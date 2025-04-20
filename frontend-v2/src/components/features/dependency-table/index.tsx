"use client"

import { useState } from "react"
import type { Dependency } from "components/../types/dependency"
import { DataTable } from "components/../components/ui/data-table"
import { SearchInput } from "components/../components/ui/search-input"
import { FilterDropdown } from "components/../components/ui/filter-dropdown"
import { Checkbox } from "components/../components/ui/checkbox"
import { Badge } from "components/../components/ui/badge"
import { Star, RefreshCw, AlertTriangle } from "lucide-react"
import { EmptyState } from "components/../components/ui/empty-state"
import { Button } from "components/../components/ui/button"
import { Loader2 } from "lucide-react"
import { prioritizedPackages } from "@/data/config"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "components/../components/ui/tooltip"

interface DependencyTableProps {
  dependencies: Dependency[]
  selectedPackages: Dependency[]
  onToggleSelection: (pkg: Dependency) => void
  onCheckPackage?: (pkg: Dependency) => void
  checking?: Record<string, boolean>
}

export function DependencyTable({
  dependencies,
  selectedPackages,
  onToggleSelection,
  onCheckPackage,
  checking = {},
}: DependencyTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
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
      const matchesSearch = dep.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter =
        filter === "all" ||
        (filter === "outdated" && dep.outdated) ||
        (filter === "prioritized" && isPrioritized(dep.name))
      return matchesSearch && matchesFilter
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
        <Checkbox checked={isSelected(dep)} onCheckedChange={() => onToggleSelection(dep)} />
      ),
    },
    {
      key: "name",
      title: "Package",
      render: (dep: Dependency) => (
        <div className="font-medium flex items-center gap-1.5">
          {isPrioritized(dep.name) && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />}
          {dep.name}
        </div>
      ),
    },
    {
      key: "currentVersion",
      title: "Current Version",
      render: (dep: Dependency) => dep.currentVersion,
    },
    {
      key: "latestVersion",
      title: "Latest Version",
      render: (dep: Dependency) => {
        // major bump: manual upgrade required
        if (dep.majorUpgrade) {
          return (
            <div className="flex items-center gap-1">
              <span className="text-red-600 font-bold">{dep.latestVersion}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
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
          return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        }

        if (onCheckPackage) {
          return (
            <div className="flex items-center gap-2">
              <span className={dep.outdated ? "text-green-600 font-medium" : ""}>{dep.latestVersion}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
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

        return <span className={dep.outdated ? "text-green-600 font-medium" : ""}>{dep.latestVersion}</span>
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search dependencies..."
          className="flex-1 w-full"
        />
        <FilterDropdown options={filterOptions} value={filter} onChange={setFilter} />
      </div>

      <DataTable
        data={filteredDependencies}
        columns={columns}
        keyExtractor={(dep) => `${dep.project}-${dep.type}-${dep.name}`}
        emptyState={
          <EmptyState
            title="No dependencies found"
            description={
              searchTerm
                ? `No dependencies match "${searchTerm}"`
                : "No dependencies found for the selected project and filter."
            }
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
