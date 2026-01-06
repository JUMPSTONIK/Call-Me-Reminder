import { Clock } from "lucide-react";
import type { ReminderStatus } from "@/lib/types";

export const statusConfig: Record<
  ReminderStatus,
  {
    label: string;
    icon: typeof Clock;
    variant: "scheduled" | "completed" | "failed";
  }
> = {
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
