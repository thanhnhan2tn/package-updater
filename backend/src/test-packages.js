const fs = require('fs').promises;
const path = require('path');

async function testPackageJson() {
  try {
    // Read the projects.json file
    const configPath = path.join(__dirname, '../../projects.json');
    const configContent = await fs.readFile(configPath, 'utf8');
    const projects = JSON.parse(configContent);

    console.log('Projects configuration:');
    console.log(JSON.stringify(projects, null, 2));

    // Try to read each package.json file
    for (const project of projects) {
      console.log(`\nTesting project: ${project.name}`);
      
      // Test frontend package.json
      try {
        const frontendPath = path.resolve(__dirname, '../../', project.frontend);
        console.log(`Frontend path: ${frontendPath}`);
        const frontendContent = await fs.readFile(frontendPath, 'utf8');
        const frontendPackage = JSON.parse(frontendContent);
        console.log(`Frontend package.json read successfully. Dependencies: ${Object.keys(frontendPackage.dependencies || {}).length}`);
      } catch (error) {
        console.error(`Error reading frontend package.json for ${project.name}:`, error.message);
      }
      
      // Test server package.json
      try {
        const serverPath = path.resolve(__dirname, '../../', project.server);
        console.log(`Server path: ${serverPath}`);
        const serverContent = await fs.readFile(serverPath, 'utf8');
        const serverPackage = JSON.parse(serverContent);
        console.log(`Server package.json read successfully. Dependencies: ${Object.keys(serverPackage.dependencies || {}).length}`);
      } catch (error) {
        console.error(`Error reading server package.json for ${project.name}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error testing package.json files:', error);
  }
}

testPackageJson().catch(console.error); 