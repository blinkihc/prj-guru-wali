// EnhancedCard component - Card with subtle hover effects
// Created: 2025-10-14
// Extends Card component with hover animations for better interactivity

"use client";

import type React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EnhancedCardProps
  extends React.ComponentPropsWithoutRef<typeof Card> {
  hoverScale?: boolean;
  hoverShadow?: boolean;
}

/**
 * EnhancedCard - Card with subtle hover effects
 * - Slight scale on hover (1.02)
 * - Shadow elevation on hover
 * - Smooth transitions
 */
export function EnhancedCard({
  children,
  className,
  hoverScale = true,
  hoverShadow = true,
  ...props
}: EnhancedCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-300 ease-out",
        hoverScale && "hover:-translate-y-1 hover:scale-[1.01]",
        hoverShadow && "hover:shadow-lg hover:shadow-primary/10",
        className,
      )}
      {...props}
    >
      {children}
    </Card>
  );
}
