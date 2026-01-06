"use client";

import { Phone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  onNewReminderClick?: () => void;
}

export function Header({ onNewReminderClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 transition-all duration-300">
      <div className="container mx-auto px-4 flex h-14 sm:h-16 items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="rounded-lg bg-primary/10 p-2 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
            <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <h1 className="text-sm sm:text-xl font-bold text-foreground transition-colors duration-200">
            Call Me Reminder
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button
            size="sm"
            className="sm:size-default transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={onNewReminderClick}
          >
            <Plus className="h-4 w-4 sm:mr-2 transition-transform duration-200 group-hover:rotate-90" />
            <span className="hidden sm:inline">New Reminder</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
