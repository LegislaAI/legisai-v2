"use client";

import { CustomPagination } from "@/components/ui/CustomPagination";
import { Card } from "@/components/v2/components/ui/Card";
import { EmptyState } from "@/components/v2/components/ui/EmptyState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/v2/components/ui/select";
import { useApiContext } from "@/context/ApiContext";
import { useDebounce } from "@/hooks/useDebounce";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkPlus,
  Calendar,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Filter,
  Link2,
  Search,
  Share2,
  Star,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type Ref = { id: string; name: string; acronym?: string };

type SavedSearch = {
  id: string;
  name: string;
  query: string;
  createdAt: string;
};

const SAVED_KEY = "legisai:proposicoes:savedSearches";

type Counters = {
  tramitacoes: number;
  relacionadas: number;
  eventos: number;
  autores: number;
  pareceres: number;
  documentos: number;
  requerimentos: number;
};

type Proposition = {
  id: string;
  description: string;
  typeAcronym: string;
  number: number;
  year: number;
  presentationDate: string;
  fullPropositionUrl?: string;
  regime?: string;
  situationDescription?: string;
  movementDescription?: string;
  lastMovementDate?: string;
  type: Ref;
  situation: Ref | null;
  authors?: { id: string; name: string }[];
  counters?: Counters;
};

const REGIME_OPTIONS = [
  { value: "Ordinário", label: "Ordinário" },
  { value: "Prioridade", label: "Prioridade" },
  { value: "Urgência", label: "Urgência" },
];

function getRegimeTone(regime?: string) {
  if (!regime) return "bg-gray-100 text-gray-600";
  const r = regime.toLowerCase();
  if (r.includes("urg")) return "bg-red-50 text-red-700";
  if (r.includes("prior")) return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

export default function PropositionsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { GetAPI } = useApiContext();

  const [types, setTypes] = useState<Ref[]>([]);
  const [themes, setThemes] = useState<Ref[]>([]);
  const [situations, setSituations] = useState<Ref[]>([]);
  const [authorTypes, setAuthorTypes] = useState<Ref[]>([]);
  const [parties, setParties] = useState<string[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);

  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingRefs, setLoadingRefs] = useState(true);

  const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
  const [typeId, setTypeId] = useState<string>(searchParams.get("typeId") ?? "");
  const [themeId, setThemeId] = useState<string>(searchParams.get("themeId") ?? "");
  const [situationId, setSituationId] = useState<string>(searchParams.get("situationId") ?? "");
  const [regime, setRegime] = useState<string>(searchParams.get("regime") ?? "");
  const [presentedFrom, setPresentedFrom] = useState<string>(searchParams.get("presentedFrom") ?? "");
  const [presentedTo, setPresentedTo] = useState<string>(searchParams.get("presentedTo") ?? "");
  const [partyAcronym, setPartyAcronym] = useState<string>(searchParams.get("partyAcronym") ?? "");
  const [uf, setUf] = useState<string>(searchParams.get("uf") ?? "");
  const [authorTypeId, setAuthorTypeId] = useState<string>(searchParams.get("authorTypeId") ?? "");
  const [hasAttached, setHasAttached] = useState<boolean>(searchParams.get("hasAttached") === "true");
  const [hasAmendment, setHasAmendment] = useState<boolean>(searchParams.get("hasAmendment") === "true");
  const [hasOpinion, setHasOpinion] = useState<boolean>(searchParams.get("hasOpinion") === "true");
  const [hasRequirement, setHasRequirement] = useState<boolean>(searchParams.get("hasRequirement") === "true");
  const [hasDispatch, setHasDispatch] = useState<boolean>(searchParams.get("hasDispatch") === "true");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") ?? "");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 400);

  const fetchReferences = useCallback(async () => {
    setLoadingRefs(true);
    try {
      const res = await GetAPI("/proposition/references", true);
      if (res.status === 200 && res.body) {
        setTypes(res.body.types ?? []);
        setThemes(res.body.themes ?? []);
        setSituations(res.body.situations ?? []);
        setAuthorTypes(res.body.authorTypes ?? []);
        setParties(res.body.parties ?? []);
        setUfs(res.body.ufs ?? []);
      }
    } catch {
      setTypes([]);
      setThemes([]);
      setSituations([]);
      setAuthorTypes([]);
      setParties([]);
      setUfs([]);
    } finally {
      setLoadingRefs(false);
    }
  }, [GetAPI]);

  const fetchPropositions = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("page", String(page));
      if (typeId) qs.set("typeId", typeId);
      if (themeId) qs.set("themeId", themeId);
      if (situationId) qs.set("situationId", situationId);
      if (regime) qs.set("regime", regime);
      if (presentedFrom) qs.set("presentedFrom", presentedFrom);
      if (presentedTo) qs.set("presentedTo", presentedTo);
      if (partyAcronym) qs.set("partyAcronym", partyAcronym);
      if (uf) qs.set("uf", uf);
      if (authorTypeId) qs.set("authorTypeId", authorTypeId);
      if (hasAttached) qs.set("hasAttached", "true");
      if (hasAmendment) qs.set("hasAmendment", "true");
      if (hasOpinion) qs.set("hasOpinion", "true");
      if (hasRequirement) qs.set("hasRequirement", "true");
      if (hasDispatch) qs.set("hasDispatch", "true");
      const res = await GetAPI(`/proposition?${qs.toString()}`, true);
      if (res.status === 200 && res.body) {
        setPropositions(res.body.propositions ?? []);
        setPages(res.body.pages ?? 0);
      }
    } catch {
      setPropositions([]);
      setPages(0);
    } finally {
      setLoading(false);
    }
  }, [
    GetAPI,
    page,
    typeId,
    themeId,
    situationId,
    regime,
    presentedFrom,
    presentedTo,
    partyAcronym,
    uf,
    authorTypeId,
    hasAttached,
    hasAmendment,
    hasOpinion,
    hasRequirement,
    hasDispatch,
  ]);

  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  useEffect(() => {
    fetchPropositions();
  }, [fetchPropositions]);

  useEffect(() => {
    setPage(1);
  }, [
    typeId,
    themeId,
    situationId,
    regime,
    presentedFrom,
    presentedTo,
    partyAcronym,
    uf,
    authorTypeId,
    hasAttached,
    hasAmendment,
    hasOpinion,
    hasRequirement,
    hasDispatch,
  ]);

  // Serializa filtros na URL para permitir compartilhamento
  useEffect(() => {
    const qs = new URLSearchParams();
    if (page > 1) qs.set("page", String(page));
    if (typeId) qs.set("typeId", typeId);
    if (themeId) qs.set("themeId", themeId);
    if (situationId) qs.set("situationId", situationId);
    if (regime) qs.set("regime", regime);
    if (presentedFrom) qs.set("presentedFrom", presentedFrom);
    if (presentedTo) qs.set("presentedTo", presentedTo);
    if (partyAcronym) qs.set("partyAcronym", partyAcronym);
    if (uf) qs.set("uf", uf);
    if (authorTypeId) qs.set("authorTypeId", authorTypeId);
    if (hasAttached) qs.set("hasAttached", "true");
    if (hasAmendment) qs.set("hasAmendment", "true");
    if (hasOpinion) qs.set("hasOpinion", "true");
    if (hasRequirement) qs.set("hasRequirement", "true");
    if (hasDispatch) qs.set("hasDispatch", "true");
    if (searchTerm) qs.set("q", searchTerm);
    const next = qs.toString();
    router.replace(`/proposicoes${next ? `?${next}` : ""}`, { scroll: false });
  }, [
    page,
    typeId,
    themeId,
    situationId,
    regime,
    presentedFrom,
    presentedTo,
    partyAcronym,
    uf,
    authorTypeId,
    hasAttached,
    hasAmendment,
    hasOpinion,
    hasRequirement,
    hasDispatch,
    searchTerm,
    router,
  ]);

  const handlePropositionClick = (id: string) => {
    router.push(`/proposicoes/${id}`);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setTypeId("");
    setThemeId("");
    setSituationId("");
    setRegime("");
    setPresentedFrom("");
    setPresentedTo("");
    setPartyAcronym("");
    setUf("");
    setAuthorTypeId("");
    setHasAttached(false);
    setHasAmendment(false);
    setHasOpinion(false);
    setHasRequirement(false);
    setHasDispatch(false);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  // Carrega pesquisas salvas do localStorage uma vez na montagem
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVED_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedSearch[];
        if (Array.isArray(parsed)) setSavedSearches(parsed);
      }
    } catch {
      /* ignora storage indisponível */
    }
  }, []);

  const persistSaved = (next: SavedSearch[]) => {
    setSavedSearches(next);
    try {
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {
      /* ignora quota */
    }
  };

  const handleSaveSearch = () => {
    if (!hasActiveFilters) return;
    const suggested = buildSearchLabel({
      typeName: activeTypeName,
      themeName: activeThemeName,
      situationName: activeSituationName,
      regime,
      partyAcronym,
      uf,
      query: searchTerm,
    });
    const name = window.prompt("Nome da pesquisa:", suggested);
    if (!name) return;
    const query = window.location.search.replace(/^\?/, "");
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const next: SavedSearch[] = [
      { id, name: name.trim(), query, createdAt: new Date().toISOString() },
      ...savedSearches,
    ].slice(0, 30);
    persistSaved(next);
  };

  const handleApplySaved = (s: SavedSearch) => {
    router.replace(`/proposicoes${s.query ? `?${s.query}` : ""}`);
    setShowSaved(false);
    // Recarrega para reaplicar o estado a partir da URL
    if (typeof window !== "undefined") {
      window.location.assign(`/proposicoes${s.query ? `?${s.query}` : ""}`);
    }
  };

  const handleDeleteSaved = (id: string) => {
    persistSaved(savedSearches.filter((s) => s.id !== id));
  };

  const handleExportCsv = () => {
    if (!propositions.length) return;
    const header = [
      "Identificador",
      "Tipo",
      "Número",
      "Ano",
      "Apresentação",
      "Situação",
      "Regime",
      "Última ação",
      "Autor principal",
      "Ementa",
      "URL",
    ];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v).replace(/\r?\n/g, " ").replace(/"/g, '""');
      return `"${s}"`;
    };
    const rows = propositions.map((p) => [
      `${p.typeAcronym} ${p.number}/${p.year}`,
      p.type?.name,
      p.number,
      p.year,
      p.presentationDate
        ? new Date(p.presentationDate).toLocaleDateString("pt-BR")
        : "",
      p.situation?.name ?? p.situationDescription ?? "",
      p.regime ?? "",
      p.lastMovementDate
        ? new Date(p.lastMovementDate).toLocaleDateString("pt-BR")
        : "",
      p.authors?.[0]?.name ?? "",
      p.description ?? "",
      p.fullPropositionUrl ?? "",
    ]);
    const csv = [header, ...rows].map((r) => r.map(escape).join(";")).join("\r\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `proposicoes_${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredPropositions = useMemo(
    () =>
      propositions.filter((p) => {
        if (!debouncedSearch) return true;
        const lower = debouncedSearch.toLowerCase();
        return (
          p.description?.toLowerCase().includes(lower) ||
          `${p.typeAcronym} ${p.number}/${p.year}`.toLowerCase().includes(lower) ||
          (p.authors ?? []).some((a) => a.name?.toLowerCase().includes(lower))
        );
      }),
    [propositions, debouncedSearch]
  );

  const hasActiveFilters = !!(
    typeId ||
    themeId ||
    situationId ||
    regime ||
    presentedFrom ||
    presentedTo ||
    partyAcronym ||
    uf ||
    authorTypeId ||
    hasAttached ||
    hasAmendment ||
    hasOpinion ||
    hasRequirement ||
    hasDispatch ||
    debouncedSearch
  );

  const activeTypeName = types.find((t) => t.id === typeId)?.acronym || types.find((t) => t.id === typeId)?.name;
  const activeThemeName = themes.find((t) => t.id === themeId)?.name;
  const activeSituationName = situations.find((t) => t.id === situationId)?.name;

  return (
    <div className="min-h-screen w-full font-sans text-[#1a1d1f] pb-20">
      {/* ── HERO ── */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#5a8a42] via-secondary to-[#8bb574] p-8 text-white shadow-xl md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <FileText size={22} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Proposições</h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-white/80">
            Explore, filtre e acompanhe matérias legislativas com visão processual, documental e
            analítica.
          </p>
        </div>
      </div>

      {/* ── BARRA DE BUSCA + AÇÕES RÁPIDAS ── */}
      <div className="sticky top-0 z-20 mb-6 rounded-2xl border border-gray-200/60 bg-white/85 p-5 shadow-md backdrop-blur-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Busque por número, ementa, autor, relator, comissão, palavra-chave ou legislação citada"
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm transition-all placeholder:text-gray-400 focus:border-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtros rápidos */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Select value={typeId || "all"} onValueChange={(v) => setTypeId(v === "all" ? "" : v)}>
            <SelectTrigger className="h-9 w-full rounded-lg border-gray-200 bg-gray-50/50 text-xs sm:w-[170px]">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {types.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.acronym || t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={situationId || "all"} onValueChange={(v) => setSituationId(v === "all" ? "" : v)}>
            <SelectTrigger className="h-9 w-full rounded-lg border-gray-200 bg-gray-50/50 text-xs sm:w-[180px]">
              <SelectValue placeholder="Todas as situações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as situações</SelectItem>
              {situations.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={regime || "all"} onValueChange={(v) => setRegime(v === "all" ? "" : v)}>
            <SelectTrigger className="h-9 w-full rounded-lg border-gray-200 bg-gray-50/50 text-xs sm:w-[160px]">
              <SelectValue placeholder="Todos os regimes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os regimes</SelectItem>
              {REGIME_OPTIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Filter size={13} />
            {showAdvanced ? "Ocultar filtros" : "Mais filtros"}
          </button>

          <div className="ml-auto flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                <X size={13} />
                Limpar filtros
              </button>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
              title="Copia a URL com filtros aplicados"
            >
              <Share2 size={13} />
              {copied ? "Copiado!" : "Compartilhar"}
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={!propositions.length}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              title="Exporta a página atual em CSV"
            >
              <Download size={13} />
              Exportar CSV
            </button>
            <button
              type="button"
              onClick={handleSaveSearch}
              disabled={!hasActiveFilters}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              title="Salva os filtros atuais neste dispositivo"
            >
              <BookmarkPlus size={13} />
              Salvar
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSaved((v) => !v)}
                disabled={!savedSearches.length}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Bookmark size={13} />
                Salvas
                {savedSearches.length > 0 && (
                  <span className="rounded-full bg-secondary/10 px-1.5 text-[10px] font-bold text-secondary">
                    {savedSearches.length}
                  </span>
                )}
              </button>
              {showSaved && savedSearches.length > 0 && (
                <div className="absolute right-0 z-30 mt-2 max-h-80 w-72 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                    Pesquisas neste dispositivo
                  </p>
                  {savedSearches.map((s) => (
                    <div
                      key={s.id}
                      className="group flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-gray-50"
                    >
                      <Star size={12} className="shrink-0 text-amber-400" />
                      <button
                        type="button"
                        onClick={() => handleApplySaved(s)}
                        className="min-w-0 flex-1 truncate text-left text-xs font-medium text-gray-800"
                        title={s.name}
                      >
                        {s.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSaved(s.id)}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                        title="Excluir"
                      >
                        <Trash2 size={12} className="text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filtros avançados */}
        {showAdvanced && (
          <div className="mt-4 space-y-4 rounded-xl border border-gray-100 bg-gray-50/40 p-4">
            {/* Bloco — Período + Tema */}
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                Período & tema
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-500">
                    Apresentação — de
                  </label>
                  <input
                    type="date"
                    value={presentedFrom}
                    onChange={(e) => setPresentedFrom(e.target.value)}
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-500">
                    Apresentação — até
                  </label>
                  <input
                    type="date"
                    value={presentedTo}
                    onChange={(e) => setPresentedTo(e.target.value)}
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] font-medium text-gray-500">
                    Tema
                  </label>
                  <Select value={themeId || "all"} onValueChange={(v) => setThemeId(v === "all" ? "" : v)}>
                    <SelectTrigger className="h-9 w-full rounded-lg border-gray-200 bg-white text-xs">
                      <SelectValue placeholder="Todos os temas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os temas</SelectItem>
                      {themes.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Bloco — Autoria */}
            <div className="border-t border-gray-100 pt-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                Autoria
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-500">
                    Partido
                  </label>
                  <Select value={partyAcronym || "all"} onValueChange={(v) => setPartyAcronym(v === "all" ? "" : v)}>
                    <SelectTrigger className="h-9 w-full rounded-lg border-gray-200 bg-white text-xs">
                      <SelectValue placeholder="Todos os partidos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os partidos</SelectItem>
                      {parties.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-500">UF</label>
                  <Select value={uf || "all"} onValueChange={(v) => setUf(v === "all" ? "" : v)}>
                    <SelectTrigger className="h-9 w-full rounded-lg border-gray-200 bg-white text-xs">
                      <SelectValue placeholder="Todas as UFs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as UFs</SelectItem>
                      {ufs.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-500">
                    Tipo de autor
                  </label>
                  <Select value={authorTypeId || "all"} onValueChange={(v) => setAuthorTypeId(v === "all" ? "" : v)}>
                    <SelectTrigger className="h-9 w-full rounded-lg border-gray-200 bg-white text-xs">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {authorTypes.map((at) => (
                        <SelectItem key={at.id} value={at.id}>
                          {at.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Bloco — Tramitação (booleans) */}
            <div className="border-t border-gray-100 pt-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                Tramitação
              </p>
              <div className="flex flex-wrap gap-2">
                <BoolPill label="Tem despacho" checked={hasDispatch} onToggle={() => setHasDispatch(!hasDispatch)} />
                <BoolPill label="Tem apensados" checked={hasAttached} onToggle={() => setHasAttached(!hasAttached)} />
                <BoolPill label="Tem emendas" checked={hasAmendment} onToggle={() => setHasAmendment(!hasAmendment)} />
                <BoolPill label="Tem parecer" checked={hasOpinion} onToggle={() => setHasOpinion(!hasOpinion)} />
                <BoolPill label="Tem requerimento" checked={hasRequirement} onToggle={() => setHasRequirement(!hasRequirement)} />
              </div>
            </div>
          </div>
        )}

        {/* Chips de filtros ativos */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {debouncedSearch && (
              <FilterChip label={`"${debouncedSearch}"`} onRemove={() => setSearchTerm("")} />
            )}
            {activeTypeName && <FilterChip label={activeTypeName} onRemove={() => setTypeId("")} />}
            {activeThemeName && <FilterChip label={activeThemeName} onRemove={() => setThemeId("")} />}
            {activeSituationName && (
              <FilterChip label={activeSituationName} onRemove={() => setSituationId("")} />
            )}
            {regime && <FilterChip label={`Regime: ${regime}`} onRemove={() => setRegime("")} />}
            {(presentedFrom || presentedTo) && (
              <FilterChip
                label={`Período: ${presentedFrom || "…"} → ${presentedTo || "…"}`}
                onRemove={() => {
                  setPresentedFrom("");
                  setPresentedTo("");
                }}
              />
            )}
            {partyAcronym && <FilterChip label={`Partido: ${partyAcronym}`} onRemove={() => setPartyAcronym("")} />}
            {uf && <FilterChip label={`UF: ${uf}`} onRemove={() => setUf("")} />}
            {authorTypeId && (
              <FilterChip
                label={`Tipo autor: ${authorTypes.find((a) => a.id === authorTypeId)?.name ?? authorTypeId}`}
                onRemove={() => setAuthorTypeId("")}
              />
            )}
            {hasDispatch && <FilterChip label="Tem despacho" onRemove={() => setHasDispatch(false)} />}
            {hasAttached && <FilterChip label="Tem apensados" onRemove={() => setHasAttached(false)} />}
            {hasAmendment && <FilterChip label="Tem emendas" onRemove={() => setHasAmendment(false)} />}
            {hasOpinion && <FilterChip label="Tem parecer" onRemove={() => setHasOpinion(false)} />}
            {hasRequirement && <FilterChip label="Tem requerimento" onRemove={() => setHasRequirement(false)} />}
          </div>
        )}
      </div>

      {/* ── HEADER DE RESULTADOS ── */}
      {!loading && filteredPropositions.length > 0 && (
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-[#1a1d1f]">{filteredPropositions.length}</span>{" "}
            proposições listadas
            {pages > 1 && (
              <span>
                {" · Página "}
                <span className="font-semibold text-[#1a1d1f]">{page}</span>
                {" de "}
                {pages}
              </span>
            )}
          </p>
        </div>
      )}

      {/* ── LISTA DE CARDS ── */}
      {loading || loadingRefs ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 w-3/4 rounded-lg bg-gray-200" />
                  <div className="h-3 w-1/2 rounded-lg bg-gray-100" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full rounded-lg bg-gray-100" />
                    <div className="h-3 w-5/6 rounded-lg bg-gray-100" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredPropositions.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPropositions.map((prop) => (
            <PropositionCard key={prop.id} prop={prop} onClick={() => handlePropositionClick(prop.id)} />
          ))}
        </div>
      ) : (
        <EmptyState
          variant={hasActiveFilters ? "no-occurrence" : "no-source"}
          title={hasActiveFilters ? "Nenhuma proposição para esses filtros" : "Nenhuma proposição encontrada"}
          message={
            hasActiveFilters
              ? "Tente afrouxar os filtros ou limpar a busca para ver mais matérias."
              : "Aguardando ingestão de novas matérias."
          }
          action={
            hasActiveFilters ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-white transition-colors"
              >
                <X size={13} /> Limpar filtros
              </button>
            ) : null
          }
        />
      )}

      {/* ── PAGINAÇÃO ── */}
      {pages > 1 && !loading && filteredPropositions.length > 0 && (
        <div className="mt-8 flex justify-center pb-12">
          <CustomPagination pages={pages} currentPage={page} setCurrentPage={setPage} />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────── */

function buildSearchLabel(args: {
  typeName?: string;
  themeName?: string;
  situationName?: string;
  regime?: string;
  partyAcronym?: string;
  uf?: string;
  query?: string;
}) {
  const parts: string[] = [];
  if (args.query) parts.push(`"${args.query}"`);
  if (args.typeName) parts.push(args.typeName);
  if (args.themeName) parts.push(args.themeName);
  if (args.situationName) parts.push(args.situationName);
  if (args.regime) parts.push(args.regime);
  if (args.partyAcronym) parts.push(args.partyAcronym);
  if (args.uf) parts.push(args.uf);
  return parts.length ? parts.join(" · ") : "Minha pesquisa";
}

function CounterRow({ counters }: { counters: Counters }) {
  const items: { label: string; value: number }[] = [
    { label: "tramitações", value: counters.tramitacoes },
    { label: "autores", value: counters.autores },
    { label: "relacionadas", value: counters.relacionadas },
    { label: "eventos", value: counters.eventos },
  ];
  const visible = items.filter((i) => i.value > 0);
  if (visible.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-gray-50 pt-3">
      {visible.map((i) => (
        <span
          key={i.label}
          className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
        >
          <span className="font-bold text-gray-800">{i.value}</span>
          {i.label}
        </span>
      ))}
    </div>
  );
}

function BoolPill({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        checked
          ? "border-secondary/30 bg-secondary/10 text-secondary"
          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          checked ? "bg-secondary" : "bg-gray-300"
        }`}
      />
      {label}
    </button>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary transition-colors hover:bg-secondary/20"
    >
      {label}
      <X size={11} />
    </button>
  );
}

function PropositionCard({ prop, onClick }: { prop: Proposition; onClick: () => void }) {
  const author = prop.authors?.[0]?.name;
  const presentation = new Date(prop.presentationDate).toLocaleDateString("pt-BR");
  const lastMove = prop.lastMovementDate
    ? new Date(prop.lastMovementDate).toLocaleDateString("pt-BR")
    : null;
  const regimeTone = getRegimeTone(prop.regime);
  const situation = prop.situation?.name || prop.situationDescription;

  return (
    <Card
      className="group relative flex cursor-pointer flex-col border-gray-100 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-lg"
      onClick={onClick}
    >
      <div className="bg-secondary absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      {/* Faixa 1 — identificação */}
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition-colors group-hover:bg-secondary/20">
          <FileText size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-[#1a1d1f] transition-colors group-hover:text-secondary">
              {prop.typeAcronym} {prop.number}/{prop.year}
            </h3>
            <ChevronRight
              size={16}
              className="shrink-0 text-secondary transition-all duration-200 group-hover:translate-x-1"
            />
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-gray-500">{prop.type?.name}</p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {situation && (
              <span className="inline-flex shrink-0 items-center rounded-md bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary">
                {situation}
              </span>
            )}
            {prop.regime && (
              <span className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${regimeTone}`}>
                {prop.regime}
              </span>
            )}
          </div>

          {/* Faixa 2 — síntese */}
          <p
            className="mt-3 line-clamp-2 text-xs leading-relaxed text-gray-600"
            title={prop.description}
          >
            {prop.description || "Sem ementa integrada."}
          </p>

          {/* Faixa 3 — metadados processuais */}
          <div className="mt-3 grid gap-1.5 text-[11px] text-gray-500">
            {author && (
              <div className="flex items-center gap-1.5">
                <User size={11} className="text-gray-400" />
                <span className="truncate">{author}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar size={11} className="text-gray-400" />
              <span>Apresentada em {presentation}</span>
            </div>
            {lastMove && (
              <div className="flex items-center gap-1.5">
                <Clock size={11} className="text-gray-400" />
                <span className="truncate">
                  Última ação: {lastMove}
                  {prop.movementDescription ? ` — ${prop.movementDescription}` : ""}
                </span>
              </div>
            )}
            {!author && (
              <div className="flex items-center gap-1.5 text-gray-400">
                <User size={11} />
                <span className="italic">Sem autoria integrada</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Faixa 4 — contadores (só não-zero, evita poluição) */}
      {prop.counters && (
        <CounterRow counters={prop.counters} />
      )}

      {/* Faixa 5 — ações */}
      <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-gray-50 pt-3">
        {prop.fullPropositionUrl && (
          <a
            href={prop.fullPropositionUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <Link2 size={11} /> Inteiro teor
          </a>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-secondary/90"
        >
          Ver matéria <ArrowUpRight size={11} />
        </button>
      </div>
    </Card>
  );
}
