@echo off
echo ========================================
echo Serving Frontend - PRODUCTION (Local Test)
echo ========================================

echo WARNING: This serves the production build locally for testing.
echo This is NOT for actual production deployment.
echo.

echo Starting Angular development server with production configuration...
echo Environment: Production
echo API URL: https://api.yourdomain.com/api
echo Frontend URL: http://localhost:4200
echo.

set /p confirm="Continue with production configuration test? (y/N): "
if /i not "%confirm%"=="y" (
    echo Production serve cancelled.
    pause
    exit /b 0
)

ng serve --configuration=production --open