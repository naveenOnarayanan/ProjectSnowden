#! /bin/bash

echo "Checking if permission to access nodejs is given"

perm=$(stat -c nodejs "$f")

if [ "$perm" = "777" ]; then
    echo "$f permissions are 777"
else
    echo "Need to chmod nodejs directory to update dependencies"
    sudo chmod -R 777 nodejs
fi

echo "Running setup"
nodejs/bin/node nodejs/bin/node_modules/npm/bin/npm-cli.js install -l
nodejs/bin/node nodejs/bin/node_modules/npm/bin/npm-cli.js install -l node_modules/nodemon/

echo "Starting app"
nodejs/bin/node node_modules/nodemon/bin/nodemon.js -e json -w /config
