const API_BASE_URL = 'http://localhost:3001/api';

export const fetchPackages = async () => {
  const response = await fetch(`${API_BASE_URL}/packages`);
  if (!response.ok) {
    throw new Error('Failed to fetch packages');
  }
  return response.json();
};

export const fetchPackageVersion = async (id) => {
  const response = await fetch(`${API_BASE_URL}/package-version/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch package version');
  }
  return response.json();
};

export const upgradePackage = async (projectName, packageInfo) => {
  const response = await fetch(`${API_BASE_URL}/upgrade`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ projectName, packageInfo }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to upgrade package');
  }
  
  return response.json();
}; 