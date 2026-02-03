@echo off
REM Fix API path in index.html

setlocal enabledelayedexpansion

set "file=C:\xampp\htdocs\ssl-dashboard\index.html"

REM Use PowerShell to do the replacement
powershell -NoProfile -Command ^
  "$content = [System.IO.File]::ReadAllText('%file%'); " ^
  "$content = $content -replace \"const API_BASE = window.location.origin \+ '/api.php';\", \"const API_BASE = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/api.php';\"; " ^
  "[System.IO.File]::WriteAllText('%file%', $content); " ^
  "Write-Host 'Fixed API path!'"

echo Done!
pause
