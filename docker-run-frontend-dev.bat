@echo off
echo ========================================
echo Starting Frontend with Docker - DEV
echo ========================================

echo Building and starting development frontend...
docker-compose -f docker-compose.frontend.yml --profile dev up --build -d

echo.
echo Development frontend started!
echo Frontend URL: http://localhost:4200
echo API URL: http://localhost:8080/api
echo.

echo To view logs: docker-compose -f docker-compose.frontend.yml logs -f frontend-dev
echo To stop: docker-compose -f docker-compose.frontend.yml --profile dev down
echo.

pause