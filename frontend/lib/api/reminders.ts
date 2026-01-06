import { apiClient } from "./client";
import type { Reminder } from "../types";

export interface ReminderCreateInput {
  title: string;
  message: string;
  phone_number: string;
  scheduled_for: string; // ISO 8601 format
  timezone: string;
}

export interface ReminderUpdateInput {
  title?: string;
  message?: string;
  phone_number?: string;
  scheduled_for?: string;
  timezone?: string;
}

export interface RemindersFilters {
  status?: "scheduled" | "completed" | "failed";
  search?: string;
}

const transformReminder = (apiReminder: any): Reminder => ({
  id: apiReminder.id,
  title: apiReminder.title,
  message: apiReminder.message,
  phoneNumber: apiReminder.phone_number,
  scheduledFor: new Date(apiReminder.scheduled_for),
  timezone: apiReminder.timezone,
  status: apiReminder.status,
  vapiCallId: apiReminder.vapi_call_id,
  failureReason: apiReminder.failure_reason,
  retryCount: apiReminder.retry_count,
  createdAt: new Date(apiReminder.created_at),
  updatedAt: new Date(apiReminder.updated_at),
  completedAt: apiReminder.completed_at
    ? new Date(apiReminder.completed_at)
    : undefined,
  callAttempts: apiReminder.call_attempts || [],
});

const transformToApiFormat = (
  data: ReminderCreateInput | ReminderUpdateInput,
): any => {
  const result: any = {};

  if ("title" in data && data.title !== undefined) result.title = data.title;
  if ("message" in data && data.message !== undefined)
    result.message = data.message;
  if ("phone_number" in data && data.phone_number !== undefined)
    result.phone_number = data.phone_number;
  if ("scheduled_for" in data && data.scheduled_for !== undefined)
    result.scheduled_for = data.scheduled_for;
  if ("timezone" in data && data.timezone !== undefined)
    result.timezone = data.timezone;

  return result;
};

export const getReminders = async (
  filters?: RemindersFilters,
): Promise<Reminder[]> => {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.append("status", filters.status);
  }

  const url = `/api/reminders/${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await apiClient.get(url);

  const remindersData = response.data.reminders || response.data;
  return remindersData.map(transformReminder);
};

export const getReminder = async (id: string): Promise<Reminder> => {
  const response = await apiClient.get(`/api/reminders/${id}`);
  return transformReminder(response.data);
};

export const createReminder = async (
  data: ReminderCreateInput,
): Promise<Reminder> => {
  const apiData = transformToApiFormat(data);
  const response = await apiClient.post("/api/reminders/", apiData);
  return transformReminder(response.data);
};

export const updateReminder = async (
  id: string,
  data: ReminderUpdateInput,
): Promise<Reminder> => {
  const apiData = transformToApiFormat(data);
  const response = await apiClient.put(`/api/reminders/${id}`, apiData);
  return transformReminder(response.data);
};

export const deleteReminder = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/reminders/${id}`);
};
