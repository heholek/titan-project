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

# Removing logstash codecs 

logstash_codecs=`/usr/share/logstash/bin/logstash-plugin list | grep "logstash-codec" | grep -v "logstash-codec-json\|logstash-codec-json_lines\|logstash-codec-line\|logstash-codec-multiline\|logstash-codec-plain\|logstash-codec-rubydebug"`

while read -r logstash_codec; do
    echo "Removing $logstash_codec"
    /usr/share/logstash/bin/logstash-plugin remove $logstash_codec > /dev/null
done <<< "$logstash_codecs"
