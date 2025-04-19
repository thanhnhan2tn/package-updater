const Logger = require('../utils/logger');
const fileService = require('./fileService');
const projectService = require('./projectService');
const commandService = require('./commandService');
const { getLatestVersion } = require('../utils/versionChecker');

/**
 * Service for package operations
 */
class PackageService {
  /**
   * Read a package.json file
   * @param {string} filePath - Path to the package.json file
   * @returns {Promise<Object|null>} - Package.json content or null if error
   */
  async readPackageJson(filePath) {
    return fileService.readJsonFile(filePath);
  }

  /**
   * Get all packages from all projects
   * @returns {Promise<Array>} - List of packages
   */
  async getAllPackages() {
    try {
      const projects = await projectService.getProjects();
      const packages = [];
      let idCounter = 1;

      for (const project of projects) {
        // Get frontend dependencies
        const frontendPath = projectService.getPackageJsonPath(project, 'frontend');
        if (frontendPath) {
          const frontendPackage = await this.readPackageJson(frontendPath);
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
        }

        // Get server dependencies
        const serverPath = projectService.getPackageJsonPath(project, 'server');
        if (serverPath) {
          const serverPackage = await this.readPackageJson(serverPath);
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
      }

      return packages;
    } catch (error) {
      Logger.error('Error getting all packages', error);
      return [];
    }
  }

  /**
   * Get version information for a specific package
   * @param {string} id - Package ID
   * @returns {Promise<Object|null>} - Package version information or null if not found
   */
  async getPackageVersion(id) {
    try {
      const packages = await this.getAllPackages();
      const pkg = packages.find(p => p.id === id);
      
      if (!pkg) {
        return null;
      }
      
      const latestVersion = await getLatestVersion(pkg.name);
      
      return {
        id: pkg.id,
        name: pkg.name,
        currentVersion: pkg.currentVersion,
        latestVersion
      };
    } catch (error) {
      Logger.error(`Error getting package version for ${id}`, error);
      return null;
    }
  }

  /**
   * Process dependencies from a package.json
   * @param {Object} dependencies - Dependencies object from package.json
   * @returns {Promise<Array>} - List of processed dependencies
   */
  async processDependencies(dependencies) {
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

  /**
   * Get all dependencies with version information
   * @returns {Promise<Array>} - List of dependencies with version information
   */
  async getAllDependencies() {
    try {
      const projects = await projectService.getProjects();
      const results = [];

      for (const project of projects) {
        // Process frontend dependencies
        const frontendPath = projectService.getPackageJsonPath(project, 'frontend');
        if (frontendPath) {
          const frontendPackage = await this.readPackageJson(frontendPath);
          if (frontendPackage && frontendPackage.dependencies) {
            const frontendDeps = await this.processDependencies(frontendPackage.dependencies);
            results.push(...frontendDeps.map(dep => ({
              ...dep,
              project: project.name,
              type: 'frontend'
            })));
          }
        }

        // Process server dependencies
        const serverPath = projectService.getPackageJsonPath(project, 'server');
        if (serverPath) {
          const serverPackage = await this.readPackageJson(serverPath);
          if (serverPackage && serverPackage.dependencies) {
            const serverDeps = await this.processDependencies(serverPackage.dependencies);
            results.push(...serverDeps.map(dep => ({
              ...dep,
              project: project.name,
              type: 'server'
            })));
          }
        }
      }

      return results;
    } catch (error) {
      Logger.error('Error getting all dependencies', error);
      return [];
    }
  }

  /**
   * Upgrade a package in a project
   * @param {Object} project - Project object
   * @param {Object} packageInfo - Package information
   * @returns {Promise<Object>} - Upgrade result
   */
  async upgradePackage(project, packageInfo) {
    try {
      const { name, latestVersion, type } = packageInfo;
      
      // Get the package.json path
      const packageJsonPath = projectService.getPackageJsonPath(project, type);
      if (!packageJsonPath) {
        throw new Error(`Invalid package type: ${type}`);
      }
      
      Logger.info(`Upgrading package in: ${packageJsonPath}`);
      
      // Read current package.json
      const packageJson = await this.readPackageJson(packageJsonPath);
      if (!packageJson) {
        throw new Error('Could not read package.json');
      }

      // Update the version in package.json
      if (packageJson.dependencies && packageJson.dependencies[name]) {
        packageJson.dependencies[name] = `^${latestVersion}`;
      } else if (packageJson.devDependencies && packageJson.devDependencies[name]) {
        packageJson.devDependencies[name] = `^${latestVersion}`;
      } else {
        throw new Error(`Package ${name} not found in dependencies or devDependencies`);
      }

      // Write updated package.json
      const writeSuccess = await fileService.writeJsonFile(packageJsonPath, packageJson);
      if (!writeSuccess) {
        throw new Error('Failed to write updated package.json');
      }

      // Get the directory containing the package.json
      const projectDir = fileService.getDirectory(packageJsonPath);
      
      // Install the updated package
      const installResult = await commandService.installDependencies(projectDir);
      if (!installResult.success) {
        throw new Error(`Failed to install dependencies: ${installResult.error}`);
      }

      return {
        success: true,
        message: `Successfully upgraded ${name} to version ${latestVersion}`,
        package: {
          name,
          version: latestVersion
        }
      };
    } catch (error) {
      Logger.error('Error upgrading package', error);
      return {
        success: false,
        message: error.message || 'Failed to upgrade package'
      };
    }
  }
}

module.exports = new PackageService(); 