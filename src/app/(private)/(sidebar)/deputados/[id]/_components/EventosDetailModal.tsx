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
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Loader2,
  MapPin,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EventoAgenda } from "./types";

/* ── Types ─────────────────────────────────────────────────── */

interface FetchParams {
  dataInicio: string;
  dataFim: string;
  page: number;
  pageSize: number;
  situacao?: string;
  tipoEvento?: string;
  orgao?: string;
  orderBy?: string;
  orderDir?: string;
}

interface EventosDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  politicianId: string;
  selectedYear: string;
  fetchEventos: (
    params: FetchParams,
  ) => Promise<{ eventos: EventoAgenda[]; total: number; pages: number }>;
}

type SortDir = "asc" | "desc" | null;
type SortField = "data" | "tipo" | "orgao" | "situacao";

const PAGE_SIZE = 10;

/* ── Helpers ───────────────────────────────────────────────── */

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
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

export function EventosDetailModal({
  open,
  onOpenChange,
  politicianId,
  selectedYear,
  fetchEventos,
}: EventosDetailModalProps) {
  /* state: data */
  const [eventos, setEventos] = useState<EventoAgenda[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  /* state: filters */
  const [filterSituacao, setFilterSituacao] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterOrgao, setFilterOrgao] = useState("");

  const handleFilterSituacao = (v: string) => setFilterSituacao(v === "__all__" ? "" : v);
  const handleFilterTipo = (v: string) => setFilterTipo(v === "__all__" ? "" : v);
  const handleFilterOrgao = (v: string) => setFilterOrgao(v === "__all__" ? "" : v);

  /* state: sort */
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  /* state: filter options (collected from first unfiltered load) */
  const [situacoes, setSituacoes] = useState<string[]>([]);
  const [tipos, setTipos] = useState<{ id: string; label: string }[]>([]);
  const [orgaos, setOrgaos] = useState<{ id: string; label: string }[]>([]);
  const optionsLoaded = useRef(false);

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
        if (filterSituacao) params.situacao = filterSituacao;
        if (filterTipo) params.tipoEvento = filterTipo;
        if (filterOrgao) params.orgao = filterOrgao;
        if (sortField && sortDir) {
          params.orderBy = sortField;
          params.orderDir = sortDir;
        }
        const result = await fetchEventos(params);
        setEventos(result.eventos);
        setTotal(result.total);
        setPages(result.pages);
      } catch {
        setEventos([]);
        setTotal(0);
        setPages(0);
      } finally {
        setLoading(false);
      }
    },
    [
      politicianId,
      selectedYear,
      fetchEventos,
      filterSituacao,
      filterTipo,
      filterOrgao,
      sortField,
      sortDir,
    ],
  );

  /* Load filter options on first open (unfiltered, large page) */
  const loadFilterOptions = useCallback(async () => {
    if (!politicianId || optionsLoaded.current) return;
    try {
      const result = await fetchEventos({
        dataInicio: `${selectedYear}-01-01`,
        dataFim: `${selectedYear}-12-31`,
        page: 1,
        pageSize: 500,
      });
      const sitSet = new Set<string>();
      const tipoMap = new Map<string, string>();
      const orgaoMap = new Map<string, string>();
      for (const ev of result.eventos) {
        if (ev.cod_situacao_evento) sitSet.add(ev.cod_situacao_evento);
        if (ev.cod_tipo_evento)
          tipoMap.set(ev.cod_tipo_evento, ev.descricao_tipo_evento);
        if (ev.sigla_orgao) orgaoMap.set(ev.sigla_orgao, ev.nome_orgao);
      }
      setSituacoes(Array.from(sitSet).sort());
      setTipos(
        Array.from(tipoMap.entries())
          .map(([id, label]) => ({ id, label }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      );
      setOrgaos(
        Array.from(orgaoMap.entries())
          .map(([id, label]) => ({ id, label: `${id} - ${label}` }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      );
      optionsLoaded.current = true;
    } catch {
      /* silent */
    }
  }, [politicianId, selectedYear, fetchEventos]);

  /* on open → reset & load */
  useEffect(() => {
    if (open) {
      setPage(1);
      setFilterSituacao("");
      setFilterTipo("");
      setFilterOrgao("");
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
  }, [filterSituacao, filterTipo, filterOrgao, sortField, sortDir]);

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

  const activeFilterCount = [filterSituacao, filterTipo, filterOrgao].filter(
    Boolean,
  ).length;

  const clearFilters = () => {
    setFilterSituacao("");
    setFilterTipo("");
    setFilterOrgao("");
  };

  const getSortDir = (field: SortField): SortDir =>
    sortField === field ? sortDir : null;

  /* ── Pagination window ─────────────────────────────────── */
  const pageNumbers = useMemo(() => {
    const maxVisible = 5;
    if (pages <= maxVisible) return Array.from({ length: pages }, (_, i) => i + 1);
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
        <DialogHeader className="shrink-0 border-b border-gray-100 bg-gradient-to-r from-[#749c5b]/[0.06] via-white to-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#749c5b]/10">
              <Calendar className="h-5 w-5 text-[#749c5b]" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900">
                Eventos no Período
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {total > 0
                  ? `${total} evento${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""} em ${selectedYear}`
                  : `Eventos em ${selectedYear}`}
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
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#749c5b] text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </div>

            <Select value={filterSituacao || "__all__"} onValueChange={handleFilterSituacao}>
              <SelectTrigger className="h-8 w-[160px] truncate rounded-lg border-gray-200 bg-white text-xs shadow-sm [&>span]:truncate">
                <SelectValue placeholder="Situação" />
              </SelectTrigger>
              <SelectContent className="max-w-[320px]">
                <SelectItem value="__all__">Todas</SelectItem>
                {situacoes.map((s) => (
                  <SelectItem key={s} value={s} className="truncate">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterTipo || "__all__"} onValueChange={handleFilterTipo}>
              <SelectTrigger className="h-8 w-[180px] truncate rounded-lg border-gray-200 bg-white text-xs shadow-sm [&>span]:truncate">
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent className="max-w-[360px]">
                <SelectItem value="__all__">Todos</SelectItem>
                {tipos.map((t) => (
                  <SelectItem key={t.id} value={t.id} textValue={t.label}>
                    <span className="block max-w-[320px] truncate" title={t.label}>
                      {t.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterOrgao || "__all__"} onValueChange={handleFilterOrgao}>
              <SelectTrigger className="h-8 w-[200px] truncate rounded-lg border-gray-200 bg-white text-xs shadow-sm [&>span]:truncate">
                <SelectValue placeholder="Órgão" />
              </SelectTrigger>
              <SelectContent className="max-w-[420px]">
                <SelectItem value="__all__">Todos</SelectItem>
                {orgaos.map((o) => (
                  <SelectItem key={o.id} value={o.id} textValue={o.id}>
                    <span className="block max-w-[380px] truncate" title={o.label}>
                      {o.label}
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
              <Loader2 className="h-6 w-6 animate-spin text-[#749c5b]" />
              <span className="ml-2 text-sm text-gray-500">
                Carregando eventos...
              </span>
            </div>
          ) : eventos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Calendar className="mb-3 h-10 w-10 text-gray-200" />
              <p className="text-sm font-medium text-gray-400">
                Nenhum evento encontrado
                {activeFilterCount > 0 ? " com os filtros selecionados." : " no período."}
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-xs font-semibold text-[#749c5b] hover:underline"
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
                    label="Data / Hora"
                    field="data"
                    dir={getSortDir("data")}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Tipo"
                    field="tipo"
                    dir={getSortDir("tipo")}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Órgão"
                    field="orgao"
                    dir={getSortDir("orgao")}
                    onSort={handleSort}
                    className="hidden md:table-cell"
                  />
                  <th className="hidden px-4 py-3 text-left text-[11px] font-bold tracking-wider text-gray-500 uppercase lg:table-cell">
                    Local
                  </th>
                  <SortableHeader
                    label="Situação"
                    field="situacao"
                    dir={getSortDir("situacao")}
                    onSort={handleSort}
                  />
                </tr>
              </thead>
              <tbody>
                {eventos.map((ev, idx) => {
                  const { date, time } = formatDateTime(ev.dt_inicio);
                  return (
                    <tr
                      key={ev.id ?? idx}
                      className={cn(
                        "border-b border-gray-50 transition-colors hover:bg-[#749c5b]/[0.03]",
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/30",
                      )}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="hidden h-3.5 w-3.5 shrink-0 text-gray-400 sm:block" />
                          <div>
                            <p className="font-semibold text-gray-800">
                              {date}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              {time}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[200px] px-4 py-3">
                        <p
                          className="truncate font-medium text-gray-700"
                          title={ev.descricao_tipo_evento}
                        >
                          {ev.descricao_tipo_evento}
                        </p>
                        {ev.descricao && (
                          <p
                            className="mt-0.5 truncate text-xs text-gray-400"
                            title={ev.descricao}
                          >
                            {ev.descricao}
                          </p>
                        )}
                      </td>
                      <td className="hidden max-w-[180px] px-4 py-3 md:table-cell">
                        <p
                          className="truncate font-semibold text-[#749c5b]"
                          title={ev.nome_orgao}
                        >
                          {ev.sigla_orgao}
                        </p>
                        <p
                          className="mt-0.5 truncate text-xs text-gray-400"
                          title={ev.nome_orgao}
                        >
                          {ev.nome_orgao}
                        </p>
                      </td>
                      <td className="hidden max-w-[160px] px-4 py-3 lg:table-cell">
                        {ev.local_evento ? (
                          <p
                            className="flex items-center gap-1 truncate text-gray-500"
                            title={ev.local_evento}
                          >
                            <MapPin className="h-3 w-3 shrink-0" />
                            {ev.local_evento}
                          </p>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                          {ev.cod_situacao_evento || "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
                      ? "bg-[#749c5b] text-white"
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
        "select-none px-4 py-3 text-left text-[11px] font-bold tracking-wider text-gray-500 uppercase",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-gray-800",
          dir !== null && "text-[#749c5b]",
        )}
      >
        {label}
        <SortIcon dir={dir} />
      </button>
    </th>
  );
}
