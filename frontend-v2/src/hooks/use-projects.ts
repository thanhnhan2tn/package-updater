"use client"

import { useState, useEffect } from "react"
import type { Project } from "@/types/dependency"
import { toast } from "@/hooks/use-toast"

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast({
        title: "Error fetching projects",
        description: "Failed to load project list",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    projects,
    loading,
    fetchProjects,
  }
}
