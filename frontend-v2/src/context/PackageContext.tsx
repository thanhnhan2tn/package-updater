import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Dependency, DockerImage, SelectedPackage, Project } from '@/types/dependency'
import {
  fetchProjects as fetchProjectsService,
  fetchPackages,
  fetchPackageVersion,
  upgradePackage,
} from '@/services/api'
import { fetchDockerImages as fetchDockerImagesService, upgradeDockerImage } from '@/services/api'
import { toast } from '@/components/ui/use-toast'

interface PackageContextType {
  projects: Project[]
  projectsLoading: boolean
  activeProjectId: string | null
  selectProject: (id: string) => void
  dependencies: Dependency[]
  dependenciesLoading: boolean
  selectedPackages: SelectedPackage[]
  checkingPackages: Record<string, boolean>
  dockerImages: DockerImage[]
  dockerImagesLoading: boolean
  selectedImages: DockerImage[]
  checkingImages: Record<string, boolean>
  upgrading: boolean
  upgradingImages: boolean
  checkAllPackages: () => Promise<void>
  upgradePackages: () => Promise<void>
  checkAllImages: () => Promise<void>
  upgradeImages: () => Promise<void>
  togglePackage: (pkg: Dependency) => void
  toggleImage: (img: DockerImage) => void
  checkPackage: (pkg: Dependency) => Promise<void>
  checkImage: (img: DockerImage) => Promise<void>
}

const PackageContext = createContext<PackageContextType | undefined>(undefined)

export function PackageProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  const [dependencies, setDependencies] = useState<Dependency[]>([])
  const [dependenciesLoading, setDependenciesLoading] = useState(false)
  const [selectedPackages, setSelectedPackages] = useState<SelectedPackage[]>([])
  const [checkingPackages, setCheckingPackages] = useState<Record<string, boolean>>({})
  const [upgrading, setUpgrading] = useState(false)

  const [dockerImages, setDockerImages] = useState<DockerImage[]>([])
  const [dockerImagesLoading, setDockerImagesLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<DockerImage[]>([])
  const [checkingImages, setCheckingImages] = useState<Record<string, boolean>>({})
  const [upgradingImages, setUpgradingImages] = useState(false)

  // Load projects on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProjectsService()
        setProjects(data)
        if (data.length) {
          setActiveProjectId(data[0].id)
        }
      } catch (e:any) {
        toast({ title: 'Error loading projects', description: e.message, variant: 'destructive' })
      } finally {
        setProjectsLoading(false)
      }
    }
    load()
  }, [])

  // On project change, fetch dependencies and images
  useEffect(() => {
    if (!activeProjectId) return
    const project = projects.find((p) => p.id === activeProjectId)
    if (!project) return
    // deps
    (async () => {
      setDependenciesLoading(true)
      try {
        const data = await fetchPackages(project.name)
        setDependencies(data.map((d) => ({ ...d, majorUpgrade: false })))
        setSelectedPackages([])
      } catch (e:any) {
        toast({ title: 'Error fetching dependencies', description: e.message, variant: 'destructive' })
      } finally {
        setDependenciesLoading(false)
      }
    })()
    // images
    ;(async () => {
      setDockerImagesLoading(true)
      try {
        const all = await fetchDockerImagesService(project.name)
        setDockerImages(all.filter((img) => img.registry === 'server'))
        setSelectedImages([])
      } catch (e:any) {
        toast({ title: 'Error fetching images', description: e.message, variant: 'destructive' })
      } finally {
        setDockerImagesLoading(false)
      }
    })()
  }, [activeProjectId, projects])

  const selectProject = useCallback((id: string) => {
    setActiveProjectId(id)
  }, [])

  const togglePackage = useCallback((pkg: Dependency) => {
    setSelectedPackages((prev) =>
      prev.some((p) => p.id === pkg.id)
        ? prev.filter((p) => p.id !== pkg.id)
        : [...prev, { ...pkg, checked: false }]
    )
  }, [])

  const toggleImage = useCallback((img: DockerImage) => {
    const key = `${img.projectId}-${img.registry}-${img.name}-${img.tag}`
    setSelectedImages((prev) =>
      prev.some((i) => `${i.projectId}-${i.registry}-${i.name}-${i.tag}` === key)
        ? prev.filter((i) => `${i.projectId}-${i.registry}-${i.name}-${i.tag}` !== key)
        : [...prev, img]
    )
  }, [])

  const checkPackage = useCallback(async (pkg: Dependency) => {
    const key = pkg.id
    setCheckingPackages((c) => ({ ...c, [key]: true }))
    try {
      const res = await fetchPackageVersion(pkg.id)
      const latest = res.latestVersion || pkg.currentVersion
      const currMajor = Number(pkg.currentVersion.split('.')[0])
      const newMajor = Number(latest.split('.')[0])
      const majorUpgrade = newMajor > currMajor
      const updated = { ...pkg, latestVersion: latest, outdated: latest !== pkg.currentVersion, majorUpgrade, checked: true }
      setDependencies((d) => d.map((x) => (x.id === pkg.id ? updated : x)))
      setSelectedPackages((s) => s.map((x) => (x.id === pkg.id ? updated : x)))
      toast({ title: 'Package checked', description: `${pkg.name} → ${latest}` })
    } catch (e:any) {
      toast({ title: 'Check package failed', description: e.message, variant: 'destructive' })
    } finally {
      setCheckingPackages((c) => ({ ...c, [key]: false }))
    }
  }, [])

  const checkAllPackages = useCallback(async () => {
    await Promise.all(selectedPackages.map(checkPackage))
  }, [selectedPackages, checkPackage])

  const upgradePackages = useCallback(async () => {
    if (!activeProjectId) return
    setUpgrading(true)
    try {
      const project = projects.find((p) => p.id === activeProjectId)
      if (!project) throw new Error('No project')
      await upgradePackage(project.name, selectedPackages)
      toast({ title: 'Upgrade complete', description: '' })
      // reload deps
      await fetchPackages(project.name)
    } catch (e:any) {
      toast({ title: 'Upgrade failed', description: e.message, variant: 'destructive' })
    } finally {
      setUpgrading(false)
    }
  }, [activeProjectId, projects, selectedPackages])

  const checkImage = useCallback(async (img: DockerImage) => {
    const key = `${img.projectId}-${img.registry}-${img.name}-${img.tag}`
    setCheckingImages((c) => ({ ...c, [key]: true }))
    try {
      const res = await fetchDockerImagesService(img.projectId)
      // assume res.latestTag
      const latest = res.latestTag || img.tag
      const updated = { ...img, latestTag: latest, outdated: latest !== img.tag }
      setDockerImages((d) => d.map((x) => `${x.projectId}-${x.registry}-${x.name}-${x.tag}` === key ? updated : x))
      toast({ title: 'Image checked', description: `${img.name} → ${latest}` })
    } catch (e:any) {
      toast({ title: 'Check image failed', description: e.message, variant: 'destructive' })
    } finally {
      setCheckingImages((c) => ({ ...c, [key]: false }))
    }
  }, [])

  const checkAllImages = useCallback(async () => {
    await Promise.all(selectedImages.map(checkImage))
  }, [selectedImages, checkImage])

  const upgradeImages = useCallback(async () => {
    if (!activeProjectId) return
    setUpgradingImages(true)
    try {
      const project = projects.find((p) => p.id === activeProjectId)
      if (!project) throw new Error('No project')
      // upgrade each selected image individually
      await Promise.all(
        selectedImages.map((img) =>
          upgradeDockerImage(project.name, {
            imageName: img.name,
            latestVersion: img.latestTag || '',
            type: img.registry,
          })
        )
      )
      toast({ title: 'Images upgraded' })
      await fetchDockerImagesService(project.name)
    } catch (e:any) {
      toast({ title: 'Upgrade images failed', description: e.message, variant: 'destructive' })
    } finally {
      setUpgradingImages(false)
    }
  }, [activeProjectId, projects, selectedImages])

  return (
    <PackageContext.Provider
      value={{
        projects,
        projectsLoading,
        activeProjectId,
        selectProject,
        dependencies,
        dependenciesLoading,
        selectedPackages,
        checkingPackages,
        dockerImages,
        dockerImagesLoading,
        selectedImages,
        checkingImages,
        upgrading,
        upgradingImages,
        checkAllPackages,
        upgradePackages,
        checkAllImages,
        upgradeImages,
        togglePackage,
        toggleImage,
        checkPackage,
        checkImage,
      }}
    >
      {children}
    </PackageContext.Provider>
  )
}

export function usePackageContext() {
  const ctx = useContext(PackageContext)
  if (!ctx) throw new Error('usePackageContext must be used within PackageProvider')
  return ctx
}
