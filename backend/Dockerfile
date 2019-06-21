FROM node:10-stretch

# Add proxy variable on build if needed
ARG http_proxy=""
ARG https_proxy=""
ARG no_proxy="127.0.0.1,localhost"
ENV http_proxy=$http_proxy
ENV https_proxy=$https_proxy
ENV no_proxy=$no_proxy

# Install Java
RUN apt-get update
RUN apt-get install openjdk-8-jdk-headless -y

# Clean the image
RUN apt-get clean autoclean
RUN apt-get autoremove --yes
RUN rm -rf /var/lib/{apt,dpkg,cache,log}/
RUN rm -rf /var/lib/apt/lists/*

# Install Logstash
COPY ./setup setup

RUN bash setup/install_logstash.sh 5.6.4
RUN bash setup/install_logstash.sh 5.6.16
RUN bash setup/install_logstash.sh 6.7.2
RUN bash setup/install_logstash.sh 6.8.0
RUN bash setup/install_logstash.sh 7.0.1
RUN bash setup/install_logstash.sh 7.1.1

RUN bash setup/update_logstash_plugins.sh 5.6.4; true
RUN bash setup/update_logstash_plugins.sh 5.6.16; true
RUN bash setup/update_logstash_plugins.sh 6.7.2; true
RUN bash setup/update_logstash_plugins.sh 6.8.0; true
RUN bash setup/update_logstash_plugins.sh 7.0.1; true
RUN bash setup/update_logstash_plugins.sh 7.1.1; true

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install --production

# Bundle app source and conf
COPY . .

# Image characteristics
EXPOSE 8081
CMD [ "npm", "start" ]

# Copy the parser executable to this container
# Comment if not needed or option disabled
COPY --from=log-parser-builder go/src/github.com/GroupePSA/log-parser/parser /usr/local/bin/

HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8081/ || exit 1
