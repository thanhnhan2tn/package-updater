/**
 * Utility functions for version comparison and management
 */

/**
 * Parses a semantic version string into its components
 * @param {string} version - The version string to parse (e.g., "1.2.3")
 * @returns {Object} An object containing major, minor, and patch numbers
 */
export const parseVersion = (version) => {
  // Handle versions with prefixes like 'v' or '^'
  const cleanVersion = version.replace(/^[^0-9]*/, '');
  
  // Split by dots and convert to numbers
  const parts = cleanVersion.split('.');
  return {
    major: parseInt(parts[0], 10) || 0,
    minor: parseInt(parts[1], 10) || 0,
    patch: parseInt(parts[2], 10) || 0
  };
};

/**
 * Checks if upgrading from current to latest version involves a major version change
 * @param {string} currentVersion - The current version string
 * @param {string} latestVersion - The latest version string
 * @returns {boolean} True if the upgrade involves a major version change
 */
export const isMajorVersionUpgrade = (currentVersion, latestVersion) => {
  if (!currentVersion || !latestVersion) return false;
  
  const current = parseVersion(currentVersion);
  const latest = parseVersion(latestVersion);
  
  return latest.major > current.major;
};

/**
 * Gets a description of the version change
 * @param {string} currentVersion - The current version string
 * @param {string} latestVersion - The latest version string
 * @returns {string} A description of the version change (major, minor, patch)
 */
export const getVersionChangeType = (currentVersion, latestVersion) => {
  if (!currentVersion || !latestVersion) return 'unknown';
  
  const current = parseVersion(currentVersion);
  const latest = parseVersion(latestVersion);
  
  if (latest.major > current.major) return 'major';
  if (latest.minor > current.minor) return 'minor';
  if (latest.patch > current.patch) return 'patch';
  return 'none';
};
