# Angular Build Troubleshooting Guide

## Common Build Errors and Solutions

### 1. Schema Validation Failed - buildOptimizer Error

**Error:**
```
Error: Schema validation failed with the following errors:
Data path "" must NOT have additional properties(buildOptimizer).
```

**Solution:**
The `buildOptimizer`, `aot`, and `namedChunks` properties are deprecated in Angular 17+ with the application builder. These have been removed from the configuration.

**Fixed Configuration:**
```json
"production": {
  "fileReplacements": [...],
  "budgets": [...],
  "outputHashing": "all",
  "optimization": true,
  "sourceMap": false,
  "extractLicenses": true
}
```

### 2. Environment File Not Found

**Error:**
```
Error: File 'src/environments/environment.uat.ts' not found.
```

**Solution:**
Ensure all environment files exist:
- `src/environments/environment.ts` (development)
- `src/environments/environment.uat.ts` (UAT)
- `src/environments/environment.prod.ts` (production)

### 3. TypeScript Compilation Errors

**Error:**
```
Error: src/app/component.ts(10,5): error TS2322: Type 'string' is not assignable to type 'number'.
```

**Solution:**
Fix TypeScript errors in your source code. Common issues:
- Type mismatches
- Missing imports
- Undefined properties
- Incorrect method signatures

### 4. Dependency Issues

**Error:**
```
Error: Cannot resolve dependency 'package-name'
```

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or force install
npm install --force
```

### 5. Memory Issues (Large Projects)

**Error:**
```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

**Solution:**
Increase Node.js memory limit:
```bash
# Windows
set NODE_OPTIONS=--max_old_space_size=8192
ng build --configuration=uat

# Linux/Mac
NODE_OPTIONS=--max_old_space_size=8192 ng build --configuration=uat
```

### 6. Bundle Size Exceeded

**Error:**
```
Error: Bundle initial exceeded maximum budget.
```

**Solution:**
1. **Increase budget limits** in `angular.json`:
```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "1mb",
    "maximumError": "2mb"
  }
]
```

2. **Optimize bundle size**:
- Enable lazy loading for routes
- Remove unused imports
- Use tree-shaking friendly imports
- Analyze bundle with `npm run analyze`

### 7. Base Href Issues

**Error:**
Application loads but assets return 404 errors.

**Solution:**
Ensure base href matches your deployment path:
```bash
# For deployment to /dynamic-platform/ path
ng build --configuration=uat --base-href=/dynamic-platform/

# For root deployment
ng build --configuration=production --base-href=/
```

### 8. CORS Issues in UAT

**Error:**
API calls fail with CORS errors in UAT environment.

**Solution:**
1. **Check API URL** in `environment.uat.ts`:
```typescript
export const environment = {
  apiUrl: 'https://dynamic-platform-api-latest.onrender.com/api'
};
```

2. **Verify backend CORS configuration** allows UAT domain.

### 9. Angular CLI Version Mismatch

**Error:**
```
This version of CLI is only compatible with Angular versions...
```

**Solution:**
Update Angular CLI:
```bash
# Update global CLI
npm install -g @angular/cli@latest

# Update local CLI
npm install @angular/cli@latest --save-dev
```

### 10. Missing Polyfills

**Error:**
Application doesn't work in older browsers.

**Solution:**
Check `polyfills` in `angular.json` and add required polyfills:
```json
"polyfills": [
  "zone.js",
  "zone.js/testing"
]
```

## Build Verification Steps

### 1. Pre-build Checks
```bash
# Check Angular CLI version
ng version

# Check Node.js version (should be 16+ for Angular 17)
node --version

# Install dependencies
npm install
```

### 2. Environment Verification
```bash
# Verify environment files exist
ls src/environments/

# Check environment configurations
cat src/environments/environment.uat.ts
```

### 3. Build Testing
```bash
# Test development build
ng build --configuration=development

# Test UAT build
ng build --configuration=uat

# Test UAT build with base-href
ng build --configuration=uat --base-href=/dynamic-platform/

# Test production build
ng build --configuration=production
```

### 4. Post-build Verification
```bash
# Check output directory
ls -la dist/dynamic-platform/

# Verify index.html base href
grep "base href" dist/dynamic-platform/index.html

# Check bundle sizes
ls -lh dist/dynamic-platform/*.js
```

## Quick Fix Commands

### Clean and Rebuild
```bash
# Clean everything and rebuild
rm -rf dist node_modules package-lock.json
npm install
ng build --configuration=uat --base-href=/dynamic-platform/
```

### Force Dependency Resolution
```bash
# Force install dependencies
npm install --force

# Clear npm cache
npm cache clean --force
```

### Memory Optimization
```bash
# Increase Node.js memory (Windows)
set NODE_OPTIONS=--max_old_space_size=8192

# Increase Node.js memory (Linux/Mac)
export NODE_OPTIONS=--max_old_space_size=8192
```

## Environment-Specific Build Commands

### Development
```bash
npm run build:dev
# or
ng build --configuration=development
```

### UAT
```bash
npm run build:uat
# or
ng build --configuration=uat

# With base-href for deployment
npm run build:uat:deploy
# or
ng build --configuration=uat --base-href=/dynamic-platform/
```

### Production
```bash
npm run build:prod
# or
ng build --configuration=production

# With base-href for deployment
npm run build:prod:deploy
# or
ng build --configuration=production --base-href=/
```

## Automated Troubleshooting

Use the provided scripts for automated troubleshooting:

### 1. Verify Build Configurations
```bash
verify-build-configs.bat
```

### 2. Fix and Build UAT
```bash
fix-and-build-uat.bat
```

### 3. Test UAT Build
```bash
test-uat-build.bat
```

## Getting Help

If you continue to experience issues:

1. **Check Angular CLI documentation**: https://angular.io/cli
2. **Review Angular update guide**: https://update.angular.io/
3. **Check GitHub issues**: https://github.com/angular/angular-cli/issues
4. **Stack Overflow**: Search for specific error messages

## Prevention Tips

1. **Keep dependencies updated** regularly
2. **Use consistent Node.js versions** across environments
3. **Test builds** in CI/CD pipeline
4. **Monitor bundle sizes** with budgets
5. **Use TypeScript strict mode** to catch errors early
6. **Implement proper error handling** in components
7. **Use environment variables** for configuration
8. **Test in multiple browsers** and devices