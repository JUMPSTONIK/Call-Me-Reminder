import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getReminders,
  getReminder,
  createReminder,
  updateReminder,
  deleteReminder,
  type ReminderCreateInput,
  type ReminderUpdateInput,
  type RemindersFilters,
} from "./reminders";
import type { Reminder } from "../types";

export const reminderKeys = {
  all: ["reminders"] as const,
  lists: () => [...reminderKeys.all, "list"] as const,
  list: (filters?: RemindersFilters) =>
    [...reminderKeys.lists(), filters] as const,
  details: () => [...reminderKeys.all, "detail"] as const,
  detail: (id: string) => [...reminderKeys.details(), id] as const,
};

export function useReminders(filters?: RemindersFilters) {
  return useQuery({
    queryKey: reminderKeys.list(filters),
    queryFn: () => getReminders(filters),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useReminder(id: string) {
  return useQuery({
    queryKey: reminderKeys.detail(id),
    queryFn: () => getReminder(id),
    enabled: !!id,
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReminderCreateInput) => createReminder(data),
    onMutate: async (newReminder) => {
      await queryClient.cancelQueries({ queryKey: reminderKeys.lists() });

      const previousReminders = queryClient.getQueryData(reminderKeys.lists());

      queryClient.setQueryData<Reminder[]>(reminderKeys.lists(), (old) => {
        if (!old) return old;

        const optimisticReminder: Reminder = {
          id: `temp-${Date.now()}`,
          title: newReminder.title,
          message: newReminder.message,
          phoneNumber: newReminder.phone_number,
          scheduledFor: new Date(newReminder.scheduled_for),
          timezone: newReminder.timezone,
          status: "scheduled",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return [optimisticReminder, ...old];
      });

      return { previousReminders };
    },
    onError: (err, newReminder, context) => {
      if (context?.previousReminders) {
        queryClient.setQueryData(
          reminderKeys.lists(),
          context.previousReminders,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReminderUpdateInput }) =>
      updateReminder(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: reminderKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: reminderKeys.lists() });

      const previousReminder = queryClient.getQueryData(
        reminderKeys.detail(id),
      );
      const previousReminders = queryClient.getQueryData(reminderKeys.lists());

      queryClient.setQueryData<Reminder>(reminderKeys.detail(id), (old) => {
        if (!old) return old;
        return {
          ...old,
          ...data,
          scheduledFor: data.scheduled_for
            ? new Date(data.scheduled_for)
            : old.scheduledFor,
          updatedAt: new Date(),
        };
      });

      queryClient.setQueryData<Reminder[]>(reminderKeys.lists(), (old) => {
        if (!old) return old;
        return old.map((reminder) =>
          reminder.id === id
            ? {
                ...reminder,
                ...data,
                scheduledFor: data.scheduled_for
                  ? new Date(data.scheduled_for)
                  : reminder.scheduledFor,
                updatedAt: new Date(),
              }
            : reminder,
        );
      });

      return { previousReminder, previousReminders };
    },
    onError: (err, { id }, context) => {
      if (context?.previousReminder) {
        queryClient.setQueryData(
          reminderKeys.detail(id),
          context.previousReminder,
        );
      }
      if (context?.previousReminders) {
        queryClient.setQueryData(
          reminderKeys.lists(),
          context.previousReminders,
        );
      }
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReminder(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: reminderKeys.lists() });

      const previousReminders = queryClient.getQueryData(reminderKeys.lists());

      queryClient.setQueryData<Reminder[]>(reminderKeys.lists(), (old) => {
        if (!old) return old;
        return old.filter((reminder) => reminder.id !== id);
      });

      return { previousReminders };
    },
    onError: (err, id, context) => {
      if (context?.previousReminders) {
        queryClient.setQueryData(
          reminderKeys.lists(),
          context.previousReminders,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
    },
  });
}
