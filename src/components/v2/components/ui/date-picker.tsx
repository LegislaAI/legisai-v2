"use client";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

interface DatePickerProps {
  /** Data no formato ISO curto "YYYY-MM-DD" (igual ao `<input type="date">`). String vazia = sem data. */
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Limita o calendário a um intervalo. */
  fromDate?: Date;
  toDate?: Date;
}

function parseValue(value: string): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

function formatValue(date: Date | undefined): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DatePicker({
  value,
  onValueChange,
  placeholder = "Selecionar data",
  className,
  disabled,
  fromDate,
  toDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseValue(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-normal",
            "transition-colors hover:bg-gray-100/60 disabled:cursor-not-allowed disabled:opacity-50",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300",
            selected ? "text-gray-900" : "text-gray-500",
            className,
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 shrink-0 opacity-50" />
          <span className="truncate text-left">
            {selected ? format(selected, "dd/MM/yyyy", { locale: ptBR }) : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto border border-gray-200 bg-white p-3 shadow-md"
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => {
            onValueChange(formatValue(d));
            setOpen(false);
          }}
          fromDate={fromDate}
          toDate={toDate}
        />
        <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
          <button
            type="button"
            onClick={() => {
              onValueChange("");
              setOpen(false);
            }}
            className="text-xs font-medium text-gray-500 hover:text-gray-800"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={() => {
              onValueChange(formatValue(new Date()));
              setOpen(false);
            }}
            className="text-secondary text-xs font-medium hover:underline"
          >
            Hoje
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
