@echo off
title ABC Yarn House - Desktop Shortcut Creator
cd /d "%~dp0"

echo ===================================================
echo     ABC YARN HOUSE - DESKTOP SHORTCUT CREATOR
echo ===================================================
echo.
echo This script will automatically create a high-quality double-clickable
echo desktop icon for "ABC Yarn House" on your Windows Desktop!
echo.

:: Path to the launch script
set "TARGET_BAT=%~dp0start_app.bat"
set "SHORTCUT_NAME=ABC Yarn House"

:: Let's create a temporary VBScript to generate the Windows Shortcut safely
set "VBS_SCRIPT=%TEMP%\create_yarn_shortcut.vbs"

if exist "%VBS_SCRIPT%" del "%VBS_SCRIPT%"

echo Set oWS = WScript.CreateObject("WScript.Shell") >> "%VBS_SCRIPT%"
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\%SHORTCUT_NAME%.lnk" >> "%VBS_SCRIPT%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%VBS_SCRIPT%"
echo oLink.TargetPath = "%TARGET_BAT%" >> "%VBS_SCRIPT%"
echo oLink.WorkingDirectory = "%~dp0" >> "%VBS_SCRIPT%"
echo oLink.Description = "Launch ABC Yarn House Ledger System" >> "%VBS_SCRIPT%"
echo oLink.IconLocation = "shell32.dll, 23" >> "%VBS_SCRIPT%"
echo oLink.Save >> "%VBS_SCRIPT%"

:: Execute the VBScript
cscript /nologo "%VBS_SCRIPT%"
del "%VBS_SCRIPT%"

echo.
echo ---------------------------------------------------
echo [SUCCESS] Shortcut "ABC Yarn House" created on your Desktop!
echo ---------------------------------------------------
echo.
echo Now you can simply double-click the "ABC Yarn House" icon on your
echo desktop to open and run your system!
echo.
echo Remember: Do not close the black command window that opens in the
echo background, as it runs your secure local database.
echo.
pause
