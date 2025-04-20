"use client"

import type { SelectedPackage } from "@/types/dependency"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { BadgeList } from "@/components/ui/badge-list"

interface SelectedPackagesPanelProps {
  packages: SelectedPackage[]
  onRemove: (pkg: SelectedPackage) => void
  onUpgrade: () => void
  onCheckAll: () => void
  upgrading: boolean
}

export function SelectedPackagesPanel({ packages, onRemove, onUpgrade, onCheckAll, upgrading }: SelectedPackagesPanelProps) {
  if (packages.length === 0) {
    return null
  }

  const hasMajor = packages.some(pkg => pkg.majorUpgrade)

  const badgeItems = packages.map((pkg) => ({
    id: `${pkg.project}-${pkg.type}-${pkg.name}`,
    label: <span className="font-medium">{pkg.name}</span>,
    description: (
      <span>
        {pkg.currentVersion} → {pkg.latestVersion}
      </span>
    ),
  }))

  const handleRemove = (id: string) => {
    const [projectId, type, name] = id.split("-")
    const pkg = packages.find((p) => p.project === projectId && p.type === type && p.name === name)
    if (pkg) {
      onRemove(pkg)
    }
  }

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Selected Packages ({packages.length})</h3>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onCheckAll} disabled={upgrading} className="flex items-center gap-1">
              Check Updates
            </Button>
            <Button size="sm" onClick={onUpgrade} disabled={upgrading || hasMajor} className="flex items-center gap-1">
              <ArrowUp className="h-3.5 w-3.5" />
              Apply Fix
            </Button>
          </div>
        </div>
        <BadgeList items={badgeItems} onRemove={handleRemove} maxHeight="24" />
        {packages.some(p => p.latestVersion === p.currentVersion) && (
          <p className="text-gray-600 text-xs mt-1">Click “Check Updates” to fetch latest versions</p>
        )}
        {hasMajor && (
          <p className="text-yellow-700 text-xs mt-1">Major version bump detected, please upgrade these manually.</p>
        )}
      </CardContent>
    </Card>
  )
}
