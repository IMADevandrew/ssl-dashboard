@echo off
REM SSL Dashboard Startup Script

title SSL Dashboard
cls
echo.
echo ================================
echo  SSL Certificate Dashboard
echo ================================
echo.

cd /d "C:\Users\rikki\ssl-dashboard"

echo Checking for Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
if exist node_modules (
    echo Dependencies already installed
) else (
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting SSL Dashboard...
echo.
echo ========================================
echo  🚀 Dashboard available at:
echo  http://localhost:3000
echo.
echo  Press Ctrl+C to stop the server
echo ========================================
echo.

node server.js

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Server failed to start!
    echo Check the error messages above.
)

pause

