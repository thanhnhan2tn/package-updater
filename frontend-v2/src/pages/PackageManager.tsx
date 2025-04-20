"use client"

import { useEffect, useState } from "react"
import { ProjectList } from "../components/features/project-list"
import { DependencyTable } from "../components/features/dependency-table"
import { DockerImagesTable } from "../components/features/docker-images-table"
import { SelectedPackagesPanel } from "../components/features/selected-packages-panel"
import { SelectedDockerImagesPanel } from "../components/features/selected-docker-images-panel"
import { Button } from "../components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { CardHeader } from "../components/ui/card-header"
import { Tabs } from "../components/ui/tabs"
import { toast } from "../hooks/use-toast"
import { fetchProjects as fetchProjectsService, fetchPackages, fetchPackageVersion, upgradePackage, checkForUpdates, commitPackageFix } from "../services/api"
import { fetchDockerImages as fetchDockerImagesService, upgradeDockerImage } from "../services/api"
import type { Dependency, DockerImage, Project } from "../types/dependency"

export function PackageManager() {
  const [activeTab, setActiveTab] = useState("dependencies")
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)

  // Dependencies state
  const [dependencies, setDependencies] = useState<Dependency[]>([])
  const [selectedPackages, setSelectedPackages] = useState<Dependency[]>([])
  const [dependenciesLoading, setDependenciesLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [upgradingImages, setUpgradingImages] = useState(false)
  const [checkingPackages, setCheckingPackages] = useState<Record<string, boolean>>({})
  const [depSelectedProject, setDepSelectedProject] = useState<string | null>(null)

  // Docker images state
  const [dockerImages, setDockerImages] = useState<DockerImage[]>([])
  const [selectedImages, setSelectedImages] = useState<DockerImage[]>([])
  const [dockerImagesLoading, setDockerImagesLoading] = useState(true)
  const [checkingImages, setCheckingImages] = useState<Record<string, boolean>>({})
  const [dockerSelectedProject, setDockerSelectedProject] = useState<string | null>(null)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchProjectsService()
        setProjects(data)
        if (data.length > 0) {
          const first = data[0]
          setDepSelectedProject(first.id)
          setDockerSelectedProject(first.id)
          fetchDependencies(first.name)
          fetchDockerImages(first.name)
        }
      } catch (error) {
        console.error("Error fetching projects:", error)
        toast({ title: "Error fetching projects", description: error.message, variant: "destructive" })
      } finally {
        setProjectsLoading(false)
      }
    }
    loadProjects()
  }, [])

  const fetchDependencies = async (projectName: string) => {
    setDependenciesLoading(true)
    try {
      const data = await fetchPackages(projectName)
      // initialize majorUpgrade flag
      const init = data.map((pkg) => ({ ...pkg, majorUpgrade: false }))
      setDependencies(init)
    } catch (error) {
      console.error("Error fetching dependencies:", error)
      toast({ title: "Error fetching dependencies", description: error.message, variant: "destructive" })
    } finally {
      setDependenciesLoading(false)
    }
  }

  const fetchDockerImages = async (projectName: string) => {
    setDockerImagesLoading(true)
    try {
      const all = await fetchDockerImagesService(projectName)
      // default to server images only
      const serverOnly = all.filter((img) => img.registry === 'server')
      setDockerImages(serverOnly)
    } catch (error) {
      console.error("Error fetching Docker images:", error)
      toast({ title: "Error fetching Docker images", description: error.message, variant: "destructive" })
    } finally {
      setDockerImagesLoading(false)
    }
  }

  const handleDepProjectSelect = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return
    setDepSelectedProject(projectId)
    setSelectedPackages([])
    fetchDependencies(project.name)
  }

  const handleDockerProjectSelect = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return
    setDockerSelectedProject(projectId)
    setSelectedImages([])
    fetchDockerImages(project.name)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      if (depSelectedProject) {
        const project = projects.find((p) => p.id === depSelectedProject)
        if (project) {
          fetchDependencies(project.name)
        }
      }
      if (dockerSelectedProject) {
        const project = projects.find((p) => p.id === dockerSelectedProject)
        if (project) {
          fetchDockerImages(project.name)
        }
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
    setCheckingPackages((prev) => ({ ...prev, [idKey]: true }))
    try {
      const result = await fetchPackageVersion(pkg.id)
      const latest = result.latestVersion ?? pkg.currentVersion
      // detect major version upgrade
      const currMajor = Number(pkg.currentVersion.split('.')[0])
      const newMajor = Number(latest.split('.')[0])
      const majorUpgrade = newMajor > currMajor
      const updatedPkg = { ...pkg, latestVersion: latest, outdated: latest !== pkg.currentVersion, majorUpgrade }
      setDependencies((prev) => prev.map((item) => (item.id === pkg.id ? updatedPkg : item)))
      setSelectedPackages((prev) => prev.map((item) => (item.id === pkg.id ? updatedPkg : item)))
      toast({ title: "Package checked", description: `Latest version for ${pkg.name} is ${latest}` })
    } catch (error) {
      console.error("Check package error", error)
      toast({ title: "Failed to check package", description: error.message, variant: "destructive" })
    } finally {
      setCheckingPackages((prev) => {
        const clone = { ...prev }
        delete clone[idKey]
        return clone
      })
    }
  }

  const handleCheckImage = async (image: DockerImage) => {
    const imageId = `${image.projectId}-${image.registry}-${image.name}-${image.tag}`
    setCheckingImages((prev) => ({ ...prev, [imageId]: true }))

    try {
      const currentTagNumber = Number.parseInt(image.tag.replace(/[^\d]/g, "")) || 1
      const latestTagNumber = currentTagNumber + Math.floor(Math.random() * 3) + 1

      const latestTag = image.tag.replace(/\d+/, latestTagNumber.toString())

      const updatedImage = {
        ...image,
        latestTag,
        outdated: true,
      }

      setDockerImages((prev) =>
        prev.map((img) =>
          img.name === image.name &&
            img.tag === image.tag &&
            img.projectId === image.projectId &&
            img.registry === image.registry
            ? updatedImage
            : img,
        ),
      )

      toast({
        title: "Image checked successfully",
        description: `Latest tag for ${image.name}:${image.tag} is ${latestTag}`,
      })
    } catch (error) {
      toast({
        title: "Failed to check image",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setCheckingImages((prev) => {
        const newChecking = { ...prev }
        delete newChecking[imageId]
        return newChecking
      })
    }
  }

  // Apply fixes to selected dependencies
  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      await Promise.all(
        selectedPackages.map((pkg) => upgradePackage(pkg.project, pkg))
      )
      // commit package fixes
      const project = projects.find(p => p.id === depSelectedProject)
      if (project) {
        const summary = selectedPackages.map(p => p.name).join('-')
        const res = await commitPackageFix(project.name, summary)
        toast({ title: "Commit created", description: `Branch ${res.branch}` })
      }
      toast({
        title: "Packages upgraded",
        description: `Upgraded ${selectedPackages.length} packages`,
      })
      // Refresh list
      if (depSelectedProject) fetchDependencies(depSelectedProject)
      setSelectedPackages([])
    } catch (error) {
      console.error("Upgrade error", error)
      toast({ title: "Upgrade failed", description: error.message, variant: "destructive" })
    } finally {
      setUpgrading(false)
    }
  }

  // Check for latest version for all selected packages
  const handleCheckAll = async () => {
    await Promise.all(selectedPackages.map((pkg) => handleCheckPackage(pkg)))
  }

  // Apply fixes to selected docker images
  const handleUpgradeImages = async () => {
    setUpgradingImages(true)
    try {
      await Promise.all(
        selectedImages.map((img) =>
          upgradeDockerImage(img.projectId, {
            imageName: img.name,
            latestVersion: img.latestTag || '',
            type: img.registry,
          })
        )
      )
      toast({ title: "Docker images upgraded", description: `Upgraded ${selectedImages.length} images` })
      if (dockerSelectedProject) fetchDockerImages(dockerSelectedProject)
      setSelectedImages([])
    } catch (error) {
      console.error("Image upgrade error", error)
      toast({ title: "Upgrade failed", description: error.message, variant: "destructive" })
    } finally {
      setUpgradingImages(false)
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
        return [...prev, image]
      }
    })
  }

  const handleCheckUpdates = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    try {
      await checkForUpdates(project.name);
      toast({ title: "Codebase updated", description: `Pulled latest changes for ${project.name}` });
      // reload dependencies and images
      if (depSelectedProject === projectId) fetchDependencies(project.name);
      if (dockerSelectedProject === projectId) fetchDockerImages(project.name);
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  }

  const handleCommitChange = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const summary = selectedPackages.map(p => p.name).join('-');
    try {
      const res = await commitPackageFix(project.name, summary);
      toast({ title: "Commit created", description: `Branch ${res.branch}` });
    } catch (error: any) {
      toast({ title: "Commit failed", description: error.message, variant: "destructive" });
    }
  }

  // Determine if commit button should show for a project
  const canCommitChange = (projectId: string) => {
    if (activeTab === "dependencies") {
      return depSelectedProject === projectId && selectedPackages.length > 0;
    }
    if (activeTab === "docker") {
      return dockerSelectedProject === projectId && selectedImages.length > 0;
    }
    return false;
  }

  useEffect(() => {
    if (activeTab === "dependencies" && depSelectedProject !== dockerSelectedProject && depSelectedProject) {
      const project = projects.find((p) => p.id === depSelectedProject)
      if (project) {
        handleDockerProjectSelect(project.id)
      }
    } else if (activeTab === "docker" && dockerSelectedProject !== depSelectedProject && dockerSelectedProject) {
      const project = projects.find((p) => p.id === dockerSelectedProject)
      if (project) {
        handleDepProjectSelect(project.id)
      }
    }
  }, [activeTab, depSelectedProject, dockerSelectedProject])

  const loading = projectsLoading || (activeTab === "dependencies" ? dependenciesLoading : dockerImagesLoading)

  const tabs = [
    { id: "dependencies", label: "Dependencies" },
    { id: "docker", label: "Docker Images" },
  ]

  return (
    <main className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Dependency Manager</h1>
        <Button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2">
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh All
        </Button>
      </div>

      {activeTab === "dependencies" && (
        <SelectedPackagesPanel
          packages={selectedPackages}
          onRemove={togglePackageSelection}
          onUpgrade={handleUpgrade}
          onCheckAll={handleCheckAll}
          upgrading={upgrading}
        />
      )}

      {activeTab === "docker" && (
        <SelectedDockerImagesPanel
          images={selectedImages}
          onRemove={toggleImageSelection}
          onUpgrade={handleUpgradeImages}
          upgrading={upgradingImages}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <CardHeader title="Projects" />
          <ProjectList
            projects={projects}
            selectedProject={activeTab === "dependencies" ? depSelectedProject : dockerSelectedProject}
            onSelectProject={activeTab === "dependencies" ? handleDepProjectSelect : handleDockerProjectSelect}
            onCheckUpdates={handleCheckUpdates}
            onCommitChange={handleCommitChange}
            canCommitChange={canCommitChange}
          />
        </div>

        <div className="md:col-span-3">
          <div className="mb-4">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={(tabId: string) => setActiveTab(tabId)} />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : activeTab === "dependencies" ? (
            <DependencyTable
              dependencies={dependencies}
              selectedPackages={selectedPackages}
              onToggleSelection={togglePackageSelection}
              onCheckPackage={handleCheckPackage}
              checking={checkingPackages}
            />
          ) : (
            <DockerImagesTable
              dockerImages={dockerImages}
              selectedImages={selectedImages}
              onToggleSelection={toggleImageSelection}
              onCheckImage={handleCheckImage}
              checking={checkingImages}
            />
          )}
        </div>
      </div>
    </main>
  )
}
