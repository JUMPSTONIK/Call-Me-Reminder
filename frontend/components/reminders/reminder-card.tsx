"use client"

import { Phone, Clock, Edit2, Trash2, Timer } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ReminderStatus } from "@/lib/types"

interface ReminderCardProps {
  id: string
  title: string
  message: string
  phoneNumber: string
  scheduledFor: Date
  status: ReminderStatus
  onEdit?: () => void
  onDelete?: () => void
  onRetry?: () => void
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
}

export function ReminderCard({
  id,
  title,
  message,
  phoneNumber,
  scheduledFor,
  status,
  onEdit,
  onDelete,
  onRetry,
}: ReminderCardProps) {
  const config = statusConfig[status]
  const timeRemaining = formatDistanceToNow(scheduledFor, { addSuffix: true })

  // Mask phone number (show only last 4 digits)
  const maskedPhone = phoneNumber.replace(/(\+\d{1,3})\s*(\d{3})\s*(\d{3})\s*(\d{4})/, "$1 ($2) $3-****")

  return (
    <Card className={cn(
      "group transition-all duration-200",
      "hover:shadow-lg hover:shadow-primary/5",
      "hover:border-primary/50",
      status === "failed" && "border-destructive/50"
    )}>
      <CardContent className="p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col-reverse items-start md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Icon */}
            <div className={cn(
              "mt-1 p-2 rounded-lg",
              "bg-primary/10 dark:bg-primary/20"
            )}>
              <Phone className="h-5 w-5 text-primary" />
            </div>

            {/* Title */}
            <h3 className="text-base sm:text-lg font-semibold text-card-foreground truncate">
              {title}
            </h3>
          </div>

          {/* Status Badge */}
          <Badge variant={config.variant} className="inline-flex items-center gap-1.5">
            <config.icon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>

        {/* Details */}
        <div className="space-y-2">
          {/* Date & Phone */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{scheduledFor.toLocaleString()}</span>
            </div>
            <span className="hidden sm:inline text-border">·</span>
            <span>{maskedPhone}</span>
          </div>

          {/* Countdown */}
          {status === "scheduled" && (
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Timer className="h-4 w-4" />
              <span className="font-mono tabular-nums">{timeRemaining}</span>
            </div>
          )}

          {/* Completion time */}
          {status === "completed" && (
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
              <Clock className="h-4 w-4" />
              <span>Completed {timeRemaining}</span>
            </div>
          )}
        </div>

        {/* Message Preview */}
        <div className={cn(
          " rounded-lg p-4",
          status === "failed"
            ? "bg-destructive/10 border border-destructive/20 dark:bg-destructive/20 dark:border-destructive/30"
            : "bg-muted"
        )}>
          <p className={cn(
            "text-sm line-clamp-2",
            status === "failed"
              ? "text-destructive dark:text-red-300"
              : "text-muted-foreground"
          )}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {status === "failed" && onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              <Timer className="h-4 w-4 mr-1.5" />
              Retry
            </Button>
          )}

          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
            >
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
        </div>
      </CardContent>
    </Card>
  )
}
