#! /bin/bash

echo "Need to chmod nodejs directory to update dependencies"
sudo chmod -R 777 nodejs

echo "Running setup"
nodejs/bin/node nodejs/bin/node_modules/npm/bin/npm-cli.js install -l
nodejs/bin/node nodejs/bin/node_modules/npm/bin/npm-cli.js install -l node_modules/nodemon/

echo "Starting app"
nodejs/bin/node node_modules/nodemon/bin/nodemon.js -e json -w /config
