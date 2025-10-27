// Checkbox component - Kotak centang bergaya HeroUI
// Created: 2025-10-20 - Dipakai untuk form biodata siswa

"use client";

import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      // Gunakan input type checkbox native agar tetap aksesibel
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          "peer size-4 shrink-0 rounded border border-input bg-background text-primary transition-all duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "checked:border-primary checked:bg-primary checked:text-primary-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);

Checkbox.displayName = "Checkbox";
