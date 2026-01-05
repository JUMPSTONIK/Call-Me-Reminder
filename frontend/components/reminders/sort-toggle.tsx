"use client"

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SortToggleProps {
  sortOrder: "asc" | "desc"
  onSortOrderChange: (order: "asc" | "desc") => void
  className?: string
}

export function SortToggle({
  sortOrder,
  onSortOrderChange,
  className,
}: SortToggleProps) {
  const toggleSort = () => {
    onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground hidden sm:inline">
        Sort:
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleSort}
        className="gap-2"
      >
        {sortOrder === "asc" ? (
          <>
            <ArrowUp className="h-4 w-4" />
            <span className="hidden sm:inline">Oldest First</span>
            <span className="sm:hidden">Oldest</span>
          </>
        ) : (
          <>
            <ArrowDown className="h-4 w-4" />
            <span className="hidden sm:inline">Newest First</span>
            <span className="sm:hidden">Newest</span>
          </>
        )}
      </Button>
    </div>
  )
}
