#!/bin/bash

# Removing logstash inputs 

logstash_inputs=`/usr/share/logstash/bin/logstash-plugin list | grep "logstash-input" | grep -v "logstash-input-stdin\|logstash-input-file"`

while read -r logstash_input; do
    echo "Removing $logstash_input"
    /usr/share/logstash/bin/logstash-plugin remove $logstash_input > /dev/null
done <<< "$logstash_inputs"

# Removing logstash outputs 

logstash_outputs=`/usr/share/logstash/bin/logstash-plugin list | grep "logstash-output" | grep -v "logstash-output-stdout"`

while read -r logstash_output; do
    echo "Removing $logstash_output"
    /usr/share/logstash/bin/logstash-plugin remove $logstash_output > /dev/null
done <<< "$logstash_outputs"

# Add new plugins if needed

logstash_filters=(logstash-filter-aggregate)

for logstash_filter in ${logstash_filters[@]}; do
      /usr/share/logstash/bin/logstash-plugin install $logstash_filter > /dev/null  
done
