const { exec } = require('child_process');
const util = require('util');

/**
 * Promisified version of child_process.exec
 * @param {string} command - Command to execute
 * @param {Object} [options] - Options to pass to exec
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
const execAsync = util.promisify(exec);

module.exports = {
  execAsync
}; 