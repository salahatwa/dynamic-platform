@echo off
echo ========================================
echo Starting Frontend with Docker - PRODUCTION
echo ========================================

echo WARNING: This will start the frontend in PRODUCTION mode!
set /p confirm="Continue with production deployment? (y/N): "
if /i not "%confirm%"=="y" (
    echo Production deployment cancelled.
    pause
    exit /b 0
)

REM Check if production API URL is set
if not defined PROD_API_URL (
    echo WARNING: PROD_API_URL environment variable not set!
    echo Using default: https://api.yourdomain.com/api
    set PROD_API_URL=https://api.yourdomain.com/api
)

echo Building and starting production frontend...
docker-compose -f docker-compose.frontend.yml --profile prod up --build -d

echo.
echo Production frontend started!
echo Frontend URL: http://localhost (port 80)
echo HTTPS URL: https://localhost (port 443)
echo API URL: %PROD_API_URL%
echo.

echo To view logs: docker-compose -f docker-compose.frontend.yml logs -f frontend-prod
echo To stop: docker-compose -f docker-compose.frontend.yml --profile prod down
echo.

pause