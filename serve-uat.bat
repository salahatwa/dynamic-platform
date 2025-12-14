@echo off
echo ========================================
echo Serving Frontend - UAT
echo ========================================

echo Starting Angular development server with UAT configuration...
echo Environment: UAT
echo API URL: https://dynamic-platform-api-latest.onrender.com/api
echo Frontend URL: http://localhost:4200
echo.

echo This will connect to the UAT backend on Render.
echo.

ng serve --configuration=uat --open