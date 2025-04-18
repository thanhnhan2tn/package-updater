const { getLatestVersion } = require('./utils/versionChecker');

async function testVersionChecking() {
  const packages = [
    'axios',
    'react',
    'express',
    'lodash',
    'custom-package'
  ];

  console.log('Testing version checking for packages:');
  
  for (const pkg of packages) {
    console.log(`\nChecking ${pkg}...`);
    try {
      const version = await getLatestVersion(pkg);
      console.log(`Latest version of ${pkg}: ${version}`);
    } catch (error) {
      console.error(`Error checking ${pkg}:`, error);
    }
  }
}

testVersionChecking().catch(console.error); 