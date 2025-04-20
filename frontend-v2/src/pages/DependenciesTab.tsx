"use client"

import { useEffect } from "react"
import { usePackageContext } from "@/context/PackageContext"
import { SelectedPackagesPanel } from "@/components/features/selected-packages-panel"
import { SelectedPackagesDetail } from "@/components/features/selected-packages-detail"
import { DependencyTable } from "@/components/features/dependency-table"
import { CardHeader } from "@/components/ui/card-header"
import { Loader2 } from "lucide-react"

export function DependenciesTab() {
  const {
    projects,
    activeProjectId,
    selectProject,
    dependencies,
    dependenciesLoading,
    checkingPackages,
    selectedPackages,
    togglePackage,
    checkPackage,
    checkAllPackages,
    upgradePackages,
    upgrading,
  } = usePackageContext()

  // load on mount
  useEffect(() => {
    if (projects.length && activeProjectId) selectProject(activeProjectId)
  }, [projects, activeProjectId, selectProject])

  return (
    <div>
      <CardHeader title="Projects" />
      {/* TODO: render project selector, e.g. dropdown using projects and selectProject */}
      {dependenciesLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <>
          <SelectedPackagesPanel
            packages={selectedPackages}
            onRemove={togglePackage}
            onCheckAll={checkAllPackages}
            onUpgrade={upgradePackages}
            upgrading={upgrading}
          />
          <DependencyTable
            dependencies={dependencies}
            selectedPackages={selectedPackages}
            onToggleSelection={togglePackage}
            onCheckPackage={checkPackage}
            checking={checkingPackages}
          />
          <SelectedPackagesDetail
            packages={selectedPackages}
            onRemove={togglePackage}
            onUpgrade={upgradePackages}
            upgrading={upgrading}
          />
        </>
      )}
    </div>
  )
}
