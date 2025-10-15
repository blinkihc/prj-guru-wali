// RippleButton component - Button with ripple effect on click
// Created: 2025-10-14
// Provides visual feedback for user interactions

"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RippleButtonProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  rippleColor?: string;
}

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

export function RippleButton({
  children,
  className,
  rippleColor,
  onClick,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();

    // Calculate ripple position relative to button
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate ripple size (diameter)
    const size = Math.max(rect.width, rect.height) * 2;

    // Create new ripple
    const newRipple: Ripple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    // Call original onClick if provided
    onClick?.(e);
  };

  return (
    <Button
      className={cn("relative overflow-hidden", className)}
      onClick={handleClick}
      {...props}
    >
      {/* Button content */}
      {children}

      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-ripple pointer-events-none"
          style={
            {
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              transform: "translate(-50%, -50%)",
              backgroundColor: rippleColor || "currentColor",
              opacity: 0.3,
              "--ripple-scale": "2",
            } as React.CSSProperties
          }
        />
      ))}
    </Button>
  );
}
