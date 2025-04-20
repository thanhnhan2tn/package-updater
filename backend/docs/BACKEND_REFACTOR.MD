# Backend Refactor Plan and Optimization Details

## Goals
- Reduce I/O (file reads, network calls) with caching
- Batch and parallelize external version checks
- Improve throughput for upgrades with async processing
- Ensure atomic updates to `package.json` and `Dockerfile`

## 1. Package Service Optimizations

### 1.1 Caching Package Lists
- Add in-memory cache with TTL (`CACHE_TTL = 60s`)
- Cache only global list (no `projectName` filter)
- On `getAllPackages(null)`, return cached data if valid

### 1.2 Parallel Version Fetching
- Refactor `processDependencies` to call `getLatestVersion` in parallel via `Promise.all`
- Reduces wall-clock time for large dependency lists

### 1.3 Indexing by ID
- Build `idToPkgMap` once per cache rebuild to speed up `getPackageVersion`
- Avoid re-scanning full list each time

### 1.4 Atomic Upgrades
- Write updated `package.json` to temp file and rename
- Only run `installDependencies` if version actually changes

## 2. Docker Service Optimizations

### 2.1 Caching Latest Tags
- In-memory `imageVersionCache` with TTL
- Avoid repeated Docker Hub requests for same image

### 2.2 Parallel Docker Hub Requests
- Batch calls in `getAllDockerImages` using `Promise.all`
- Lowers total latency when listing multiple images

### 2.3 Atomic Dockerfile Updates
- Use temp file + rename for `writeDockerfile`
- Check for actual `FROM` version change before writing

## Expected Outcomes
- **Faster API responses** for listing dependencies and images
- **Lower network load** on npm registry and Docker Hub
- **Scalable** to many projects without linear slowdown
- **Robustness**: atomic file operations prevent half-written files

---
*This document will be kept alongside code to guide maintenance and future refactors.*
