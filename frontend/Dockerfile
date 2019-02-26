FROM nginx:1.15.8

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