const Logger = require('../utils/logger');
const projectService = require('../services/projectService');

/**
 * Controller for project operations
 */
class ProjectController {
  /**
   * Get all projects
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllProjects(req, res) {
    try {
      Logger.info('Getting all projects');
      const projects = await projectService.getProjects();
      
      Logger.info(`Found ${projects.length} projects`);
      res.json(projects);
    } catch (error) {
      Logger.error('Error in getAllProjects controller', error);
      Logger.error('Error stack:', error.stack);
      res.status(500).json({ 
        error: 'Failed to get projects', 
        message: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Get a project by name
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProjectByName(req, res) {
    try {
      const { projectName } = req.params;
      
      if (!projectName) {
        return res.status(400).json({ error: 'Project name is required' });
      }
      
      const project = await projectService.getProjectByName(projectName);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.json(project);
    } catch (error) {
      Logger.error('Error in getProjectByName controller', error);
      res.status(500).json({ error: 'Failed to get project' });
    }
  }
}

module.exports = new ProjectController();
