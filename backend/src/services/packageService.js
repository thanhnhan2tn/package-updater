const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class PackageService {
  async readPackageJson(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error reading package.json at ${filePath}:`, error);
      return null;
    }
  }

  async upgradePackage(project, packageInfo) {
    try {
      const { name, latestVersion } = packageInfo;
      
      // Determine which package.json to update based on the package type
      let packageJsonPath;
      if (packageInfo.type === 'frontend') {
        packageJsonPath = path.resolve(__dirname, '../../..', project.frontend);
      } else if (packageInfo.type === 'server') {
        packageJsonPath = path.resolve(__dirname, '../../..', project.server);
      } else {
        throw new Error('Package type must be either "frontend" or "server"');
      }
      
      console.log(`Upgrading package in: ${packageJsonPath}`);
      
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
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

      // Get the directory containing the package.json
      const projectDir = path.dirname(packageJsonPath);
      
      // Install the updated package
      await execAsync(`cd ${projectDir} && npm install`);

      return {
        success: true,
        message: `Successfully upgraded ${name} to version ${latestVersion}`,
        package: {
          name,
          version: latestVersion
        }
      };
    } catch (error) {
      console.error('Error upgrading package:', error);
      return {
        success: false,
        message: error.message || 'Failed to upgrade package'
      };
    }
  }
}

module.exports = new PackageService(); 