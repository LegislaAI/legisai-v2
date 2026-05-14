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
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

export type SearchableSelectOption = {
  value: string;
  label: string;
};

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder: string;
  /** Texto do item "limpa filtro". Default: usa o `placeholder`. */
  allLabel?: string;
  /** Texto quando a busca não retorna nada. Default: "Nada encontrado". */
  emptyMessage?: string;
  /** Placeholder do input de busca. Default: "Buscar..." */
  searchPlaceholder?: string;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  allLabel,
  emptyMessage = "Nada encontrado",
  searchPlaceholder = "Buscar...",
  className,
  contentClassName,
  disabled,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selected = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  );

  const handleSelect = (next: string) => {
    onValueChange(next === value ? "" : next);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 text-xs font-normal",
            "transition-colors hover:bg-gray-100/60 disabled:cursor-not-allowed disabled:opacity-50",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300",
            selected ? "text-gray-900" : "text-gray-500",
            className,
          )}
        >
          <span className="truncate text-left">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn(
          "w-[var(--radix-popover-trigger-width)] min-w-[220px] border border-gray-200 bg-white p-0 shadow-md",
          contentClassName,
        )}
      >
        <Command
          filter={(itemValue, search) => {
            // itemValue é o que passamos em `value=` no CommandItem; usamos
            // o label normalizado pra comparar (acentos/caixa).
            const norm = (s: string) =>
              s
                .toLowerCase()
                .normalize("NFD")
                .replace(/[̀-ͯ]/g, "");
            return norm(itemValue).includes(norm(search)) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value={`__all__ ${allLabel ?? placeholder}`}
                onSelect={() => {
                  onValueChange("");
                  setOpen(false);
                }}
                className="text-xs text-gray-600"
              >
                <Check
                  className={cn(
                    "mr-2 h-3.5 w-3.5",
                    value === "" ? "opacity-100" : "opacity-0",
                  )}
                />
                {allLabel ?? placeholder}
              </CommandItem>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={`${opt.label} ${opt.value}`}
                  onSelect={() => handleSelect(opt.value)}
                  className="text-xs"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3.5 w-3.5",
                      value === opt.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">{opt.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
