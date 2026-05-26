"use client";

import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { Paginated, useAdminApi } from "../_lib/admin-api";

type UserLite = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  value: UserLite | null;
  onChange: (user: UserLite | null) => void;
  placeholder?: string;
  disabled?: boolean;
};

/**
 * Combobox com busca server-side em /admin/users.
 * Debounce de 300ms; resultados limitados a 20 por busca.
 * Não carrega todos os usuários — preparado para bases grandes.
 */
export function UserCombobox({
  value,
  onChange,
  placeholder = "Selecionar usuário…",
  disabled,
}: Props) {
  const { list } = useAdminApi();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [items, setItems] = useState<UserLite[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounce 300ms para evitar request por tecla.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Cancelamento simples via "última request vence".
  const reqIdRef = useRef(0);

  const fetchUsers = useCallback(async () => {
    const id = ++reqIdRef.current;
    setLoading(true);
    try {
      const res = await list<Paginated<UserLite>>("/admin/users", {
        pageSize: "20",
        q: debouncedQuery || undefined,
      });
      if (reqIdRef.current === id) {
        setItems(res.items);
      }
    } catch {
      if (reqIdRef.current === id) setItems([]);
    } finally {
      if (reqIdRef.current === id) setLoading(false);
    }
  }, [list, debouncedQuery]);

  // Busca quando o combobox abre ou o query (debounced) muda.
  useEffect(() => {
    if (!open) return;
    fetchUsers();
  }, [open, fetchUsers]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 text-sm",
            "transition-colors hover:bg-gray-100/60 disabled:cursor-not-allowed disabled:opacity-50",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300",
            value ? "text-gray-900" : "text-gray-500",
          )}
        >
          <span className="truncate text-left">
            {value ? (
              <>
                {value.name}{" "}
                <span className="text-xs text-gray-500">· {value.email}</span>
              </>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        collisionPadding={16}
        className="z-[1000] w-[var(--radix-popover-trigger-width)] min-w-[280px] border border-gray-200 bg-white p-0 shadow-md"
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Buscar por nome, email ou CPF/CNPJ…"
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-6 text-xs text-zinc-500">
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Buscando…
              </div>
            )}
            {!loading && items.length === 0 && (
              <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
            )}
            {!loading && items.length > 0 && (
              <CommandGroup>
                {items.map((u) => {
                  const selected = value?.id === u.id;
                  return (
                    <CommandItem
                      key={u.id}
                      value={u.id}
                      onSelect={() => {
                        onChange(u);
                        setOpen(false);
                        setQuery("");
                      }}
                      className="text-sm"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-3.5 w-3.5",
                          selected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{u.name}</span>
                        <span className="text-xs text-zinc-500">{u.email}</span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
