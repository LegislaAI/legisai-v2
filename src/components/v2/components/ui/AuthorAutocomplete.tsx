"use client";

import { useApiContext } from "@/context/ApiContext";
import { useDebounce } from "@/hooks/useDebounce";
import { Check, Loader2, User, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

export type AuthorValue = {
  /** politicianId quando o usuário selecionou uma sugestão. Vazio = busca por texto livre. */
  id?: string;
  name: string;
};

type Suggestion = {
  id: string;
  name: string;
  fullName: string;
  party: string | null;
  state: string | null;
};

interface AuthorAutocompleteProps {
  value: AuthorValue;
  onChange: (value: AuthorValue) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Autocomplete do campo "Autor" da Pesquisa de Proposições.
 *
 * Spec do Leo (Básica §6.2-6.3 / Avançada §7.2): se o autor for deputado, o
 * campo deve sugerir nomes da base; ao selecionar, a busca usa o ID interno
 * (preciso). Texto livre fica disponível para autores institucionais ("Senado
 * Federal", "Poder Executivo") que não estão em `politicians`.
 *
 * Contrato com o pai:
 * - `value.id` preenchido = sugestão foi selecionada; query usa `politicianId`.
 * - `value.id` vazio com `value.name` = texto livre; query usa `authorName` ILIKE.
 * - Editar o texto após selecionar limpa o `id` (evita ID antigo com nome novo).
 */
export function AuthorAutocomplete({
  value,
  onChange,
  placeholder = "Nome do autor (deputado ou não)",
  className,
}: AuthorAutocompleteProps) {
  const { GetAPI } = useApiContext();
  const inputId = useId();
  const [input, setInput] = useState(value.name ?? "");
  const debounced = useDebounce(input, 300);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  // Trava a próxima busca quando o pai acabou de mandar o value (evita refetch após selecionar).
  const skipNextFetch = useRef(false);

  // Mantém o input sincronizado quando o pai muda o value (clearFilters, URL aplicada, etc).
  useEffect(() => {
    setInput(value.name ?? "");
    if (value.id) skipNextFetch.current = true;
  }, [value.id, value.name]);

  // Fetch debounced. Pula quando: input < 2 chars, ou quando o pai acabou de aplicar selection.
  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    const q = debounced.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    let aborted = false;
    setLoading(true);
    (async () => {
      try {
        const res = await GetAPI(
          `/politician/suggest?q=${encodeURIComponent(q)}&limit=10`,
          true
        );
        if (aborted) return;
        if (res.status === 200 && Array.isArray(res.body)) {
          setSuggestions(res.body as Suggestion[]);
        } else {
          setSuggestions([]);
        }
      } catch {
        if (!aborted) setSuggestions([]);
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [debounced, GetAPI]);

  // Click fora fecha o dropdown.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleInputChange = (next: string) => {
    setInput(next);
    setOpen(true);
    setHighlight(-1);
    // Editar limpa qualquer ID prévio: se o usuário mexer no texto após
    // selecionar, deixa de ser "Samuel Viana especificamente" e vira "busca por texto".
    onChange({ id: undefined, name: next });
  };

  const handleSelect = useCallback(
    (s: Suggestion) => {
      setOpen(false);
      setInput(s.name);
      setHighlight(-1);
      skipNextFetch.current = true;
      onChange({ id: s.id, name: s.name });
    },
    [onChange]
  );

  const handleClear = () => {
    setInput("");
    setOpen(false);
    setHighlight(-1);
    onChange({ id: undefined, name: "" });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && suggestions.length > 0 && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      if (open && highlight >= 0 && suggestions[highlight]) {
        e.preventDefault();
        handleSelect(suggestions[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const hasSelection = Boolean(value.id);
  const showDropdown =
    open && (loading || suggestions.length > 0 || debounced.trim().length >= 2);

  const dropdownItems = useMemo(
    () =>
      suggestions.map((s, i) => {
        const meta = [s.party, s.state].filter(Boolean).join("/");
        return (
          <button
            key={s.id}
            type="button"
            onMouseDown={(e) => {
              // mousedown previne perder o foco antes do click. handleSelect cuida do resto.
              e.preventDefault();
              handleSelect(s);
            }}
            onMouseEnter={() => setHighlight(i)}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
              highlight === i ? "bg-secondary/10 text-secondary" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <User size={12} className="shrink-0 text-gray-400" />
            <span className="min-w-0 flex-1 truncate">
              <span className="font-medium">{s.name}</span>
              {meta && <span className="ml-1.5 text-gray-400">— {meta}</span>}
            </span>
            {value.id === s.id && <Check size={12} className="shrink-0 text-secondary" />}
          </button>
        );
      }),
    [suggestions, highlight, value.id, handleSelect]
  );

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <div
        className={`relative flex h-9 w-full items-center rounded-lg border bg-white pl-3 pr-2 transition-colors focus-within:ring-2 focus-within:ring-secondary/20 ${
          hasSelection ? "border-secondary/40" : "border-gray-200 focus-within:border-secondary"
        }`}
      >
        {hasSelection && <Check size={12} className="mr-1.5 shrink-0 text-secondary" />}
        <input
          id={inputId}
          type="text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none"
          autoComplete="off"
        />
        {loading && <Loader2 size={12} className="ml-1.5 shrink-0 animate-spin text-gray-400" />}
        {input && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-1 shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="Limpar"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {loading && suggestions.length === 0 && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
              <Loader2 size={12} className="animate-spin" />
              Buscando…
            </div>
          )}
          {!loading && suggestions.length === 0 && debounced.trim().length >= 2 && (
            <div className="px-3 py-2 text-xs text-gray-500">
              Nenhum deputado encontrado. Pode digitar livremente — busca por texto ainda funciona
              (ex.: &quot;Senado Federal&quot;, &quot;Poder Executivo&quot;).
            </div>
          )}
          {suggestions.length > 0 && <div className="py-1">{dropdownItems}</div>}
        </div>
      )}
    </div>
  );
}
