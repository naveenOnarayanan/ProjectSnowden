@echo off
echo "Installing Modules"
call %~dp0\..\nodejs\bin\npm.cmd install -l
call %~dp0\..\nodejs\bin\npm.cmd install -l %~dp0\..\node_modules\nodemon

echo "Starting Application"
echo %~dp0\..\node_modules\nodemon\bin\nodemon.js
call %~dp0\..\nodejs\bin\node\windows\node.exe %~dp0..\node_modules\nodemon\bin\nodemon.js -e json -w %~dp0\..\config %~dp0\..\app.js