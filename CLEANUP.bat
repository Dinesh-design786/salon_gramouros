@echo off
echo ================================================
echo   GlamourOS - Cleanup + Launch Dev Servers
echo ================================================
echo.

cd /d "e:\summerinternship"

echo [1/5] Deleting old src folder...
rmdir /s /q src 2>nul
echo      Done.

echo [2/5] Deleting old .next build cache...
rmdir /s /q .next 2>nul
echo      Done.

echo [3/5] Deleting old root config files...
del /f /q next.config.js 2>nul
del /f /q next-env.d.ts 2>nul
del /f /q tailwind.config.js 2>nul
del /f /q tsconfig.json 2>nul
del /f /q postcss.config.js 2>nul
del /f /q package.json 2>nul
del /f /q package-lock.json 2>nul
del /f /q migrate.js 2>nul
del /f /q rebrand.js 2>nul
del /f /q run-glamouros.bat 2>nul
echo      Done.

echo [4/5] Also deleting frontend .next cache to force clean rebuild...
rmdir /s /q "e:\summerinternship\glamouros\frontend\.next" 2>nul
echo      Done.

echo [5/5] Starting GlamourOS Frontend on localhost:3000 ...
start "GlamourOS FRONTEND" cmd /k "cd /d e:\summerinternship\glamouros\frontend && npm run dev"

echo.
echo ================================================
echo   Launching backend server...
echo ================================================
start "GlamourOS BACKEND" cmd /k "cd /d e:\summerinternship\glamouros\backend && npm run dev"

echo.
echo ================================================
echo   Both servers are starting!
echo.
echo   Frontend --> http://localhost:3000
echo   Backend  --> http://localhost:5000
echo ================================================
echo.
pause
