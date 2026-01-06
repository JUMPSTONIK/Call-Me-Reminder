import type { Reminder } from "@/lib/types";

/**
 * Filters reminders by search query
 * @param reminders - Array of reminders to filter
 * @param query - Search query string
 * @returns Filtered reminders
 */
export function filterRemindersBySearch(
  reminders: Reminder[],
  query: string,
): Reminder[] {
  if (!query.trim()) return reminders;

  const normalizedQuery = query.toLowerCase();
  return reminders.filter(
    (reminder) =>
      reminder.title.toLowerCase().includes(normalizedQuery) ||
      reminder.message.toLowerCase().includes(normalizedQuery),
  );
}

/**
 * Sorts reminders by scheduled date
 * @param reminders - Array of reminders to sort
 * @param order - Sort order ('asc' or 'desc')
 * @returns Sorted reminders
 */
export function sortRemindersByDate(
  reminders: Reminder[],
  order: "asc" | "desc" = "desc",
): Reminder[] {
  return [...reminders].sort((a, b) => {
    const dateA = new Date(a.scheduledFor).getTime();
    const dateB = new Date(b.scheduledFor).getTime();
    return order === "asc" ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Calculates counts of reminders by status
 * @param reminders - Array of reminders
 * @returns Object with counts for each status
 */
export function calculateReminderCounts(reminders: Reminder[]): {
  all: number;
  scheduled: number;
  completed: number;
  failed: number;
} {
  return {
    all: reminders.length,
    scheduled: reminders.filter((r) => r.status === "scheduled").length,
    completed: reminders.filter((r) => r.status === "completed").length,
    failed: reminders.filter((r) => r.status === "failed").length,
  };
}

/**
 * Creates a date for rescheduling a reminder
 * @param minutesFromNow - Number of minutes from now
 * @returns New Date object
 */
export function createRescheduleDate(minutesFromNow: number = 5): Date {
  return new Date(Date.now() + minutesFromNow * 60 * 1000);
}
