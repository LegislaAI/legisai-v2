"use client";

import { CustomPagination } from "@/components/ui/CustomPagination";
import { Card } from "@/components/v2/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/v2/components/ui/select";
import { useApiContext } from "@/context/ApiContext";
import { useDebounce } from "@/hooks/useDebounce";
import { ChevronRight, FileText, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Ref = { id: string; name: string; acronym?: string };
type Proposition = {
  id: string;
  description: string;
  typeAcronym: string;
  number: number;
  year: number;
  presentationDate: string;
  fullPropositionUrl?: string;
  type: Ref;
  situation: Ref | null;
};

export default function PropositionsListPage() {
  const router = useRouter();
  const { GetAPI } = useApiContext();

  const [types, setTypes] = useState<Ref[]>([]);
  const [themes, setThemes] = useState<Ref[]>([]);
  const [situations, setSituations] = useState<Ref[]>([]);
  
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingRefs, setLoadingRefs] = useState(true);
  
  const [page, setPage] = useState(1);
  const [typeId, setTypeId] = useState<string>("");
  const [themeId, setThemeId] = useState<string>("");
  const [situationId, setSituationId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useDebounce(searchTerm, 400);

  const fetchReferences = useCallback(async () => {
    setLoadingRefs(true);
    try {
      const res = await GetAPI("/proposition/references", true);
      if (res.status === 200 && res.body) {
        setTypes(res.body.types ?? []);
        setThemes(res.body.themes ?? []);
        setSituations(res.body.situations ?? []);
      }
    } catch {
      setTypes([]);
      setThemes([]);
      setSituations([]);
    } finally {
      setLoadingRefs(false);
    }
  }, [GetAPI]);

  const fetchPropositions = useCallback(async () => {
    setLoading(true);
    try {
      let q = `?page=${page}`;
      if (typeId) q += `&typeId=${typeId}`;
      if (themeId) q += `&themeId=${themeId}`;
      if (situationId) q += `&situationId=${situationId}`;
      const res = await GetAPI(`/proposition${q}`, true);
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
  }, [GetAPI, page, typeId, themeId, situationId]);

  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  useEffect(() => {
    fetchPropositions();
  }, [fetchPropositions]);

  useEffect(() => {
    setPage(1);
  }, [typeId, themeId, situationId]);

  const handlePropositionClick = (id: string) => {
    router.push(`/propositions/${id}`);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setTypeId("");
    setThemeId("");
    setSituationId("");
  };

  const filteredPropositions = propositions.filter((p) => {
    if (!debouncedSearch) return true;
    const lowerSearch = debouncedSearch.toLowerCase();
    return (
      p.description?.toLowerCase().includes(lowerSearch) ||
      `${p.typeAcronym} ${p.number}/${p.year}`.toLowerCase().includes(lowerSearch)
    );
  });

  const hasActiveFilters = !!(typeId || themeId || situationId || debouncedSearch);

  const activeTypeName = types.find(t => t.id === typeId)?.acronym || types.find(t => t.id === typeId)?.name;
  const activeThemeName = themes.find(t => t.id === themeId)?.name;
  const activeSituationName = situations.find(t => t.id === situationId)?.name;

  return (
    <div className="min-h-screen w-full font-sans text-[#1a1d1f] pb-20">
      {/* ── HERO ── */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[#5a8a42] via-secondary to-[#8bb574] p-8 text-white shadow-xl md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <FileText size={22} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Proposições
            </h1>
          </div>
          <p className="mt-2 max-w-lg text-sm text-white/75">
            Acompanhe, filtre e explore todas as proposições em andamento na Câmara dos Deputados.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm backdrop-blur-sm">
              <span className="text-white/60">Página Atual</span>
              <span className="font-bold">{page}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTROS ── */}
      <div className="sticky top-0 z-20 mb-6 rounded-2xl border border-gray-200/60 bg-white/80 p-5 shadow-md backdrop-blur-xl">
        {/* Linha 1 — Busca */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar nas proposições da página atual (ex: projeto de lei, relator)..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm transition-all placeholder:text-gray-400 focus:border-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Linha 2 — Filtros */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 md:flex md:flex-wrap md:items-center">
          <Select value={typeId || "all"} onValueChange={(v) => setTypeId(v === "all" ? "" : v)}>
            <SelectTrigger className="h-10 w-full rounded-lg border-gray-200 bg-gray-50/50 text-xs sm:h-9 sm:w-[180px]">
              <SelectValue placeholder="Tipo" />
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

          <Select value={themeId || "all"} onValueChange={(v) => setThemeId(v === "all" ? "" : v)}>
            <SelectTrigger className="h-10 w-full rounded-lg border-gray-200 bg-gray-50/50 text-xs sm:h-9 sm:w-[180px]">
              <SelectValue placeholder="Tema" />
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

          <Select value={situationId || "all"} onValueChange={(v) => setSituationId(v === "all" ? "" : v)}>
            <SelectTrigger className="h-10 w-full rounded-lg border-gray-200 bg-gray-50/50 text-xs sm:h-9 sm:w-[180px]">
              <SelectValue placeholder="Situação" />
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

          {/* Chips inline */}
          {hasActiveFilters && (
            <>
              <div className="hidden sm:block h-5 w-px bg-gray-200" />
              <div className="flex flex-1 flex-wrap items-center gap-2">
                {debouncedSearch && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary transition-colors hover:bg-secondary/20"
                  >
                    "{debouncedSearch}"
                    <X size={11} />
                  </button>
                )}
                {activeTypeName && (
                  <button
                    type="button"
                    onClick={() => setTypeId("")}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary transition-colors hover:bg-secondary/20"
                  >
                    {activeTypeName}
                    <X size={11} />
                  </button>
                )}
                {activeThemeName && (
                  <button
                    type="button"
                    onClick={() => setThemeId("")}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary transition-colors hover:bg-secondary/20"
                  >
                    {activeThemeName}
                    <X size={11} />
                  </button>
                )}
                {activeSituationName && (
                  <button
                    type="button"
                    onClick={() => setSituationId("")}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary transition-colors hover:bg-secondary/20"
                  >
                    {activeSituationName}
                    <X size={11} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-gray-400 transition-colors hover:text-gray-600"
                >
                  Limpar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── RESULTADOS HEADER ── */}
      {!loading && filteredPropositions.length > 0 && (
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-[#1a1d1f]">
              {filteredPropositions.length}
            </span>{" "}
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

      {/* ── LIST/GRID ── */}
      {loading || loadingRefs ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
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
            <Card
              key={prop.id}
              className="group relative cursor-pointer border-gray-100 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-lg"
              onClick={() => handlePropositionClick(prop.id)}
            >
              <div className="bg-secondary absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition-colors group-hover:bg-secondary/20">
                  <FileText size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#1a1d1f] transition-colors group-hover:text-secondary">
                      {prop.typeAcronym} {prop.number}/{prop.year}
                    </h3>
                    <div className="flex shrink-0 items-center gap-1.5 text-secondary transition-all duration-200 group-hover:translate-x-1">
                      <span className="text-[10px] font-bold tracking-widest uppercase md:hidden">
                        Acessar
                      </span>
                      <ChevronRight size={16} />
                    </div>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {prop.situation?.name && (
                      <span className="inline-flex shrink-0 items-center rounded-md bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-secondary uppercase tracking-wide">
                        {prop.situation.name}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(prop.presentationDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-gray-500">
                    {prop.description || "Nenhuma ementa disponível para esta proposição."}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-gray-200 py-20 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100">
            <FileText size={40} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-[#1a1d1f]">
            Nenhuma proposição encontrada
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
            Nenhum resultado para os filtros atuais na página selecionada.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="bg-secondary hover:bg-secondary/90 mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors"
            >
              <X size={14} />
              Limpar filtros
            </button>
          )}
        </Card>
      )}

      {/* ── PAGINAÇÃO ── */}
      {pages > 1 && !loading && filteredPropositions.length > 0 && (
        <div className="mt-8 flex justify-center pb-12">
          <CustomPagination
            pages={pages}
            currentPage={page}
            setCurrentPage={setPage}
          />
        </div>
      )}
    </div>
  );
}
