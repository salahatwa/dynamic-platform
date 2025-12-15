// =============================================================================
// UAT ENVIRONMENT CONFIGURATION
// =============================================================================
// This environment is used for User Acceptance Testing
// It points to the UAT backend server on Render

export const environment = {
  production: false,
  name: 'uat',
  apiUrl: 'https://dynamic-platform-api-latest.onrender.com/api',
  
  // GitHub Pages deployment configuration
  deploymentUrl: 'https://salahatwa.github.io/dynamic-platform',
  
  // Feature flags for UAT
  features: {
    enableDebugMode: true,
    enableConsoleLogging: true,
    enableDevTools: true,
    enableMockData: false,
    enablePerformanceMonitoring: true
  },
  
  // UAT specific settings
  config: {
    logLevel: 'info',
    enableSourceMaps: true,
    enableHotReload: false,
    cacheTimeout: 300000, // 5 minutes caching
    requestTimeout: 45000, // 45 seconds (longer for remote server)
    retryAttempts: 3
  },
  
  // OAuth and external services (UAT)
  oauth: {
    googleClientId: 'your-uat-google-client-id',
    redirectUri: 'https://uat.yourdomain.com/oauth/callback'
  },
  
  // Analytics and monitoring (enabled for testing)
  analytics: {
    enabled: true,
    trackingId: 'UA-XXXXXXXX-2', // UAT tracking ID
    enableErrorReporting: true
  },
  
  // UAT specific URLs and endpoints
  urls: {
    documentationUrl: 'https://uat-docs.yourdomain.com',
    supportUrl: 'https://uat-support.yourdomain.com',
    feedbackUrl: 'https://uat-feedback.yourdomain.com'
  }
};