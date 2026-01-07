"use client";

import { useRef } from "react";
import { Calendar as CalendarIcon, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DateTimeInputProps {
  date: Date | undefined;
  time: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  onDateTouched?: () => void;
  onTimeTouched?: () => void;
  dateError?: string;
  timeError?: string;
  required?: boolean;
}

export function DateTimeInput({
  date,
  time,
  onDateChange,
  onTimeChange,
  onDateTouched,
  onTimeTouched,
  dateError,
  timeError,
  required = false,
}: DateTimeInputProps) {
  const timeInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>
          Date {required && <span className="text-destructive">*</span>}
        </Label>
        <Popover
          onOpenChange={(isOpen) => {
            if (!isOpen && !date && onDateTouched) {
              onDateTouched();
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              onClick={onDateTouched}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground",
                dateError && "border-destructive",
              )}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                onDateChange(newDate);
                if (onDateTouched) onDateTouched();
              }}
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {dateError && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {dateError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="time">
          Time {required && <span className="text-destructive">*</span>}
        </Label>
        <div className="relative">
          <Clock
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            onClick={() => {
              timeInputRef.current?.focus();
              timeInputRef.current?.showPicker();
            }}
          />
          <Input
            ref={timeInputRef}
            id="time"
            type="time"
            value={time}
            onChange={(e) => {
              onTimeChange(e.target.value);
              if (onTimeTouched) onTimeTouched();
            }}
            onBlur={() => {
              if (onTimeTouched) onTimeTouched();
            }}
            className={cn("pl-10", timeError && "border-destructive")}
          />
        </div>
        {timeError && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {timeError}
          </p>
        )}
      </div>
    </div>
  );
}
