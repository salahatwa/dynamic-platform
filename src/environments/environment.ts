// =============================================================================
// DEVELOPMENT ENVIRONMENT CONFIGURATION (Default)
// =============================================================================
// This is the default environment used during development
// It points to the local backend server

export const environment = {
  production: false,
  name: 'development',
  // apiUrl: 'http://localhost:8080/api',
  apiUrl: 'http://35.196.142.99:8080/api',
  
  // Feature flags for development
  features: {
    enableDebugMode: true,
    enableConsoleLogging: true,
    enableDevTools: true,
    enableMockData: false,
    enablePerformanceMonitoring: false
  },
  
  // Development specific settings
  config: {
    logLevel: 'debug',
    enableSourceMaps: true,
    enableHotReload: true,
    cacheTimeout: 0, // No caching in development
    requestTimeout: 30000, // 30 seconds
    retryAttempts: 3
  },
  
  // OAuth and external services (development)
  oauth: {
    googleClientId: 'your-dev-google-client-id',
    redirectUri: 'http://localhost:4200/oauth/callback'
  },
  
  // Analytics and monitoring (disabled in dev)
  analytics: {
    enabled: false,
    trackingId: '',
    enableErrorReporting: true
  }
};
