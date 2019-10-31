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

# Create app directory
WORKDIR /usr/src/app

# Install docker client CLI
ENV DOCKERVERSION=19.03.3
RUN curl -fsSLO https://download.docker.com/linux/static/stable/x86_64/docker-${DOCKERVERSION}.tgz \
  && tar xzvf docker-${DOCKERVERSION}.tgz --strip 1 \
                 -C /usr/local/bin docker/docker \
  && rm docker-${DOCKERVERSION}.tgz


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
COPY ./parser /usr/local/bin/parser

HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8081/ || exit 1
