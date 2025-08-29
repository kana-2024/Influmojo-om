@echo off
echo ========================================
echo INFLUMOJO MOBILE ENVIRONMENT SWITCHER
echo ========================================
echo.

if "%1"=="dev" goto dev
if "%1"=="prod" goto prod
if "%1"=="production" goto prod

echo Usage: switch-mobile-env.bat [dev^|prod]
echo.
echo Examples:
echo   switch-mobile-env.bat dev     - Switch to mobile development
echo   switch-mobile-env.bat prod    - Switch to mobile production
echo.
echo Current mobile environment: 
if exist "mobile\.env.mobile" (
    echo   Active: mobile\.env.mobile
    if exist "mobile\.env.mobile.dev" echo   Available: Development (mobile\.env.mobile.dev)
    if exist "mobile\.env.mobile.prod" echo   Available: Production (mobile\.env.mobile.prod)
) else (
    echo   No active mobile environment file
)
echo.
pause
exit /b 1

:dev
echo 🔄 Switching to MOBILE DEVELOPMENT environment...
echo.

if not exist "mobile\.env.mobile.dev" (
    echo ❌ ERROR: mobile\.env.mobile.dev file not found!
    echo Please ensure you have a .env.mobile.dev file in the mobile directory.
    pause
    exit /b 1
)

if exist "mobile\.env.mobile" (
    echo Backing up current .env.mobile to .env.mobile.backup...
    if exist "mobile\.env.mobile.backup" del "mobile\.env.mobile.backup"
    copy "mobile\.env.mobile" "mobile\.env.mobile.backup" >nul
    echo ✅ Current .env.mobile backed up to .env.mobile.backup
)

echo Activating mobile development environment...
if exist "mobile\.env.mobile" del "mobile\.env.mobile"
copy "mobile\.env.mobile.dev" "mobile\.env.mobile" >nul
echo ✅ Switched to MOBILE DEVELOPMENT
echo.
echo Current mobile environment: Development
echo Active file: mobile\.env.mobile (development values)
if exist "mobile\.env.mobile.backup" echo Backup file: mobile\.env.mobile.backup (previous values)
echo.
pause
exit /b 0

:prod
echo 🔄 Switching to MOBILE PRODUCTION environment...
echo.

if not exist "mobile\.env.mobile.prod" (
    echo ❌ ERROR: mobile\.env.mobile.prod file not found!
    echo Please ensure you have a .env.mobile.prod file in the mobile directory.
    pause
    exit /b 1
)

if exist "mobile\.env.mobile" (
    echo Backing up current .env.mobile to .env.mobile.backup...
    if exist "mobile\.env.mobile.backup" del "mobile\.env.mobile.backup"
    echo ✅ Current .env.mobile backed up to .env.mobile.backup
)

echo Activating mobile production environment...
if exist "mobile\.env.mobile" del "mobile\.env.mobile"
copy "mobile\.env.mobile.prod" "mobile\.env.mobile" >nul
echo ✅ Switched to MOBILE PRODUCTION
echo.
echo Current mobile environment: Production
echo Active file: mobile\.env.mobile (production values)
if exist "mobile\.env.mobile.backup" echo Backup file: mobile\.env.mobile.backup (previous values)
echo.
pause
exit /b 0
