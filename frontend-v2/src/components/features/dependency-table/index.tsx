"use client"

import { useState } from "react"
import type { Dependency } from "components/../types/dependency"
import { DataTable } from "components/../components/ui/data-table"
import { FilterDropdown } from "components/../components/ui/filter-dropdown"
import { Checkbox } from "components/../components/ui/checkbox"
import { Badge } from "components/../components/ui/badge"
import { Star, RefreshCw, AlertTriangle, ArrowUp } from "lucide-react"
import { EmptyState } from "components/../components/ui/empty-state"
import { Button } from "components/../components/ui/button"
import { Loader2 } from "lucide-react"
import { prioritizedPackages } from "@/data/config"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "components/../components/ui/tooltip"
import { Card, CardContent } from "components/../components/ui/card"
import { BadgeList } from "components/../components/ui/badge-list"

interface DependencyTableProps {
  dependencies: Dependency[]
  selectedPackages: Dependency[]
  onToggleSelection: (pkg: Dependency) => void
  onCheckPackage?: (pkg: Dependency) => void
  onCheckAllPackages?: () => void
  onUpgradePackages?: () => void
  checking?: Record<string, boolean>
  upgrading?: boolean
}

export function DependencyTable({
  dependencies,
  selectedPackages,
  onToggleSelection,
  onCheckPackage,
  onCheckAllPackages,
  onUpgradePackages,
  checking = {},
  upgrading = false,
}: DependencyTableProps) {
  const [filter, setFilter] = useState<string>("all")

  const filterOptions = [
    { value: "all", label: "All Packages" },
    { value: "outdated", label: "Outdated Packages" },
    { value: "prioritized", label: "Prioritized Packages" },
  ]

  const isPrioritized = (name: string) => prioritizedPackages.includes(name)

  const isSelected = (dep: Dependency) => {
    return selectedPackages.some(
      (p) => p.name === dep.name && p.project === dep.project && p.type === dep.type,
    )
  }

  const isChecking = (dep: Dependency) => {
    const depId = `${dep.project}-${dep.type}-${dep.name}`
    return checking[depId] || false
  }

  const filteredDependencies = dependencies
    .filter((dep) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "outdated" && dep.outdated) ||
        (filter === "prioritized" && isPrioritized(dep.name))
      return matchesFilter
    })
    .sort((a, b) => {
      // First sort by prioritized status
      const aPrioritized = isPrioritized(a.name)
      const bPrioritized = isPrioritized(b.name)

      if (aPrioritized && !bPrioritized) return -1
      if (!aPrioritized && bPrioritized) return 1

      // Then sort by type and name
      return a.type.localeCompare(b.type) || a.name.localeCompare(b.name)
    })

  const columns = [
    {
      key: "select",
      title: "",
      render: (dep: Dependency) => (
        <Checkbox 
          data-testid={`package-checkbox-${dep.name}`}
          checked={isSelected(dep)} 
          onCheckedChange={() => onToggleSelection(dep)} 
        />
      ),
    },
    {
      key: "name",
      title: "Package",
      render: (dep: Dependency) => (
        <div className="font-medium flex items-center gap-1.5" data-testid={`package-name-${dep.name}`}>
          {isPrioritized(dep.name) && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />}
          {dep.name}
        </div>
      ),
    },
    {
      key: "currentVersion",
      title: "Current Version",
      render: (dep: Dependency) => (
        <span data-testid={`current-version-${dep.name}`}>{dep.currentVersion}</span>
      ),
    },
    {
      key: "latestVersion",
      title: "Latest Version",
      render: (dep: Dependency) => {
        // major bump: manual upgrade required
        if (dep.majorUpgrade) {
          return (
            <div className="flex items-center gap-1" data-testid={`latest-version-${dep.name}`}>
              <span className="text-red-600 font-bold">{dep.latestVersion}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertTriangle className="h-4 w-4 text-red-600" data-testid={`major-version-warning-${dep.name}`} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Major version bump—manual upgrade required</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )
        }
        if (isChecking(dep)) {
          return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" data-testid={`checking-loader-${dep.name}`} />
        }

        if (onCheckPackage) {
          return (
            <div className="flex items-center gap-2" data-testid={`latest-version-${dep.name}`}>
              <span className={dep.outdated ? "text-green-600 font-medium" : ""}>{dep.latestVersion}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      data-testid={`check-package-button-${dep.name}`}
                      variant="ghost"
                      size="icon"
                      onClick={() => onCheckPackage(dep)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Check for latest version</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )
        }

        return (
          <span 
            data-testid={`latest-version-${dep.name}`}
            className={dep.outdated ? "text-green-600 font-medium" : ""}
          >
            {dep.latestVersion}
          </span>
        )
      },
    },
    {
      key: "packageType",
      title: "Type",
      render: (dep: Dependency) => (
        <Badge variant={dep.type === "frontend" ? "default" : "secondary"}>{dep.type}</Badge>
      ),
    },
  ]

  // Function to render the selected packages panel
  const renderSelectedPackagesPanel = () => {
    if (selectedPackages.length === 0) return null;

    const hasMajor = selectedPackages.some(pkg => pkg.majorUpgrade);

    const badgeItems = selectedPackages.map((pkg) => {
      const needsUpgrade = pkg.latestVersion && pkg.currentVersion !== pkg.latestVersion;
      return {
        id: `${pkg.project}-${pkg.type}-${pkg.name}`,
        label: <span className="font-medium">{pkg.name}</span>,
        description: (
          <span>
            {pkg.currentVersion} → {pkg.latestVersion}
          </span>
        ),
        showLoader: upgrading && needsUpgrade,
      };
    });

    const handleRemove = (id: string) => {
      const [projectId, type, name] = id.split("-");
      const pkg = selectedPackages.find((p) => p.project === projectId && p.type === type && p.name === name);
      if (pkg) {
        onToggleSelection(pkg);
      }
    };

    return (
      <Card className="mb-4 border-primary/20 bg-primary/5" data-testid="selected-packages-panel">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Selected Packages ({selectedPackages.length})</h3>
            <div className="flex items-center gap-2">
              {onCheckAllPackages && (
                <Button 
                  data-testid="bulk-check-button"
                  size="sm" 
                  onClick={onCheckAllPackages} 
                  disabled={upgrading} 
                  className="flex items-center gap-1"
                >
                  Check Updates
                </Button>
              )}
              {onUpgradePackages && (
                <Button 
                  data-testid="apply-fix-button"
                  size="sm" 
                  onClick={onUpgradePackages} 
                  disabled={upgrading || hasMajor} 
                  className="flex items-center gap-1"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                  Apply Fix
                </Button>
              )}
            </div>
          </div>
          <BadgeList items={badgeItems} onRemove={handleRemove} maxHeight="24" />
          {selectedPackages.some(p => p.latestVersion === p.currentVersion) && (
            <p className="text-gray-600 text-xs mt-1">Some selected packages are up to date.</p>
          )}
          {hasMajor && (
            <p className="text-yellow-700 text-xs mt-1" data-testid="major-version-warning">Major version bump detected, please upgrade these manually.</p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div data-testid="dependency-table">
      {selectedPackages.length > 0 && renderSelectedPackagesPanel()}
      <div className="flex justify-end mb-4">
        <FilterDropdown options={filterOptions} value={filter} onChange={setFilter} />
      </div>

      <DataTable
        data={filteredDependencies}
        columns={columns}
        keyExtractor={(dep) => `${dep.project}-${dep.type}-${dep.name}`}
        emptyState={
          <EmptyState
            data-testid="empty-state"
            title="No dependencies found"
            description="No dependencies found for the selected project and filter."
          />
        }
        footer={
          <div className="text-sm text-gray-500">
            Showing {filteredDependencies.length} of {dependencies.length} dependencies
          </div>
        }
      />
    </div>
  )
}
