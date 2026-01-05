export type ReminderStatus = "scheduled" | "completed" | "failed"

export interface Reminder {
  id: string
  title: string
  message: string
  phoneNumber: string
  scheduledFor: Date
  timezone: string
  status: ReminderStatus
  createdAt: Date
  updatedAt: Date
}

export interface ReminderFormData {
  title: string
  message: string
  phoneNumber: string
  scheduledFor: Date
  timezone: string
}

export interface CallAttempt {
  id: string
  reminderId: string
  attemptedAt: Date
  status: "initiated" | "ringing" | "answered" | "failed" | "no_answer"
  duration?: number
  errorMessage?: string
}
