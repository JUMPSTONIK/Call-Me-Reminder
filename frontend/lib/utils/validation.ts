/**
 * Validates if a phone number follows E.164 format
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export function isValidPhoneNumber(phone: string): boolean {
  return /^\+[1-9]\d{1,14}$/.test(phone);
}

/**
 * Validates if a date/time combination is valid for scheduling
 * @param date - The date to validate
 * @param time - The time string in HH:mm format
 * @returns Object with validation result and error messages
 */
export function validateScheduledDateTime(
  date: Date | undefined,
  time: string,
): {
  isValid: boolean;
  dateError?: string;
  timeError?: string;
} {
  if (!date) {
    return {
      isValid: false,
      dateError: "Please select a date",
    };
  }

  if (!time) {
    return {
      isValid: false,
      timeError: "Please select a time",
    };
  }

  const [hours, minutes] = time.split(":");
  const combinedDate = new Date(date);
  combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  const now = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  if (combinedDate <= now) {
    return {
      isValid: false,
      dateError: "Selected date is in the past",
      timeError: "Selected time is in the past",
    };
  }

  if (combinedDate > oneYearFromNow) {
    return {
      isValid: false,
      dateError: "Cannot schedule more than 1 year in advance",
    };
  }

  return { isValid: true };
}

/**
 * Combines a date and time string into a single Date object
 * @param date - The date
 * @param time - The time string in HH:mm format
 * @returns Combined Date object
 */
export function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":");
  const combinedDate = new Date(date);
  combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return combinedDate;
}
