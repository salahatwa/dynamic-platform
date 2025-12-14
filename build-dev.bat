@echo off
echo ========================================
echo Building Frontend - DEVELOPMENT
echo ========================================

echo Building Angular application for development...
ng build --configuration=development

echo.
echo Development build completed!
echo Output directory: dist/dynamic-platform
echo.

echo To serve locally: ng serve --configuration=development
echo URL: http://localhost:4200
echo API URL: http://localhost:8080/api
echo.

pause