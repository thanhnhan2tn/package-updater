/**
 * API configuration
 */
const config = {
  // Base URL for API requests
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  
  // Request timeout in milliseconds
  timeout: 10000,
  
  // Retry configuration
  retry: {
    maxRetries: 2,
    retryDelay: 1000,
  }
};

export default config; 