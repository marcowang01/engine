#! /bin/bash

SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)"

cd $SCRIPT_PATH/../

# load environment variables
source .env

go run .
