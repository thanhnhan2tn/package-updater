"use client"

import type { SelectedPackage } from "@/types/dependency"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUp, Loader2 } from "lucide-react"
import { BadgeList } from "@/components/ui/badge-list"
import { useMemo } from "react"

interface SelectedPackagesDetailProps {
  packages: SelectedPackage[]
  onRemove: (pkg: SelectedPackage) => void
  onUpgrade: () => void
  upgrading: boolean
}

export function SelectedPackagesDetail({ packages, onRemove, onUpgrade, upgrading }: SelectedPackagesDetailProps) {
  // Group packages by project
  const packagesByProject = useMemo(() => {
    return packages.reduce(
      (acc, pkg) => {
        if (!acc[pkg.project]) {
          acc[pkg.project] = []
        }
        acc[pkg.project].push(pkg)
        return acc
      },
      {} as Record<string, SelectedPackage[]>,
    )
  }, [packages])

  const handleRemove = (id: string) => {
    const [projectId, type, name] = id.split("-")
    const pkg = packages.find((p) => p.project === projectId && p.type === type && p.name === name)
    if (pkg) {
      onRemove(pkg)
    }
  }

  if (packages.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Selected Packages</CardTitle>
            <CardDescription>
              {packages.length} package{packages.length !== 1 ? "s" : ""} selected for upgrade
            </CardDescription>
          </div>
          <Button onClick={onUpgrade} disabled={upgrading} className="flex items-center gap-2">
            {upgrading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            Apply Fix
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {Object.entries(packagesByProject).map(([projectId, projectPackages]) => {
          const badgeItems = projectPackages.map((pkg) => ({
            id: `${pkg.project}-${pkg.type}-${pkg.name}`,
            label: <span className="font-medium">{pkg.name}</span>,
            description: (
              <span>
                {pkg.currentVersion} → {pkg.latestVersion}
              </span>
            ),
          }))

          return (
            <div key={projectId} className="mb-4 last:mb-0">
              <h3 className="text-sm font-medium mb-2">{projectId}</h3>
              <BadgeList items={badgeItems} onRemove={handleRemove} />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
