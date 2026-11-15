@echo off
setlocal
cd /d "%~dp0"
PowerShell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-dropsave.ps1"
set EXIT_CODE=%ERRORLEVEL%
if not "%EXIT_CODE%"=="0" (
  echo.
  echo DropSave automatic build failed. Error code: %EXIT_CODE%
  pause
)
exit /b %EXIT_CODE%
