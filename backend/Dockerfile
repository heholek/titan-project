FROM node:10-stretch

# Add proxy variable on build if needed
ARG http_proxy=""
ARG https_proxy=""
ARG no_proxy="127.0.0.1,localhost"
ENV http_proxy=$http_proxy
ENV https_proxy=$https_proxy
ENV no_proxy=$no_proxy

# Install Logstash
RUN apt-get update
RUN apt-get install openjdk-8-jdk-headless -y
RUN wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | apt-key add -
RUN apt-get install apt-transport-https
RUN echo "deb https://artifacts.elastic.co/packages/5.x/apt stable main" | tee -a /etc/apt/sources.list.d/elastic-5.x.list
RUN apt-get update
RUN apt-get install logstash=1:5.6.16-1 -y

# We remove unused Logstash plugins
COPY ./docker/scripts/remove_logstash_plugins.sh .
RUN bash remove_logstash_plugins.sh

# We add new Logstash plugins
COPY ./docker/scripts/add_logstash_plugins.sh .
RUN bash add_logstash_plugins.sh

# We then update remaining plugins
RUN /usr/share/logstash/bin/logstash-plugin update


# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install --production
# If you are building your code for production
# RUN npm ci --only=production

# Clean the image
RUN apt-get clean autoclean
RUN apt-get autoremove --yes
RUN rm -rf /var/lib/{apt,dpkg,cache,log}/
RUN rm -rf /var/lib/apt/lists/*

# Bundle app source and conf
COPY . .
COPY ./docker/confs/jvm.options /etc/logstash/jvm.options

# Image characteristics
EXPOSE 8081
CMD [ "npm", "start" ]

HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8081/ || exit 1
