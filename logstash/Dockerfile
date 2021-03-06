FROM ubuntu:bionic

ARG JDK_VERSION

RUN apt-get update \
    && apt-get install openjdk-${JDK_VERSION}-jre-headless wget tar -y

RUN useradd -ms /bin/bash logstash
RUN mkdir /logstash && chown -R logstash /logstash

USER logstash

WORKDIR /logstash

ARG LOGSTASH_VERSION

RUN wget -q https://artifacts.elastic.co/downloads/logstash/logstash-${LOGSTASH_VERSION}.tar.gz \
    && tar -C /logstash -zxsf logstash-${LOGSTASH_VERSION}.tar.gz logstash-${LOGSTASH_VERSION}/ --strip-components=1 \
    && rm logstash-${LOGSTASH_VERSION}.tar.gz

RUN echo "" > /logstash/config/logstash.yml

COPY jvm-jdk-${JDK_VERSION}.options /logstash/config/jvm.options

COPY update_logstash_plugins.sh /tmp/update_logstash_plugins.sh

ARG PLUGINS_TO_ADD=""
ARG PLUGINS_TO_REMOVE=""
ARG UPDATE_PLUGINS="false"
ENV PLUGINS_TO_ADD=$PLUGINS_TO_ADD
ENV PLUGINS_TO_REMOVE=$PLUGINS_TO_REMOVE
ENV UPDATE_PLUGINS=$UPDATE_PLUGINS

RUN /tmp/update_logstash_plugins.sh

COPY entrypoint.sh /entrypoint.sh

USER root

RUN chmod +x /entrypoint.sh

USER logstash

ENTRYPOINT [ "/entrypoint.sh" ]