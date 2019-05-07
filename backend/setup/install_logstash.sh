#!/bin/bash

mkdir -p /logstash
wget -q https://artifacts.elastic.co/downloads/logstash/logstash-$1.tar.gz 
tar -C /logstash -zxf logstash-$1.tar.gz
rm logstash-$1.tar.gz
