"use client";

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
import { useReminders } from "@/lib/api/hooks";
import { useReminderFilters } from "@/hooks/useReminderFilters";
import { useReminderActions } from "@/hooks/useReminderActions";
import { useState } from "react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<
    "all" | "scheduled" | "completed" | "failed"
  >("all");

  const statusFilter = activeTab === "all" ? undefined : activeTab;
  const {
    data: reminders = [],
    isLoading,
    error,
    refetch,
  } = useReminders({ status: statusFilter });

  const {
    searchQuery,
    sortOrder,
    filteredReminders,
    counts,
    setSearchQuery,
    setSortOrder,
  } = useReminderFilters({
    reminders,
  });

  const {
    isFormOpen,
    editingReminder,
    handleCreateReminder,
    handleEditReminder,
    handleOpenForm,
    handleCloseForm,
    handleDeleteReminder,
    handleRetryReminder,
  } = useReminderActions({ reminders });

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
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
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
