// List of package IDs that should be pre-selected
// These are the packages that users want to track by default
export const packagesToFollow = [
  'react',
  'react-dom',
  'typescript',
  '@types/react',
  '@types/node',
  'express',
  'cors'
];

// Optional: Add metadata about why these packages are being followed
export const packagesMetadata = {
  'react': 'Core library for the frontend',
  'react-dom': 'React DOM rendering package',
  'typescript': 'Type safety for the entire project',
  '@types/react': 'TypeScript definitions for React',
  '@types/node': 'TypeScript definitions for Node.js',
  'express': 'Backend web framework',
  'cors': 'Cross-Origin Resource Sharing middleware'
}; 