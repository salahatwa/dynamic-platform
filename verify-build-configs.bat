@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Build Configuration Verification
echo ========================================

cd /d "%~dp0"

echo.
echo Checking Angular CLI...
ng version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Angular CLI not found!
    echo Please install: npm install -g @angular/cli
    pause
    exit /b 1
) else (
    echo [OK] Angular CLI is available
)

echo.
echo Checking Node.js and npm...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    pause
    exit /b 1
) else (
    echo [OK] Node.js version: 
    node --version
)

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm not found!
    pause
    exit /b 1
) else (
    echo [OK] npm version: 
    npm --version
)

echo.
echo Checking project files...
if exist "package.json" (
    echo [OK] package.json found
) else (
    echo [ERROR] package.json not found!
    pause
    exit /b 1
)

if exist "angular.json" (
    echo [OK] angular.json found
) else (
    echo [ERROR] angular.json not found!
    pause
    exit /b 1
)

if exist "src\environments\environment.ts" (
    echo [OK] Development environment file found
) else (
    echo [ERROR] Development environment file missing!
)

if exist "src\environments\environment.uat.ts" (
    echo [OK] UAT environment file found
) else (
    echo [ERROR] UAT environment file missing!
)

if exist "src\environments\environment.prod.ts" (
    echo [OK] Production environment file found
) else (
    echo [ERROR] Production environment file missing!
)

echo.
echo Installing/updating dependencies...
npm install

echo.
echo ========================================
echo Testing Build Configurations
echo ========================================

echo.
echo 1. Testing Development Build...
ng build --configuration=development
if %errorlevel% equ 0 (
    echo [OK] Development build successful
) else (
    echo [ERROR] Development build failed
    set BUILD_ERRORS=1
)

echo.
echo 2. Testing UAT Build...
ng build --configuration=uat
if %errorlevel% equ 0 (
    echo [OK] UAT build successful
) else (
    echo [ERROR] UAT build failed
    set BUILD_ERRORS=1
)

echo.
echo 3. Testing UAT Build with base-href...
ng build --configuration=uat --base-href=/dynamic-platform/
if %errorlevel% equ 0 (
    echo [OK] UAT build with base-href successful
) else (
    echo [ERROR] UAT build with base-href failed
    set BUILD_ERRORS=1
)

echo.
echo 4. Testing Production Build...
ng build --configuration=production
if %errorlevel% equ 0 (
    echo [OK] Production build successful
) else (
    echo [ERROR] Production build failed
    set BUILD_ERRORS=1
)

echo.
echo ========================================
echo Build Verification Results
echo ========================================

if defined BUILD_ERRORS (
    echo [ERROR] Some builds failed. Please check the errors above.
    echo.
    echo Common solutions:
    echo - Run 'npm install' to ensure all dependencies are installed
    echo - Check TypeScript compilation errors
    echo - Verify environment files exist and are properly configured
    echo - Check angular.json configuration
) else (
    echo [SUCCESS] All build configurations are working correctly!
    echo.
    echo Available commands:
    echo - npm run build:dev
    echo - npm run build:uat  
    echo - npm run build:prod
    echo.
    echo With base-href:
    echo - ng build --configuration=uat --base-href=/dynamic-platform/
    echo - ng build --configuration=production --base-href=/your-path/
)

echo.
echo Build output directory: dist/dynamic-platform
if exist "dist\dynamic-platform" (
    echo Current build size:
    for /f %%i in ('dir "dist\dynamic-platform" /s /-c ^| find "bytes"') do echo %%i
)

echo.
pause