"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

export type RadioOption<T extends string = string> = {
  value: T;
  label: string;
};

interface RadioGroupProps<T extends string = string> {
  value: T;
  onValueChange: (value: T) => void;
  options: RadioOption<T>[];
  className?: string;
  disabled?: boolean;
}

export function RadioGroup<T extends string = string>({
  value,
  onValueChange,
  options,
  className,
  disabled,
}: RadioGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      className={cn("inline-flex gap-1 rounded-lg border border-gray-200 bg-white p-1", className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            type="button"
            key={opt.value}
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onValueChange(opt.value)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-secondary text-white"
                : "text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
