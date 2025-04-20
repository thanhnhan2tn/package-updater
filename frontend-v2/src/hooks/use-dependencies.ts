"use client"

import { useState } from "react"
import type { Dependency, SelectedPackage } from "@/types/dependency"
import { toast } from "@/hooks/use-toast"
import { refreshAllDependencies, upgradePackages } from "@/lib/actions"
import { fetchPackageVersion } from "@/services/api"

export function useDependencies(initialProjectId: string | null = null) {
  const [dependencies, setDependencies] = useState<Dependency[]>([])
  const [selectedPackages, setSelectedPackages] = useState<SelectedPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [checking, setChecking] = useState<Record<string, boolean>>({})
  const [selectedProject, setSelectedProject] = useState<string | null>(initialProjectId)

  const fetchDependencies = async (projectId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/dependencies?projectId=${projectId}`)
      const data = await response.json()
      setDependencies(data)
    } catch (error) {
      console.error("Error fetching dependencies:", error)
      toast({
        title: "Error fetching dependencies",
        description: "Failed to load dependencies for the selected project",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId)
    setSelectedPackages([])
    fetchDependencies(projectId)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshAllDependencies()
      if (selectedProject) {
        fetchDependencies(selectedProject)
      }
      toast({
        title: "Dependencies refreshed",
        description: "Successfully refreshed all dependencies",
      })
    } catch (error) {
      console.error("Error refreshing dependencies:", error)
      toast({
        title: "Error refreshing dependencies",
        description: "Failed to refresh dependencies",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const handleCheckPackage = async (pkg: Dependency) => {
    const idKey = pkg.id
    setChecking((prev) => ({ ...prev, [idKey]: true }))

    try {
      const result = await fetchPackageVersion(pkg.id)
      const latest = result.latestVersion ?? pkg.currentVersion
      const updatedPkg = { ...pkg, latestVersion: latest, outdated: latest !== pkg.currentVersion }
      setDependencies((prev) => prev.map((item) => (item.id === pkg.id ? updatedPkg : item)))
      toast({ title: "Package checked", description: `Latest version for ${pkg.name} is ${latest}` })
    } catch (error) {
      console.error("Check package error", error)
      toast({ title: "Failed to check package", description: error.message, variant: "destructive" })
    } finally {
      setChecking((prev) => {
        const clone = { ...prev }
        delete clone[idKey]
        return clone
      })
    }
  }

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const result = await upgradePackages(selectedPackages)

      if (result.success) {
        toast({
          title: "Packages upgraded successfully",
          description: `Upgraded ${selectedPackages.length} packages`,
        })
        // Clear selected packages after successful upgrade
        setSelectedPackages([])
      } else {
        toast({
          title: "Failed to upgrade packages",
          description: result.error || "An unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Failed to upgrade packages",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setUpgrading(false)
    }
  }

  const togglePackageSelection = (pkg: Dependency) => {
    setSelectedPackages((prev) => {
      const isSelected = prev.some(
        (p) => p.name === pkg.name && p.project === pkg.project && p.type === pkg.type,
      )

      if (isSelected) {
        return prev.filter(
          (p) => !(p.name === pkg.name && p.project === pkg.project && p.type === pkg.type),
        )
      } else {
        return [...prev, pkg]
      }
    })
  }

  return {
    dependencies,
    selectedPackages,
    loading,
    refreshing,
    upgrading,
    checking,
    selectedProject,
    fetchDependencies,
    handleProjectSelect,
    handleRefresh,
    handleCheckPackage,
    handleUpgrade,
    togglePackageSelection,
  }
}
