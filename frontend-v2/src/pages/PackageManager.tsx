"use client"

import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { ProjectList } from "../components/features/project-list"
import { DependencyTable } from "../components/features/dependency-table"
import { DockerImagesTable } from "../components/features/docker-images-table"
import { Button } from "../components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { CardHeader } from "../components/ui/card-header"
import { Tabs } from "../components/ui/tabs"
import { useToast } from "../hooks/use-toast"
import { useProjectManager } from "../hooks/use-project-manager"
import { useDependencyManager } from "../hooks/use-dependency-manager"
import { useDockerManager } from "../hooks/use-docker-manager"

// Tab configuration
const TABS = [
  { id: "dependencies", label: "Dependencies" },
  { id: "docker", label: "Docker Images" },
]

export function PackageManager() {
  // Shared state
  const [activeTab, setActiveTab] = useState("dependencies")
  const { toast } = useToast()
  
  // Track initial load
  const initialLoadRef = useRef(false)
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)
  
  // Custom hooks for different concerns
  const {
    projects,
    loading: projectsLoading,
    selectedProject,
    setSelectedProject,
    handleCheckUpdates,
    handleCommitChange,
    getSelectedProjectName,
  } = useProjectManager()
  
  const {
    dependencies,
    selectedPackages,
    loading: dependenciesLoading,
    refreshing: depsRefreshing,
    upgrading: depsUpgrading,
    checkingPackages,
    loadDependencies,
    checkPackageVersion,
    checkAllSelectedPackages,
    upgradeDependencies,
    togglePackageSelection,
    clearSelectedPackages,
    setRefreshing: setDepsRefreshing,
  } = useDependencyManager()
  
  const {
    dockerImages,
    selectedImages,
    loading: dockerImagesLoading,
    upgrading: dockerUpgrading,
    checkingImages,
    loadDockerImages,
    checkDockerImage,
    upgradeDockerImages,
    toggleImageSelection,
    clearSelectedImages,
  } = useDockerManager()

  // Handle initial data loading
  useEffect(() => {
    // Only run once when we have a selected project
    if (initialDataLoaded || !selectedProject) return;
    
    const loadInitialData = async () => {
      const projectName = getSelectedProjectName();
      if (!projectName) return;
      
      console.log(`📌 Initial data load for ${projectName}`);
      
      try {
        // Load data for the active tab
        if (activeTab === "dependencies") {
          await loadDependencies(projectName);
        } else {
          await loadDockerImages(projectName);
        }
        
        setInitialDataLoaded(true);
        initialLoadRef.current = true;
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };
    
    loadInitialData();
  }, [
    selectedProject, 
    getSelectedProjectName, 
    activeTab, 
    loadDependencies, 
    loadDockerImages, 
    initialDataLoaded
  ]);

  // Handle project selection
  const handleProjectSelect = useCallback((projectId: string) => {
    setSelectedProject(projectId)
    
    const projectName = projects.find(p => p.id === projectId)?.name || null
    
    // Clear selected items
    if (activeTab === "dependencies") {
      clearSelectedPackages()
    } else {
      clearSelectedImages()
    }
    
    // Load data for the selected project
    if (projectName) {
      if (activeTab === "dependencies") {
        loadDependencies(projectName)
      } else {
        loadDockerImages(projectName)
      }
    }
  }, [
    projects, 
    activeTab, 
    setSelectedProject, 
    clearSelectedPackages, 
    clearSelectedImages, 
    loadDependencies, 
    loadDockerImages
  ])

  // Synchronize tab changes
  useEffect(() => {
    // Skip if we haven't completed initial load
    if (!initialLoadRef.current) return;
    
    const projectName = getSelectedProjectName()
    if (!projectName) return
        
    // Load appropriate data when switching tabs
    if (activeTab === "dependencies") {
      loadDependencies(projectName)
    } else {
      loadDockerImages(projectName)
    }
  }, [activeTab, getSelectedProjectName, loadDependencies, loadDockerImages])

  // Handle refresh all button
  const handleRefresh = useCallback(async () => {
    const projectName = getSelectedProjectName()
    if (!projectName) return
    
    setDepsRefreshing(true)
    try {
      if (activeTab === "dependencies") {
        await loadDependencies(projectName)
      } else {
        await loadDockerImages(projectName)
      }
      
      toast({
        title: activeTab === "dependencies" ? "Dependencies refreshed" : "Docker images refreshed",
        description: `Successfully refreshed ${activeTab === "dependencies" ? "all dependencies" : "all Docker images"}`,
      })
    } catch (error: any) {
      console.error(`Error refreshing ${activeTab}:`, error)
      toast({
        title: `Error refreshing ${activeTab}`,
        description: error.message || `Failed to refresh ${activeTab}`,
        variant: "destructive",
      })
    } finally {
      setDepsRefreshing(false)
    }
  }, [
    activeTab, 
    getSelectedProjectName, 
    loadDependencies, 
    loadDockerImages, 
    setDepsRefreshing, 
    toast
  ])

  // Memoized value to determine if a project has selected items
  const canCommitChange = useCallback((projectId: string) => {
    if (!selectedProject || selectedProject !== projectId) return false
    
    if (activeTab === "dependencies") {
      return selectedPackages.length > 0
    }
    
    return selectedImages.length > 0
  }, [activeTab, selectedProject, selectedPackages.length, selectedImages.length])

  // Compute loading state
  const isLoading = useMemo(() => {
    if (projectsLoading) return true
    if (activeTab === "dependencies" && dependenciesLoading) return true
    if (activeTab === "docker" && dockerImagesLoading) return true
    return false
  }, [
    projectsLoading,
    activeTab,
    dependenciesLoading,
    dockerImagesLoading,
  ])

  // Generate commit summary from selected packages
  const getCommitSummary = useCallback(() => {
    if (activeTab === "dependencies") {
      return selectedPackages.map(p => p.name).join('-')
    }
    return selectedImages.map(img => `${img.name}:${img.tag}`).join('-')
  }, [activeTab, selectedPackages, selectedImages])

  // Handle commit action
  const onCommitChange = useCallback(async (projectId: string) => {
    const summary = getCommitSummary()
    return handleCommitChange(projectId, summary)
  }, [getCommitSummary, handleCommitChange])

  return (
    <main className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Dependency Manager</h1>
        <Button 
          onClick={handleRefresh} 
          disabled={depsRefreshing} 
          className="flex items-center gap-2"
        >
          {depsRefreshing ? 
            <Loader2 className="h-4 w-4 animate-spin" /> : 
            <RefreshCw className="h-4 w-4" />
          }
          Refresh All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Projects Panel */}
        <div className="md:col-span-1">
          <CardHeader title="Projects" />
          <ProjectList
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={handleProjectSelect}
            onCheckUpdates={handleCheckUpdates}
            onCommitChange={onCommitChange}
            canCommitChange={canCommitChange}
          />
        </div>

        {/* Main Content Panel */}
        <div className="md:col-span-3">
          <div className="mb-4">
            <Tabs 
              tabs={TABS} 
              activeTab={activeTab} 
              onChange={setActiveTab} 
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : activeTab === "dependencies" ? (
            <DependencyTable
              dependencies={dependencies}
              selectedPackages={selectedPackages}
              onToggleSelection={togglePackageSelection}
              onCheckPackage={checkPackageVersion}
              onCheckAllPackages={checkAllSelectedPackages}
              onUpgradePackages={upgradeDependencies}
              checking={checkingPackages}
              upgrading={depsUpgrading}
            />
          ) : (
            <DockerImagesTable
              dockerImages={dockerImages}
              selectedImages={selectedImages}
              onToggleSelection={toggleImageSelection}
              onCheckImage={checkDockerImage}
              onUpgradeImages={upgradeDockerImages}
              checking={checkingImages}
              upgrading={dockerUpgrading}
            />
          )}
        </div>
      </div>
    </main>
  )
}
