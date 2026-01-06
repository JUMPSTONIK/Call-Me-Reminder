"use client";

import { Clock, Timer } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { ReminderStatus } from "@/lib/types";

interface ReminderCardBodyProps {
  scheduledFor: Date;
  phoneNumber: string;
  message: string;
  status: ReminderStatus;
}

export function ReminderCardBody({
  scheduledFor,
  phoneNumber,
  message,
  status,
}: ReminderCardBodyProps) {
  const timeRemaining = formatDistanceToNow(scheduledFor, { addSuffix: true });
  const maskedPhone = phoneNumber.replace(
    /(\+\d{1,3})\s*(\d{3})\s*(\d{3})\s*(\d{4})/,
    "$1 ($2) $3-****",
  );

  return (
    <>
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{scheduledFor.toLocaleString()}</span>
          </div>
          <span className="hidden sm:inline text-border">·</span>
          <span>{maskedPhone}</span>
        </div>

        {status === "scheduled" && (
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Timer className="h-4 w-4" />
            <span className="font-mono tabular-nums">{timeRemaining}</span>
          </div>
        )}

        {status === "completed" && (
          <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
            <Clock className="h-4 w-4" />
            <span>Completed {timeRemaining}</span>
          </div>
        )}
      </div>

      <div
        className={cn(
          " rounded-lg p-4",
          status === "failed"
            ? "bg-destructive/10 border border-destructive/20 dark:bg-destructive/20 dark:border-destructive/30"
            : "bg-muted",
        )}
      >
        <p
          className={cn(
            "text-sm line-clamp-2",
            status === "failed"
              ? "text-destructive dark:text-red-300"
              : "text-muted-foreground",
          )}
        >
          {message}
        </p>
      </div>
    </>
  );
}
