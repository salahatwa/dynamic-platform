@echo off
echo ========================================
echo Building Frontend - UAT
echo ========================================

echo Building Angular application for UAT environment...
ng build --configuration=uat

echo.
echo UAT build completed!
echo Output directory: dist/dynamic-platform
echo API URL: https://dynamic-platform-api-latest.onrender.com/api
echo.

echo Build is ready for UAT deployment.
echo Files are optimized but include source maps for debugging.
echo.

pause