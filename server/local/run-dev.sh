#! /bin/bash

SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)"

cd $SCRIPT_PATH/../

go run .
