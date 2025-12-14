@echo off
echo ========================================
echo Building Frontend - PRODUCTION
echo ========================================

echo WARNING: This will create a production build!
echo Make sure all production configurations are correct.
echo.
set /p confirm="Continue with production build? (y/N): "
if /i not "%confirm%"=="y" (
    echo Production build cancelled.
    pause
    exit /b 0
)

echo Building Angular application for production...
ng build --configuration=production

echo.
echo Production build completed!
echo Output directory: dist/dynamic-platform
echo.

echo Production build features:
echo - Optimized and minified code
echo - No source maps (for security)
echo - AOT compilation enabled
echo - Tree-shaking applied
echo - Bundle size optimized
echo.

echo Build is ready for production deployment.
echo.

pause