"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BadgeItem {
  id: string
  label: React.ReactNode
  description?: React.ReactNode
}

interface BadgeListProps {
  items: BadgeItem[]
  onRemove?: (id: string) => void
  maxHeight?: string
}

export function BadgeList({ items, onRemove, maxHeight }: BadgeListProps) {
  const content = (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item.id} variant="secondary" className="flex items-center gap-1 py-1.5 px-3">
          {item.label}
          {item.description && <span className="text-gray-500 text-xs">{item.description}</span>}
          {onRemove && (
            <button onClick={() => onRemove(item.id)} className="ml-1 text-gray-500 hover:text-gray-700">
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
    </div>
  )

  if (maxHeight) {
    return <ScrollArea className={`max-h-${maxHeight}`}>{content}</ScrollArea>
  }

  return content
}
