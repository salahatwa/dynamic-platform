@echo off
echo ========================================
echo Testing UAT Build Configuration
echo ========================================

echo.
echo Testing UAT build with base-href...
echo Command: ng build --configuration=uat --base-href=/dynamic-platform/
echo.

cd /d "%~dp0"

REM Check if Angular CLI is available
ng version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Angular CLI not found. Please install it first:
    echo npm install -g @angular/cli
    pause
    exit /b 1
)

REM Run the UAT build
echo Starting UAT build...
ng build --configuration=uat --base-href=/dynamic-platform/

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo UAT Build Successful!
    echo ========================================
    echo.
    echo Output directory: dist/dynamic-platform
    echo Base href: /dynamic-platform/
    echo Configuration: UAT
    echo API URL: https://dynamic-platform-api-latest.onrender.com/api
    echo.
    
    REM Check if dist folder exists and show some info
    if exist "dist\dynamic-platform" (
        echo Build output files:
        dir "dist\dynamic-platform" /b
        echo.
        
        REM Check file sizes
        echo Checking bundle sizes...
        for %%f in (dist\dynamic-platform\*.js) do (
            echo %%~nxf: %%~zf bytes
        )
    )
    
    echo.
    echo Build is ready for UAT deployment!
) else (
    echo.
    echo ========================================
    echo UAT Build Failed!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo Common issues:
    echo - Missing dependencies: run 'npm install'
    echo - TypeScript errors: check your code
    echo - Configuration errors: check angular.json
)

echo.
pause