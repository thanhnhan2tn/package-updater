const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const { remote } = require('webdriverio');
const packageMappings = require('../config/packageMappings');

/**
 * Get the latest version of a package using yarn info
 * @param {string} packageName - The name of the package
 * @returns {Promise<string>} - The latest version or null if not found
 */
async function getVersionFromYarn(packageName) {
  try {
    const { stdout } = await execAsync(`yarn info ${packageName} version`);
    // Extract version from output (format: "3.13.18")
    const version = stdout.trim();
    if (version && version.match(/^\d+\.\d+\.\d+$/)) {
      return version;
    }
    return null;
  } catch (error) {
    console.error(`Error getting version from yarn for ${packageName}:`, error.message);
    return null;
  }
}

/**
 * Get the latest version of a package by scraping a custom URL
 * @param {string} packageName - The name of the package
 * @param {Object} mapping - The mapping configuration for the package
 * @returns {Promise<string>} - The latest version or null if not found
 */
async function getVersionFromCustomUrl(packageName, mapping) {
  try {
    // Initialize WebDriver
    const browser = await remote({
      capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          args: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
        }
      }
    });

    // Navigate to the custom URL
    await browser.url(mapping.url);
    
    // Wait for the page to load
    await browser.pause(2000);
    
    // Get the version element using the custom selector
    const versionElement = await browser.$(mapping.selector);
    const versionText = await versionElement.getText();
    
    // Close the browser
    await browser.deleteSession();
    
    // Extract version using the custom regex
    const versionMatch = versionText.match(mapping.regex);
    if (versionMatch && versionMatch[1]) {
      return versionMatch[1];
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting version from custom URL for ${packageName}:`, error.message);
    return null;
  }
}

/**
 * Get the latest version of a package by scraping GitHub releases
 * @param {string} packageName - The name of the package
 * @returns {Promise<string>} - The latest version or null if not found
 */
async function getVersionFromGitHub(packageName) {
  try {
    // Initialize WebDriver
    const browser = await remote({
      capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          args: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
        }
      }
    });

    // Navigate to GitHub releases page
    await browser.url(`https://github.com/${packageName}/${packageName}/releases`);
    
    // Wait for the page to load
    await browser.pause(2000);
    
    // Get the first release version (latest)
    const versionElement = await browser.$('h1.release-title');
    const versionText = await versionElement.getText();
    
    // Close the browser
    await browser.deleteSession();
    
    // Extract version from text (format: "v0.30.0")
    const versionMatch = versionText.match(/v(\d+\.\d+\.\d+)/);
    if (versionMatch && versionMatch[1]) {
      return versionMatch[1];
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting version from GitHub for ${packageName}:`, error.message);
    return null;
  }
}

/**
 * Get the latest version of a package using multiple methods
 * @param {string} packageName - The name of the package
 * @returns {Promise<string>} - The latest version or error message
 */
async function getLatestVersion(packageName) {
  // First try yarn info
  const yarnVersion = await getVersionFromYarn(packageName);
  if (yarnVersion) {
    return yarnVersion;
  }
  
  // Check if there's a custom mapping for this package
  if (packageMappings[packageName]) {
    const customVersion = await getVersionFromCustomUrl(packageName, packageMappings[packageName]);
    if (customVersion) {
      return customVersion;
    }
  }
  
  // If no custom mapping or custom mapping fails, try GitHub releases
  const githubVersion = await getVersionFromGitHub(packageName);
  if (githubVersion) {
    return githubVersion;
  }
  
  return 'Error fetching version';
}

module.exports = {
  getLatestVersion
}; 