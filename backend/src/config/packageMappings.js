/**
 * Package URL mappings configuration
 * 
 * This file defines custom URLs for packages that don't follow the standard GitHub pattern.
 * Each entry should have:
 * - name: The package name
 * - url: The URL to check for the latest version
 * - selector: CSS selector to find the version element
 * - regex: Regular expression to extract the version from the text
 */
const packageMappings = {
  // Example for a package with a custom URL
  'custom-package': {
    url: 'https://custom-registry.com/package/custom-package',
    selector: '.version-number',
    regex: /version\s+(\d+\.\d+\.\d+)/i
  },
  
  // Example for a package with a different GitHub organization
  'org-package': {
    url: 'https://github.com/different-org/package/releases',
    selector: 'h1.release-title',
    regex: /v(\d+\.\d+\.\d+)/
  },
  
  // Example for a package with a completely different website
  'external-package': {
    url: 'https://external-website.com/downloads',
    selector: '.download-version',
    regex: /(\d+\.\d+\.\d+)/
  }
};

module.exports = packageMappings; 