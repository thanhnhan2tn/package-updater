"use client"

import { useState } from "react"
import type { DockerImage, SelectedDockerImage } from "@/types/dependency"
import { toast } from "@/hooks/use-toast"
import { checkDockerImage } from "@/lib/actions"

export function useDockerImages(initialProjectId: string | null = null) {
  const [dockerImages, setDockerImages] = useState<DockerImage[]>([])
  const [selectedImages, setSelectedImages] = useState<SelectedDockerImage[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState<Record<string, boolean>>({})
  const [selectedProject, setSelectedProject] = useState<string | null>(initialProjectId)

  const fetchDockerImages = async (projectId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/docker-images?projectId=${projectId}`)
      const data = await response.json()
      setDockerImages(data)
    } catch (error) {
      console.error("Error fetching Docker images:", error)
      toast({
        title: "Error fetching Docker images",
        description: "Failed to load Docker images for the selected project",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId)
    setSelectedImages([])
    fetchDockerImages(projectId)
  }

  const handleCheckImage = async (image: DockerImage) => {
    const imageId = `${image.projectId}-${image.registry}-${image.name}-${image.tag}`
    setChecking((prev) => ({ ...prev, [imageId]: true }))

    try {
      const result = await checkDockerImage(image)

      if (result.success) {
        setDockerImages((prev) =>
          prev.map((img) =>
            img.name === image.name &&
            img.tag === image.tag &&
            img.projectId === image.projectId &&
            img.registry === image.registry
              ? result.image
              : img,
          ),
        )

        toast({
          title: "Image checked successfully",
          description: `Latest tag for ${image.name}:${image.tag} is ${result.image.latestTag}`,
        })
      } else {
        toast({
          title: "Failed to check image",
          description: result.error || "An unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Failed to check image",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setChecking((prev) => {
        const newChecking = { ...prev }
        delete newChecking[imageId]
        return newChecking
      })
    }
  }

  const toggleImageSelection = (image: DockerImage) => {
    if (!image.latestTag) {
      toast({
        title: "Cannot select image",
        description: "Please check the image status first to get the latest tag information",
        variant: "destructive",
      })
      return
    }

    setSelectedImages((prev) => {
      const isSelected = prev.some(
        (i) =>
          i.name === image.name &&
          i.tag === image.tag &&
          i.projectId === image.projectId &&
          i.registry === image.registry,
      )

      if (isSelected) {
        return prev.filter(
          (i) =>
            !(
              i.name === image.name &&
              i.tag === image.tag &&
              i.projectId === image.projectId &&
              i.registry === image.registry
            ),
        )
      } else {
        return [...prev, image as SelectedDockerImage]
      }
    })
  }

  return {
    dockerImages,
    selectedImages,
    loading,
    checking,
    selectedProject,
    fetchDockerImages,
    handleProjectSelect,
    handleCheckImage,
    toggleImageSelection,
  }
}
