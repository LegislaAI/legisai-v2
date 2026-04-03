"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/v2/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/v2/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Filter,
  Loader2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProposicaoDeputado } from "./types";

/* ── Types ─────────────────────────────────────────────────── */

interface FetchParams {
  dataInicio: string;
  dataFim: string;
  page: number;
  pageSize: number;
  typeId?: string;
  situationId?: string;
  orderBy?: string;
  orderDir?: string;
}

interface ProposicoesDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  politicianId: string;
  selectedYear: string;
  fetchProposicoes: (params: FetchParams) => Promise<{
    proposicoes: ProposicaoDeputado[];
    total: number;
    pages: number;
  }>;
}

type SortDir = "asc" | "desc" | null;
type SortField = "data" | "tipo" | "numero" | "ano";

const PAGE_SIZE = 10;

/* ── Helpers ───────────────────────────────────────────────── */

/** Apresentação: DD/MM/YYYY - HH:MM (24h, fuso local). */
function formatPresentationDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dateStr = d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${dateStr} - ${timeStr}`;
}

function nextSortDir(current: SortDir): SortDir {
  if (current === null) return "asc";
  if (current === "asc") return "desc";
  return null;
}

function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === "asc") return <ArrowUp className="h-3 w-3" />;
  if (dir === "desc") return <ArrowDown className="h-3 w-3" />;
  return <ArrowUpDown className="h-3 w-3 opacity-40" />;
}

/* ── Component ─────────────────────────────────────────────── */

export function ProposicoesDetailModal({
  open,
  onOpenChange,
  politicianId,
  selectedYear,
  fetchProposicoes,
}: ProposicoesDetailModalProps) {
  /* state: data */
  const [proposicoes, setProposicoes] = useState<ProposicaoDeputado[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  /* state: filters */
  const [filterTipo, setFilterTipo] = useState("");
  const [filterSituacao, setFilterSituacao] = useState("");

  /* state: sort */
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  /* state: filter options */
  const [tipos, setTipos] = useState<string[]>([]);
  const [situacoes, setSituacoes] = useState<string[]>([]);
  const optionsLoaded = useRef(false);

  const handleFilterTipo = (v: string) =>
    setFilterTipo(v === "__all__" ? "" : v);
  const handleFilterSituacao = (v: string) =>
    setFilterSituacao(v === "__all__" ? "" : v);

  /* ── data fetching ─────────────────────────────────────── */

  const load = useCallback(
    async (p: number) => {
      if (!politicianId) return;
      setLoading(true);
      try {
        const params: FetchParams = {
          dataInicio: `${selectedYear}-01-01`,
          dataFim: `${selectedYear}-12-31`,
          page: p,
          pageSize: PAGE_SIZE,
        };
        if (filterTipo) params.typeId = filterTipo;
        if (filterSituacao) params.situationId = filterSituacao;
        if (sortField && sortDir) {
          params.orderBy = sortField;
          params.orderDir = sortDir;
        }
        console.log("params: ", params);
        const result = await fetchProposicoes(params);
        console.log("result: ", result);
        setProposicoes(result.proposicoes);
        setTotal(result.total);
        setPages(result.pages);
      } catch {
        setProposicoes([]);
        setTotal(0);
        setPages(0);
      } finally {
        setLoading(false);
      }
    },
    [
      politicianId,
      selectedYear,
      fetchProposicoes,
      filterTipo,
      filterSituacao,
      sortField,
      sortDir,
    ],
  );

  /* Load filter options on first open */
  const loadFilterOptions = useCallback(async () => {
    if (!politicianId || optionsLoaded.current) return;
    try {
      const result = await fetchProposicoes({
        dataInicio: `${selectedYear}-01-01`,
        dataFim: `${selectedYear}-12-31`,
        page: 1,
        pageSize: 500,
      });
      const tipoSet = new Set<string>();
      const sitSet = new Set<string>();
      for (const p of result.proposicoes) {
        if (p.sigla_tipo) tipoSet.add(p.sigla_tipo);
        if (p.situacao_descricao) sitSet.add(p.situacao_descricao);
      }
      setTipos(Array.from(tipoSet).sort());
      setSituacoes(Array.from(sitSet).sort());
      optionsLoaded.current = true;
    } catch {
      /* silent */
    }
  }, [politicianId, selectedYear, fetchProposicoes]);

  /* on open → reset & load */
  useEffect(() => {
    if (open) {
      setPage(1);
      setFilterTipo("");
      setFilterSituacao("");
      setSortField(null);
      setSortDir(null);
      optionsLoaded.current = false;
      load(1);
      loadFilterOptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* re-fetch when filters/sort change */
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!open) return;
    setPage(1);
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTipo, filterSituacao, sortField, sortDir]);

  const handlePageChange = (p: number) => {
    setPage(p);
    load(p);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      const next = nextSortDir(sortDir);
      if (next === null) {
        setSortField(null);
        setSortDir(null);
      } else {
        setSortDir(next);
      }
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const activeFilterCount = [filterTipo, filterSituacao].filter(Boolean).length;

  const clearFilters = () => {
    setFilterTipo("");
    setFilterSituacao("");
  };

  const getSortDir = (field: SortField): SortDir =>
    sortField === field ? sortDir : null;

  /* ── Pagination window ─────────────────────────────────── */
  const pageNumbers = useMemo(() => {
    const maxVisible = 5;
    if (pages <= maxVisible)
      return Array.from({ length: pages }, (_, i) => i + 1);
    let start: number;
    if (page <= 3) start = 1;
    else if (page >= pages - 2) start = pages - maxVisible + 1;
    else start = page - 2;
    return Array.from({ length: maxVisible }, (_, i) => start + i);
  }, [pages, page]);

  /* ── Render ────────────────────────────────────────────── */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-[95vw] max-w-5xl flex-col gap-0 overflow-hidden rounded-2xl border-gray-100 p-0">
        {/* ── Header ────────────────────────────────────── */}
        <DialogHeader className="shrink-0 border-b border-gray-100 bg-gradient-to-r from-[#4E9F3D]/[0.06] via-white to-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4E9F3D]/10">
              <FileText className="h-5 w-5 text-[#4E9F3D]" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900">
                Proposições no Período
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {total > 0
                  ? `${total} proposiç${total !== 1 ? "ões" : "ão"} encontrada${total !== 1 ? "s" : ""} em ${selectedYear}`
                  : `Proposições em ${selectedYear}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Filters ───────────────────────────────────── */}
        <div className="shrink-0 border-b border-gray-100 bg-gray-50/50 px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <Filter className="h-3.5 w-3.5" />
              Filtros
              {activeFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#4E9F3D] text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </div>

            <Select
              value={filterTipo || "__all__"}
              onValueChange={handleFilterTipo}
            >
              <SelectTrigger className="h-8 w-[140px] truncate rounded-lg border-gray-200 bg-white text-xs shadow-sm [&>span]:truncate">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="max-w-[300px]">
                <SelectItem value="__all__">Todos</SelectItem>
                {tipos.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterSituacao || "__all__"}
              onValueChange={handleFilterSituacao}
            >
              <SelectTrigger className="h-8 w-[200px] truncate rounded-lg border-gray-200 bg-white text-xs shadow-sm [&>span]:truncate">
                <SelectValue placeholder="Situação" />
              </SelectTrigger>
              <SelectContent className="max-w-[400px]">
                <SelectItem value="__all__">Todas</SelectItem>
                {situacoes.map((s) => (
                  <SelectItem key={s} value={s} textValue={s}>
                    <span className="block max-w-[360px] truncate" title={s}>
                      {s}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-200/60 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* ── Table ──────────────────────────────────────── */}
        <div className="min-h-0 flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-[#4E9F3D]" />
              <span className="ml-2 text-sm text-gray-500">
                Carregando proposições...
              </span>
            </div>
          ) : proposicoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FileText className="mb-3 h-10 w-10 text-gray-200" />
              <p className="text-sm font-medium text-gray-400">
                Nenhuma proposição encontrada
                {activeFilterCount > 0
                  ? " com os filtros selecionados."
                  : " no período."}
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-xs font-semibold text-[#4E9F3D] hover:underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm">
                <tr className="border-b border-gray-100">
                  <SortableHeader
                    label="Tipo"
                    field="tipo"
                    dir={getSortDir("tipo")}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Número"
                    field="numero"
                    dir={getSortDir("numero")}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Ano"
                    field="ano"
                    dir={getSortDir("ano")}
                    onSort={handleSort}
                  />
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                    Ementa
                  </th>
                  <SortableHeader
                    label="Apresentação"
                    field="data"
                    dir={getSortDir("data")}
                    onSort={handleSort}
                  />
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                    Situação
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                    Link
                  </th>
                </tr>
              </thead>
              <tbody>
                {proposicoes.map((p, idx) => (
                  <tr
                    key={p.id ?? idx}
                    className={cn(
                      "border-b border-gray-50 transition-colors hover:bg-[#4E9F3D]/[0.03]",
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/30",
                    )}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex rounded-md bg-[#4E9F3D]/10 px-2 py-0.5 text-xs font-bold text-[#4E9F3D]">
                        {p.sigla_tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap text-gray-800">
                      {p.numero}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {p.ano}
                    </td>
                    <td className="max-w-[300px] px-4 py-3">
                      <p
                        className="line-clamp-2 text-gray-700"
                        title={p.ementa}
                      >
                        {p.ementa}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-gray-600">
                        {formatPresentationDateTime(p.dt_apresentacao)}
                      </span>
                    </td>
                    <td className="max-w-[180px] px-4 py-3">
                      <span
                        className="inline-flex max-w-full truncate rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600"
                        title={p.situacao_descricao}
                      >
                        {p.situacao_descricao || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.uri_proposicao ? (
                        <a
                          href={p.uri_proposicao}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[#4E9F3D]/10 hover:text-[#4E9F3D]"
                          title="Abrir na Câmara"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ─────────────────────────────────── */}
        {pages > 1 && !loading && (
          <div className="flex shrink-0 items-center justify-between border-t border-gray-100 px-6 py-3">
            <span className="text-xs text-gray-400">
              Página {page} de {pages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {pageNumbers.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={cn(
                    "h-8 w-8 rounded-lg text-xs font-semibold transition-colors",
                    p === page
                      ? "bg-[#4E9F3D] text-white"
                      : "text-gray-500 hover:bg-gray-100",
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(Math.min(pages, page + 1))}
                disabled={page >= pages}
                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ── Sortable Header ─────────────────────────────────────── */

function SortableHeader({
  label,
  field,
  dir,
  onSort,
  className,
}: {
  label: string;
  field: SortField;
  dir: SortDir;
  onSort: (field: SortField) => void;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-[11px] font-bold tracking-wider text-gray-500 uppercase select-none",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-gray-800",
          dir !== null && "text-[#4E9F3D]",
        )}
      >
        {label}
        <SortIcon dir={dir} />
      </button>
    </th>
  );
}
