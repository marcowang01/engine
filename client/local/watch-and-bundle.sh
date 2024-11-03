#! /bin/bash


# set -e: makes the script exit on error
# set -x: prints the commands as they are executed
set -ex

# Get the absolute path of the script itself
SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)"

cd $SCRIPT_PATH/../

# reflex: watches the file and rebuilds it when it changes
# -g: glob pattern to watch
# -- sh: runs the command in a shell
# -c: command to run

reflex -g src/editor/editor.ts -- sh -c \
  "pnpm rollup -c && \
  cd public && \
  npx terser editor.bundle.js -o editor.bundle.min.js && \
  echo done"
