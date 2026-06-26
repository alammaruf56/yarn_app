@echo off
title ABC Yarn House - Accountant Companion
echo ==========================================================
echo       ABC YARN HOUSE - OFFLINE ACCOUNTANT COMPANION
echo ==========================================================
echo.
echo [1/3] Checking Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on your computer!
    echo Please download and install Node.js from: https://nodejs.org/
    echo After installing, double-click this file again to start.
    pause
    exit
)

echo [2/3] Checking dependencies (this may take a few seconds on first run)...
if not exist node_modules (
    echo Installing required packages...
    call npm install
) else (
    echo Packages already installed.
    @rem Quick update check
)

echo.
echo [3/3] Starting full-stack server...
echo.
echo === APP READY! Keep this window open while using the app ===
echo.

@rem Launch the web browser automatically to the local address after a 3 second delay
start "" "http://localhost:3000"

@rem Start the application server
call npm run dev

pause
