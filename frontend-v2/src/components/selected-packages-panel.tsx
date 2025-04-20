"use client"

import { X, ArrowUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SelectedPackage {
  name: string
  currentVersion: string
  latestVersion: string
  projectId: string
  packageType: "frontend" | "server"
}

interface SelectedPackagesPanelProps {
  packages: SelectedPackage[]
  onRemove: (pkg: SelectedPackage) => void
  onUpgrade: () => void
  upgrading: boolean
}

export function SelectedPackagesPanel({ packages, onRemove, onUpgrade, upgrading }: SelectedPackagesPanelProps) {
  if (packages.length === 0) {
    return null
  }

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Selected Packages ({packages.length})</h3>
          <Button size="sm" onClick={onUpgrade} disabled={upgrading} className="flex items-center gap-1">
            <ArrowUp className="h-3.5 w-3.5" />
            Apply Fix
          </Button>
        </div>
        <ScrollArea className="max-h-24">
          <div className="flex flex-wrap gap-2">
            {packages.map((pkg) => (
              <Badge
                key={`${pkg.projectId}-${pkg.packageType}-${pkg.name}`}
                variant="secondary"
                className="flex items-center gap-1 py-1.5 px-3"
              >
                <span className="font-medium">{pkg.name}</span>
                <span className="text-gray-500 text-xs">
                  {pkg.currentVersion} → {pkg.latestVersion}
                </span>
                <button onClick={() => onRemove(pkg)} className="ml-1 text-gray-500 hover:text-gray-700">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
