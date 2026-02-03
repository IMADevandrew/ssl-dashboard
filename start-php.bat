@echo off
REM SSL Dashboard - PHP Version
REM Simple startup script

title SSL Dashboard - PHP
cls
echo.
echo ================================
echo  SSL Certificate Dashboard
echo  (PHP Version)
echo ================================
echo.

cd /d "C:\Users\rikki\ssl-dashboard"

echo Checking for PHP...
where php >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: PHP is not installed or not in PATH
    echo.
    echo Please install PHP from: https://www.php.net/downloads
    echo Or download portable PHP from: https://windows.php.net/
    echo.
    echo Make sure to add PHP to your System PATH
    pause
    exit /b 1
)

echo PHP found!
echo.
echo Starting server...
echo.
echo ========================================
echo  🚀 Dashboard available at:
echo  http://localhost:8000
echo.
echo  Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start PHP built-in server
php -S localhost:8000

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Server failed to start!
    echo Check the error messages above.
)

pause
