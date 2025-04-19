import config from '../config/api';

/**
 * Generic fetch wrapper with error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - API response
 */
const fetchApi = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${config.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

/**
 * Fetch all packages
 * @returns {Promise<Array>} - List of packages
 */
export const fetchPackages = () => {
  return fetchApi('/packages');
};

/**
 * Fetch version information for a specific package
 * @param {string} id - Package ID
 * @returns {Promise<Object>} - Package version information
 */
export const fetchPackageVersion = (id) => {
  return fetchApi(`/package-version/${id}`);
};

/**
 * Upgrade a package
 * @param {string} projectName - Project name
 * @param {Object} packageInfo - Package information
 * @returns {Promise<Object>} - Upgrade result
 */
export const upgradePackage = (projectName, packageInfo) => {
  return fetchApi('/upgrade', {
    method: 'POST',
    body: JSON.stringify({ projectName, packageInfo }),
  });
}; 