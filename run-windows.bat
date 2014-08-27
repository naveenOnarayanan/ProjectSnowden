@echo off
echo "Installing Modules"
call nodejs\bin\npm.cmd install -l 
call nodejs\bin\npm.cmd install -l node_modules\nodemon

echo "Starting Application"
echo node_modules\nodemon\bin\nodemon.js
call nodejs\bin\node\windows\node.exe node_modules\nodemon\bin\nodemon.js -e json -w config