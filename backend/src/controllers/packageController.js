const Logger = require('../utils/logger');
const packageService = require('../services/packageService');
const projectService = require('../services/projectService');

/**
 * Controller for package-related HTTP requests
 */
class PackageController {
  /**
   * Get all packages
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllPackages(req, res) {
    try {
      const packages = await packageService.getAllPackages();
      res.json(packages);
    } catch (error) {
      Logger.error('Error getting packages', error);
      res.status(500).json({ error: 'Failed to get packages' });
    }
  }

  /**
   * Get version information for a specific package
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPackageVersion(req, res) {
    try {
      const { id } = req.params;
      const packageInfo = await packageService.getPackageVersion(id);
      
      if (!packageInfo) {
        return res.status(404).json({ error: 'Package not found' });
      }
      
      res.json(packageInfo);
    } catch (error) {
      Logger.error('Error getting package version', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get all dependencies with version information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllDependencies(req, res) {
    try {
      const dependencies = await packageService.getAllDependencies();
      res.json(dependencies);
    } catch (error) {
      Logger.error('Error getting dependencies', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Upgrade a package
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async upgradePackage(req, res) {
    try {
      const { projectName, packageInfo } = req.body;
      
      // Validate request
      if (!projectName) {
        return res.status(400).json({ error: 'Project name is required' });
      }
      
      if (!packageInfo || !packageInfo.name || !packageInfo.latestVersion) {
        return res.status(400).json({ error: 'Package information is incomplete' });
      }
      
      if (!packageInfo.type) {
        return res.status(400).json({ error: 'Package type is required' });
      }
      
      // Get project
      const project = await projectService.getProjectByName(projectName);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      // Upgrade package
      const result = await packageService.upgradePackage(project, packageInfo);
      res.json(result);
    } catch (error) {
      Logger.error('Error upgrading package', error);
      res.status(500).json({ error: 'Failed to upgrade package' });
    }
  }
}

module.exports = new PackageController(); 