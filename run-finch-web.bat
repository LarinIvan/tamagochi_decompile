@echo off
set PATH=C:\Users\larin\nodejs;%PATH%
echo Starting Finch Web App on http://localhost:3000 ...
start http://localhost:3000
node "%~dp0web\server.js"
