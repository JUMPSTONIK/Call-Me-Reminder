"use client";

import { useState } from "react";
import {
  Phone,
  Clock,
  Edit2,
  Trash2,
  Timer,
  ChevronDown,
  ChevronUp,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ReminderStatus, CallAttempt } from "@/lib/types";
import { CallAttemptTimeline } from "./call-attempt-timeline";

interface ReminderCardProps {
  id: string;
  title: string;
  message: string;
  phoneNumber: string;
  scheduledFor: Date;
  status: ReminderStatus;
  callAttempts?: CallAttempt[];
  onEdit?: () => void;
  onDelete?: () => void;
  onRetry?: () => void;
}

const statusConfig = {
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    variant: "scheduled" as const,
  },
  completed: {
    label: "Completed",
    icon: Clock,
    variant: "completed" as const,
  },
  failed: {
    label: "Failed",
    icon: Clock,
    variant: "failed" as const,
  },
};

export function ReminderCard({
  id,
  title,
  message,
  phoneNumber,
  scheduledFor,
  status,
  callAttempts = [],
  onEdit,
  onDelete,
  onRetry,
}: ReminderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = statusConfig[status];
  const timeRemaining = formatDistanceToNow(scheduledFor, { addSuffix: true });
  const hasAttempts = callAttempts && callAttempts.length > 0;

  const maskedPhone = phoneNumber.replace(
    /(\+\d{1,3})\s*(\d{3})\s*(\d{3})\s*(\d{4})/,
    "$1 ($2) $3-****",
  );

  return (
    <Card
      className={cn(
        "group transition-all duration-300 ease-in-out",
        "hover:shadow-lg hover:shadow-primary/10",
        "hover:border-primary/50",
        "hover:scale-[1.01]",
        status === "failed" && "border-destructive/50",
        "animate-in fade-in-50 slide-in-from-bottom-4 duration-500",
      )}
    >
      <CardContent className="p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
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

          <Badge
            variant={config.variant}
            className="inline-flex items-center gap-1.5"
          >
            <config.icon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>

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

        <div className="flex flex-wrap items-center gap-2">
          {status === "scheduled" && onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit2 className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          )}

          {hasAttempts && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-auto text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <Activity className="h-4 w-4 mr-1.5 transition-transform duration-200 group-hover:rotate-12" />
              <span className="hidden sm:inline">Activity</span>
              <span className="sm:hidden">Calls</span>
              <span className="ml-1">({callAttempts.length})</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 ml-1.5 transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-1.5 transition-transform duration-200" />
              )}
            </Button>
          )}
        </div>

        {hasAttempts && isExpanded && (
          <div className="border-t pt-4 mt-2 animate-in slide-in-from-top-2 fade-in-50 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">Call History</h4>
            </div>
            <CallAttemptTimeline attempts={callAttempts} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
