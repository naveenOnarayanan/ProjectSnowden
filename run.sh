#! /bin/bash

echo "Running setup"
nodejs/bin/node_modules/npm/bin/npm install -l
nodejs/bin/node_modules/npm/bin/npm install -l node_modules/nodemon/

echo "Starting app"
nodejs/bin/node node_modules/nodemon/bin/nodemon.js -e json -w /config
