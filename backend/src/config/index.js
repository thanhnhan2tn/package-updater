const path = require('path');

/**
 * Application configuration
 */
const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
  },
  
  // File paths
  paths: {
    root: path.resolve(__dirname, '../../..'),
    projects: path.resolve(__dirname, '../../../projects.json'),
  },
  
  // Package manager configuration
  packageManager: {
    command: 'npm',
    installCommand: 'npm install --legacy-peer-deps',
  },
};

module.exports = config; 