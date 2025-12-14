@echo off
echo ========================================
echo Clean UAT Build with Updated Budgets
echo ========================================

cd /d "%~dp0"

echo.
echo Step 1: Cleaning previous builds...
if exist "dist" (
    rmdir /s /q "dist"
    echo Previous build cleaned
)

echo.
echo Step 2: Installing/updating dependencies...
npm install

echo.
echo Step 3: Building UAT with updated budget limits...
echo Configuration: UAT
echo Base href: /dynamic-platform/
echo API URL: https://dynamic-platform-api-latest.onrender.com/api
echo.

ng build --configuration=uat --base-href=/dynamic-platform/

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS: UAT Build Completed!
    echo ========================================
    echo.
    
    if exist "dist\dynamic-platform" (
        echo Build output information:
        echo.
        
        REM Show main bundle sizes
        echo Main JavaScript bundles:
        for %%f in (dist\dynamic-platform\*.js) do (
            set /a size=%%~zf/1024
            echo   %%~nxf: !size! KB
        )
        
        echo.
        echo CSS files:
        for %%f in (dist\dynamic-platform\*.css) do (
            set /a size=%%~zf/1024
            echo   %%~nxf: !size! KB
        )
        
        echo.
        echo Total build size:
        for /f "tokens=3" %%a in ('dir "dist\dynamic-platform" /s /-c ^| find "File(s)"') do (
            set /a totalKB=%%a/1024
            echo   Total: !totalKB! KB
        )
        
        echo.
        echo Verifying base href in index.html...
        findstr "base href" "dist\dynamic-platform\index.html"
    )
    
    echo.
    echo ========================================
    echo Build Ready for UAT Deployment!
    echo ========================================
    echo.
    echo Deployment Instructions:
    echo 1. Upload contents of 'dist/dynamic-platform/' to your UAT server
    echo 2. Configure web server to serve from '/dynamic-platform/' path
    echo 3. Ensure backend API is accessible at: https://dynamic-platform-api-latest.onrender.com/api
    echo 4. Test the application in UAT environment
    
) else (
    echo.
    echo ========================================
    echo ERROR: UAT Build Failed!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo.
    echo Common solutions:
    echo - Check for TypeScript compilation errors
    echo - Verify all environment files exist
    echo - Run 'npm install --force' if dependency issues
    echo - Check angular.json configuration
)

echo.
pause