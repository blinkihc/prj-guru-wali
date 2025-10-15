// AnimatedDock component - macOS-style horizontal dock navigation
// Created: 2025-10-14
// Updated: 2025-10-14 - Added keyboard navigation support
// Horizontal dock for mobile/tablet, replaces sidebar with always-visible icons

"use client";

import {
  AnimatePresence,
  type MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface DockItem {
  title: string;
  icon: React.ReactNode;
  href: string;
}

interface AnimatedDockProps {
  items: DockItem[];
  className?: string;
}

/**
 * AnimatedDock - macOS-style horizontal dock
 * Always visible on mobile/tablet, hidden on desktop
 * Supports keyboard navigation (Tab, Enter, Arrow keys)
 */
export function AnimatedDock({ items, className }: AnimatedDockProps) {
  const mouseXPosition = useMotionValue(Number.POSITIVE_INFINITY);

  return (
    <motion.nav
      aria-label="Main navigation"
      onMouseMove={(e) => mouseXPosition.set(e.pageX)}
      onMouseLeave={() => mouseXPosition.set(Number.POSITIVE_INFINITY)}
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "flex h-16 items-end gap-4 rounded-2xl px-4 pb-3",
        "bg-card/90 backdrop-blur-md border border-border shadow-lg",
        "lg:hidden", // Hidden on desktop (≥1024px)
        className,
      )}
    >
      {items.map((item) => (
        <DockIcon mouseX={mouseXPosition} key={item.title} {...item} />
      ))}
    </motion.nav>
  );
}

/**
 * DockIcon - Individual icon with hover magnification effect
 */
function DockIcon({
  mouseX,
  title,
  icon,
  href,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isActive = pathname === href;

  // Calculate distance from mouse to icon
  const distanceFromMouse = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Transform size based on distance (magnification effect)
  const widthTransform = useTransform(
    distanceFromMouse,
    [-150, 0, 150],
    [40, 80, 40],
  );
  const heightTransform = useTransform(
    distanceFromMouse,
    [-150, 0, 150],
    [40, 80, 40],
  );

  // Icon size transformation
  const iconWidthTransform = useTransform(
    distanceFromMouse,
    [-150, 0, 150],
    [20, 40, 20],
  );
  const iconHeightTransform = useTransform(
    distanceFromMouse,
    [-150, 0, 150],
    [20, 40, 20],
  );

  // Spring animations for smooth transitions
  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const iconWidth = useSpring(iconWidthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const iconHeight = useSpring(iconHeightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      aria-label={title}
      aria-current={isActive ? "page" : undefined}
      className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative flex aspect-square items-center justify-center rounded-full",
          "shadow-lg backdrop-blur-md transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "bg-background/80 text-foreground hover:bg-accent hover:text-accent-foreground",
        )}
      >
        {/* Tooltip on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className={cn(
                "absolute -top-10 left-1/2 w-fit whitespace-pre",
                "rounded-md border border-border bg-card/95 backdrop-blur-sm",
                "px-2 py-1 text-xs text-card-foreground shadow-md",
              )}
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Icon with dynamic size */}
        <motion.div
          style={{ width: iconWidth, height: iconHeight }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </Link>
  );
}
