"use server"
import path from "path"

// Path to the projects.json config file
const configPath = path.join(process.cwd(), "projects.json")

export async function getProjects() {
  try {
    // This function will be called from API routes
    // We'll just return the path to the config file
    return configPath
  } catch (error) {
    console.error("Error with projects path:", error)
    return null
  }
}
