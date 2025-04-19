/**
 * Simple logger utility
 */
class Logger {
  /**
   * Log an info message
   * @param {string} message - The message to log
   * @param {Object} [data] - Optional data to include in the log
   */
  static info(message, data = {}) {
    console.log(`[INFO] ${message}`, Object.keys(data).length ? data : '');
  }

  /**
   * Log an error message
   * @param {string} message - The message to log
   * @param {Error|Object} [error] - Optional error or data to include in the log
   */
  static error(message, error = {}) {
    console.error(`[ERROR] ${message}`, error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }

  /**
   * Log a debug message
   * @param {string} message - The message to log
   * @param {Object} [data] - Optional data to include in the log
   */
  static debug(message, data = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, Object.keys(data).length ? data : '');
    }
  }
}

module.exports = Logger; 