"use client"

import { PhoneOff, Clock, Phone, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReminderEmptyProps {
  onCreateClick?: () => void
}

export function ReminderEmpty({ onCreateClick }: ReminderEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon with glow effect */}
      <div className="relative mb-6">
        {/* Glow effect - adapts to dark mode */}
        <div className="absolute inset-0 bg-primary/20 dark:bg-primary/30 rounded-full blur-3xl" />

        {/* Icon container */}
        <div className="relative rounded-full bg-linear-to-br from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 p-8">
          <PhoneOff className="h-16 w-16 text-primary" />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
        No reminders yet
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground text-center max-w-md mb-8">
        Get started by creating your first reminder. We'll call you at the perfect time.
      </p>

      {/* CTA */}
      <Button size="lg" onClick={onCreateClick} className="shadow-lg">
        <Phone className="h-5 w-5 mr-2" />
        Create Your First Reminder
      </Button>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-2xl w-full">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
            <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm text-muted-foreground">
            Never miss important moments
          </p>
        </div>

        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
            <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm text-muted-foreground">
            Automated phone calls
          </p>
        </div>

        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3">
            <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-sm text-muted-foreground">
            Schedule with ease
          </p>
        </div>
      </div>
    </div>
  )
}
