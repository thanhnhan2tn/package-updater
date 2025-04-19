import axios from 'axios';

const IMAGES_URL = 'http://localhost:3001/api/docker/images';
const DOCKER_API_URL = 'http://localhost:3001/api/docker';

/**
 * Fetch all Docker images
 */
export const fetchDockerImages = async () => {
  const response = await axios.get(IMAGES_URL);
  return response.data;
};

/**
 * Get latest version for a Docker image
 * @param {string} projectName - Name of the project
 * @param {string} type - Image type ('frontend' or 'server')
 */
export const checkDockerImageVersion = async (projectName, type) => {
  // Fetch Docker image info including latestVersion
  const response = await axios.get(`${DOCKER_API_URL}/image/${projectName}/${type}`);
  return response.data;
};

/**
 * Upgrade a Docker image via backend
 * @param {string} projectName
 * @param {{imageName:string,latestVersion:string,type:string}} payload
 */
export const upgradeDockerImage = async (projectName, payload) => {
  const response = await axios.post(`${DOCKER_API_URL}/upgrade/${projectName}`, payload);
  return response.data;
};
