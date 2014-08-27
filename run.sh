#! /bin/bash

echo "Checking if permission to access nodejs is given"
perms==$(stat nodejs | sed -n '/^Access: (/{s/Access: (\([0-9]\+\).*$/\1/;p}')
if [[ $perms =~ 755 ]]; then
    echo "Need to chmod nodejs directory to update dependencies"
    sudo chmod -R 755 nodejs
fi

echo "Running setup"
nodejs/bin/node nodejs/bin/node_modules/npm/bin/npm-cli.js install -l
nodejs/bin/node nodejs/bin/node_modules/npm/bin/npm-cli.js install -l node_modules/nodemon/

echo "Starting app"
nodejs/bin/node node_modules/nodemon/bin/nodemon.js -e json -w /config
