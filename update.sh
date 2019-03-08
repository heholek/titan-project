#!/bin/bash

if [ ! -d ".git" ]; then
  echo "We are not in a git local repository, I cannot continue"
  exit 1
fi

echo "Getting latest version if any"

cp docker-compose.yml docker-compose-old.yml
git reset --hard
git pull
cp docker-compose.yml docker-compose-latest.yml
cp docker-compose-old.yml docker-compose.yml

read -p "Do you want to launch the build and deployment of the new version with docker ? " -n 1 -r
echo 
if [[ $REPLY =~ ^[Yy]$ ]]
then
    docker-compose up -d --build
fi
