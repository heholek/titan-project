#!/bin/bash

# Add new plugins if needed

logstash_filters=(logstash-filter-aggregate logstash-filter-elapsed)

for logstash_filter in ${logstash_filters[@]}; do
    echo "Adding $logstash_filter"
    /logstash/logstash-$1/bin/logstash-plugin install $logstash_filter > /dev/null  
done

# Removing logstash inputs 

logstash_inputs=`/logstash/logstash-$1/bin/logstash-plugin list | grep "logstash-input" | grep -v "logstash-input-stdin\|logstash-input-file"`

while read -r logstash_input; do
    echo "Removing $logstash_input"
    /logstash/logstash-$1/bin/logstash-plugin remove $logstash_input > /dev/null
done <<< "$logstash_inputs"

# Removing logstash outputs 

logstash_outputs=`/logstash/logstash-$1/bin/logstash-plugin list | grep "logstash-output" | grep -v "logstash-output-stdout"`

while read -r logstash_output; do
    echo "Removing $logstash_output"
    /logstash/logstash-$1/bin/logstash-plugin remove $logstash_output > /dev/null
done <<< "$logstash_outputs"
