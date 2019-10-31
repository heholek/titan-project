FROM ubuntu:bionic

# Add proxy variable on build if needed
ARG http_proxy=""
ARG https_proxy=""
ARG no_proxy="127.0.0.1,localhost"
ENV http_proxy=$http_proxy
ENV https_proxy=$https_proxy
ENV no_proxy=$no_proxy

ARG JDK_VERSION

RUN apt-get update \
    && apt-get install openjdk-${JDK_VERSION}-jre-headless wget tar -y

ARG LOGSTASH_VERSION

RUN mkdir -p /logstash \
    && wget -q https://artifacts.elastic.co/downloads/logstash/logstash-${LOGSTASH_VERSION}.tar.gz \
    && tar -C /logstash -zxsf logstash-${LOGSTASH_VERSION}.tar.gz logstash-${LOGSTASH_VERSION}/ --strip-components=1 \
    && rm logstash-${LOGSTASH_VERSION}.tar.gz

RUN echo "" > /logstash/config/logstash.yml

COPY jvm-jdk-${JDK_VERSION}.options /logstash/config/jvm.options
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

COPY update_logstash_plugins.sh /tmp/update_logstash_plugins.sh

ARG PLUGINS_TO_ADD=""
ARG PLUGINS_TO_REMOVE=""
ARG UPDATE_PLUGINS="false"
ENV PLUGINS_TO_ADD=$PLUGINS_TO_ADD
ENV PLUGINS_TO_REMOVE=$PLUGINS_TO_REMOVE
ENV UPDATE_PLUGINS=$UPDATE_PLUGINS

RUN /tmp/update_logstash_plugins.sh

ENTRYPOINT [ "/entrypoint.sh" ]