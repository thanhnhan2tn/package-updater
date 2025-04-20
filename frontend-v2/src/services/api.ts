import { API_URL } from '@/data/config';
import { Project } from '@/types/dependency';
import axios from 'axios';


const fetchApi = async (endpoint: string, options: any = {}) => {
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

export const fetchPackages = (projectName: string | null) => {
  const endpoint = projectName
    ? `/packages?projectName=${encodeURIComponent(projectName)}`
    : '/packages';
  return fetchApi(endpoint);
};


export const fetchPackageVersion = (id: string) => {
  return fetchApi(`/package-version/${id}`);
};

export const upgradePackage = (projectName: string, packageInfo: any) => {
  return fetchApi('/upgrade', {
    method: 'POST',
    body: JSON.stringify({ projectName, packageInfo }),
  });
};

export const fetchProjects = async () : Promise<Project[]> => {
  try {
    const response = await axios.get(`${API_URL}/projects`);
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

const IMAGES_URL = `${API_URL}/docker/images`;
const DOCKER_API_URL = `${API_URL}/docker`;

export const fetchDockerImages = async (projectName: string | null) => {
  const url = projectName
    ? `${DOCKER_API_URL}/images?projectName=${encodeURIComponent(projectName)}`
    : IMAGES_URL;
  const response = await axios.get(url);
  const raw = response.data || [];
  // Map backend fields to frontend DockerImage model
  return raw.map((p: any) => ({
    name: p.imageName || '',
    tag: p.currentVersion || '',
    latestTag: p.latestVersion ?? null,
    // determine outdated: true if new latestVersion differs
    outdated: p.latestVersion != null ? p.latestVersion !== p.currentVersion : null,
    projectId: p.project,
    registry: p.type || '',
  }));
};

export const checkDockerImageVersion = async (projectName: string, type: string) => {
  const response = await axios.get(`${DOCKER_API_URL}/image/${projectName}/${type}`);
  return response.data;
};

export const upgradeDockerImage = async (projectName: string, payload: any) => {
  const response = await axios.post(`${DOCKER_API_URL}/upgrade/${projectName}`, payload);
  return response.data;
};
