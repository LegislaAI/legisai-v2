"use client";

import { PoliticianProps } from "@/@types/v2/politician";
import { CustomPagination } from "@/components/ui/CustomPagination";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/v2/components/ui/avatar";
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
import { fetchCamara } from "@/lib/camara-api";
import {
  ChevronRight,
  Landmark,
  MapPin,
  Search,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface Legislatura {
  id: number;
  dataInicio?: string;
  dataFim?: string;
}

interface Bloco {
  id: number | string;
  nome: string;
  idLegislatura?: number;
}

interface PartidoNoBloco {
  id: number | string;
  sigla: string;
  nome?: string;
}

export default function DeputadosListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { GetAPI } = useApiContext();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [politicians, setPoliticians] = useState<PoliticianProps[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [legislaturas, setLegislaturas] = useState<Legislatura[]>([]);
  const [selectedLegislature, setSelectedLegislature] = useState<string>("current");
  const [currentLegislature, setCurrentLegislature] = useState<number | null>(
    null,
  );
  const [filterParty, setFilterParty] = useState<string>(() => searchParams.get("party") ?? "");
  const [filterState, setFilterState] = useState<string>("");
  const [filterSex, setFilterSex] = useState<string>("");
  const [filterStates, setFilterStates] = useState<string[]>([]);
  const [filterParties, setFilterParties] = useState<string[]>([]);
  const [partidoToBloco, setPartidoToBloco] = useState<Map<string, string>>(new Map());

  // Aplicar partido vindo da URL (ex: link "Ver deputados na base" em /partidos/[id])
  useEffect(() => {
    const partyFromUrl = searchParams.get("party");
    if (partyFromUrl != null) setFilterParty(partyFromUrl);
  }, [searchParams]);

  const debouncedSearch = useDebounce(searchTerm, 400);

  const fetchLegislatures = useCallback(async () => {
    const res = await GetAPI("/politician/legislatures", true);
    if (res.status === 200 && res.body?.current != null) {
      setCurrentLegislature(res.body.current);
    }
  }, [GetAPI]);

  useEffect(() => {
    async function loadLegislaturas() {
      const { ok, dados } = await fetchCamara<Legislatura[]>("legislaturas");
      if (ok && Array.isArray(dados)) setLegislaturas(dados);
    }
    loadLegislaturas();
  }, []);

  const legislatureForBlocos =
    selectedLegislature === "current" || selectedLegislature === "all"
      ? currentLegislature
      : selectedLegislature !== ""
        ? parseInt(selectedLegislature, 10)
        : currentLegislature;

  useEffect(() => {
    const idLeg = legislatureForBlocos != null && !isNaN(legislatureForBlocos) ? legislatureForBlocos : null;
    if (idLeg == null) return;
    const legId: number = idLeg;
    let cancelled = false;
    async function loadPartidoToBloco() {
      const { ok: okBlocos, dados: blocos } = await fetchCamara<Bloco[]>("blocos", {
        idLegislatura: legId,
        itens: 100,
      });
      if (!okBlocos || !Array.isArray(blocos) || cancelled) return;
      const map = new Map<string, string>();
      for (const bloco of blocos) {
        if (cancelled) return;
        const { ok: okPartidos, dados: partidos } = await fetchCamara<PartidoNoBloco[]>(
          `blocos/${bloco.id}/partidos`
        );
        if (okPartidos && Array.isArray(partidos)) {
          for (const p of partidos) {
            const sigla = (p.sigla || "").trim().toUpperCase();
            if (sigla) map.set(sigla, bloco.nome || String(bloco.id));
          }
        }
      }
      if (!cancelled) setPartidoToBloco(map);
    }
    loadPartidoToBloco();
    return () => {
      cancelled = true;
    };
  }, [legislatureForBlocos ?? null]);

  const fetchFilters = useCallback(async () => {
    let params = "?";
    if (selectedLegislature === "all") {
      params += "allLegislatures=true";
    } else {
      const leg = selectedLegislature === "current" ? currentLegislature : selectedLegislature;
      if (leg != null && leg !== "") params += `legislature=${leg}`;
      else if (currentLegislature != null) params += `legislature=${currentLegislature}`;
    }
    const res = await GetAPI(`/politician/filters${params}`, true);
    if (res.status === 200 && res.body) {
      setFilterStates(res.body.states ?? []);
      setFilterParties(res.body.parties ?? []);
    }
  }, [selectedLegislature, currentLegislature, GetAPI]);

  const fetchPoliticians = useCallback(async () => {
    setIsLoading(true);
    try {
      let params = `?page=${currentPage}`;
      if (debouncedSearch) params += `&query=${debouncedSearch}`;
      if (filterParty) params += `&party=${encodeURIComponent(filterParty)}`;
      if (filterState) params += `&state=${encodeURIComponent(filterState)}`;
      if (filterSex) params += `&sexo=${encodeURIComponent(filterSex)}`;
      if (selectedLegislature === "all") {
        params += "&allLegislatures=true";
      } else {
        const leg = selectedLegislature === "current" ? currentLegislature : selectedLegislature;
        if (leg != null && leg !== "") params += `&legislature=${leg}`;
        else if (currentLegislature != null) params += `&legislature=${currentLegislature}`;
      }
      console.log("params", params);
      const response = await GetAPI(`/politician${params}`, true);
      console.log("response", response);
      if (response.status === 200 && response.body) {
        setPoliticians(response.body.politicians ?? []);
        setTotalPages(response.body.pages ?? 1);
      } else {
        setPoliticians([]);
      }
    } catch {
      setPoliticians([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    debouncedSearch,
    filterParty,
    filterState,
    filterSex,
    selectedLegislature,
    currentLegislature,
    GetAPI,
  ]);

  useEffect(() => {
    fetchLegislatures();
  }, [fetchLegislatures]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchPoliticians();
  }, [fetchPoliticians]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedLegislature, filterParty, filterState, filterSex]);

  const legislaturaLabel = (l: Legislatura) => {
    const ini = l.dataInicio ? new Date(l.dataInicio).getFullYear() : "";
    const fim = l.dataFim ? new Date(l.dataFim).getFullYear() : "";
    return fim ? `${l.id} (${ini}-${fim})` : `${l.id} (${ini})`;
  };

  const selectedLegislatureLabel =
    selectedLegislature === "all"
      ? "Todas"
      : selectedLegislature === "current"
        ? legislaturas.length > 0
          ? (() => {
              const current = legislaturas.find((l) => l.dataFim && new Date(l.dataFim) > new Date()) ?? legislaturas[legislaturas.length - 1];
              return current ? `Atual: ${legislaturaLabel(current)}` : `Legislatura ${currentLegislature ?? "—"}`;
            })()
          : `Legislatura ${currentLegislature ?? "—"}`
        : (() => {
            const l = legislaturas.find((x) => String(x.id) === selectedLegislature);
            return l ? legislaturaLabel(l) : `Legislatura ${selectedLegislature}`;
          })();

  const handleDeputadoClick = (id: string) => {
    router.push(`/deputados/${id}`);
  };

  const hasActiveFilters = !!(filterParty || filterState || filterSex || debouncedSearch);

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterParty("");
    setFilterState("");
    setFilterSex("");
  };

  return (
    <div className="min-h-screen w-full font-sans text-[#1a1d1f]">
      {/* ── HERO ── */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[#5a8a42] via-secondary to-[#8bb574] p-8 text-white shadow-xl md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Users size={22} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Deputados Federais
            </h1>
          </div>
          <p className="mt-2 max-w-lg text-sm text-white/75">
            Consulte, filtre e explore os perfis dos parlamentares da Câmara dos
            Deputados do Brasil.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm backdrop-blur-sm">
              <Landmark size={14} className="text-white/60" />
              <span className="text-white/60">Legislatura</span>
              <span className="font-bold">
                {selectedLegislatureLabel}
              </span>
            </div>
            {filterParty && (
              <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm backdrop-blur-sm">
                <span className="text-white/60">Partido</span>
                <span className="font-bold">{filterParty}</span>
              </div>
            )}
            {filterState && (
              <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm backdrop-blur-sm">
                <MapPin size={14} className="text-white/60" />
                <span className="font-bold">{filterState}</span>
              </div>
            )}
            {filterSex && (
              <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm backdrop-blur-sm">
                <span className="text-white/60">Sexo</span>
                <span className="font-bold">{filterSex === "M" ? "Masculino" : filterSex === "F" ? "Feminino" : filterSex}</span>
              </div>
            )}
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
            placeholder="Buscar deputado por nome..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm transition-all placeholder:text-gray-400 focus:border-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Linha 2 — Filtros */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center gap-3">
            {legislaturas.length > 0 && (
              <Select
                value={selectedLegislature}
                onValueChange={(v) => {
                  setSelectedLegislature(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[220px] rounded-lg border-gray-200 bg-gray-50/50 text-xs">
                  <SelectValue placeholder="Legislatura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">
                    Legislatura atual
                  </SelectItem>
                  {legislaturas.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {legislaturaLabel(l)}
                    </SelectItem>
                  ))}
                  <SelectItem value="all">Todas as legislaturas</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Select
              value={filterParty || "all"}
              onValueChange={(v) => setFilterParty(v === "all" ? "" : v)}
            >
              <SelectTrigger className="h-9 w-[155px] rounded-lg border-gray-200 bg-gray-50/50 text-xs">
                <SelectValue placeholder="Partido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os partidos</SelectItem>
                {filterParties.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterState || "all"}
              onValueChange={(v) => setFilterState(v === "all" ? "" : v)}
            >
              <SelectTrigger className="h-9 w-[135px] rounded-lg border-gray-200 bg-gray-50/50 text-xs">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                {filterStates.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterSex || "all"}
              onValueChange={(v) => {
                setFilterSex(v === "all" ? "" : v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[140px] rounded-lg border-gray-200 bg-gray-50/50 text-xs">
                <SelectValue placeholder="Sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-5 w-px bg-gray-200" />

          {/* Chips inline */}
          {hasActiveFilters && (
            <>
              <div className="h-5 w-px bg-gray-200" />

              <div className="flex flex-1 flex-wrap items-center gap-2">
                {debouncedSearch && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary transition-colors hover:bg-secondary/20"
                  >
                    &ldquo;{debouncedSearch}&rdquo;
                    <X size={11} />
                  </button>
                )}
                {filterParty && (
                  <button
                    type="button"
                    onClick={() => setFilterParty("")}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary transition-colors hover:bg-secondary/20"
                  >
                    {filterParty}
                    <X size={11} />
                  </button>
                )}
                {filterState && (
                  <button
                    type="button"
                    onClick={() => setFilterState("")}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary transition-colors hover:bg-secondary/20"
                  >
                    {filterState}
                    <X size={11} />
                  </button>
                )}
                {filterSex && (
                  <button
                    type="button"
                    onClick={() => setFilterSex("")}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary transition-colors hover:bg-secondary/20"
                  >
                    {filterSex === "M" ? "Masculino" : "Feminino"}
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
      {!isLoading && politicians.length > 0 && (
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-[#1a1d1f]">
              {politicians.length}
            </span>{" "}
            deputados nesta página
            {totalPages > 1 && (
              <span>
                {" · Página "}
                <span className="font-semibold text-[#1a1d1f]">
                  {currentPage}
                </span>
                {" de "}
                {totalPages}
              </span>
            )}
          </p>
        </div>
      )}

      {/* ── GRID ── */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 shrink-0 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 w-3/4 rounded-lg bg-gray-200" />
                  <div className="h-3 w-1/2 rounded-lg bg-gray-100" />
                  <div className="flex gap-2">
                    <div className="h-5 w-12 rounded-md bg-gray-100" />
                    <div className="h-5 w-8 rounded-md bg-gray-100" />
                  </div>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-50 pt-3">
                <div className="h-3 w-2/3 rounded-lg bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : politicians.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {politicians.map((dep) => {
            const partidoSigla = dep.politicalPartyAcronym?.trim() || dep.politicalParty?.trim() || "";
            const blocoNome = partidoSigla ? partidoToBloco.get(partidoSigla.toUpperCase()) : undefined;
            const legList = (dep.legislaturas?.length ? dep.legislaturas : dep.legislature != null ? [dep.legislature] : []).sort((a, b) => b - a);
            return (
            <Card
              key={dep.id}
              className="group relative cursor-pointer border-gray-100 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-lg"
              onClick={() => handleDeputadoClick(dep.id)}
            >
              <div className="bg-secondary absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

              {/* Avatar + Info */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <Avatar className="h-14 w-14 border-2 border-gray-100 shadow-sm transition-all duration-200 group-hover:border-secondary/30 group-hover:shadow-md">
                    <AvatarImage
                      src={dep.imageUrl}
                      alt={dep.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-secondary/10 text-lg font-bold text-secondary">
                      {dep.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {dep.situacaoExercicio && (
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                        dep.situacaoExercicio === "Exercício"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                      title={dep.situacaoExercicio}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-base font-bold text-[#1a1d1f] transition-colors group-hover:text-secondary">
                      {dep.name || "—"}
                    </h3>
                    <ChevronRight
                      size={16}
                      className="mt-0.5 shrink-0 text-gray-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-secondary"
                    />
                  </div>

                  {dep.fullName && dep.fullName !== dep.name && (
                    <p
                      className="mt-0.5 truncate text-xs text-gray-400"
                      title={dep.fullName}
                    >
                      {dep.fullName}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {partidoSigla && (
                      <>
                        <span className="inline-flex shrink-0 items-center rounded-md bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary">
                          {partidoSigla}
                        </span>
                        {blocoNome && (
                          <span
                            className="inline-flex max-w-[180px] shrink-0 items-center truncate rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600"
                            title={blocoNome}
                          >
                            {blocoNome}
                          </span>
                        )}
                      </>
                    )}
                    {dep.state?.trim() && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        <MapPin size={10} />
                        {dep.state.trim()}
                      </span>
                    )}
                    {legList.length > 0 && (
                      <span
                        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-0.5 text-xs font-medium text-gray-600"
                        title={`Legislaturas: ${legList.join(", ")}`}
                      >
                        <Landmark size={10} />
                        Leg. {legList.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

            </Card>
          );
          })}
        </div>
      ) : (
        <Card className="border-dashed border-gray-200 py-20 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100">
            <UserCircle size={40} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-[#1a1d1f]">
            Nenhum deputado encontrado
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
            Nenhum resultado para os filtros atuais. Tente ajustar a busca, o
            partido, o estado ou o filtro de ativos.
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
      {totalPages > 1 && !isLoading && politicians.length > 0 && (
        <div className="mt-8 flex justify-center pb-12">
          <CustomPagination
            pages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
