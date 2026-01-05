"use client"

import { Phone, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

interface HeaderProps {
  onNewReminderClick?: () => void
}

export function Header({ onNewReminderClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-base sm:text-xl font-bold text-foreground">
            Call Me Reminder
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button size="sm" className="sm:size-default" onClick={onNewReminderClick}>
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">New Reminder</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
