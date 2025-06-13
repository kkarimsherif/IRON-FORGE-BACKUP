@echo off
echo Starting IRON-FORGE application...
start cmd /k "npm run dev"
timeout /t 3 /nobreak > nul
echo Opening browser...
start http://localhost:5003
echo Server and browser started! 