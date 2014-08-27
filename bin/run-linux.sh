#! /bin/bash
path=$(pwd)
echo "Checking if permission to access nodejs is given"

perm=$(stat -c ${path}/../nodejs "$f")

if [ "$perm" = "777" ]; then
    echo "$f permissions are 777"
else
    echo "Need to chmod nodejs directory to update dependencies"
    sudo chmod -R 777 ${path}/../nodejs
fi

echo "Running setup"
${path}/../nodejs/bin/node/linux/node ${path}/../nodejs/bin/node_modules/npm/bin/npm-cli.js install -l
${path}/../nodejs/bin/node/linux/node ${path}/../nodejs/bin/node_modules/npm/bin/npm-cli.js install -l ${path}/../node_modules/nodemon/

echo "Starting app"
${path}/../nodejs/bin/node/linux/node ${path}/../node_modules/nodemon/bin/nodemon.js -e json -w ${path}/../config ${path}/../app.js
