import { Badge } from "@/components/ui/badge";
import {
  Phone,
  PhoneIncoming,
  PhoneOff,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { CallAttempt } from "@/lib/types";

interface CallAttemptBadgeProps {
  status: CallAttempt["status"];
  size?: "sm" | "md";
}

const statusConfig = {
  initiated: {
    label: "Initiated",
    variant: "secondary" as const,
    icon: Clock,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  ringing: {
    label: "Ringing",
    variant: "secondary" as const,
    icon: PhoneIncoming,
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  },
  answered: {
    label: "Answered",
    variant: "secondary" as const,
    icon: Phone,
    className:
      "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  },
  completed: {
    label: "Completed",
    variant: "default" as const,
    icon: CheckCircle2,
    className:
      "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  },
  failed: {
    label: "Failed",
    variant: "destructive" as const,
    icon: XCircle,
    className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
  no_answer: {
    label: "No Answer",
    variant: "secondary" as const,
    icon: PhoneOff,
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
};

export function CallAttemptBadge({
  status,
  size = "md",
}: CallAttemptBadgeProps) {
  const config = statusConfig[status] || statusConfig.initiated;
  const Icon = config.icon;

  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${textSize} gap-1.5`}
    >
      <Icon className={iconSize} />
      {config.label}
    </Badge>
  );
}
