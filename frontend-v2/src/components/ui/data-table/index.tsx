"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

interface DataTableColumn<T> {
  key: string
  title: string
  sortable?: boolean
  render: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  keyExtractor: (item: T) => string
  emptyState?: React.ReactNode
  footer?: React.ReactNode
}

export function DataTable<T>({ data, columns, keyExtractor, emptyState, footer }: DataTableProps<T>) {
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(key)
      setSortDirection("asc")
    }
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>
                {column.sortable ? (
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1 p-0 h-auto font-semibold"
                    onClick={() => handleSort(column.key)}
                  >
                    {column.title}
                    {sortBy === column.key && (
                      <ArrowUpDown className={`h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                    )}
                  </Button>
                ) : (
                  column.title
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={keyExtractor(item)}>
              {columns.map((column) => (
                <TableCell key={`${keyExtractor(item)}-${column.key}`}>{column.render(item)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {footer && <div className="p-4 border-t">{footer}</div>}
    </div>
  )
}
