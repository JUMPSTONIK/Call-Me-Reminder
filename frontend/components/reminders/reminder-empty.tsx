"use client";

import { PhoneOff, Clock, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReminderEmptyProps {
  onCreateClick?: () => void;
}

export function ReminderEmpty({ onCreateClick }: ReminderEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
      <div className="relative mb-6 animate-in zoom-in-50 duration-500 delay-150">
        <div className="absolute inset-0 bg-primary/20 dark:bg-primary/30 rounded-full blur-3xl animate-pulse" />

        <div className="relative rounded-full bg-linear-to-br from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 p-8 transition-transform duration-300 hover:scale-110">
          <PhoneOff className="h-16 w-16 text-primary transition-transform duration-500 hover:rotate-12" />
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 animate-in fade-in-50 slide-in-from-bottom-2 duration-500 delay-300">
        No reminders yet
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground text-center max-w-md mb-8 animate-in fade-in-50 slide-in-from-bottom-2 duration-500 delay-500">
        Get started by creating your first reminder. We'll call you at the
        perfect time.
      </p>

      <Button
        size="lg"
        onClick={onCreateClick}
        className="shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 animate-in fade-in-50 zoom-in-50 delay-700"
      >
        <Phone className="h-5 w-5 mr-2" />
        Create Your First Reminder
      </Button>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-2xl w-full">
        <div className="text-center group animate-in fade-in-50 slide-in-from-bottom-2 duration-500 delay-1000">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50">
            <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <p className="text-sm text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
            Never miss important moments
          </p>
        </div>

        <div className="text-center group animate-in fade-in-50 slide-in-from-bottom-2 duration-500 delay-1100">
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:bg-green-200 dark:group-hover:bg-green-900/50">
            <Phone className="h-6 w-6 text-green-600 dark:text-green-400 transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <p className="text-sm text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
            Automated phone calls
          </p>
        </div>

        <div className="text-center group animate-in fade-in-50 slide-in-from-bottom-2 duration-500 delay-1200">
          <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50">
            <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400 transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <p className="text-sm text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
            Schedule with ease
          </p>
        </div>
      </div>
    </div>
  );
}
