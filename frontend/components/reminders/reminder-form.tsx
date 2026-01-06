"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Phone,
  Calendar as CalendarIcon,
  Clock,
  Globe,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// Select component removed - timezone is now auto-detected
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  reminderSchema,
  type ReminderFormValues,
} from "@/lib/validations/reminder-schema";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

interface ReminderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ReminderFormValues) => void | Promise<void>;
  defaultValues?: Partial<ReminderFormValues>;
  isEditing?: boolean;
}

export function ReminderForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEditing = false,
}: ReminderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    defaultValues?.scheduledFor,
  );
  const [time, setTime] = useState<string>("");
  const [dateTouched, setDateTouched] = useState(false);
  const [timeTouched, setTimeTouched] = useState(false);
  const [dateError, setDateError] = useState<string>("");
  const [timeError, setTimeError] = useState<string>("");
  const timeInputRef = useRef<HTMLInputElement>(null);

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      title: defaultValues?.title || "",
      phoneNumber: defaultValues?.phoneNumber || "",
      timezone: userTimezone,
      message: defaultValues?.message || "",
      scheduledFor: defaultValues?.scheduledFor || undefined,
    },
  });

  useEffect(() => {
    if (defaultValues && open) {
      form.reset({
        title: defaultValues.title,
        phoneNumber: defaultValues.phoneNumber,
        timezone: userTimezone,
        message: defaultValues.message,
        scheduledFor: defaultValues.scheduledFor,
      });

      if (defaultValues.scheduledFor) {
        setDate(defaultValues.scheduledFor);
        const hours = defaultValues.scheduledFor
          .getHours()
          .toString()
          .padStart(2, "0");
        const minutes = defaultValues.scheduledFor
          .getMinutes()
          .toString()
          .padStart(2, "0");
        setTime(`${hours}:${minutes}`);
      }
    } else if (!open) {
      form.reset({
        title: "",
        phoneNumber: "",
        timezone: userTimezone,
        message: "",
        scheduledFor: undefined,
      });
      setDate(undefined);
      setTime("");
      setDateTouched(false);
      setTimeTouched(false);
      setDateError("");
      setTimeError("");
    }
  }, [defaultValues, open, form, userTimezone]);

  const validateDateTime = () => {
    let hasError = false;

    if (dateTouched && !date) {
      setDateError("Please select a date");
      hasError = true;
    } else {
      setDateError("");
    }

    if (timeTouched && !time) {
      setTimeError("Please select a time");
      hasError = true;
    } else {
      setTimeError("");
    }

    if (date && time) {
      const [hours, minutes] = time.split(":");
      const combinedDate = new Date(date);
      combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const now = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      if (combinedDate <= now) {
        setDateError("Selected date is in the past");
        setTimeError("Selected time is in the past");
        hasError = true;
      } else if (combinedDate > oneYearFromNow) {
        setDateError("Cannot schedule more than 1 year in advance");
        setTimeError("");
        hasError = true;
      } else {
        setDateError("");
        setTimeError("");
      }
    }

    return !hasError;
  };

  useEffect(() => {
    if (date && time) {
      const [hours, minutes] = time.split(":");
      const combinedDate = new Date(date);
      combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      form.setValue("scheduledFor", combinedDate, {
        shouldValidate: false,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
    validateDateTime();
  }, [date, time, dateTouched, timeTouched]);

  const handleSubmit = async (data: ReminderFormValues) => {
    setDateTouched(true);
    setTimeTouched(true);

    if (!validateDateTime()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      setDate(undefined);
      setTime("");
      setDateTouched(false);
      setTimeTouched(false);
      setDateError("");
      setTimeError("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const phoneNumber = form.watch("phoneNumber");
  const message = form.watch("message");
  const phoneValid = phoneNumber && /^\+[1-9]\d{1,14}$/.test(phoneNumber);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Reminder" : "Create New Reminder"}
          </DialogTitle>
          <DialogDescription>
            Set up a phone call reminder. We'll call you at the specified time.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Reminder Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Call Mom on her birthday"
              {...form.register("title")}
              className={
                form.formState.errors.title ? "border-destructive" : ""
              }
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 555 123 4567"
                {...form.register("phoneNumber")}
                className={cn(
                  "pl-10",
                  form.formState.errors.phoneNumber && "border-destructive",
                )}
              />
            </div>
            {phoneValid && !form.formState.errors.phoneNumber && (
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Valid phone number
              </p>
            )}
            {form.formState.errors.phoneNumber && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {form.formState.errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Date <span className="text-destructive">*</span>
                </Label>
                <Popover
                  onOpenChange={(isOpen) => {
                    if (!isOpen && !date) {
                      setDateTouched(true);
                    }
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setDateTouched(true)}
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
                        setDate(newDate);
                        setDateTouched(true);
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
                  Time <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Clock
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => timeInputRef.current?.showPicker()}
                  />
                  <Input
                    ref={timeInputRef}
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => {
                      setTime(e.target.value);
                      setTimeTouched(true);
                    }}
                    onBlur={() => {
                      setTimeTouched(true);
                    }}
                    className={cn(
                      "pl-10",
                      timeError && "border-destructive",
                    )}
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
          </div>

          <div className="space-y-2">
            <Label>Timezone (Auto-detected)</Label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/50 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span className="font-mono">{userTimezone}</span>
              <CheckCircle className="h-4 w-4 ml-auto text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xs text-muted-foreground">
              Your reminder will be scheduled according to your local timezone
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="What should we say when we call you?"
              {...form.register("message")}
              rows={4}
              maxLength={500}
              className={cn(
                "resize-none",
                form.formState.errors.message && "border-destructive",
              )}
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {message?.length || 0} / 500 characters
              </span>
              {message && message.length >= 450 && (
                <span className="text-amber-600 dark:text-amber-400">
                  Almost at limit
                </span>
              )}
            </div>
            {form.formState.errors.message && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {form.formState.errors.message.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {isEditing ? "Update Reminder" : "Create Reminder"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
