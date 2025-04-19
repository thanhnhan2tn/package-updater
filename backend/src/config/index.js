const path = require('path');

/**
 * Application configuration
 */
const packageManager = process.env.PACKAGE_MANAGER || 'npm';
const installCmd = packageManager === 'yarn'
  ? 'yarn install --mode update-lockfile'
  : 'npm install --legacy-peer-deps --package-lock-only';

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
    command: packageManager,
    installCommand: installCmd,
  },
};

module.exports = config; 