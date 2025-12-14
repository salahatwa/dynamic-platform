@echo off
echo ========================================
echo Fix and Build UAT Configuration
echo ========================================

cd /d "%~dp0"

echo.
echo Step 1: Installing/updating dependencies...
npm install

echo.
echo Step 2: Cleaning previous builds...
if exist "dist" (
    rmdir /s /q "dist"
    echo Previous build cleaned
)

echo.
echo Step 3: Building UAT configuration with base-href...
echo Command: ng build --configuration=uat --base-href=/dynamic-platform/
echo.

ng build --configuration=uat --base-href=/dynamic-platform/

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS: UAT Build Completed!
    echo ========================================
    echo.
    echo Configuration: UAT
    echo Base href: /dynamic-platform/
    echo API URL: https://dynamic-platform-api-latest.onrender.com/api
    echo Output: dist/dynamic-platform/
    echo.
    
    if exist "dist\dynamic-platform\index.html" (
        echo Verifying index.html base href...
        findstr "base href" "dist\dynamic-platform\index.html"
        echo.
    )
    
    echo Build is ready for UAT deployment!
    echo.
    echo Next steps:
    echo 1. Upload the contents of 'dist/dynamic-platform/' to your UAT server
    echo 2. Configure your web server to serve from /dynamic-platform/ path
    echo 3. Ensure the backend API is accessible at the configured URL
    
) else (
    echo.
    echo ========================================
    echo ERROR: UAT Build Failed!
    echo ========================================
    echo.
    echo The build configuration has been fixed, but there might be other issues.
    echo Please check the error messages above.
    echo.
    echo If you see TypeScript errors, please fix them in your source code.
    echo If you see dependency issues, try: npm install --force
)

echo.
pause