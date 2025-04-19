/**
 * Application configuration
 */

require('dotenv').config();
const path = require('path');
const Joi = require('joi');

const packageManager = process.env.PACKAGE_MANAGER || 'npm';
const installCmd = packageManager === 'yarn'
  ? 'yarn install --mode update-lockfile'
  : 'npm install --package-lock-only';

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

const schema = Joi.object({
  server: Joi.object({
    port: Joi.number().integer().min(1).max(65535).required(),
    host: Joi.string().required(),
  }).required(),
  paths: Joi.object({
    root: Joi.string().required(),
    projects: Joi.string().required(),
  }).required(),
  packageManager: Joi.object({
    command: Joi.string().valid('npm','yarn').required(),
    installCommand: Joi.string().required(),
  }).required(),
});
const { error } = schema.validate(config);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = config; 