"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Reminder } from "@/lib/types";
import type { ReminderFormValues } from "@/lib/validations/reminder-schema";
import {
  useCreateReminder,
  useUpdateReminder,
  useDeleteReminder,
} from "@/lib/api/hooks";

interface UseReminderActionsProps {
  reminders: Reminder[];
}

export function useReminderActions({ reminders }: UseReminderActionsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const createMutation = useCreateReminder();
  const updateMutation = useUpdateReminder();
  const deleteMutation = useDeleteReminder();

  const handleCreateReminder = async (data: ReminderFormValues) => {
    try {
      if (editingReminder) {
        await updateMutation.mutateAsync({
          id: editingReminder.id,
          data: {
            title: data.title,
            message: data.message,
            phone_number: data.phoneNumber,
            scheduled_for: data.scheduledFor.toISOString(),
            timezone: data.timezone,
          },
        });
        toast.success("Reminder updated successfully!");
        setEditingReminder(null);
      } else {
        await createMutation.mutateAsync({
          title: data.title,
          message: data.message,
          phone_number: data.phoneNumber,
          scheduled_for: data.scheduledFor.toISOString(),
          timezone: data.timezone,
        });
        toast.success("Reminder created successfully!");
      }
      handleCloseForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(
        editingReminder
          ? "Failed to update reminder"
          : "Failed to create reminder",
        {
          description: message,
        },
      );
    }
  };

  const handleEditReminder = (id: string) => {
    const reminder = reminders.find((r) => r.id === id);
    if (reminder) {
      setEditingReminder(reminder);
      setIsFormOpen(true);
    }
  };

  const handleOpenForm = () => {
    setEditingReminder(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingReminder(null);
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Reminder deleted successfully!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to delete reminder", {
        description: message,
      });
    }
  };

  const handleRetryReminder = async (id: string) => {
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;

    try {
      const newScheduledTime = new Date(Date.now() + 5 * 60 * 1000);

      await updateMutation.mutateAsync({
        id,
        data: {
          scheduled_for: newScheduledTime.toISOString(),
        },
      });
      toast.success("Reminder rescheduled for 5 minutes from now!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to reschedule reminder", {
        description: message,
      });
    }
  };

  return {
    isFormOpen,
    editingReminder,
    handleCreateReminder,
    handleEditReminder,
    handleOpenForm,
    handleCloseForm,
    handleDeleteReminder,
    handleRetryReminder,
  };
}
