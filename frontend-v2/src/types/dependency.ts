export interface Project {
  id: string
  name: string
  remote?: string
  path: string
  frontend?: {
    path: string
    dockerfile: string
  }
  server?: {
    path: string
    dockerfile: string
  }
}

export interface Dependency {
  // unique package id
  id: string
  name: string
  currentVersion: string
  latestVersion: string
  project: string
  type: "frontend" | "server"
  outdated: boolean
  // major version bump detected (requires manual upgrade)
  majorUpgrade: boolean
}

export interface SelectedPackage extends Dependency {
  type: "frontend" | "server";
  majorUpgrade: boolean
}

export interface DockerImage {
  name: string
  tag: string
  latestTag: string | null
  outdated: boolean | null
  projectId: string
  registry: string
}

export interface SelectedDockerImage extends DockerImage {}
