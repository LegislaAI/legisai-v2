"use client";

import { PoliticianProps } from "@/@types/v2/politician";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/v2/components/ui/avatar";
import { Card } from "@/components/v2/components/ui/Card";
import { Label } from "@/components/v2/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/v2/components/ui/select";
import { Switch } from "@/components/v2/components/ui/switch";
import { useApiContext } from "@/context/ApiContext";
import { useDebounce } from "@/hooks/useDebounce";
import { ArrowRight, Search, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function DeputadosListPage() {
  const router = useRouter();
  const { GetAPI } = useApiContext();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [politicians, setPoliticians] = useState<PoliticianProps[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [currentLegislature, setCurrentLegislature] = useState<number | null>(null);
  const [filterParty, setFilterParty] = useState<string>("");
  const [filterState, setFilterState] = useState<string>("");
  const [filterStates, setFilterStates] = useState<string[]>([]);
  const [filterParties, setFilterParties] = useState<string[]>([]);

  const debouncedSearch = useDebounce(searchTerm, 400);

  const fetchLegislatures = useCallback(async () => {
    const res = await GetAPI("/politician/legislatures", true);
    if (res.status === 200 && res.body?.current != null) {
      setCurrentLegislature(res.body.current);
    }
  }, [GetAPI]);

  const fetchFilters = useCallback(async () => {
    let params = "?";
    if (showActiveOnly && currentLegislature != null) {
      params += `legislature=${currentLegislature}`;
    } else {
      params += "allLegislatures=true";
    }
    const res = await GetAPI(`/politician/filters${params}`, true);
    if (res.status === 200 && res.body) {
      setFilterStates(res.body.states ?? []);
      setFilterParties(res.body.parties ?? []);
    }
  }, [showActiveOnly, currentLegislature, GetAPI]);

  const fetchPoliticians = useCallback(async () => {
    setIsLoading(true);
    try {
      let params = `?page=${currentPage}`;
      if (debouncedSearch) params += `&query=${debouncedSearch}`;
      if (filterParty) params += `&party=${encodeURIComponent(filterParty)}`;
      if (filterState) params += `&state=${encodeURIComponent(filterState)}`;
      if (showActiveOnly && currentLegislature != null) {
        params += `&legislature=${currentLegislature}`;
      } else {
        params += "&allLegislatures=true";
      }

      const response = await GetAPI(`/politician${params}`, true);
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
  }, [currentPage, debouncedSearch, filterParty, filterState, showActiveOnly, currentLegislature, GetAPI]);

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
  }, [debouncedSearch, showActiveOnly, filterParty, filterState]);

  const handleDeputadoClick = (id: string) => {
    router.push(`/deputados/${id}`);
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f4f4] font-sans text-[#1a1d1f]">
      <div className="w-full space-y-8">
        {/* HEADER */}
        <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-dark flex items-center gap-3 text-3xl font-bold">
              <div className="rounded-xl bg-secondary p-2 text-white shadow-lg shadow-secondary/20">
                <UserCircle size={24} />
              </div>
              Deputados
            </h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              Consulte a lista de deputados da Câmara. Use a busca e os filtros
              para encontrar um deputado.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
              <Label
                htmlFor="active-filter"
                className="text-xs text-gray-600 whitespace-nowrap"
              >
                {showActiveOnly ? "Apenas ativos" : "Todos (incl. ex-deputados)"}
              </Label>
              <Switch
                id="active-filter"
                checked={showActiveOnly}
                onCheckedChange={setShowActiveOnly}
              />
            </div>
            <Select value={filterParty || "all"} onValueChange={(v) => setFilterParty(v === "all" ? "" : v)}>
              <SelectTrigger className="w-full min-w-[140px] border-gray-200 bg-white sm:w-[180px]">
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
            <Select value={filterState || "all"} onValueChange={(v) => setFilterState(v === "all" ? "" : v)}>
              <SelectTrigger className="w-full min-w-[120px] border-gray-200 bg-white sm:w-[140px]">
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
            <div className="relative w-full min-w-[260px] sm:w-auto sm:min-w-[200px]">
              <Search
                className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar por nome..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm shadow-sm transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 w-full animate-pulse rounded-xl border border-gray-100 bg-white"
                />
              ))}
            </div>
          ) : politicians.length > 0 ? (
            <div className="space-y-4">
              {politicians.map((dep) => (
                <Card
                  key={dep.id}
                  className="group relative overflow-hidden border-gray-100 shadow-sm transition-all hover:border-secondary/30 hover:shadow-md"
                >
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-secondary opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="flex flex-col gap-4 pl-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-center gap-4">
                      <Avatar className="h-14 w-14 border-2 border-gray-100 shrink-0">
                        <AvatarImage
                          src={dep.imageUrl}
                          alt={dep.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-secondary text-lg text-white">
                          {dep.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-dark truncate text-lg font-bold">
                          {dep.name || "—"}
                        </h3>
                        {(dep.politicalPartyAcronym?.trim() ||
                          dep.politicalParty?.trim() ||
                          dep.state?.trim()) && (
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            {(dep.politicalPartyAcronym?.trim() ||
                              dep.politicalParty?.trim()) && (
                              <span className="bg-secondary/10 text-secondary inline-flex shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold">
                                {dep.politicalPartyAcronym?.trim() ||
                                  dep.politicalParty?.trim()}
                              </span>
                            )}
                            {dep.state?.trim() && (
                              <span className="inline-flex shrink-0 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">
                                {dep.state.trim()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleDeputadoClick(dep.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-dark shadow-sm transition-all hover:bg-secondary hover:text-white sm:h-auto sm:w-auto sm:rounded-lg sm:border-transparent sm:bg-dark sm:px-4 sm:py-2 sm:text-white"
                      >
                        <ArrowRight size={18} className="sm:mr-2" />
                        <span className="hidden text-sm font-medium sm:inline">
                          Ver detalhes
                        </span>
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
              <UserCircle
                size={48}
                className="text-secondary mx-auto mb-4 opacity-30"
              />
              <p className="text-gray-500">
                Nenhum deputado encontrado para os filtros selecionados.
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Tente alterar a busca, partido, estado ou o filtro de ativos.
              </p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && !isLoading && politicians.length > 0 && (
          <div className="flex justify-center pb-12">
            <CustomPagination
              pages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
