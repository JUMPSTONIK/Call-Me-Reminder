"use client";

import { forwardRef } from "react";
import { Phone, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PhoneInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  showValidation?: boolean;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ error, showValidation = true, className, value, ...props }, ref) => {
    const phoneValid =
      value &&
      typeof value === "string" &&
      /^\+[1-9]\d{1,14}$/.test(value);

    return (
      <div className="space-y-2">
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={ref}
            type="tel"
            className={cn("pl-10", error && "border-destructive", className)}
            value={value}
            {...props}
          />
        </div>
        {showValidation && phoneValid && !error && (
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Valid phone number
          </p>
        )}
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

PhoneInput.displayName = "PhoneInput";
