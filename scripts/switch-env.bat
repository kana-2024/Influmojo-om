@echo off
echo ========================================
echo INFLUMOJO ENVIRONMENT SWITCHER
echo ========================================
echo.

if "%1"=="dev" goto dev
if "%1"=="prod" goto prod
if "%1"=="production" goto prod

echo Usage: switch-env.bat [dev^|prod]
echo.
echo Examples:
echo   switch-env.bat dev     - Switch to development
echo   switch-env.bat prod    - Switch to production
echo.
echo Current environment: 
if exist ".env" (
    echo   Active: .env
    if exist ".env.dev" echo   Available: Development (.env.dev)
    if exist ".env.prod" echo   Available: Production (.env.prod)
) else (
    echo   No active environment file
)
echo.
pause
exit /b 1

:dev
echo 🔄 Switching to DEVELOPMENT environment...
echo.

if not exist ".env.dev" (
    echo ❌ ERROR: .env.dev file not found!
    echo Please ensure you have a .env.dev file.
    pause
    exit /b 1
)

if exist ".env" (
    echo Backing up current .env to .env.backup...
    if exist ".env.backup" del ".env.backup"
    copy ".env" ".env.backup" >nul
    echo ✅ Current .env backed up to .env.backup
)

echo Activating development environment...
if exist ".env" del ".env"
copy ".env.dev" ".env" >nul
echo ✅ Switched to DEVELOPMENT
echo.
echo Current environment: Development
echo Active file: .env (development values)
if exist ".env.backup" echo Backup file: .env.backup (previous values)
echo.
pause
exit /b 0

:prod
echo 🔄 Switching to PRODUCTION environment...
echo.

if not exist ".env.prod" (
    echo ❌ ERROR: .env.prod file not found!
    echo Please ensure you have a .env.prod file.
    pause
    exit /b 1
)

if exist ".env" (
    echo Backing up current .env to .env.backup...
    if exist ".env.backup" del ".env.backup"
    copy ".env" ".env.backup" >nul
    echo ✅ Current .env backed up to .env.backup
)

echo Activating production environment...
if exist ".env" del ".env"
copy ".env.prod" ".env" >nul
echo ✅ Switched to PRODUCTION
echo.
echo Current environment: Production
echo Active file: .env (production values)
if exist ".env.backup" echo Backup file: .env.backup (previous values)
echo.
pause
exit /b 0
