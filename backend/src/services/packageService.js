const Logger = require('../utils/logger');
const fileService = require('./fileService');
const projectService = require('./projectService');
const commandService = require('./commandService');
const { getLatestVersion } = require('../utils/versionChecker');
const fs = require('fs').promises;
const path = require('path');

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
    try {
      // First check if the file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        Logger.warn(`Package.json file does not exist at path: ${filePath}`);
        return null;
      }
      
      return fileService.readJsonFile(filePath);
    } catch (error) {
      Logger.error(`Error reading package.json at ${filePath}`, error);
      return null;
    }
  }

  /**
   * Get all packages from selected projects
   * @param {string} [projectName] - Optional project name to only get packages for
   * @returns {Promise<Array>} - List of packages
   */
  async getAllPackages(projectName) {
    // Serve from cache if valid and no filter
    const now = Date.now();
    if (!projectName && packagesCache.data.length && (now - packagesCache.timestamp) < PACKAGE_CACHE_TTL) {
      return packagesCache.data;
    }
    // Build fresh list
    const projects = await projectService.getProjects();
    let idCounter = 1;
    const list = [];
    // helper to add dependencies
    const addDeps = async (pkgJson, type, projectName) => {
      if (pkgJson && pkgJson.dependencies) {
        Object.entries(pkgJson.dependencies).forEach(([name, version]) => {
          list.push({
            id: `pkg-${idCounter++}`,
            project: projectName,
            type,
            name,
            currentVersion: version.replace(/[\^~]/g, ''),
            latestVersion: null
          });
        });
      }
    };
    for (const project of projects) {
      if (projectName && project.name !== projectName) continue;
      const fpath = projectService.getPackageJsonPath(project, 'frontend');
      if (fpath) await addDeps(await this.readPackageJson(fpath), 'frontend', project.name);
      const spath = projectService.getPackageJsonPath(project, 'server');
      if (spath) await addDeps(await this.readPackageJson(spath), 'server', project.name);
    }
    // update cache if global
    if (!projectName) {
      packagesCache = { timestamp: now, data: list, idMap: new Map(list.map(p => [p.id, p])) };
    }
    return list;
  }

  /**
   * Get version information for a specific package by name
   * @param {string} projectName - Project name
   * @param {string} name - Package name
   * @returns {Promise<Object|null>} - Package version information or null if not found
   */
  async getPackageVersion(projectName, name) {
    try {
      // load packages for the project
      const packages = await this.getAllPackages(projectName);
      // find matching package
      const pkg = packages.find(p => p.name === name && p.project === projectName);
      if (!pkg) {
        return null;
      }
      const latestVersion = await getLatestVersion(pkg.name);
      return {
        project: pkg.project,
        type: pkg.type,
        name: pkg.name,
        currentVersion: pkg.currentVersion,
        latestVersion
      };
    } catch (error) {
      Logger.error(`Error getting package version for ${name} in project ${projectName}`, error);
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
    return Promise.all(Object.entries(dependencies).map(async ([name, version]) => ({
      name,
      currentVersion: version.replace(/[\^~]/g, ''),
      latestVersion: await getLatestVersion(name)
    })));
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

      // atomic write
      const tmp = `${packageJsonPath}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(packageJson, null, 2));
      await fs.rename(tmp, packageJsonPath);

      // Get the directory containing the package.json
      const projectDir = fileService.getDirectory(packageJsonPath);
      
      // only install if version changed
      if (packageInfo.latestVersion !== packageInfo.currentVersion) {
        const installResult = await commandService.installDependencies(projectDir);
        if (!installResult.success) throw new Error(`Failed to install dependencies: ${installResult.error}`);
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

const PACKAGE_CACHE_TTL = 60000; // 60 seconds
let packagesCache = { timestamp: 0, data: [], idMap: new Map() };

module.exports = new PackageService(); 