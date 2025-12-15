@echo off
echo ========================================
echo GitHub Pages Deployment Script
echo ========================================

echo.
echo 1. Cleaning previous build...
if exist "dist" rmdir /s /q dist

echo.
echo 2. Building for GitHub Pages deployment...
call npm run build:uat:deploy

echo.
echo 3. Checking build output...
if not exist "dist\dynamic-platform\browser" (
    echo ERROR: Build failed - browser folder not found
    exit /b 1
)

echo.
echo 4. Build completed successfully!
echo.
echo Next steps:
echo 1. Copy the contents of 'dist/dynamic-platform/browser' to your GitHub Pages repository
echo 2. Or use GitHub Actions to automate deployment
echo.
echo Build location: dist/dynamic-platform/browser
echo GitHub Pages URL: https://salahatwa.github.io/dynamic-platform/
echo.
echo ========================================
echo Deployment build ready!
echo ========================================

pause