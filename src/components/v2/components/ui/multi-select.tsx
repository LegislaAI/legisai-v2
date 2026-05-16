"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, X } from "lucide-react";
import * as React from "react";

export type MultiSelectOption = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  values: string[];
  onValuesChange: (values: string[]) => void;
  options: MultiSelectOption[];
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function MultiSelect({
  values,
  onValuesChange,
  options,
  placeholder,
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nada encontrado",
  className,
  contentClassName,
  disabled,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedSet = React.useMemo(() => new Set(values), [values]);
  const selectedLabels = React.useMemo(
    () =>
      values
        .map((v) => options.find((o) => o.value === v)?.label ?? v)
        .filter(Boolean),
    [values, options]
  );

  const toggle = (value: string) => {
    const next = selectedSet.has(value)
      ? values.filter((v) => v !== value)
      : [...values, value];
    onValuesChange(next);
  };

  const selectAll = () => onValuesChange(options.map((o) => o.value));
  const clear = () => onValuesChange([]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 text-xs font-normal",
            "transition-colors hover:bg-gray-100/60 disabled:cursor-not-allowed disabled:opacity-50",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300",
            selectedLabels.length ? "text-gray-900" : "text-gray-500",
            className
          )}
        >
          <span className="truncate text-left">
            {selectedLabels.length === 0
              ? placeholder
              : selectedLabels.length === 1
                ? selectedLabels[0]
                : `${selectedLabels.length} selecionados`}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn(
          "w-[var(--radix-popover-trigger-width)] min-w-[240px] border border-gray-200 bg-white p-0 shadow-md",
          contentClassName
        )}
      >
        <Command
          filter={(itemValue, search) =>
            normalize(itemValue).includes(normalize(search)) ? 1 : 0
          }
        >
          <CommandInput placeholder={searchPlaceholder} />
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-2 py-1.5">
            <button
              type="button"
              onClick={selectAll}
              className="text-[11px] font-medium text-secondary hover:underline"
            >
              Selecionar todos
            </button>
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-800"
            >
              <X size={11} /> Limpar seleção
            </button>
          </div>
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const checked = selectedSet.has(opt.value);
                return (
                  <CommandItem
                    key={opt.value}
                    value={`${opt.label} ${opt.value}`}
                    onSelect={() => toggle(opt.value)}
                    className="text-xs"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3.5 w-3.5",
                        checked ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{opt.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
