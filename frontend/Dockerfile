FROM nginx:1.15.8

# Add proxy variable on build if needed
ARG http_proxy=""
ARG https_proxy=""
ARG no_proxy="localhost"
ENV http_proxy=$http_proxy
ENV https_proxy=$https_proxy
ENV no_proxy=$no_proxy

# Install curl for healthcheck
RUN apt-get update
RUN apt-get install curl -y

# Clean the image
RUN apt-get clean autoclean
RUN apt-get autoremove --yes
RUN rm -rf /var/lib/{apt,dpkg,cache,log}/
RUN rm -rf /var/lib/apt/lists/*

COPY . /usr/share/nginx/html

ARG BACKENDHOST="localhost:8081"

RUN sed -i '1s/.*/const api_url="http:\/\/'"$BACKENDHOST"'";/' /usr/share/nginx/html/js/custom.js

HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost/ || exit 1