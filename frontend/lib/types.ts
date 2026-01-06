export type ReminderStatus = "scheduled" | "completed" | "failed";

export interface Reminder {
  id: string;
  title: string;
  message: string;
  phoneNumber: string;
  scheduledFor: Date;
  timezone: string;
  status: ReminderStatus;
  vapiCallId?: string;
  failureReason?: string;
  retryCount?: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  callAttempts?: CallAttempt[];
}

export interface ReminderFormData {
  title: string;
  message: string;
  phoneNumber: string;
  scheduledFor: Date;
  timezone: string;
}

export interface CallAttempt {
  id: string;
  attempt_number: number;
  status:
    | "initiated"
    | "ringing"
    | "answered"
    | "completed"
    | "failed"
    | "no_answer";
  vapi_call_id?: string;
  duration_seconds?: number;
  failure_reason?: string;
  initiated_at: string;
  completed_at?: string;
}
