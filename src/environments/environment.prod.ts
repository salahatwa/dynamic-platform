// =============================================================================
// PRODUCTION ENVIRONMENT CONFIGURATION
// =============================================================================
// This environment is used for production deployment
// All debug features are disabled for optimal performance and security

export const environment = {
  production: true,
  name: 'production',
  apiUrl: 'https://api.yourdomain.com/api', // Replace with your production API URL
  
  // Feature flags for production (minimal features enabled)
  features: {
    enableDebugMode: false,
    enableConsoleLogging: false,
    enableDevTools: false,
    enableMockData: false,
    enablePerformanceMonitoring: true
  },
  
  // Production optimized settings
  config: {
    logLevel: 'error',
    enableSourceMaps: false,
    enableHotReload: false,
    cacheTimeout: 3600000, // 1 hour caching
    requestTimeout: 30000, // 30 seconds
    retryAttempts: 2
  },
  
  // OAuth and external services (production)
  oauth: {
    googleClientId: 'your-prod-google-client-id',
    redirectUri: 'https://yourdomain.com/oauth/callback'
  },
  
  // Analytics and monitoring (production)
  analytics: {
    enabled: true,
    trackingId: 'UA-XXXXXXXX-1', // Production tracking ID
    enableErrorReporting: true
  },
  
  // Production URLs and endpoints
  urls: {
    documentationUrl: 'https://docs.yourdomain.com',
    supportUrl: 'https://support.yourdomain.com',
    feedbackUrl: 'https://feedback.yourdomain.com'
  },
  
  // Security settings for production
  security: {
    enableCSP: true, // Content Security Policy
    enableHSTS: true, // HTTP Strict Transport Security
    enableXFrameOptions: true,
    sessionTimeout: 1800000 // 30 minutes
  }
};