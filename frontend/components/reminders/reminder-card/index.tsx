"use client";

import { useState } from "react";
import { Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReminderStatus, CallAttempt } from "@/lib/types";
import { CallAttemptTimeline } from "../call-attempt-timeline";
import { ReminderCardHeader } from "./ReminderCardHeader";
import { ReminderCardBody } from "./ReminderCardBody";
import { ReminderCardFooter } from "./ReminderCardFooter";

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

export function ReminderCard({
  title,
  message,
  phoneNumber,
  scheduledFor,
  status,
  callAttempts = [],
  onEdit,
  onDelete,
}: ReminderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasAttempts = callAttempts && callAttempts.length > 0;

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
        <ReminderCardHeader title={title} status={status} />

        <ReminderCardBody
          scheduledFor={scheduledFor}
          phoneNumber={phoneNumber}
          message={message}
          status={status}
        />

        <ReminderCardFooter
          status={status}
          callAttempts={callAttempts}
          isExpanded={isExpanded}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
        />

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
