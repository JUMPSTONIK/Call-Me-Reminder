"use client";

import { Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReminderStatus } from "@/lib/types";
import { statusConfig } from "@/lib/constants/reminder-status";

interface ReminderCardHeaderProps {
  title: string;
  status: ReminderStatus;
}

export function ReminderCardHeader({
  title,
  status,
}: ReminderCardHeaderProps) {
  const config = statusConfig[status];

  return (
    <div className="flex flex-col-reverse items-start md:flex-row md:items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-3 w-full md:flex-1 min-w-0 overflow-hidden">
        <div
          className={cn(
            "mt-1 p-2 rounded-lg shrink-0",
            "bg-primary/10 dark:bg-primary/20",
          )}
        >
          <Phone className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          <h3 className="text-base sm:text-lg font-semibold text-card-foreground truncate">
            {title}
          </h3>
        </div>
      </div>

      <Badge variant={config.variant} className="inline-flex items-center gap-1.5">
        <config.icon className="h-3 w-3" />
        {config.label}
      </Badge>
    </div>
  );
}
