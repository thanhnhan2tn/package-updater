import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

/**
 * Generic fetch wrapper with error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - API response
 */
const fetchApi = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
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
 * Fetch packages optionally filtered by projectName
 * @param {string} [projectName]
 * @returns Promise<Array>
 */
export const fetchPackages = (projectName) => {
  const endpoint = projectName
    ? `/packages?projectName=${encodeURIComponent(projectName)}`
    : '/packages';
  return fetchApi(endpoint);
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

/**
 * Fetch all projects
 * @returns {Promise<Array>} - List of projects
 */
export const fetchProjects = async () => {
  try {
    const response = await axios.get(`${API_URL}/projects`);
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};