#! /bin/bash

SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)"

cd $SCRIPT_PATH/../

# load environment variables
export $(xargs < .env)

go1.22.8 run .
