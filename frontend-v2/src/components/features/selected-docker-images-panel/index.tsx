"use client"

import type { DockerImage } from "@/types/dependency"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { BadgeList } from "@/components/ui/badge-list"

interface SelectedDockerImagesPanelProps {
  images: DockerImage[]
  onRemove: (image: DockerImage) => void
  onUpgrade: () => void
  upgrading: boolean
}

export function SelectedDockerImagesPanel({ images, onRemove, onUpgrade, upgrading }: SelectedDockerImagesPanelProps) {
  if (images.length === 0) {
    return null
  }

  const badgeItems = images.map((image) => ({
    id: `${image.projectId}-${image.registry}-${image.name}-${image.tag}`,
    label: <span className="font-medium">{image.name}</span>,
    description: (
      <span>
        {image.tag} → {image.latestTag}
      </span>
    ),
  }))

  const handleRemove = (id: string) => {
    const [projectId, registry, name, tag] = id.split("-")
    const image = images.find(
      (i) => i.projectId === projectId && i.registry === registry && i.name === name && i.tag === tag,
    )
    if (image) {
      onRemove(image)
    }
  }

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Selected Docker Images ({images.length})</h3>
          <Button size="sm" onClick={onUpgrade} disabled={upgrading} className="flex items-center gap-1">
            <ArrowUp className="h-3.5 w-3.5" />
            Apply Fix
          </Button>
        </div>
        <BadgeList items={badgeItems} onRemove={handleRemove} maxHeight="24" />
      </CardContent>
    </Card>
  )
}
