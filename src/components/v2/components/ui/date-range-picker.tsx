"use client";

import { DatePicker } from "@/components/v2/components/ui/date-picker";
import { cn } from "@/lib/utils";
import * as React from "react";

interface DateRangePickerProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  fromPlaceholder?: string;
  toPlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
  fromPlaceholder = "dd/mm/aaaa",
  toPlaceholder = "dd/mm/aaaa",
  className,
  disabled,
}: DateRangePickerProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      <DatePicker
        value={from}
        onValueChange={onFromChange}
        placeholder={fromPlaceholder}
        toDate={to ? new Date(to) : undefined}
        disabled={disabled}
      />
      <DatePicker
        value={to}
        onValueChange={onToChange}
        placeholder={toPlaceholder}
        fromDate={from ? new Date(from) : undefined}
        disabled={disabled}
      />
    </div>
  );
}
