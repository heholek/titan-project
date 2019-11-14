#!/bin/bash

# Some prerequisits tests

if ! [ -x "$(command -v curl)" ]; then
  echo 'Error: curl is not installed.' >&2
  exit 1
fi

if ! [ -x "$(command -v jq)" ]; then
  echo 'Error: jq is not installed.' >&2
  exit 1
fi

# Start of the checking

versions=`curl -s  localhost:8081/logstash/versions | jq -r  '.versions[]' | grep -v "-"`

rc=0
versions_problem=()

IFS=$'\n'
for version in $versions  
do
    echo "Starting test for version '$version'"
    LOGSTASH_VERSION=$version npm test
    if [ $? -ne 0 ]
    then
        rc=1
        versions_problem+=("$version")
    fi
    
done

if [ $rc -ne 0 ]
then
    >&2 echo "Errors for versions ${versions_problem[@]}"
fi

exit $rc