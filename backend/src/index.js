const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { getLatestVersion } = require('./utils/versionChecker');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Function to read package.json file
async function readPackageJson(filePath) {
  try {
    // Resolve the path relative to the backend directory
    const absolutePath = path.resolve(__dirname, '../../', filePath);
    console.log(`Reading package.json from: ${absolutePath}`);
    const content = await fs.readFile(absolutePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading package.json at ${filePath}:`, error);
    return null;
  }
}

// Function to process dependencies
async function processDependencies(dependencies) {
  if (!dependencies) return [];
  
  const results = [];
  for (const [name, version] of Object.entries(dependencies)) {
    const latestVersion = await getLatestVersion(name);
    results.push({
      name,
      currentVersion: version.replace(/[\^~]/g, ''),
      latestVersion
    });
  }
  return results;
}

// Function to get all packages without version information
async function getAllPackages() {
  try {
    const configPath = path.join(__dirname, '../../projects.json');
    const configContent = await fs.readFile(configPath, 'utf8');
    const projects = JSON.parse(configContent);

    const packages = [];
    let idCounter = 1;

    for (const project of projects) {
      // Get frontend dependencies
      const frontendPackage = await readPackageJson(project.frontend);
      if (frontendPackage && frontendPackage.dependencies) {
        for (const [name, version] of Object.entries(frontendPackage.dependencies)) {
          packages.push({
            id: `pkg-${idCounter++}`,
            project: project.name,
            type: 'frontend',
            name,
            currentVersion: version.replace(/[\^~]/g, ''),
            latestVersion: null
          });
        }
      }

      // Get server dependencies
      const serverPackage = await readPackageJson(project.server);
      if (serverPackage && serverPackage.dependencies) {
        for (const [name, version] of Object.entries(serverPackage.dependencies)) {
          packages.push({
            id: `pkg-${idCounter++}`,
            project: project.name,
            type: 'server',
            name,
            currentVersion: version.replace(/[\^~]/g, ''),
            latestVersion: null
          });
        }
      }
    }

    return packages;
  } catch (error) {
    console.error('Error getting all packages:', error);
    return [];
  }
}

// Endpoint to get all packages without version information
app.get('/api/packages', async (req, res) => {
  try {
    const packages = await getAllPackages();
    res.json(packages);
  } catch (error) {
    console.error('Error getting packages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to get version information for a specific package
app.get('/api/package-version/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const packages = await getAllPackages();
    const pkg = packages.find(p => p.id === id);
    
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    const latestVersion = await getLatestVersion(pkg.name);
    
    res.json({
      id: pkg.id,
      name: pkg.name,
      currentVersion: pkg.currentVersion,
      latestVersion
    });
  } catch (error) {
    console.error('Error getting package version:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Main endpoint to get all dependencies with version information
app.get('/api/dependencies', async (req, res) => {
  try {
    const configPath = path.join(__dirname, '../../projects.json');
    const configContent = await fs.readFile(configPath, 'utf8');
    const projects = JSON.parse(configContent);

    const results = [];

    for (const project of projects) {
      // Process frontend dependencies
      const frontendPackage = await readPackageJson(project.frontend);
      if (frontendPackage) {
        const frontendDeps = await processDependencies(frontendPackage.dependencies);
        results.push(...frontendDeps.map(dep => ({
          ...dep,
          project: project.name,
          type: 'frontend'
        })));
      }

      // Process server dependencies
      const serverPackage = await readPackageJson(project.server);
      if (serverPackage) {
        const serverDeps = await processDependencies(serverPackage.dependencies);
        results.push(...serverDeps.map(dep => ({
          ...dep,
          project: project.name,
          type: 'server'
        })));
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Error processing dependencies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 