"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus, Loader2, Globe, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  reminderSchema,
  type ReminderFormValues,
} from "@/lib/validations/reminder-schema";
import { FormField } from "@/components/forms/FormField";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { DateTimeInput } from "@/components/forms/DateTimeInput";
import { TextareaField } from "@/components/forms/TextareaField";
import { useFormState } from "@/hooks/useFormState";
import { useDateTimeValidation } from "@/hooks/useDateTimeValidation";
import { useEffect } from "react";

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
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { isSubmitting, withSubmitting } = useFormState();

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

  const {
    date,
    time,
    dateError,
    timeError,
    setDate,
    setTime,
    setDateTouched,
    setTimeTouched,
    validateDateTime,
    resetDateTime,
    setDateTimeFromValue,
  } = useDateTimeValidation({
    defaultDate: defaultValues?.scheduledFor,
    setValue: form.setValue,
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
        setDateTimeFromValue(defaultValues.scheduledFor);
      }
    } else if (!open) {
      form.reset({
        title: "",
        phoneNumber: "",
        timezone: userTimezone,
        message: "",
        scheduledFor: undefined,
      });
      resetDateTime();
    }
  }, [
    defaultValues,
    open,
    form,
    userTimezone,
    resetDateTime,
    setDateTimeFromValue,
  ]);

  const handleSubmit = async (data: ReminderFormValues) => {
    setDateTouched(true);
    setTimeTouched(true);

    if (!validateDateTime()) {
      return;
    }

    await withSubmitting(async () => {
      await onSubmit(data);
      form.reset();
      resetDateTime();
      onOpenChange(false);
    });
  };

  const phoneNumber = form.watch("phoneNumber");
  const message = form.watch("message");

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
          <FormField
            label="Reminder Title"
            htmlFor="title"
            required
            error={form.formState.errors.title?.message}
          >
            <Input
              id="title"
              placeholder="e.g., Call Mom on her birthday"
              {...form.register("title")}
            />
          </FormField>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <PhoneInput
              id="phone"
              placeholder="+1 555 123 4567"
              value={phoneNumber}
              error={form.formState.errors.phoneNumber?.message}
              {...form.register("phoneNumber")}
            />
          </div>

          <div className="space-y-2">
            <DateTimeInput
              date={date}
              time={time}
              onDateChange={setDate}
              onTimeChange={setTime}
              onDateTouched={() => setDateTouched(true)}
              onTimeTouched={() => setTimeTouched(true)}
              dateError={dateError}
              timeError={timeError}
              required
            />
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

          <FormField
            label="Message"
            htmlFor="message"
            required
            error={form.formState.errors.message?.message}
          >
            <TextareaField
              id="message"
              placeholder="What should we say when we call you?"
              rows={4}
              currentLength={message?.length || 0}
              {...form.register("message")}
            />
          </FormField>

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
