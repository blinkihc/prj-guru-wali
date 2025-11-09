// OptimizedImage Component
// Created: 2025-11-09
// Purpose: Optimize image loading with blur placeholder and lazy loading

"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "src" | "fill"> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  blurDataURL?: string;
  showLoading?: boolean;
}

// Default blur placeholder (1x1 transparent PNG)
const DEFAULT_BLUR =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  blurDataURL = DEFAULT_BLUR,
  showLoading = true,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    // Fallback UI for failed images
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground border border-dashed border-border",
          className,
        )}
        style={{ width, height }}
      >
        <span className="text-xs text-center px-2">Gambar tidak tersedia</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {showLoading && isLoading && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        placeholder="blur"
        blurDataURL={blurDataURL}
        {...props}
      />
    </div>
  );
}

// Specialized component for student photos
export function StudentPhoto({
  studentId,
  className,
  size = 80,
}: {
  studentId: string;
  className?: string;
  size?: number;
}) {
  const photoUrl = `/api/students/photo?id=${studentId}`;

  return (
    <OptimizedImage
      src={photoUrl}
      alt={`Foto siswa ${studentId}`}
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      priority={size <= 100} // Prioritize small avatars
      sizes={`${size}px`}
    />
  );
}

// Specialized component for cover images
export function CoverImage({
  type,
  userId,
  className,
  width = 400,
  height = 200,
}: {
  type: "logo-dinas" | "logo-sekolah" | "illustration";
  userId: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  const coverUrl = `https://april.tigasama.com/covers/${userId}/${type}.png`;

  return (
    <OptimizedImage
      src={coverUrl}
      alt={`${type} cover`}
      width={width}
      height={height}
      className={cn("object-cover", className)}
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}
