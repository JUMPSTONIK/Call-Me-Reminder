"use client";

import { SearchX, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReminderNoResultsProps {
  searchQuery: string;
  onClearSearch: () => void;
}

export function ReminderNoResults({
  searchQuery,
  onClearSearch,
}: ReminderNoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
      <div className="relative mb-6 animate-in zoom-in-50 duration-500 delay-150">
        <div className="absolute inset-0 bg-amber-500/20 dark:bg-amber-500/30 rounded-full blur-3xl animate-pulse" />

        <div className="relative rounded-full bg-linear-to-br from-amber-500/10 to-amber-500/20 dark:from-amber-500/20 dark:to-amber-500/30 p-8 transition-transform duration-300 hover:scale-110">
          <SearchX className="h-16 w-16 text-amber-600 dark:text-amber-500 transition-transform duration-500 hover:rotate-12" />
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 animate-in fade-in-50 slide-in-from-bottom-2 duration-500 delay-300">
        No results found
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground text-center max-w-md mb-2 animate-in fade-in-50 slide-in-from-bottom-2 duration-500 delay-400">
        We couldn't find any reminders matching
      </p>
      <div className="flex items-center gap-2 mb-8 animate-in fade-in-50 slide-in-from-bottom-2 duration-500 delay-500">
        <code className="text-sm font-mono bg-muted px-3 py-1 rounded-md border text-foreground">
          "{searchQuery}"
        </code>
      </div>

      <Button
        variant="outline"
        size="lg"
        onClick={onClearSearch}
        className="shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 animate-in fade-in-50 zoom-in-50 duration-500 delay-700"
      >
        <X className="h-5 w-5 mr-2" />
        Clear Search
      </Button>

      <div className="mt-12 max-w-md w-full animate-in fade-in-50 slide-in-from-bottom-2 duration-500 delay-1000">
        <div className="rounded-lg border border-border bg-card p-6">
          <h4 className="text-sm font-semibold mb-3 text-foreground">
            Search tips:
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Try using different keywords</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Check for spelling mistakes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Use fewer or more general terms</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
