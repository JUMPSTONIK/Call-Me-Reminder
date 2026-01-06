"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReminderFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: "all" | "scheduled" | "completed" | "failed";
  onTabChange: (tab: "all" | "scheduled" | "completed" | "failed") => void;
  counts: {
    all: number;
    scheduled: number;
    completed: number;
    failed: number;
  };
}

const tabLabels = {
  all: "All",
  scheduled: "Scheduled",
  completed: "Completed",
  failed: "Failed",
};

export function ReminderFilters({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  counts,
}: ReminderFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="md:hidden">
        <Select value={activeTab} onValueChange={(v) => onTabChange(v as any)}>
          <SelectTrigger>
            <SelectValue>
              {tabLabels[activeTab]}{" "}
              {counts[activeTab] > 0 && `(${counts[activeTab]})`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              All{" "}
              {counts.all > 0 && activeTab === "all" ? `(${counts.all})` : null}
            </SelectItem>
            <SelectItem value="scheduled">
              Scheduled {counts.scheduled > 0 && `(${counts.scheduled})`}
            </SelectItem>
            <SelectItem value="completed">
              Completed {counts.completed > 0 && `(${counts.completed})`}
            </SelectItem>
            <SelectItem value="failed">
              Failed {counts.failed > 0 && `(${counts.failed})`}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden md:block">
        <Tabs
          value={activeTab}
          onValueChange={(v) => onTabChange(v as any)}
          activationMode="manual"
        >
          <TabsList
            className="w-full grid grid-cols-4"
            aria-label="Filter reminders by status"
          >
            <TabsTrigger value="all" className="relative">
              All
              {counts.all > 0 && activeTab === "all" && (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  ({counts.all})
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="relative">
              Scheduled
              {counts.scheduled > 0 && (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  ({counts.scheduled})
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="relative">
              Completed
              {counts.completed > 0 && (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  ({counts.completed})
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="failed" className="relative">
              Failed
              {counts.failed > 0 && (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  ({counts.failed})
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search reminders..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
