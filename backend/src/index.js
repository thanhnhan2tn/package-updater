const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { getLatestVersion } = require('./utils/versionChecker');
const { upgradePackage } = require('./utils/packageUpgrader');
const { execAsync } = require('./utils/execAsync');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Function to read package.json files
async function readPackageJson(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

// Function to process dependencies
function processDependencies(dependencies = {}) {
  return Object.entries(dependencies).map(([name, version]) => ({
    id: name,
    name,
    version: version.replace(/[\^~]/g, ''),
    type: 'dependency'
  }));
}

// Function to get all packages without version information
async function getAllPackages() {
  try {
    const projectsConfig = await fs.readFile(path.join(__dirname, '../projects.json'), 'utf8');
    const projects = JSON.parse(projectsConfig);
    
    const allPackages = [];
    
    for (const project of projects) {
      // Handle frontend dependencies
      if (project.frontend) {
        let frontendPath = project.frontend;
        
        // If it's a git URL, clone the repository
        if (frontendPath.startsWith('http')) {
          const repoName = frontendPath.split('/').pop().replace('.git', '');
          const clonePath = path.join(__dirname, '../../temp', repoName);
          
          // Clone the repository if it doesn't exist
          if (!fs.existsSync(clonePath)) {
            await execAsync(`git clone ${frontendPath} ${clonePath}`);
          }
          
          frontendPath = path.join(clonePath, 'package.json');
        }
        
        const frontendPackageJson = await readPackageJson(frontendPath);
        if (frontendPackageJson) {
          const frontendDeps = processDependencies(frontendPackageJson.dependencies);
          const frontendDevDeps = processDependencies(frontendPackageJson.devDependencies).map(dep => ({
            ...dep,
            type: 'devDependency'
          }));
          
          allPackages.push(...frontendDeps, ...frontendDevDeps);
        }
      }
      
      // Handle server dependencies
      if (project.server) {
        let serverPath = project.server;
        
        // If it's a git URL, clone the repository
        if (serverPath.startsWith('http')) {
          const repoName = serverPath.split('/').pop().replace('.git', '');
          const clonePath = path.join(__dirname, '../../temp', repoName);
          
          // Clone the repository if it doesn't exist
          if (!fs.existsSync(clonePath)) {
            await execAsync(`git clone ${serverPath} ${clonePath}`);
          }
          
          serverPath = path.join(clonePath, 'package.json');
        }
        
        const serverPackageJson = await readPackageJson(serverPath);
        if (serverPackageJson) {
          const serverDeps = processDependencies(serverPackageJson.dependencies);
          const serverDevDeps = processDependencies(serverPackageJson.devDependencies).map(dep => ({
            ...dep,
            type: 'devDependency'
          }));
          
          allPackages.push(...serverDeps, ...serverDevDeps);
        }
      }
    }
    
    // Remove duplicates based on package ID
    const uniquePackages = Array.from(new Map(allPackages.map(pkg => [pkg.id, pkg])).values());
    
    return uniquePackages;
  } catch (error) {
    console.error('Error getting all packages:', error);
    return [];
  }
}

// API endpoint to get all packages without version information
app.get('/api/packages', async (req, res) => {
  try {
    const packages = await getAllPackages();
    res.json(packages);
  } catch (error) {
    console.error('Error in /api/packages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to get version information for a specific package
app.get('/api/package-version/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const latestVersion = await getLatestVersion(id);
    res.json({ id, latestVersion });
  } catch (error) {
    console.error(`Error in /api/package-version/${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to get all dependencies with version information
app.get('/api/dependencies', async (req, res) => {
  try {
    const packages = await getAllPackages();
    const dependenciesWithVersions = await Promise.all(
      packages.map(async (pkg) => {
        const latestVersion = await getLatestVersion(pkg.id);
        return {
          ...pkg,
          latestVersion
        };
      })
    );
    res.json(dependenciesWithVersions);
  } catch (error) {
    console.error('Error in /api/dependencies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add upgrade package endpoint
app.post('/api/upgrade-package', async (req, res) => {
  const { packageName, projectPath, type } = req.body;
  
  if (!packageName || !projectPath || !type) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Change to the project directory
    process.chdir(projectPath);

    // Determine the package manager command based on type
    const command = type === 'frontend' ? 'npm' : 'yarn';
    const upgradeCommand = `${command} install ${packageName}@latest`;

    // Execute the upgrade command
    const { stdout, stderr } = await execPromise(upgradeCommand);

    // Return success response
    res.json({
      success: true,
      message: `Successfully upgraded ${packageName}`,
      output: stdout,
      error: stderr
    });
  } catch (error) {
    console.error(`Error upgrading package ${packageName}:`, error);
    res.status(500).json({
      error: `Failed to upgrade package: ${error.message}`,
      details: error.stderr || error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 