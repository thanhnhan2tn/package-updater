const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class GitService {
  async initGitConfig() {
    try {
      // Initialize git configuration if needed
      await execAsync('git config --global --list');
      return true;
    } catch (error) {
      console.error('Error initializing git config:', error);
      return false;
    }
  }

  async ensureRepository(project) {
    try {
      // Check if the repository exists
      await execAsync(`git -C ${project.localPath} status`);
      return true;
    } catch (error) {
      console.error(`Repository not available for project ${project.name}:`, error);
      return false;
    }
  }

  async commitChanges(project, message) {
    try {
      await execAsync(`git -C ${project.localPath} add .`);
      await execAsync(`git -C ${project.localPath} commit -m "${message}"`);
      return true;
    } catch (error) {
      console.error(`Error committing changes for project ${project.name}:`, error);
      return false;
    }
  }
}

module.exports = new GitService(); 