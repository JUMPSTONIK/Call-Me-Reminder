import { formatDistanceToNow } from "date-fns";
import { Clock, AlertCircle, Phone } from "lucide-react";
import { CallAttemptBadge } from "./call-attempt-badge";
import type { CallAttempt } from "@/lib/types";

interface CallAttemptTimelineProps {
  attempts: CallAttempt[];
}

export function CallAttemptTimeline({ attempts }: CallAttemptTimelineProps) {
  if (!attempts || attempts.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        No call attempts yet
      </div>
    );
  }

  const sortedAttempts = [...attempts].sort(
    (a, b) => b.attempt_number - a.attempt_number,
  );

  return (
    <div className="space-y-4">
      {sortedAttempts.map((attempt, index) => {
        const isLast = index === sortedAttempts.length - 1;
        const initiatedAt = new Date(attempt.initiated_at);
        const completedAt = attempt.completed_at
          ? new Date(attempt.completed_at)
          : null;

        return (
          <div key={attempt.id} className="relative">
            {!isLast && (
              <div className="absolute left-2.75 top-8 bottom-0 w-0.5 bg-border" />
            )}

            <div className="flex items-start gap-4">
              <div className="relative flex items-center justify-center">
                <div className="h-6 w-6 rounded-full border-2 border-border bg-background flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
              </div>

              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Attempt #{attempt.attempt_number}
                    </span>
                    <CallAttemptBadge status={attempt.status} size="sm" />
                  </div>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(initiatedAt, { addSuffix: true })}
                  </time>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Started: {initiatedAt.toLocaleString()}</span>
                  </div>

                  {attempt.duration_seconds !== undefined &&
                    attempt.duration_seconds > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <span>
                          Duration: {formatDuration(attempt.duration_seconds)}
                        </span>
                      </div>
                    )}

                  {completedAt && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Ended: {completedAt.toLocaleString()}</span>
                    </div>
                  )}

                  {attempt.failure_reason && (
                    <div className="flex items-start gap-2 text-destructive mt-2 p-2 rounded-md bg-destructive/10">
                      <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span className="text-xs">{attempt.failure_reason}</span>
                    </div>
                  )}

                  {attempt.vapi_call_id && (
                    <div className="text-xs text-muted-foreground font-mono mt-2">
                      Call ID: {attempt.vapi_call_id.slice(0, 20)}...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
