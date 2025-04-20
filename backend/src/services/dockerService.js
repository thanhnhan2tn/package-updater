const fs = require('fs').promises;
const path = require('path');
const Logger = require('../utils/logger');
const fileService = require('./fileService');
const projectService = require('./projectService');
const axios = require('axios');

// Cache Docker Hub tags
const IMAGE_TAG_TTL = 60000; // 60s TTL
const versionCache = new Map(); // imageName -> { timestamp, version }

/**
 * Service for Docker operations
 */
class DockerService {
  /**
   * Read a Dockerfile
   * @param {string} filePath - Path to the Dockerfile
   * @returns {Promise<string|null>} - Dockerfile content or null if error
   */
  async readDockerfile(filePath) {
    try {
      // Check if the file exists first
      try {
        await fs.access(filePath);
      } catch (error) {
        Logger.warn(`Dockerfile does not exist at path: ${filePath}`);
        return null;
      }
      
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      Logger.error(`Error reading Dockerfile at ${filePath}`, error);
      return null;
    }
  }

  /**
   * Write to a Dockerfile
   * @param {string} filePath - Path to the Dockerfile
   * @param {string} content - Content to write
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  async writeDockerfile(filePath, content) {
    try {
      await fs.writeFile(filePath, content);
      return true;
    } catch (error) {
      Logger.error(`Error writing Dockerfile at ${filePath}`, error);
      return false;
    }
  }

  /**
   * Parse image information from a Dockerfile
   * @param {string} content - Dockerfile content
   * @returns {Object|null} - Image information or null if not found
   */
  parseImageInfo(content) {
    try {
      if (!content) {
        Logger.warn('Empty Dockerfile content provided to parseImageInfo');
        return null;
      }

      Logger.info('Parsing Dockerfile content:', content.substring(0, 100) + (content.length > 100 ? '...' : ''));

      // Match FROM instruction with optional version tag
      const fromMatch = content.match(/FROM\s+([^:\s]+)(?::([^\s]+))?/);
      if (!fromMatch) {
        Logger.warn('No FROM instruction found in Dockerfile');
        return null;
      }

      const [, imageName, version = 'latest'] = fromMatch;
      Logger.info(`Parsed Docker image: ${imageName}:${version}`);
      
      return {
        imageName,
        currentVersion: version
      };
    } catch (error) {
      Logger.error('Error parsing Docker image info:', error);
      return null;
    }
  }

  /**
   * Check for the latest version of a Docker image
   * @param {string} imageName - Docker image name
   * @returns {Promise<string|null>} - Latest version or null if error
   */
  async getLatestImageVersion(imageName) {
    try {
      // For Docker Hub images
      if (!imageName.includes('/') || imageName.split('/').length === 2) {
        // cache check
        const now = Date.now();
        const cacheEntry = versionCache.get(imageName);
        if (cacheEntry && now - cacheEntry.timestamp < IMAGE_TAG_TTL) {
          return cacheEntry.version;
        }
        const [namespace, repo] = imageName.includes('/') 
          ? imageName.split('/') 
          : ['library', imageName];
          
        try {
          const response = await axios.get(`https://hub.docker.com/v2/repositories/${namespace}/${repo}/tags?page_size=100`);
          
          if (response.data && response.data.results && response.data.results.length > 0) {
            // Filter out 'latest' tag and sort by name
            const tags = response.data.results
              .filter(tag => tag.name !== 'latest')
              .sort((a, b) => {
                // Try to sort semantically if possible
                const aVer = a.name.replace(/^v/, '').split('.');
                const bVer = b.name.replace(/^v/, '').split('.');
                
                // If both have 3 parts (major.minor.patch), sort semantically
                if (aVer.length === 3 && bVer.length === 3) {
                  for (let i = 0; i < 3; i++) {
                    const aNum = parseInt(aVer[i], 10);
                    const bNum = parseInt(bVer[i], 10);
                    if (!isNaN(aNum) && !isNaN(bNum) && aNum !== bNum) {
                      return bNum - aNum; // Descending order
                    }
                  }
                  return 0;
                }
                
                // Otherwise sort by name (descending)
                return b.name.localeCompare(a.name);
              });
            
            if (tags.length > 0) {
              const latest = tags[0].name;
              versionCache.set(imageName, { timestamp: Date.now(), version: latest });
              return latest;
            }
          }
        } catch (axiosError) {
          Logger.error(`Error fetching tags for ${namespace}/${repo}:`, axiosError.message);
          return 'latest'; // Return 'latest' as fallback
        }
      } 
      // For GCR images
      else if (imageName.includes('gcr.io')) {
        // Extract project and image name from gcr.io URL
        const parts = imageName.split('/');
        if (parts.length >= 3) {
          const project = parts[1];
          const repo = parts.slice(2).join('/');
          
          // GCR API requires authentication, so we'll use a simplified approach
          // In a real implementation, you would need to authenticate with GCP
          Logger.info(`GCR images require authentication for version checking: ${imageName}`);
          return 'latest'; // Placeholder
        }
      }
      
      return 'latest'; // Default fallback
    } catch (error) {
      Logger.error(`Error getting latest image version for ${imageName}`, error);
      return 'latest'; // Return 'latest' as fallback instead of null
    }
  }

  /**
   * Get Docker image information for a project
   * @param {Object} project - Project object
   * @param {string} type - Project type ('frontend' or 'server')
   * @returns {Promise<Object|null>} - Docker image information or null if error
   */
  async getDockerImageInfo(project, type) {
    try {
      // Check if the project has the specified type and a Dockerfile
      if (!project || !project[type] || !project[type].dockerfile) {
        Logger.info(`Project ${project?.name} does not have a Dockerfile for ${type}`);
        return null;
      }
      
      const dockerfilePath = fileService.resolvePath(project[type].dockerfile);
      
      // Check if the Dockerfile exists
      const exists = await fileService.fileExists(dockerfilePath);
      if (!exists) {
        Logger.info(`Dockerfile not found at path: ${dockerfilePath}`);
        return null;
      }
      
      const content = await this.readDockerfile(dockerfilePath);
      
      if (!content) {
        return null;
      }
      
      const imageInfo = this.parseImageInfo(content);
      if (!imageInfo) {
        return null;
      }
      
      const latestVersion = await this.getLatestImageVersion(imageInfo.imageName);
      
      return {
        imageName: imageInfo.imageName,
        currentVersion: imageInfo.currentVersion,
        latestVersion: latestVersion || 'unknown',
        dockerfilePath
      };
    } catch (error) {
      Logger.error(`Error getting Docker image info for ${project?.name}/${type}`, error);
      return null;
    }
  }

  /**
   * Get all Docker images from all projects
   * @returns {Promise<Array>} - List of Docker images
   */
  async getAllDockerImages() {
    try {
      Logger.info('Starting to get all Docker images');
      const projects = await projectService.getProjects();
      Logger.info(`Found ${projects.length} projects`);
      
      const images = [];
      let idCounter = 1;

      for (const project of projects) {
        // Skip if project is null or undefined
        if (!project) {
          Logger.info('Skipping null or undefined project');
          continue;
        }
        
        Logger.info(`Processing project: ${project.name}`);
        
        // Get frontend Docker image
        if (project.frontend && typeof project.frontend === 'object' && project.frontend.dockerfile) {
          Logger.info(`Project ${project.name} has frontend Dockerfile: ${project.frontend.dockerfile}`);
          try {
            const frontendImage = await this.getDockerImageInfo(project, 'frontend');
            if (frontendImage) {
              Logger.info(`Found frontend Docker image for project ${project.name}: ${frontendImage.imageName}:${frontendImage.currentVersion}`);
              images.push({
                id: `docker-${idCounter++}`,
                project: project.name,
                type: 'frontend',
                imageName: frontendImage.imageName,
                currentVersion: frontendImage.currentVersion,
                latestVersion: frontendImage.latestVersion
              });
            } else {
              Logger.info(`No frontend Docker image found for project ${project.name}`);
            }
          } catch (frontendError) {
            Logger.error(`Error getting frontend Docker image for project ${project.name}:`, frontendError);
          }
        } else {
          Logger.info(`Project ${project.name} does not have a frontend Dockerfile`);
        }

        // Get server Docker image
        if (project.server && typeof project.server === 'object' && project.server.dockerfile) {
          Logger.info(`Project ${project.name} has server Dockerfile: ${project.server.dockerfile}`);
          try {
            const serverImage = await this.getDockerImageInfo(project, 'server');
            if (serverImage) {
              Logger.info(`Found server Docker image for project ${project.name}: ${serverImage.imageName}:${serverImage.currentVersion}`);
              images.push({
                id: `docker-${idCounter++}`,
                project: project.name,
                type: 'server',
                imageName: serverImage.imageName,
                currentVersion: serverImage.currentVersion,
                latestVersion: serverImage.latestVersion
              });
            } else {
              Logger.info(`No server Docker image found for project ${project.name}`);
            }
          } catch (serverError) {
            Logger.error(`Error getting server Docker image for project ${project.name}:`, serverError);
          }
        } else {
          Logger.info(`Project ${project.name} does not have a server Dockerfile`);
        }
      }

      Logger.info(`Returning ${images.length} Docker images`);
      return images;
    } catch (error) {
      Logger.error('Error getting all Docker images', error);
      Logger.error('Error stack:', error.stack);
      throw error; // Let the controller handle the error
    }
  }

  /**
   * Upgrade a Docker image in a project
   * @param {Object} project - Project object
   * @param {Object} imageInfo - Image information
   * @returns {Promise<Object>} - Upgrade result
   */
  async upgradeDockerImage(project, imageInfo) {
    try {
      const { imageName, latestVersion, type } = imageInfo;
      
      if (!project || !project[type] || !project[type].dockerfile) {
        throw new Error(`Invalid project or type: ${type}`);
      }
      
      const dockerfilePath = fileService.resolvePath(project[type].dockerfile);
      const content = await this.readDockerfile(dockerfilePath);
      
      if (!content) {
        throw new Error('Could not read Dockerfile');
      }
      
      // Replace the image version in the FROM instruction
      const updatedContent = content.replace(
        /FROM\s+([^:\s]+)(?::([^\s]+))?/,
        `FROM ${imageName}:${latestVersion}`
      );
      
      // Write updated Dockerfile
      const writeSuccess = await this.writeDockerfile(dockerfilePath, updatedContent);
      if (!writeSuccess) {
        throw new Error('Failed to write updated Dockerfile');
      }
      
      return {
        success: true,
        message: `Successfully upgraded ${imageName} to version ${latestVersion}`,
        image: {
          name: imageName,
          version: latestVersion
        }
      };
    } catch (error) {
      Logger.error('Error upgrading Docker image', error);
      return {
        success: false,
        message: error.message || 'Failed to upgrade Docker image'
      };
    }
  }
}

module.exports = new DockerService();
