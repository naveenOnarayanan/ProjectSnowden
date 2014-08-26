@echo off
call setup.bat

nodejs\bin\node.exe node_modules\nodemon\bin\nodemon.js -e json -w /config