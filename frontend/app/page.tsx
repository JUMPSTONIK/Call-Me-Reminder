"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Header } from "@/components/layout/header"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { ReminderFilters } from "@/components/reminders/reminder-filters"
import { ReminderCard } from "@/components/reminders/reminder-card"
import { ReminderEmpty } from "@/components/reminders/reminder-empty"
import { ReminderListSkeleton } from "@/components/reminders/reminder-skeleton"
import { ReminderForm } from "@/components/reminders/reminder-form"
import { toast } from "sonner"
import type { Reminder } from "@/lib/types"
import type { ReminderFormValues } from "@/lib/validations/reminder-schema"

// Mock data for demonstration
const mockReminders: Reminder[] = [
  {
    id: "1",
    title: "Call Mom on her birthday",
    message: "Hey Mom! Just wanted to remind you that today is your special day. Happy birthday! 🎉",
    phoneNumber: "+15551234567",
    scheduledFor: new Date(Date.now() + 14 * 60 * 60 * 1000), // 14 hours from now
    timezone: "America/New_York",
    status: "scheduled",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Take medication reminder",
    message: "Don't forget to take your daily medication. Your health is important!",
    phoneNumber: "+15559876543",
    scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    timezone: "America/Los_Angeles",
    status: "scheduled",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    title: "Meeting with client",
    message: "You have a meeting scheduled with the client at 3 PM today.",
    phoneNumber: "+15551112222",
    scheduledFor: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    timezone: "America/Chicago",
    status: "completed",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "scheduled" | "completed" | "failed">("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders)
  const [isLoading, setIsLoading] = useState(false)

  // Filter reminders based on search and active tab
  const filteredReminders = reminders.filter((reminder) => {
    const matchesSearch = reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reminder.message.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTab = activeTab === "all" || reminder.status === activeTab

    return matchesSearch && matchesTab
  })

  // Calculate counts for tabs
  const counts = {
    all: reminders.length,
    scheduled: reminders.filter((r) => r.status === "scheduled").length,
    completed: reminders.filter((r) => r.status === "completed").length,
    failed: reminders.filter((r) => r.status === "failed").length,
  }

  const handleCreateReminder = async (data: ReminderFormValues) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (editingReminder) {
      // Update existing reminder
      setReminders(
        reminders.map((r) =>
          r.id === editingReminder.id
            ? {
                ...r,
                title: data.title,
                message: data.message,
                phoneNumber: data.phoneNumber,
                scheduledFor: data.scheduledFor,
                timezone: data.timezone,
                updatedAt: new Date(),
              }
            : r
        )
      )
      toast.success("Reminder updated successfully!")
      setEditingReminder(null)
    } else {
      // Create new reminder
      const newReminder: Reminder = {
        id: Math.random().toString(36).substring(7),
        title: data.title,
        message: data.message,
        phoneNumber: data.phoneNumber,
        scheduledFor: data.scheduledFor,
        timezone: data.timezone,
        status: "scheduled",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setReminders([newReminder, ...reminders])
      toast.success("Reminder created successfully!")
    }
  }

  const handleEditReminder = (id: string) => {
    const reminder = reminders.find((r) => r.id === id)
    if (reminder) {
      setEditingReminder(reminder)
      setIsFormOpen(true)
    }
  }

  const handleOpenForm = () => {
    setEditingReminder(null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingReminder(null)
  }

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id))
    toast.success("Reminder deleted successfully!")
  }

  const handleRetryReminder = (id: string) => {
    const reminder = reminders.find((r) => r.id === id)
    if (reminder) {
      setReminders(
        reminders.map((r) =>
          r.id === id ? { ...r, status: "scheduled" as const } : r
        )
      )
      toast.success("Reminder rescheduled!")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onNewReminderClick={handleOpenForm} />

      <main className="container mx-auto py-8 px-4">
        {/* Page Header */}
        <PageHeader
          title="Reminders"
          description="Manage your phone call reminders"
          className="mb-8"
        />

        {/* Filters */}
        <div className="mb-6">
          <ReminderFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <ReminderListSkeleton />
        ) : filteredReminders.length === 0 ? (
          reminders.length === 0 ? (
            <ReminderEmpty onCreateClick={handleOpenForm} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No reminders found matching your search.
              </p>
            </div>
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

      {/* Create/Edit Form */}
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
  )
}
