@echo off
echo ========================================
echo Serving Frontend - DEVELOPMENT
echo ========================================

echo Starting Angular development server...
echo Environment: Development
echo API URL: http://localhost:8080/api
echo Frontend URL: http://localhost:4200
echo.

echo Make sure your backend is running on http://localhost:8080
echo.

ng serve --configuration=development --open