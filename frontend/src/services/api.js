// API base URL
const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Fetch all packages from the backend
 * @returns {Promise<Array>} List of packages
 */
export const fetchPackages = async () => {
  const response = await fetch(`${API_BASE_URL}/packages`);
  if (!response.ok) {
    throw new Error('Failed to fetch packages');
  }
  return response.json();
};

/**
 * Fetch version information for a specific package
 * @param {string} id - Package ID
 * @returns {Promise<Object>} Package version information
 */
export const fetchPackageVersion = async (id) => {
  const response = await fetch(`${API_BASE_URL}/package-version/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch package version');
  }
  return response.json();
}; 