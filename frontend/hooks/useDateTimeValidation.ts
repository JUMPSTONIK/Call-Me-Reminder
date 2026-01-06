"use client";

import { useState, useEffect, useCallback } from "react";
import type { UseFormSetValue } from "react-hook-form";
import type { ReminderFormValues } from "@/lib/validations/reminder-schema";

interface UseDateTimeValidationProps {
  defaultDate?: Date;
  setValue?: UseFormSetValue<ReminderFormValues>;
}

export function useDateTimeValidation({
  defaultDate,
  setValue,
}: UseDateTimeValidationProps = {}) {
  const [date, setDate] = useState<Date | undefined>(defaultDate);
  const [time, setTime] = useState<string>("");
  const [dateTouched, setDateTouched] = useState(false);
  const [timeTouched, setTimeTouched] = useState(false);
  const [dateError, setDateError] = useState<string>("");
  const [timeError, setTimeError] = useState<string>("");

  const validateDateTime = useCallback(() => {
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
  }, [date, time, dateTouched, timeTouched]);

  useEffect(() => {
    if (date && time && setValue) {
      const [hours, minutes] = time.split(":");
      const combinedDate = new Date(date);
      combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      setValue("scheduledFor", combinedDate, {
        shouldValidate: false,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
    validateDateTime();
  }, [date, time, dateTouched, timeTouched, setValue, validateDateTime]);

  const resetDateTime = useCallback(() => {
    setDate(undefined);
    setTime("");
    setDateTouched(false);
    setTimeTouched(false);
    setDateError("");
    setTimeError("");
  }, []);

  const setDateTimeFromValue = useCallback((value: Date) => {
    setDate(value);
    const hours = value.getHours().toString().padStart(2, "0");
    const minutes = value.getMinutes().toString().padStart(2, "0");
    setTime(`${hours}:${minutes}`);
  }, []);

  return {
    date,
    time,
    dateError,
    timeError,
    dateTouched,
    timeTouched,
    setDate,
    setTime,
    setDateTouched,
    setTimeTouched,
    validateDateTime,
    resetDateTime,
    setDateTimeFromValue,
  };
}
