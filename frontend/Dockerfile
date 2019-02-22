FROM nginx:1.15.8

COPY . /usr/share/nginx/html

ARG BACKENDHOST="localhost:8081"

RUN sed -i '1s/.*/const api_url="http:\/\/'"$BACKENDHOST"'";/' /usr/share/nginx/html/js/custom.js