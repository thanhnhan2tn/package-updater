# Dependency Version Checker

A tool to check and compare dependency versions across multiple React projects.

## Features

- View all dependencies from multiple React projects
- Compare current versions with latest available versions
- Simple and clean UI
- Real-time version checking
- Support for both frontend and server dependencies
- Multiple version checking methods (yarn info, GitHub releases, and custom URLs)
- Configurable package mappings for custom version checking

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Chrome browser (for web scraping)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dependency-checker
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Configuration

1. Create or modify `projects.json` in the root directory with your project information:
```json
[
  {
    "name": "project1",
    "frontend": "./project1/frontend/package.json",
    "server": "./project1/server/package.json"
  },
  {
    "name": "project2",
    "frontend": "./project2/frontend/package.json",
    "server": "./project2/server/package.json"
  }
]
```

2. Configure package mappings in `backend/src/config/packageMappings.js`:
```javascript
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
  }
};

module.exports = packageMappings;
```

## Version Checking Mechanism

The application uses multiple methods to check for the latest version of a package:

1. **Yarn Info**: First, it tries to use `yarn info [package-name] version` to get the latest version.
2. **Custom URL**: If yarn info fails and there's a custom mapping for the package, it tries to scrape the custom URL.
3. **GitHub Releases**: If both previous methods fail, it falls back to scraping the GitHub releases page (e.g., https://github.com/axios/axios/releases).

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. In a new terminal, start the frontend:
```bash
cd frontend
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

- The application will automatically load all dependencies from the configured projects
- Click the "Refresh" button to update the latest version information
- Dependencies are displayed in a table format with the following information:
  - Project name
  - Package type (frontend/server)
  - Dependency name
  - Current version
  - Latest version

## Project Structure

```
dependency-checker/
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── config/
│   │   │   └── packageMappings.js
│   │   └── utils/
│   │       └── versionChecker.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── projects.json
```

## Notes

- The tool assumes that all package.json files are accessible from the paths specified in projects.json
- Make sure you have Chrome browser installed for the web scraping functionality
- The tool does not store any historical data
- Version checking is done in real-time when the refresh button is clicked
- For packages with custom URLs, make sure to configure the correct selector and regex pattern 