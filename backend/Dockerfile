FROM node:8-stretch


# Install Logstash
RUN apt-get update
RUN apt-get install openjdk-8-jdk-headless -y
RUN wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | apt-key add -
RUN apt-get install apt-transport-https
RUN echo "deb https://artifacts.elastic.co/packages/5.x/apt stable main" | tee -a /etc/apt/sources.list.d/elastic-5.x.list
RUN apt-get update
RUN apt-get install logstash=1:5.6.15-1 -y

# We remove unussed Logstash plugins
COPY ./scripts/remove_logstash_plugins.sh .
RUN ./remove_logstash_plugins.sh

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

# Create the cron to clean logstash data directory
RUN apt-get install cron -y
RUN echo "0 0 * * * rm -rf /tmp/logstash/data/*" >> clean_cron
RUN crontab -u root clean_cron
RUN crontab clean_cron
RUN rm clean_cron

# Clean the image
RUN apt-get clean autoclean
RUN apt-get autoremove --yes
RUN rm -rf /var/lib/{apt,dpkg,cache,log}/
RUN rm -rf /var/lib/apt/lists/*

# Bundle app source
COPY . .

EXPOSE 8081
CMD [ "npm", "start" ]