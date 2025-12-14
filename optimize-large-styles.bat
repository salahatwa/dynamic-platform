@echo off
echo ========================================
echo CSS Optimization Helper
echo ========================================

echo.
echo This script helps identify and optimize large CSS files.
echo.

cd /d "%~dp0"

echo Analyzing component styles...
echo.

echo ========================================
echo Large CSS Files (>5KB)
echo ========================================

REM Check for large CSS/SCSS files
for /r "src" %%f in (*.css *.scss) do (
    set /a sizeKB=%%~zf/1024
    if !sizeKB! gtr 5 (
        echo [!sizeKB! KB] %%f
    )
)

echo.
echo ========================================
echo Optimization Recommendations
echo ========================================

echo.
echo 1. Template Editor Enhanced (24KB+):
echo    - Split into multiple SCSS files
echo    - Extract toolbar styles to shared component
echo    - Use CSS Grid instead of complex flexbox
echo    - Remove unused CSS rules
echo.

echo 2. API Keys Component (8KB+):
echo    - Extract table styles to shared component
echo    - Use global form styles
echo    - Simplify responsive layouts
echo.

echo 3. Apps Component (7KB+):
echo    - Extract card styles to shared component
echo    - Use CSS Grid for layouts
echo    - Simplify responsive breakpoints
echo.

echo 4. PDF Parameters Dialog (7KB+):
echo    - Use shared modal styles
echo    - Extract form styles to global
echo    - Simplify dialog layouts
echo.

echo ========================================
echo Quick Optimization Steps
echo ========================================

echo.
echo Step 1: Create shared styles directory
if not exist "src\styles\components" (
    mkdir "src\styles\components"
    echo Created: src\styles\components\
)

echo.
echo Step 2: Extract common patterns
echo Creating shared style templates...

REM Create shared button styles
if not exist "src\styles\components\_buttons.scss" (
    echo // Shared button styles > "src\styles\components\_buttons.scss"
    echo // Extract common button patterns here >> "src\styles\components\_buttons.scss"
    echo Created: _buttons.scss template
)

REM Create shared form styles
if not exist "src\styles\components\_forms.scss" (
    echo // Shared form styles > "src\styles\components\_forms.scss"
    echo // Extract common form patterns here >> "src\styles\components\_forms.scss"
    echo Created: _forms.scss template
)

REM Create shared modal styles
if not exist "src\styles\components\_modals.scss" (
    echo // Shared modal styles > "src\styles\components\_modals.scss"
    echo // Extract common modal patterns here >> "src\styles\components\_modals.scss"
    echo Created: _modals.scss template
)

REM Create shared table styles
if not exist "src\styles\components\_tables.scss" (
    echo // Shared table styles > "src\styles\components\_tables.scss"
    echo // Extract common table patterns here >> "src\styles\components\_tables.scss"
    echo Created: _tables.scss template
)

echo.
echo Step 3: Update global styles
echo Add imports to src\styles.scss:
echo @import 'styles/components/buttons';
echo @import 'styles/components/forms';
echo @import 'styles/components/modals';
echo @import 'styles/components/tables';

echo.
echo Step 4: Refactor component styles
echo - Move common styles to shared files
echo - Keep only component-specific styles in component files
echo - Use CSS custom properties for theming

echo.
echo ========================================
echo Bundle Size Verification
echo ========================================

echo.
echo After optimization, run:
echo 1. build-uat-clean.bat - Clean build with size reporting
echo 2. analyze-bundle.bat - Detailed bundle analysis
echo 3. ng build --configuration=uat - Verify no budget errors

echo.
echo Target sizes after optimization:
echo - Component styles: ^< 10KB each
echo - Total bundle: ^< 1.5MB
echo - No budget warnings or errors

echo.
pause