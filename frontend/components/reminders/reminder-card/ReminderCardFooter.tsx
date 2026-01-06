"use client";

import {
  Edit2,
  Trash2,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReminderStatus, CallAttempt } from "@/lib/types";

interface ReminderCardFooterProps {
  status: ReminderStatus;
  callAttempts?: CallAttempt[];
  isExpanded: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleExpand: () => void;
}

export function ReminderCardFooter({
  status,
  callAttempts = [],
  isExpanded,
  onEdit,
  onDelete,
  onToggleExpand,
}: ReminderCardFooterProps) {
  const hasAttempts = callAttempts && callAttempts.length > 0;

  return (
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
          onClick={onToggleExpand}
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
  );
}
