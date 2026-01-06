"use client";

import { useState, useMemo } from "react";
import type { Reminder } from "@/lib/types";

type FilterTab = "all" | "scheduled" | "completed" | "failed";

interface UseReminderFiltersProps {
  reminders: Reminder[];
}

export function useReminderFilters({ reminders }: UseReminderFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

  return {
    searchQuery,
    activeTab,
    sortOrder,
    filteredReminders,
    counts,
    setSearchQuery,
    setActiveTab,
    setSortOrder,
  };
}
