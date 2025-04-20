"use server"

export async function refreshAllDependencies() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/refresh`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error("Failed to refresh dependencies")
    }

    return { success: true }
  } catch (error) {
    console.error("Error refreshing dependencies:", error)
    return { success: false, error: error.message }
  }
}

export async function upgradePackages(packages: any[]): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/upgrade`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ packages }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to upgrade packages")
    }

    const result = await response.json()
    return result
  } catch (error: unknown) {
    console.error("Error upgrading packages:", error)
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: message }
  }
}

export async function checkDockerImage(image: any): Promise<{ success: boolean; error?: string; image?: any }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/docker-images/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to check Docker image")
    }

    const result = await response.json()
    return { success: true, image: result }
  } catch (error: unknown) {
    console.error("Error checking Docker image:", error)
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: message }
  }
}
