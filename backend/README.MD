# Check Update Backend API

## Overview
This Express.js backend provides RESTful endpoints to manage projects, dependencies, and Docker images. It supports:
- Listing projects
- Fetching package lists and version info
- Upgrading packages
- Listing Docker images and their version info
- Upgrading Docker images

## Installation
```bash
cd backend
npm install      # or yarn install
```

## Configuration
Copy `.env.example` to `.env` and set:
```env
PORT=3001
HOST=localhost
PACKAGE_MANAGER=npm      # or yarn
API_URL=http://localhost:3001/api
# any other secrets or DB connection strings
```

## Running the Server
```bash
npm start           # runs src/server.js
# or in dev mode
npm run dev         # if configured with nodemon
```
Server listens on `http://HOST:PORT` (default: http://localhost:3001).



## API Endpoints
All routes are prefixed with `/api`.

### Projects
#### GET /api/projects
List all projects defined in `projects.json`.
**Response** (200):
```json
[
  { "id": "proj1", "name": "project1", "remote": "..." },
  ...
]
```

#### GET /api/project/:projectName
Get details for a single project.
**Params**:
- `projectName`: repo or folder name

**Response** (200):
```json
{ "id": "proj1", "name": "project1", "path": "./project1" }
```

### Dependencies
#### GET /api/packages?projectName={name}
Fetch all packages for a project.
**Query**:
- `projectName` (optional)

**Response** (200):
```json
[
  { "id": "uuid", "name": "lodash", "currentVersion": "4.17.21" },
  ...
]
```

#### GET /api/package-version/:id
Fetch latest version for package ID.
**Params**:
- `id`: package record ID

**Response** (200):
```json
{ "id": "uuid", "latestVersion": "4.17.22" }
```

#### GET /api/dependencies
List all dependencies with version info across projects.

#### POST /api/upgrade
Upgrade a package in its project.
**Body**:
```json
{
  "projectName": "project1",
  "packageInfo": {
    "name": "lodash",
    "latestVersion": "4.17.22",
    "type": "dependencies"
  }
}
```
**Response** (200):
```json
{ "success": true, "installedVersion": "4.17.22" }
```

### Docker Images
#### GET /api/docker/images?projectName={name}
List Docker images for a project (server images only).

#### GET /api/docker/image/:projectName/:type
Get version info for a specific image.

#### POST /api/docker/upgrade/:projectName
Upgrade a Docker image.
**Body**:
```json
{
  "imageName": "nginx",
  "latestVersion": "1.21.0",
  "type": "server"
}
```
**Response** (200):
```json
{ "success": true }
```

## Error Handling
- All controllers catch exceptions and return `5xx` for server errors.
- Validation errors return `400` with JSON `{ "error": "message" }`.

## Logging
Uses `utils/logger.js` (winston or console) for structured logs.

## Maintenance
- Config is validated by Joi in `src/config/index.js`.
- To add new endpoints:
  1. Define route in `src/routes`
  2. Implement controller in `src/controllers`
  3. Add business logic in `src/services`
- Update `src/config/projects.json` to register new projects.

---
*Feel free to contribute or extend functionality with additional services or tests.*