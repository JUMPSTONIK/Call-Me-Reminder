"use client";

import { forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  currentLength?: number;
  warningThreshold?: number;
}

export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps
>(
  (
    {
      error,
      currentLength = 0,
      maxLength = 500,
      warningThreshold = 450,
      className,
      ...props
    },
    ref,
  ) => {
    const showWarning = currentLength >= warningThreshold;

    return (
      <div className="space-y-2">
        <Textarea
          ref={ref}
          maxLength={maxLength}
          className={cn(
            "resize-none",
            error && "border-destructive",
            className,
          )}
          {...props}
        />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {currentLength} / {maxLength} characters
          </span>
          {showWarning && !error && (
            <span className="text-amber-600 dark:text-amber-400">
              Almost at limit
            </span>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
      </div>
    );
  },
);

TextareaField.displayName = "TextareaField";
