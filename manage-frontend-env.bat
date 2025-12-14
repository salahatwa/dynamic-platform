@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Frontend Environment Management Utility
echo ========================================
echo.

:menu
echo Available options:
echo 1. Serve Development Environment
echo 2. Serve UAT Environment
echo 3. Serve Production Environment (Local Test)
echo 4. Build Development
echo 5. Build UAT
echo 6. Build Production
echo 7. Show Environment Info
echo 8. Validate Configuration
echo 9. Install Dependencies
echo 10. Exit
echo.

set /p choice="Enter your choice (1-10): "

if "%choice%"=="1" goto serve_dev
if "%choice%"=="2" goto serve_uat
if "%choice%"=="3" goto serve_prod
if "%choice%"=="4" goto build_dev
if "%choice%"=="5" goto build_uat
if "%choice%"=="6" goto build_prod
if "%choice%"=="7" goto show_env
if "%choice%"=="8" goto validate
if "%choice%"=="9" goto install_deps
if "%choice%"=="10" goto exit
goto invalid

:serve_dev
echo.
echo ========================================
echo Starting Development Server
echo ========================================
call serve-dev.bat
goto menu

:serve_uat
echo.
echo ========================================
echo Starting UAT Server
echo ========================================
call serve-uat.bat
goto menu

:serve_prod
echo.
echo ========================================
echo Starting Production Test Server
echo ========================================
call serve-prod.bat
goto menu

:build_dev
echo.
echo ========================================
echo Building Development
echo ========================================
call build-dev.bat
goto menu

:build_uat
echo.
echo ========================================
echo Building UAT
echo ========================================
call build-uat.bat
goto menu

:build_prod
echo.
echo ========================================
echo Building Production
echo ========================================
call build-prod.bat
goto menu

:show_env
echo.
echo ========================================
echo Environment Information
echo ========================================
echo.

echo Development Environment:
echo - API URL: http://localhost:8080/api
echo - Debug Mode: Enabled
echo - Source Maps: Enabled
echo - Console Logging: Enabled
echo.

echo UAT Environment:
echo - API URL: https://dynamic-platform-api-latest.onrender.com/api
echo - Debug Mode: Enabled
echo - Source Maps: Enabled
echo - Performance Monitoring: Enabled
echo.

echo Production Environment:
echo - API URL: https://api.yourdomain.com/api
echo - Debug Mode: Disabled
echo - Source Maps: Disabled
echo - Console Logging: Disabled
echo - Optimization: Full
echo.

pause
goto menu

:validate
echo.
echo ========================================
echo Configuration Validation
echo ========================================
echo.

REM Check if environment files exist
if exist "src\environments\environment.ts" (
    echo [OK] Development environment file found
) else (
    echo [ERROR] Development environment file missing
)

if exist "src\environments\environment.uat.ts" (
    echo [OK] UAT environment file found
) else (
    echo [ERROR] UAT environment file missing
)

if exist "src\environments\environment.prod.ts" (
    echo [OK] Production environment file found
) else (
    echo [ERROR] Production environment file missing
)

if exist "angular.json" (
    echo [OK] Angular configuration file found
) else (
    echo [ERROR] Angular configuration file missing
)

if exist "package.json" (
    echo [OK] Package.json found
) else (
    echo [ERROR] Package.json missing
)

echo.
echo Checking Angular CLI...
ng version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Angular CLI is installed
) else (
    echo [WARNING] Angular CLI not found or not in PATH
)

echo.
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js is installed
    node --version
) else (
    echo [ERROR] Node.js not found
)

echo.
pause
goto menu

:install_deps
echo.
echo ========================================
echo Installing Dependencies
echo ========================================
echo.

echo Installing npm dependencies...
npm install

echo.
echo Dependencies installation completed!
echo.
pause
goto menu

:invalid
echo Invalid choice. Please try again.
echo.
goto menu

:exit
echo.
echo Goodbye!
exit /b 0