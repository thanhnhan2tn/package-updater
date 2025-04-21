import { API_URL } from '@/data/config';
import { Project } from '@/types/dependency';
import axios from 'axios';

// Cache for pending requests to prevent duplicates
const pendingRequests: Record<string, Promise<any>> = {};

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
  const key = `packages_${projectName || 'all'}`;
  
  // If we already have a pending request for this key, return it
  if (pendingRequests[key]) {
    console.log(`🔄 Reusing pending request for ${key}`);
    return pendingRequests[key];
  }
  
  console.log(`⚡ API Call: fetchPackages(${projectName}) at ${new Date().toISOString()}`);
  const endpoint = projectName
    ? `/packages?projectName=${encodeURIComponent(projectName)}`
    : '/packages';
    
  // Store the promise in our cache
  const request = fetchApi(endpoint);
  pendingRequests[key] = request;
  
  // Remove from cache once completed
  request.finally(() => {
    delete pendingRequests[key];
  });
  
  return request;
};

export const fetchPackageVersion = (projectName: string, name: string) => {
  const key = `packageVersion_${projectName}_${name}`;
  
  if (pendingRequests[key]) {
    console.log(`🔄 Reusing pending request for ${key}`);
    return pendingRequests[key];
  }
  
  const params = `?projectName=${encodeURIComponent(projectName)}&name=${encodeURIComponent(name)}`;
  const request = fetchApi(`/package-version${params}`);
  
  pendingRequests[key] = request;
  request.finally(() => {
    delete pendingRequests[key];
  });
  
  return request;
};

export const upgradePackage = (projectName: string, packageInfo: any) => {
  return fetchApi('/upgrade', {
    method: 'POST',
    body: JSON.stringify({ projectName, packageInfo }),
  });
};

export const fetchProjects = async (): Promise<Project[]> => {
  const key = 'projects';
  
  if (pendingRequests[key]) {
    console.log(`🔄 Reusing pending request for ${key}`);
    return pendingRequests[key];
  }
  
  console.log(`⚡ API Call: fetchProjects() at ${new Date().toISOString()}`);
  try {
    const request = axios.get(`${API_URL}/projects`).then(response => response.data);
    pendingRequests[key] = request;
    
    request.finally(() => {
      delete pendingRequests[key];
    });
    
    return request;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

const IMAGES_URL = `${API_URL}/docker/images`;
const DOCKER_API_URL = `${API_URL}/docker`;

export const fetchDockerImages = async (projectName: string | null) => {
  const key = `dockerImages_${projectName || 'all'}`;
  
  if (pendingRequests[key]) {
    console.log(`🔄 Reusing pending request for ${key}`);
    return pendingRequests[key];
  }
  
  console.log(`⚡ API Call: fetchDockerImages(${projectName}) at ${new Date().toISOString()}`);
  const url = projectName
    ? `${DOCKER_API_URL}/images?projectName=${encodeURIComponent(projectName)}`
    : IMAGES_URL;
  
  const request = axios.get(url).then(response => {
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
  });
  
  pendingRequests[key] = request;
  request.finally(() => {
    delete pendingRequests[key];
  });
  
  return request;
};

export const checkDockerImageVersion = async (projectName: string, type: string) => {
  const response = await axios.get(`${DOCKER_API_URL}/image/${projectName}/${type}`);
  return response.data;
};

export const upgradeDockerImage = async (projectName: string, payload: any) => {
  const response = await axios.post(`${DOCKER_API_URL}/upgrade/${projectName}`, payload);
  return response.data;
};

export const checkForUpdates = async (projectName: string) => {
  const response = await axios.get(`${API_URL}/project/${encodeURIComponent(projectName)}/check-updates`);
  return response.data;
};

export const commitPackageFix = async (projectName: string, summary: string) => {
  const response = await axios.post(
    `${API_URL}/project/${encodeURIComponent(projectName)}/commit-fix`,
    { summary }
  );
  return response.data;
};
