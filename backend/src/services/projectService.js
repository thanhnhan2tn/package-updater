const Logger = require('../utils/logger');
const fileService = require('./fileService');
const config = require('../config');

/**
 * Service for project operations
 */
class ProjectService {
  /**
   * Get all projects from projects.json
   * @returns {Promise<Array>} - List of projects
   */
  async getProjects() {
    try {
      const projects = await fileService.readJsonFile(config.paths.projects);
      return projects || [];
    } catch (error) {
      Logger.error('Error reading projects.json', error);
      return [];
    }
  }

  /**
   * Get a project by name
   * @param {string} projectName - Name of the project
   * @returns {Promise<Object|null>} - Project object or null if not found
   */
  async getProjectByName(projectName) {
    const projects = await this.getProjects();
    return projects.find(p => p.name === projectName) || null;
  }

  /**
   * Get package.json path for a project
   * @param {Object} project - Project object
   * @param {string} type - Package type ('frontend' or 'server')
   * @returns {string|null} - Path to package.json or null if invalid type
   */
  getPackageJsonPath(project, type) {
    if (!project) return null;
    
    if (type === 'frontend' && project.frontend) {
      return fileService.resolvePath(project.frontend);
    } else if (type === 'server' && project.server) {
      return fileService.resolvePath(project.server);
    }
    
    return null;
  }
}

module.exports = new ProjectService(); 