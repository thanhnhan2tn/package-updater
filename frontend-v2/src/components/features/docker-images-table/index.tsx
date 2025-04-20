"use client"

import { useState } from "react"
import type { DockerImage } from "@/types/dependency"
import { DataTable } from "@/components/ui/data-table"
import { SearchInput } from "@/components/ui/search-input"
import { FilterDropdown } from "@/components/ui/filter-dropdown"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Star, RefreshCw } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { prioritizedDockerImages } from "@/data/config"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DockerImagesTableProps {
  dockerImages: DockerImage[]
  selectedImages: DockerImage[]
  onToggleSelection: (image: DockerImage) => void
  onCheckImage: (image: DockerImage) => void
  checking: Record<string, boolean>
}

export function DockerImagesTable({
  dockerImages,
  selectedImages,
  onToggleSelection,
  onCheckImage,
  checking,
}: DockerImagesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<string>("all")

  const filterOptions = [
    { value: "all", label: "All Images" },
    { value: "outdated", label: "Outdated Images" },
    { value: "prioritized", label: "Prioritized Images" },
    { value: "unchecked", label: "Unchecked Images" },
  ]

  const isPrioritized = (name: string) => prioritizedDockerImages.includes(name)

  const isSelected = (image: DockerImage) => {
    return selectedImages.some(
      (i) =>
        i.name === image.name &&
        i.tag === image.tag &&
        i.projectId === image.projectId &&
        i.registry === image.registry,
    )
  }

  const isChecking = (image: DockerImage) => {
    const imageId = `${image.projectId}-${image.registry}-${image.name}-${image.tag}`
    return checking[imageId] || false
  }

  const filteredImages = dockerImages
    .filter((image) => {
      const lowerSearch = searchTerm.toLowerCase()
      const name = image.name || ''
      const tag = image.tag || ''
      const registry = image.registry || ''
      const matchesSearch =
        name.toLowerCase().includes(lowerSearch) ||
        tag.toLowerCase().includes(lowerSearch) ||
        registry.toLowerCase().includes(lowerSearch)

      const matchesFilter =
        filter === "all" ||
        (filter === "outdated" && image.outdated === true) ||
        (filter === "prioritized" && isPrioritized(image.name)) ||
        (filter === "unchecked" && image.latestTag === null)

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      // First sort by prioritized status
      const aPrioritized = isPrioritized(a.name)
      const bPrioritized = isPrioritized(b.name)

      if (aPrioritized && !bPrioritized) return -1
      if (!aPrioritized && bPrioritized) return 1

      // Then sort by name, guarding against undefined
      const nameA = a.name || ''
      const nameB = b.name || ''
      return nameA.localeCompare(nameB)
    })

  const columns = [
    {
      key: "select",
      title: "",
      render: (image: DockerImage) => (
        <Checkbox
          checked={isSelected(image)}
          onCheckedChange={() => onToggleSelection(image)}
          disabled={image.latestTag === null}
        />
      ),
    },
    {
      key: "name",
      title: "Image",
      sortable: true,
      render: (image: DockerImage) => (
        <div className="font-medium flex items-center gap-1.5">
          {isPrioritized(image.name) && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />}
          {image.name}
        </div>
      ),
    },
    {
      key: "tag",
      title: "Current Tag",
      sortable: true,
      render: (image: DockerImage) => image.tag,
    },
    {
      key: "latestTag",
      title: "Latest Tag",
      sortable: true,
      render: (image: DockerImage) => {
        if (isChecking(image)) {
          return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        }

        if (image.latestTag === null) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onCheckImage(image)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Check for latest tag</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        }

        return <span className={image.outdated ? "text-green-600 font-medium" : ""}>{image.latestTag}</span>
      },
    },
    {
      key: "registry",
      title: "Registry",
      sortable: true,
      render: (image: DockerImage) => (
        <Badge variant="outline" className="font-mono text-xs">
          {image.registry}
        </Badge>
      ),
    },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search Docker images..."
          className="flex-1 w-full"
        />
        <FilterDropdown options={filterOptions} value={filter} onChange={setFilter} />
      </div>

      <DataTable
        data={filteredImages}
        columns={columns}
        keyExtractor={(image) => `${image.projectId}-${image.registry}-${image.name}-${image.tag}`}
        emptyState={
          <EmptyState
            title="No Docker images found"
            description={
              searchTerm
                ? `No Docker images match "${searchTerm}"`
                : "No Docker images found for the selected project and filter."
            }
          />
        }
        footer={
          <div className="text-sm text-gray-500">
            Showing {filteredImages.length} of {dockerImages.length} Docker images
          </div>
        }
      />
    </div>
  )
}
