import axios from 'axios';

const IMAGES_URL = 'http://localhost:3001/api/docker/images';
const DOCKER_API_URL = 'http://localhost:3001/api/docker';

/**
 * Fetch Docker images optionally filtered by projectName
 * @param {string} [projectName]
 */
export const fetchDockerImages = async (projectName) => {
  const url = projectName
    ? `${DOCKER_API_URL}/images?projectName=${encodeURIComponent(projectName)}`
    : IMAGES_URL;
  const response = await axios.get(url);
  const raw = response.data || [];
  // Map backend fields to frontend DockerImage model
  return raw.map((p) => ({
    name: p.imageName || '',
    tag: p.currentVersion || '',
    latestTag: p.latestVersion ?? null,
    // determine outdated: true if new latestVersion differs
    outdated: p.latestVersion != null ? p.latestVersion !== p.currentVersion : null,
    projectId: p.project,
    registry: p.type || '',
  }));
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
