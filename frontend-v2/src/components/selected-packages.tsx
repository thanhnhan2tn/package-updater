"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, ArrowUp, Loader2 } from "lucide-react"
import { upgradePackages } from "@/lib/actions"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SelectedPackage {
  name: string
  currentVersion: string
  latestVersion: string
  projectId: string
  packageType: "frontend" | "server"
}

interface SelectedPackagesProps {
  packages: SelectedPackage[]
  onRemove: (pkg: SelectedPackage) => void
}

const mockProjects = [
  { id: "project1", name: "Project 1" },
  { id: "project2", name: "Project 2" },
]

export function SelectedPackages({ packages, onRemove }: SelectedPackagesProps) {
  const [upgrading, setUpgrading] = useState(false)

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const result = await upgradePackages(packages)

      if (result.success) {
        toast({
          title: "Packages upgraded successfully",
          description: `Upgraded ${packages.length} packages`,
        })
      } else {
        toast({
          title: "Failed to upgrade packages",
          description: result.error || "An unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Failed to upgrade packages",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setUpgrading(false)
    }
  }

  // Group packages by project
  const packagesByProject = packages.reduce<Record<string, SelectedPackage[]>>((acc, pkg) => {
    if (!acc[pkg.projectId]) {
      acc[pkg.projectId] = []
    }
    acc[pkg.projectId].push(pkg)
    return acc
  }, {} as Record<string, SelectedPackage[]>)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Selected Packages</span>
          <Button
            onClick={handleUpgrade}
            disabled={upgrading || packages.length === 0}
            className="flex items-center gap-2"
          >
            {upgrading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            Apply Fix
          </Button>
        </CardTitle>
        <CardDescription>
          {packages.length} package{packages.length !== 1 ? "s" : ""} selected for upgrade
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(Object.entries(packagesByProject) as [string, SelectedPackage[]][]).map(([projectId, projectPackages]) => (
          <div key={projectId} className="mb-4 last:mb-0">
            <h3 className="text-sm font-medium mb-2">
              {mockProjects.find((p) => p.id === projectId)?.name || projectId}
            </h3>
            <div className="flex flex-wrap gap-2">
              {projectPackages.map((pkg: SelectedPackage) => (
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
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
