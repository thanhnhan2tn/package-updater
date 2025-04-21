"use client"

import { useState } from "react"
import type { DockerImage } from "@/types/dependency"
import { DataTable } from "@/components/ui/data-table"
import { FilterDropdown } from "@/components/ui/filter-dropdown"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Star, RefreshCw, ArrowUp } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { prioritizedDockerImages } from "@/data/config"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"
import { BadgeList } from "@/components/ui/badge-list"

interface DockerImagesTableProps {
  dockerImages: DockerImage[]
  selectedImages: DockerImage[]
  onToggleSelection: (image: DockerImage) => void
  onCheckImage: (image: DockerImage) => void
  onUpgradeImages?: () => void
  checking: Record<string, boolean>
  upgrading?: boolean
}

export function DockerImagesTable({
  dockerImages,
  selectedImages,
  onToggleSelection,
  onCheckImage,
  onUpgradeImages,
  checking,
  upgrading = false,
}: DockerImagesTableProps) {
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
      const matchesFilter =
        filter === "all" ||
        (filter === "outdated" && image.outdated === true) ||
        (filter === "prioritized" && isPrioritized(image.name)) ||
        (filter === "unchecked" && image.latestTag === null)

      return matchesFilter
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

  // Function to render the selected docker images panel
  const renderSelectedDockerImagesPanel = () => {
    if (selectedImages.length === 0) return null;

    const badgeItems = selectedImages.map((image) => {
      const needsUpgrade = image.latestTag && image.tag !== image.latestTag;
      return {
        id: `${image.projectId}-${image.registry}-${image.name}-${image.tag}`,
        label: <span className="font-medium">{image.name}</span>,
        description: (
          <span>
            {image.tag} → {image.latestTag}
          </span>
        ),
        showLoader: upgrading && needsUpgrade,
      };
    });

    const handleRemove = (id: string) => {
      const [projectId, registry, name, tag] = id.split("-");
      const image = selectedImages.find(
        (i) => i.projectId === projectId && i.registry === registry && i.name === name && i.tag === tag,
      );
      if (image) {
        onToggleSelection(image);
      }
    };

    return (
      <Card className="mb-4 border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Selected Docker Images ({selectedImages.length})</h3>
            {onUpgradeImages && (
              <Button size="sm" onClick={onUpgradeImages} disabled={upgrading} className="flex items-center gap-1">
                <ArrowUp className="h-3.5 w-3.5" />
                Apply Fix
              </Button>
            )}
          </div>
          <BadgeList items={badgeItems} onRemove={handleRemove} maxHeight="24" />
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      {selectedImages.length > 0 && renderSelectedDockerImagesPanel()}
      <div className="flex justify-end mb-4">
        <FilterDropdown options={filterOptions} value={filter} onChange={setFilter} />
      </div>

      <DataTable
        data={filteredImages}
        columns={columns}
        keyExtractor={(image) => `${image.projectId}-${image.registry}-${image.name}-${image.tag}`}
        emptyState={
          <EmptyState
            title="No Docker images found"
            description="No Docker images found for the selected project and filter."
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
