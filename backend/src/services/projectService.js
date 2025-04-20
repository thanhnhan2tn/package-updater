const Logger = require('../utils/logger');
const fileService = require('./fileService');
const config = require('../config');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

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
      
      // Process any remote repositories
      for (const project of projects || []) {
        if (!project.id) {
          project.id = path.basename(project.path);
        }
        
        if (this.hasRemoteRepository(project)) {
          await this.ensureProjectCloned(project);
        }
      }
      
      return projects || [];
    } catch (error) {
      Logger.error('Error reading projects.json', error);
      return [];
    }
  }

  /**
   * Ensure a remote project is cloned to the local path
   * @param {Object} project - Project object with remote repository
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  async ensureProjectCloned(project) {
    if (!project.remote || !project.path) {
      return false;
    }

    try {
      const localPath = fileService.resolvePath(project.path);
      
      // Check if the directory exists
      try {
        await fs.access(localPath);
        // Directory exists, check if it's a git repository
        try {
          await execPromise('git status', { cwd: localPath });
          Logger.info(`Project ${project.name} already cloned at ${localPath}`);
          
          // Pull latest changes
          Logger.info(`Pulling latest changes for ${project.name}`);
          await execPromise('git pull', { cwd: localPath });
          
          return true;
        } catch (gitError) {
          // Not a git repository, remove it and clone
          Logger.info(`Directory exists but is not a git repository: ${localPath}`);
          await fs.rm(localPath, { recursive: true, force: true });
        }
      } catch (accessError) {
        // Directory doesn't exist, create parent directory if needed
        const parentDir = path.dirname(localPath);
        try {
          await fs.access(parentDir);
        } catch (parentAccessError) {
          await fs.mkdir(parentDir, { recursive: true });
        }
      }
      
      // Clone the repository
      Logger.info(`Cloning repository ${project.remote} to ${localPath}`);
      
      // Use a timeout to prevent hanging on git clone
      const clonePromise = new Promise(async (resolve, reject) => {
        try {
          const result = await execPromise(`git clone ${project.remote} ${localPath}`, {
            timeout: 30000 // 30 seconds timeout
          });
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      await clonePromise;
      
      Logger.info(`Successfully cloned ${project.name} to ${localPath}`);
      return true;
    } catch (error) {
      Logger.error(`Error ensuring project ${project.name} is cloned:`, error);
      return false;
    }
  }

  /**
   * Get a project by name
   * @param {string} projectName - Name of the project
   * @returns {Promise<Object|null>} - Project object or null if not found
   */
  async getProjectByName(projectName) {
    const projects = await this.getProjects();
    const project = projects.find(p => p.name === projectName) || null;
    
    if (project && this.hasRemoteRepository(project)) {
      await this.ensureProjectCloned(project);
    }
    
    return project;
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
      // Handle both old and new project structure
      return fileService.resolvePath(
        typeof project.frontend === 'string' ? project.frontend : project.frontend.path
      );
    } else if (type === 'server' && project.server) {
      // Handle both old and new project structure
      return fileService.resolvePath(
        typeof project.server === 'string' ? project.server : project.server.path
      );
    }
    
    return null;
  }

  /**
   * Get Dockerfile path for a project
   * @param {Object} project - Project object
   * @param {string} type - Project type ('frontend' or 'server')
   * @returns {string|null} - Path to Dockerfile or null if not available
   */
  getDockerfilePath(project, type) {
    if (!project) return null;
    
    if (type === 'frontend' && project.frontend && 
        typeof project.frontend === 'object' && project.frontend.dockerfile) {
      return fileService.resolvePath(project.frontend.dockerfile);
    } else if (type === 'server' && project.server && 
               typeof project.server === 'object' && project.server.dockerfile) {
      return fileService.resolvePath(project.server.dockerfile);
    }
    
    return null;
  }

  /**
   * Check if a project has a remote repository
   * @param {Object} project - Project object
   * @returns {boolean} - True if project has a remote repository
   */
  hasRemoteRepository(project) {
    return project && project.remote && typeof project.remote === 'string';
  }

  /**
   * Check for updates on main branch and pull latest
   * @param {string} projectName
   * @returns {Promise<boolean>}
   */
  async checkForUpdates(projectName) {
    const project = await this.getProjectByName(projectName);
    if (!project) throw new Error('Project not found');
    const cwd = fileService.resolvePath(project.path);
    const branch = project.mainBranch || 'main';
    // Checkout main branch
    await execPromise(`git checkout ${branch}`, { cwd });
    // Pull latest
    await execPromise('git pull', { cwd });
    return true;
  }

  /**
   * Commit package fixes to a new branch
   * @param {string} projectName
   * @param {string} summary
   * @returns {Promise<string>} - New branch name
   */
  async commitPackageFix(projectName, summary) {
    const project = await this.getProjectByName(projectName);
    if (!project) throw new Error('Project not found');
    const cwd = fileService.resolvePath(project.path);
    const branch = `fix/bump-packages-${summary}`;
    // Create and checkout new branch
    await execPromise(`git checkout -b ${branch}`, { cwd });
    // Stage changes
    await execPromise('git add -A', { cwd });
    // Commit
    const message = `Bump packages: ${summary}`;
    await execPromise(`git commit -m "${message}"`, { cwd });
    return branch;
  }
}

module.exports = new ProjectService();