"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

export function useCountdown(targetDate: Date) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    // Initial update
    setTimeRemaining(formatDistanceToNow(targetDate, { addSuffix: true }));

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(formatDistanceToNow(targetDate, { addSuffix: true }));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeRemaining;
}
