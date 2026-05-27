@echo off
echo ================================================
echo   GlamourOS - Migrating Frontend to Root
echo ================================================
echo.

cd /d "e:\summerinternship"

echo [1/3] Copying frontend files to root...
node copy-frontend-to-root.js
echo      Done.

echo [2/3] Cleaning up temporary scripts...
del /f /q copy-frontend-to-root.js 2>nul
echo      Done.

echo [3/3] Removing duplicate glamouros/frontend folder...
rmdir /s /q "e:\summerinternship\glamouros\frontend" 2>nul
echo      Done.

echo.
echo ================================================
echo   SUCCESS! GlamourOS is now at the root directory.
echo   Vercel will now deploy perfectly with standard Settings!
echo ================================================
echo.
pause
del /f /q "e:\summerinternship\MIGRATE.bat"
