"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/layout/page-header";
import { ReminderFilters } from "@/components/reminders/reminder-filters";
import { SortToggle } from "@/components/reminders/sort-toggle";
import { ReminderCard } from "@/components/reminders/reminder-card";
import { ReminderEmpty } from "@/components/reminders/reminder-empty";
import { ReminderError } from "@/components/reminders/reminder-error";
import { ReminderNoResults } from "@/components/reminders/reminder-no-results";
import { ReminderListSkeleton } from "@/components/reminders/reminder-skeleton";
import { ReminderForm } from "@/components/reminders/reminder-form";
import { toast } from "sonner";
import type { Reminder } from "@/lib/types";
import type { ReminderFormValues } from "@/lib/validations/reminder-schema";
import {
  useReminders,
  useCreateReminder,
  useUpdateReminder,
  useDeleteReminder,
} from "@/lib/api/hooks";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "scheduled" | "completed" | "failed"
  >("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const statusFilter = activeTab === "all" ? undefined : activeTab;
  const {
    data: reminders = [],
    isLoading,
    error,
    refetch,
  } = useReminders({ status: statusFilter });

  const createMutation = useCreateReminder();
  const updateMutation = useUpdateReminder();
  const deleteMutation = useDeleteReminder();

  const filteredReminders = useMemo(() => {
    let filtered = reminders;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (reminder) =>
          reminder.title.toLowerCase().includes(query) ||
          reminder.message.toLowerCase().includes(query),
      );
    }

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.scheduledFor).getTime();
      const dateB = new Date(b.scheduledFor).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [reminders, searchQuery, sortOrder]);

  const counts = useMemo(() => {
    return {
      all: reminders.length,
      scheduled: reminders.filter((r) => r.status === "scheduled").length,
      completed: reminders.filter((r) => r.status === "completed").length,
      failed: reminders.filter((r) => r.status === "failed").length,
    };
  }, [reminders]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header onNewReminderClick={handleOpenForm} />
        <main className="container mx-auto py-8 px-4">
          <ReminderError
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => refetch()}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onNewReminderClick={handleOpenForm} />

      <main className="container mx-auto py-8 px-4">
        <PageHeader
          title="Reminders"
          description="Manage your phone call reminders"
          className="mb-8"
        />

        <div className="mb-6 space-y-4">
          <ReminderFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts}
          />

          <div className="flex justify-end">
            <SortToggle
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
            />
          </div>
        </div>

        {isLoading ? (
          <ReminderListSkeleton />
        ) : filteredReminders.length === 0 ? (
          reminders.length === 0 ? (
            <ReminderEmpty onCreateClick={handleOpenForm} />
          ) : (
            <ReminderNoResults
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery("")}
            />
          )
        ) : (
          <div className="space-y-4">
            {filteredReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                {...reminder}
                onEdit={() => handleEditReminder(reminder.id)}
                onDelete={() => handleDeleteReminder(reminder.id)}
                onRetry={() => handleRetryReminder(reminder.id)}
              />
            ))}
          </div>
        )}
      </main>

      <ReminderForm
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        onSubmit={handleCreateReminder}
        defaultValues={
          editingReminder
            ? {
                title: editingReminder.title,
                message: editingReminder.message,
                phoneNumber: editingReminder.phoneNumber,
                scheduledFor: editingReminder.scheduledFor,
                timezone: editingReminder.timezone,
              }
            : undefined
        }
        isEditing={!!editingReminder}
      />
    </div>
  );
}
