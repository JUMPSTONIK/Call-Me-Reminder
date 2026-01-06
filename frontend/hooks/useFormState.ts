"use client";

import { useState, useCallback } from "react";

export function useFormState() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startSubmitting = useCallback(() => {
    setIsSubmitting(true);
  }, []);

  const stopSubmitting = useCallback(() => {
    setIsSubmitting(false);
  }, []);

  const withSubmitting = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      startSubmitting();
      try {
        return await fn();
      } finally {
        stopSubmitting();
      }
    },
    [startSubmitting, stopSubmitting],
  );

  return {
    isSubmitting,
    startSubmitting,
    stopSubmitting,
    withSubmitting,
  };
}
