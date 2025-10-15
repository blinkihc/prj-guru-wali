// PhoneInput component - Indonesian phone number input with auto +62 prefix
// Created: 2025-01-14
// Features:
// - Auto prefix +62 (non-editable)
// - First digit after prefix must be 8
// - Auto-converts 0xxx to 62xxx
// - Numbers only input
// - Real-time validation

"use client";

import { AlertCircle, Phone } from "lucide-react";
import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  showValidation?: boolean;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value = "",
      onChange,
      error,
      showValidation = true,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [localError, setLocalError] = useState<string>("");

    // Extract phone number (remove +62 prefix if present)
    const getPhoneNumber = (val: string): string => {
      if (!val) return "";
      // Remove all non-digits
      const digits = val.replace(/\D/g, "");
      // Remove 62 prefix if present
      if (digits.startsWith("62")) {
        return digits.slice(2);
      }
      return digits;
    };

    // Get display value (just the number part, no prefix)
    const displayValue = getPhoneNumber(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Remove all non-digits
      let digits = inputValue.replace(/\D/g, "");

      // Handle if user pastes/types starting with 0
      if (digits.startsWith("0")) {
        // Remove leading 0
        digits = digits.slice(1);
        setLocalError("Awalan 0 diganti otomatis menjadi +62");
        setTimeout(() => setLocalError(""), 3000);
      }

      // Validate first digit must be 8
      if (digits.length > 0 && digits[0] !== "8") {
        setLocalError("Nomor HP Indonesia harus diawali angka 8");
        return; // Reject input
      } else if (localError && digits.length > 0 && digits[0] === "8") {
        setLocalError("");
      }

      // Limit to reasonable phone number length (8-13 digits after 62)
      if (digits.length > 13) {
        digits = digits.slice(0, 13);
      }

      // Call onChange with full format: 62xxx
      if (onChange) {
        const fullNumber = digits ? `62${digits}` : "";
        onChange(fullNumber);
      }
    };

    const displayError = error || localError;
    const hasError = !!displayError;

    return (
      <div className="space-y-1">
        <div className="relative">
          {/* Prefix Display */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground pointer-events-none">
            <Phone className="h-4 w-4" />
            <span className="font-medium">+62</span>
          </div>

          {/* Input Field */}
          <Input
            ref={ref}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            disabled={disabled}
            className={cn(
              "pl-[70px]",
              hasError && "border-destructive focus-visible:ring-destructive",
              className,
            )}
            placeholder="8xxxxxxxxx"
            {...props}
          />
        </div>

        {/* Error Message */}
        {showValidation && hasError && (
          <div className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Helper Text */}
        {showValidation && !hasError && displayValue && (
          <div className="text-xs text-muted-foreground">
            Format: +62{displayValue}
          </div>
        )}
      </div>
    );
  },
);

PhoneInput.displayName = "PhoneInput";
