const fs = require('fs').promises;
const path = require('path');
const Logger = require('../utils/logger');
const config = require('../config');

/**
 * Service for file operations
 */
class FileService {
  /**
   * Read a JSON file
   * @param {string} filePath - Path to the file
   * @returns {Promise<Object|null>} - The parsed JSON content or null if error
   */
  async readJsonFile(filePath) {
    try {
      // Check if the file exists first
      try {
        await fs.access(filePath);
      } catch (error) {
        Logger.warn(`File does not exist at path: ${filePath}`);
        return null;
      }
      
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      Logger.error(`Error reading JSON file at ${filePath}`, error);
      return null;
    }
  }

  /**
   * Write a JSON file
   * @param {string} filePath - Path to the file
   * @param {Object} data - Data to write
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  async writeJsonFile(filePath, data) {
    try {
      // Ensure the directory exists
      const dir = path.dirname(filePath);
      try {
        await fs.access(dir);
      } catch (error) {
        // Create directory if it doesn't exist
        await fs.mkdir(dir, { recursive: true });
      }
      
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      Logger.error(`Error writing JSON file at ${filePath}`, error);
      return false;
    }
  }

  /**
   * Resolve a path relative to the project root
   * @param {string} relativePath - Path relative to project root
   * @returns {string} - Absolute path
   */
  resolvePath(relativePath) {
    if (!relativePath || typeof relativePath !== 'string') {
      Logger.warn(`Invalid path provided to resolvePath: ${relativePath}`);
      return '';
    }
    return path.resolve(config.paths.root, relativePath);
  }

  /**
   * Get the directory containing a file
   * @param {string} filePath - Path to the file
   * @returns {string} - Directory path
   */
  getDirectory(filePath) {
    return path.dirname(filePath);
  }
  
  /**
   * Check if a file exists
   * @param {string} filePath - Path to the file
   * @returns {Promise<boolean>} - True if the file exists, false otherwise
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new FileService();