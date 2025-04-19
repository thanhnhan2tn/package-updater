const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { getLatestVersion } = require('./utils/versionChecker');
const packageService = require('./services/packageService');
const Logger = require('./utils/logger');
const config = require('./config');
const packageRoutes = require('./routes/packageRoutes');
const dockerRoutes = require('./routes/dockerRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();
const PORT = config.server.port;

app.use(cors());
app.use(express.json());

// Function to get all projects from projects.json
async function getProjects() {
  try {
    const configPath = path.join(__dirname, '../../projects.json');
    const configContent = await fs.readFile(configPath, 'utf8');
    return JSON.parse(configContent);
  } catch (error) {
    console.error('Error reading projects.json:', error);
    return [];
  }
}

// Function to read package.json file
async function readPackageJson(filePath) {
  try {
    if (!filePath) {
      console.error('No file path provided to readPackageJson');
      return null;
    }
    // Resolve the path relative to the backend directory
    const absolutePath = path.resolve(__dirname, '../..', filePath);
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

// Routes
app.use('/api', packageRoutes);
app.use('/api/docker', dockerRoutes);
app.use('/api', projectRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  Logger.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  Logger.info(`Server running on port ${PORT}`);
}); 