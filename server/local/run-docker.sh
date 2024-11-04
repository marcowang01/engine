#! /bin/bash

SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)"

cd $SCRIPT_PATH/../

if [ "$1" = "--keygen" ]; then
    ./local/generate-certs.sh
fi

docker-compose down --rmi all --volumes --remove-orphans
docker-compose build --no-cache
docker-compose up
