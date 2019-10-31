#!/bin/bash

# Remove Logstash plugins
if [ "$PLUGINS_TO_REMOVE" != "" ]; then
    for plugin in ${PLUGINS_TO_REMOVE}; do
        echo "Removing $plugin"
        /logstash/bin/logstash-plugin remove $plugin > /dev/null  
    done
fi

#  Update all plugins
if [ "${UPDATE_PLUGINS}" == "true" ]; then
    echo "Updating all plugins"
    /logstash/bin/logstash-plugin update > /dev/null  
fi

# Add Logstash plugins
if [ "$PLUGINS_TO_ADD" != "" ]; then
    for plugin in ${PLUGINS_TO_ADD}; do
        echo "Adding $plugin"
        /logstash/bin/logstash-plugin install $plugin > /dev/null  
    done
fi