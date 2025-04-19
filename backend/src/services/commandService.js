const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const Logger = require('../utils/logger');
const config = require('../config');
const fs = require('fs');
const path = require('path');

/**
 * Service for executing commands
 */
class CommandService {
  /**
   * Execute a command in a directory
   * @param {string} command - Command to execute
   * @param {string} directory - Directory to execute the command in
   * @returns {Promise<Object>} - Command result
   */
  async executeCommand(command, directory) {
    try {
      Logger.debug(`Executing command: ${command} in ${directory}`);
      const result = await execAsync(`cd ${directory} && ${command}`);
      return {
        success: true,
        stdout: result.stdout,
        stderr: result.stderr
      };
    } catch (error) {
      Logger.error(`Error executing command: ${command} in ${directory}`, error);
      return {
        success: false,
        error: error.message,
        stdout: error.stdout,
        stderr: error.stderr
      };
    }
  }

  /**
   * Install dependencies in a directory
   * @param {string} directory - Directory to install dependencies in
   * @returns {Promise<Object>} - Installation result
   */
  async installDependencies(directory) {
    // Determine package manager per project (Yarn if yarn.lock exists)
    const lockFile = path.join(directory, 'yarn.lock');
    const cmd = fs.existsSync(lockFile)
      ? 'yarn install --mode update-lockfile'
      : config.packageManager.installCommand;
    return this.executeCommand(cmd, directory);
  }
}

module.exports = new CommandService(); 