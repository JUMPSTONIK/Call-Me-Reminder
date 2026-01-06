import { z } from "zod";

// E.164 phone number format validation
const phoneRegex = /^\+[1-9]\d{1,14}$/;

export const reminderSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),

  phoneNumber: z
    .string()
    .regex(
      phoneRegex,
      "Phone number must be in E.164 format (e.g., +15551234567)",
    ),

  scheduledFor: z.date({
    required_error: "Please select a date and time",
  }),

  timezone: z.string().min(1, "Please select a timezone"),

  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must be less than 500 characters"),
});

export type ReminderFormValues = z.infer<typeof reminderSchema>;
