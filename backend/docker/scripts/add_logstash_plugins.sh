#!/bin/bash

# Add new plugins if needed

logstash_filters=(logstash-filter-aggregate logstash-filter-elapsed)

for logstash_filter in ${logstash_filters[@]}; do
    echo "Adding $logstash_filter"
    /usr/share/logstash/bin/logstash-plugin install $logstash_filter > /dev/null  
done
