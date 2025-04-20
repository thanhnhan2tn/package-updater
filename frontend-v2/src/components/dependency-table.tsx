"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowUpDown, Filter, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { prioritizedPackages } from "@/data/config"
import { Dependency, SelectedPackage } from "@/types/dependency"

interface DependencyTableProps {
  dependencies: Dependency[]
  selectedPackages: SelectedPackage[]
  onToggleSelection: (pkg: any) => void
}

export function DependencyTable({ dependencies, selectedPackages, onToggleSelection }: DependencyTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "outdated" | "prioritized">("all")
  const [sortBy, setSortBy] = useState<"name" | "currentVersion" | "latestVersion" | "packageType">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (column: "name" | "currentVersion" | "latestVersion" | "packageType") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
  }

  const isPrioritized = (name: string) => prioritizedPackages.includes(name)

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

      // Then sort by the selected column
      let comparison = 0
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === "currentVersion") {
        comparison = a.currentVersion.localeCompare(b.currentVersion)
      } else if (sortBy === "latestVersion") {
        comparison = a.latestVersion.localeCompare(b.latestVersion)
      } else if (sortBy === "packageType") {
        comparison = a.type.localeCompare(b.type)
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

  const isSelected = (dep: Dependency) => {
    return selectedPackages.some(
      (p) => p.name === dep.name && p.project === dep.project && p.type === dep.type,
    )
  }

  if (dependencies.length === 0) {
    return <div className="text-gray-500 py-8 text-center">No dependencies found</div>
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search dependencies..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {filter === "all" ? "All Packages" : filter === "outdated" ? "Outdated Packages" : "Prioritized Packages"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilter("all")}>All Packages</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("outdated")}>Outdated Packages</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("prioritized")}>Prioritized Packages</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 p-0 h-auto font-semibold"
                  onClick={() => handleSort("name")}
                >
                  Package
                  {sortBy === "name" && (
                    <ArrowUpDown className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 p-0 h-auto font-semibold"
                  onClick={() => handleSort("currentVersion")}
                >
                  Current Version
                  {sortBy === "currentVersion" && (
                    <ArrowUpDown className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 p-0 h-auto font-semibold"
                  onClick={() => handleSort("latestVersion")}
                >
                  Latest Version
                  {sortBy === "latestVersion" && (
                    <ArrowUpDown className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 p-0 h-auto font-semibold"
                  onClick={() => handleSort("packageType")}
                >
                  Type
                  {sortBy === "packageType" && (
                    <ArrowUpDown className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDependencies.map((dep) => (
              <TableRow key={`${dep.project}-${dep.type}-${dep.name}`}>
                <TableCell>
                  <Checkbox checked={isSelected(dep)} onCheckedChange={() => onToggleSelection(dep)} />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-1.5">
                    {isPrioritized(dep.name) && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />}
                    {dep.name}
                  </div>
                </TableCell>
                <TableCell>{dep.currentVersion}</TableCell>
                <TableCell>
                  {dep.outdated ? (
                    <span className="text-green-600 font-medium">{dep.latestVersion}</span>
                  ) : (
                    <span>{dep.latestVersion}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={dep.type === "frontend" ? "default" : "secondary"}>{dep.type}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredDependencies.length} of {dependencies.length} dependencies
      </div>
    </div>
  )
}
