const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs').promises;
const path = require('path');
const { SimpleGit } = require('simple-git');

/**
 * Update a package version in a package.json file
 * @param {string} packageJsonPath - Path to the package.json file
 * @param {string} packageName - Name of the package to update
 * @param {string} newVersion - New version to set
 * @returns {Promise<boolean>} - Success status
 */
async function updatePackageVersion(packageJsonPath, packageName, newVersion) {
  try {
    // Read the package.json file
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    
    // Check if the package exists in dependencies
    if (packageJson.dependencies && packageJson.dependencies[packageName]) {
      // Update the version
      packageJson.dependencies[packageName] = `^${newVersion}`;
    } else if (packageJson.devDependencies && packageJson.devDependencies[packageName]) {
      // Update the version in devDependencies
      packageJson.devDependencies[packageName] = `^${newVersion}`;
    } else {
      console.error(`Package ${packageName} not found in ${packageJsonPath}`);
      return false;
    }
    
    // Write the updated package.json back to the file
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error updating package version: ${error.message}`);
    return false;
  }
}

/**
 * Run yarn to update the yarn.lock file
 * @param {string} projectPath - Path to the project directory
 * @returns {Promise<boolean>} - Success status
 */
async function runYarn(projectPath) {
  try {
    // Change to the project directory
    process.chdir(projectPath);
    
    // Run yarn
    await execAsync('yarn');
    
    // Change back to the original directory
    process.chdir(path.resolve(__dirname, '../../../'));
    
    return true;
  } catch (error) {
    console.error(`Error running yarn: ${error.message}`);
    return false;
  }
}

/**
 * Create a git branch and commit changes
 * @param {string} projectPath - Path to the project directory
 * @param {string} packageName - Name of the package being updated
 * @param {string} oldVersion - Old version of the package
 * @param {string} newVersion - New version of the package
 * @param {Object} gitConfig - Git configuration (username, email, token)
 * @returns {Promise<Object>} - Result of the git operations
 */
async function commitToGit(projectPath, packageName, oldVersion, newVersion, gitConfig) {
  try {
    // Initialize git
    const git = SimpleGit(projectPath);
    
    // Create branch name with current date
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB').replace(/\//g, '-');
    const branchName = `fix/upgrade-package-${dateStr}`;
    
    // Create and checkout new branch
    await git.checkoutLocalBranch(branchName);
    
    // Configure git user
    await git.addConfig('user.name', gitConfig.username);
    await git.addConfig('user.email', gitConfig.email);
    
    // Add changes
    await git.add(['package.json', 'yarn.lock']);
    
    // Commit changes
    const commitMessage = `update package ${packageName} from ${oldVersion} to ${newVersion}`;
    await git.commit(commitMessage);
    
    // Push changes if remote is configured
    if (gitConfig.remote) {
      // Set up remote with token if provided
      if (gitConfig.token) {
        const remoteUrl = gitConfig.remote.replace('https://', `https://${gitConfig.token}@`);
        await git.remote(['set-url', 'origin', remoteUrl]);
      }
      
      await git.push(['-u', 'origin', branchName]);
    }
    
    return {
      success: true,
      branchName,
      commitMessage
    };
  } catch (error) {
    console.error(`Error committing to git: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Upgrades a package to its latest version
 * @param {string} packageName - Name of the package to upgrade
 * @param {string} projectPath - Path to the project's package.json
 * @param {string} [type='dependencies'] - Type of dependency (dependencies, devDependencies, etc.)
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function upgradePackage(packageName, projectPath, type = 'dependencies') {
  try {
    // Read package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

    // Check if package exists
    if (!packageJson[type] || !packageJson[type][packageName]) {
      return {
        success: false,
        message: `Package ${packageName} not found in ${type}`
      };
    }

    // Get latest version
    const { stdout: latestVersion } = await execAsync(`npm view ${packageName} version`);
    const trimmedLatestVersion = latestVersion.trim();

    // Update package.json
    packageJson[type][packageName] = `^${trimmedLatestVersion}`;
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Run npm install
    await execAsync('npm install', { cwd: projectPath });

    return {
      success: true,
      message: `Successfully upgraded ${packageName} to version ${trimmedLatestVersion}`
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to upgrade ${packageName}: ${error.message}`
    };
  }
}

module.exports = {
  upgradePackage
}; 