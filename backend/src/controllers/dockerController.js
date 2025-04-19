const Logger = require('../utils/logger');
const dockerService = require('../services/dockerService');
const projectService = require('../services/projectService');

/**
 * Controller for Docker operations
 */
class DockerController {
  /**
   * Get all Docker images
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllImages(req, res) {
    try {
      Logger.info('Getting all Docker images');
      const images = await dockerService.getAllDockerImages();
      
      // Return an empty array if no images are found
      Logger.info(`Found ${images ? images.length : 0} Docker images`);
      res.json(images || []);
    } catch (error) {
      Logger.error('Error in getAllImages controller', error);
      Logger.error('Error stack:', error.stack);
      res.status(500).json({ 
        error: 'Failed to get Docker images', 
        message: error.message || 'Unknown error'
      });
    }
  }

  /**
   * Get Docker image info for a specific project and type
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getImageInfo(req, res) {
    try {
      Logger.info('Getting Docker image info');
      const { projectName, type } = req.params;
      
      if (!projectName || !type) {
        return res.status(400).json({ error: 'Project name and type are required' });
      }
      
      const project = await projectService.getProjectByName(projectName);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const imageInfo = await dockerService.getDockerImageInfo(project, type);
      if (!imageInfo) {
        return res.status(404).json({ error: 'Docker image not found' });
      }
      
      Logger.info(`Found Docker image info for project ${projectName} and type ${type}`);
      res.json(imageInfo);
    } catch (error) {
      Logger.error('Error in getImageInfo controller', error);
      Logger.error('Error stack:', error.stack);
      res.status(500).json({ error: 'Failed to get Docker image info' });
    }
  }

  /**
   * Upgrade a Docker image
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async upgradeImage(req, res) {
    try {
      Logger.info('Upgrading Docker image');
      const { projectName } = req.params;
      const { imageName, latestVersion, type } = req.body;
      
      if (!projectName || !imageName || !latestVersion || !type) {
        return res.status(400).json({ 
          error: 'Project name, image name, latest version, and type are required' 
        });
      }
      
      const project = await projectService.getProjectByName(projectName);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const result = await dockerService.upgradeDockerImage(project, {
        imageName,
        latestVersion,
        type
      });
      
      if (!result.success) {
        Logger.error(`Failed to upgrade Docker image for project ${projectName}: ${result.message}`);
        return res.status(400).json({ error: result.message });
      }
      
      Logger.info(`Successfully upgraded Docker image for project ${projectName}`);
      res.json(result);
    } catch (error) {
      Logger.error('Error in upgradeImage controller', error);
      Logger.error('Error stack:', error.stack);
      res.status(500).json({ error: 'Failed to upgrade Docker image' });
    }
  }
}

module.exports = new DockerController();
