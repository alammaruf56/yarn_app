@echo off
:: This script starts the backend database server and opens the app automatically in the browser
title ABC Yarn House Launcher
cd /d "%~dp0"

echo ===================================================
echo             ABC YARN HOUSE SYSTEM (PORTABLE)
echo ===================================================
echo.

:: Check if portable node folder exists in the project directory
if exist "%~dp0node\node.exe" (
    echo [PORTABLE MODE] Found local Node.js folder. Setting paths...
    set "PATH=%~dp0node;%PATH%"
) else (
    echo [SYSTEM MODE] Local Node.js folder not found. Using system-wide Node.js...
)

echo Checking Node.js version...
node -v
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is not found!
    echo Please make sure you have extracted the portable 'node' folder inside:
    echo %~dp0
    echo.
    pause
    exit /b
)

:: Check if node_modules exists, if not install dependencies
if not exist "%~dp0node_modules" (
    echo.
    echo Installing required dependencies... This may take a minute on the first run...
    call npm install
)

echo.
echo Starting the database server...
echo Please do not close this black command window while using the app.
echo.

:: Automatically open the web browser to the app
start http://localhost:3000

:: Start the node server in production mode
npm start

pause
