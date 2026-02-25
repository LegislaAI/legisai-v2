"use client";

import { cn } from "@/lib/utils";

export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded bg-gray-200", className)}
      aria-hidden
    />
  );
}
