@echo off
echo ========================================
echo Starting Frontend with Docker - UAT
echo ========================================

echo Building and starting UAT frontend...
docker-compose -f docker-compose.frontend.yml --profile uat up --build -d

echo.
echo UAT frontend started!
echo Frontend URL: http://localhost:4200
echo API URL: https://dynamic-platform-api-latest.onrender.com/api
echo.

echo To view logs: docker-compose -f docker-compose.frontend.yml logs -f frontend-uat
echo To stop: docker-compose -f docker-compose.frontend.yml --profile uat down
echo.

pause