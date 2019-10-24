FROM ubuntu:bionic

# Add proxy variable on build if needed
ARG http_proxy=""
ARG https_proxy=""
ARG no_proxy="127.0.0.1,localhost"
ENV http_proxy=$http_proxy
ENV https_proxy=$https_proxy
ENV no_proxy=$no_proxy

#RUN echo 'Acquire::HTTP::Proxy "http://172.17.0.1:3142";' >> /etc/apt/apt.conf.d/01proxy \
# && echo 'Acquire::HTTPS::Proxy "false";' >> /etc/apt/apt.conf.d/01proxy

# Install Nodejs 10
RUN apt-get update \
    && apt-get install -y curl dirmngr apt-transport-https lsb-release ca-certificates \
    && curl -sL https://deb.nodesource.com/setup_10.x | bash \
    && apt-get update \
    && apt-get -y install gcc g++ make \
    && apt-get install -y nodejs

# Install Java
RUN apt-get update \
    && apt-get install tar wget openjdk-8-jre-headless openjdk-11-jre-headless -y

# Install Logstash
COPY ./setup setup

RUN bash setup/install_logstash.sh 5.6.4 && (JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64 setup/update_logstash_plugins.sh 5.6.4; true)
RUN bash setup/install_logstash.sh 5.6.16 && (JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64 setup/update_logstash_plugins.sh 5.6.16; true)
RUN bash setup/install_logstash.sh 6.8.3 && (JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64 setup/update_logstash_plugins.sh 6.8.3; true)
RUN bash setup/install_logstash.sh 7.4.0 && (JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64 setup/update_logstash_plugins.sh 7.4.0; true)

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install --production

# Copy the logstash jvm files
COPY docker_ressources/jvm-jdk8.options /logstash/logstash-5.6.4/config/jvm.options
COPY docker_ressources/jvm-jdk8.options /logstash/logstash-5.6.16/config/jvm.options
COPY docker_ressources/jvm-jdk11.options /logstash/logstash-6.8.3/config/jvm.options
COPY docker_ressources/jvm-jdk11.options /logstash/logstash-7.4.0/config/jvm.options

# Bundle app source and conf
COPY . .

# Image characteristics
EXPOSE 8081
CMD [ "npm", "start" ]

# Copy the parser executable to this container
# Comment if not needed or option disabled
COPY ./parser /usr/local/bin/parser

HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8081/ || exit 1
