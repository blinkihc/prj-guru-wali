// Switch component - Toggle ala HeroUI untuk kontrol boolean
// Created: 2025-10-20 - Dipakai di form biodata siswa

"use client";

import type { ButtonHTMLAttributes } from "react";
import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      defaultChecked = false,
      onCheckedChange,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const [uncontrolled, setUncontrolled] = useState(defaultChecked);
    const isControlled = checked !== undefined;
    const value = isControlled ? checked : uncontrolled;

    const toggle = () => {
      if (disabled) return;
      const next = !value;
      if (!isControlled) {
        setUncontrolled(next);
      }
      onCheckedChange?.(next);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={value}
        data-state={value ? "checked" : "unchecked"}
        data-disabled={disabled ? "true" : undefined}
        disabled={disabled}
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggle();
          }
        }}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input/60 p-0.5 transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "data-[state=checked]:bg-primary data-[state=checked]:/50",
          "data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none inline-block size-5 rounded-full bg-background shadow transition-transform",
            value ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    );
  },
);

Switch.displayName = "Switch";
