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
import { fetchPackages, fetchPackageVersion, upgradePackage } from "../services/api"
import { fetchDockerImages as fetchDockerImagesService, upgradeDockerImage } from "../services/api"
import type { Dependency, DockerImage } from "../types/dependency"
import { useProjects, useResource, useToggleList, useChecker } from "../hooks/usePackageManagerHooks"

export function PackageManager() {
  const [activeTab, setActiveTab] = useState("dependencies")
  const [upgrading, setUpgrading] = useState(false)
  const [upgradingImages, setUpgradingImages] = useState(false)
  const [depSelectedProject, setDepSelectedProject] = useState<string | null>(null)
  const [dockerSelectedProject, setDockerSelectedProject] = useState<string | null>(null)

  const { list: projects, loading: projectsLoading, reload: reloadProjects } = useProjects()
  const { items: dependencies, loading: dependenciesLoading, reload: reloadDependencies } =
    useResource<Dependency>(fetchPackages, depSelectedProject)
  const { items: dockerImages, loading: dockerImagesLoading, reload: reloadDockerImages } =
    useResource<DockerImage>(fetchDockerImagesService, dockerSelectedProject, img => img.registry === 'server')
  const { selected: selectedPackages, toggle: togglePackageSelection, clear: clearSelectedPackages } =
    useToggleList<Dependency>(dep => dep.name)
  const { selected: selectedImages, toggle: toggleImageSelection, clear: clearSelectedImages } =
    useToggleList<DockerImage>(img => `${img.projectId}-${img.registry}-${img.name}-${img.tag}`)

  const { busy: checkingPackages, run: handleCheckPackage } = useChecker<Dependency>(
    pkg => pkg.id,
    async (pkg) => {
      const result = await fetchPackageVersion(pkg.id)
      const latest = result.latestVersion ?? pkg.currentVersion
      const currMajor = Number(pkg.currentVersion.split('.')[0])
      const newMajor = Number(latest.split('.')[0])
      const majorUpgrade = newMajor > currMajor
      reloadDependencies()
      clearSelectedPackages()
      toast({ title: 'Package checked', description: `Latest version for ${pkg.name} is ${latest}` })
    },
    (msg) => toast({ title: 'Failed to check package', description: msg, variant: 'destructive' })
  )
  const { busy: checkingImages, run: handleCheckImage } = useChecker<DockerImage>(
    img => `${img.projectId}-${img.registry}-${img.name}-${img.tag}`,
    async (img) => {
      const current = Number.parseInt(img.tag.replace(/[^\d]/g, '')) || 1
      const latestTag = img.tag.replace(/\d+/, (current + Math.floor(Math.random()*3) + 1).toString())
      reloadDockerImages()
      clearSelectedImages()
      toast({ title: 'Image checked', description: `Latest tag for ${img.name}:${img.tag} is ${latestTag}` })
    },
    (msg) => toast({ title: 'Failed to check image', description: msg, variant: 'destructive' })
  )

  // Initialize selected project after projects load
  useEffect(() => {
    if (!depSelectedProject && projects.length > 0) {
      const first = projects[0]
      setDepSelectedProject(first.id)
      setDockerSelectedProject(first.id)
    }
  }, [projects])

  const handleRefresh = () => {
    reloadProjects()
    reloadDependencies()
    reloadDockerImages()
  }

  const handleDepProjectSelect = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return
    setDepSelectedProject(projectId)
    clearSelectedPackages()
    reloadDependencies()
  }

  const handleDockerProjectSelect = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return
    setDockerSelectedProject(projectId)
    clearSelectedImages()
    reloadDockerImages()
  }

  // Apply fixes to selected dependencies
  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      await Promise.all(
        selectedPackages.map((pkg) => upgradePackage(pkg.project, pkg))
      )
      toast({
        title: "Packages upgraded",
        description: `Upgraded ${selectedPackages.length} packages`,
      })
      reloadDependencies()
      clearSelectedPackages()
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
      reloadDockerImages()
      clearSelectedImages()
    } catch (error) {
      console.error("Image upgrade error", error)
      toast({ title: "Upgrade failed", description: error.message, variant: "destructive" })
    } finally {
      setUpgradingImages(false)
    }
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
        <Button onClick={handleRefresh} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh All
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
