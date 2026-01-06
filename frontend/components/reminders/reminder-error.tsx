"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReminderErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function ReminderError({ message, onRetry }: ReminderErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
      <div className="relative mb-6 animate-in zoom-in-50 duration-500 delay-150">
        <div className="absolute inset-0 bg-destructive/20 dark:bg-destructive/30 rounded-full blur-3xl animate-pulse" />

        <div className="relative rounded-full bg-linear-to-br from-destructive/10 to-destructive/20 dark:from-destructive/20 dark:to-destructive/30 p-8 transition-transform duration-300 hover:scale-110">
          <AlertCircle className="h-16 w-16 text-destructive transition-transform duration-500 hover:rotate-12" />
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 animate-in fade-in-50 slide-in-from-bottom-2 duration-500 delay-300">
        Something went wrong
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground text-center max-w-md mb-2 animate-in fade-in-50 slide-in-from-bottom-2 duration-500 delay-400">
        We couldn't load your reminders. This might be a temporary issue.
      </p>

      {message && (
        <p className="text-xs text-destructive/80 text-center max-w-md mb-8 animate-in fade-in-50 slide-in-from-bottom-2 duration-500 delay-500">
          {message}
        </p>
      )}

      {onRetry && (
        <Button
          variant="outline"
          size="lg"
          onClick={onRetry}
          className="shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 animate-in fade-in-50 zoom-in-50 duration-500 delay-700"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Try Again
        </Button>
      )}

      <div className="mt-12 max-w-md w-full animate-in fade-in-50 slide-in-from-bottom-2 duration-500 delay-1000">
        <div className="rounded-lg border border-border bg-card p-6">
          <h4 className="text-sm font-semibold mb-3 text-foreground">
            Common issues:
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Check your internet connection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>The backend server might be down</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Try refreshing the page</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
