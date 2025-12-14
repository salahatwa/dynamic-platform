@echo off
echo ========================================
echo Bundle Size Analysis Tool
echo ========================================

cd /d "%~dp0"

echo.
echo This tool will build the application and analyze bundle sizes.
echo.
set /p config="Enter configuration (dev/uat/prod) [uat]: "
if "%config%"=="" set config=uat

echo.
echo Building %config% configuration with stats...
ng build --configuration=%config% --stats-json

if %errorlevel% neq 0 (
    echo Build failed. Cannot analyze bundle.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Bundle Analysis Results
echo ========================================

if exist "dist\dynamic-platform\stats.json" (
    echo.
    echo Opening bundle analyzer...
    echo This will open a web browser with detailed bundle analysis.
    echo.
    
    REM Check if webpack-bundle-analyzer is installed
    npx webpack-bundle-analyzer --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo Installing webpack-bundle-analyzer...
        npm install -g webpack-bundle-analyzer
    )
    
    REM Open bundle analyzer
    npx webpack-bundle-analyzer dist/dynamic-platform/stats.json
    
) else (
    echo Stats file not found. Build may have failed.
)

echo.
echo ========================================
echo Bundle Size Summary
echo ========================================

if exist "dist\dynamic-platform" (
    echo.
    echo JavaScript bundles:
    for %%f in (dist\dynamic-platform\*.js) do (
        set /a sizeKB=%%~zf/1024
        if !sizeKB! gtr 100 (
            echo   [LARGE] %%~nxf: !sizeKB! KB
        ) else if !sizeKB! gtr 50 (
            echo   [MEDIUM] %%~nxf: !sizeKB! KB
        ) else (
            echo   [SMALL] %%~nxf: !sizeKB! KB
        )
    )
    
    echo.
    echo CSS bundles:
    for %%f in (dist\dynamic-platform\*.css) do (
        set /a sizeKB=%%~zf/1024
        if !sizeKB! gtr 50 (
            echo   [LARGE] %%~nxf: !sizeKB! KB
        ) else if !sizeKB! gtr 20 (
            echo   [MEDIUM] %%~nxf: !sizeKB! KB
        ) else (
            echo   [SMALL] %%~nxf: !sizeKB! KB
        )
    )
    
    echo.
    echo Optimization recommendations:
    echo - Large JavaScript bundles: Consider lazy loading modules
    echo - Large CSS files: Split component styles or use CSS purging
    echo - Multiple small bundles: May indicate good code splitting
    
    echo.
    echo Total application size:
    for /f "tokens=3" %%a in ('dir "dist\dynamic-platform" /s /-c ^| find "File(s)"') do (
        set /a totalMB=%%a/1048576
        set /a totalKB=%%a/1024
        echo   Total: !totalKB! KB (!totalMB! MB)
    )
)

echo.
pause