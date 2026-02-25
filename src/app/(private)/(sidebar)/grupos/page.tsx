"use client";

import { BackButton } from "@/components/v2/components/ui/BackButton";
import { Card } from "@/components/v2/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/v2/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/v2/components/ui/tooltip";
import { fetchCamara, getTotalPagesFromLinks } from "@/lib/camara-api";
import { getPaisTemaFromNome, getSituacaoLabel } from "@/types/grupos";
import type { Grupo } from "@/types/grupos";
import {
  Globe,
  ArrowRight,
  Info,
  ChevronLeft,
  ChevronRight,
  Search,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const CARD_CLASS =
  "group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#749c5b]/25 hover:shadow-[0_12px_40px_-12px_rgba(116,156,91,0.25)]";

export default function GruposPage() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterPaisTema, setFilterPaisTema] = useState<string>("");
  const [nomeBusca, setNomeBusca] = useState("");
  const [nomeSubmit, setNomeSubmit] = useState("");

  const loadPage = useCallback(
    async (page: number) => {
      setLoading(true);
      const params: Record<string, string | number> = { itens: 50, pagina: page };
      if (nomeSubmit.trim()) params.nome = nomeSubmit.trim();
      const { ok, body, dados } = await fetchCamara<Grupo[]>("grupos", params);
      if (ok) {
        const list = Array.isArray(dados) ? dados : [];
        setGrupos(list);
        setTotalPages(getTotalPagesFromLinks(body.links) || 1);
      } else {
        setGrupos([]);
      }
      setLoading(false);
    },
    [nomeSubmit]
  );

  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage, nomeSubmit, loadPage]);

  const paisTemaOptions = useMemo(() => {
    const set = new Set<string>();
    grupos.forEach((g) => set.add(getPaisTemaFromNome(g.nome || "")));
    return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [grupos]);

  const filtered = useMemo(() => {
    if (!filterPaisTema) return grupos;
    return grupos.filter((g) => getPaisTemaFromNome(g.nome || "") === filterPaisTema);
  }, [grupos, filterPaisTema]);

  const handleBuscaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNomeSubmit(nomeBusca);
    setFilterPaisTema("");
    setCurrentPage(1);
  };

  const handleGrupoClick = (id: number) => {
    router.push(`/grupos/${id}`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
      <BackButton />
      <TooltipProvider delayDuration={250}>
        <div className="space-y-8">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#749c5b]/10 via-[#4E9F3D]/5 to-transparent px-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm"
                  style={{ background: "linear-gradient(135deg, #749c5b22, #749c5b0a)" }}
                >
                  <Globe className="h-6 w-6 text-[#749c5b]" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                    Grupos interparlamentares
                  </h1>
                  <p className="mt-1 max-w-xl text-sm text-gray-600">
                    Grupos de cooperação e amizade com outros parlamentos. Filtre por país/tema ou nome.
                  </p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-gray-400 hover:text-gray-600">
                      <Info className="h-5 w-5" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[260px] border-gray-200 bg-white text-xs shadow-lg">
                    Grupos interparlamentares promovem o relacionamento com outros parlamentos. Dados da API Dados Abertos.
                  </TooltipContent>
                </Tooltip>
              </div>
              {/* Filtros — alinhado ao ETL: País/tema + Nome */}
              <div className="flex flex-wrap items-center gap-3">
                <form onSubmit={handleBuscaSubmit} className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="search"
                      placeholder="Buscar por nome..."
                      value={nomeBusca}
                      onChange={(e) => setNomeBusca(e.target.value)}
                      className="h-10 w-52 rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#749c5b] focus:outline-none focus:ring-1 focus:ring-[#749c5b]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-10 rounded-xl border border-[#749c5b]/30 bg-[#749c5b]/10 px-4 text-sm font-semibold text-[#749c5b] transition-colors hover:bg-[#749c5b]/20"
                  >
                    Buscar
                  </button>
                </form>
                <Select
                  value={filterPaisTema || "todos"}
                  onValueChange={(v) => setFilterPaisTema(v === "todos" ? "" : v)}
                >
                  <SelectTrigger className="w-[200px] border-gray-200 bg-white">
                    <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                    <SelectValue placeholder="País / tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os países/temas</SelectItem>
                    {paisTemaOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <p className="text-sm text-gray-500">
                Mostrando <strong>{filtered.length}</strong> grupo{filtered.length !== 1 ? "s" : ""}
                {filterPaisTema && ` em "${filterPaisTema}"`}.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((g) => {
                  const paisTema = getPaisTemaFromNome(g.nome || "");
                  const situacao = getSituacaoLabel(g.ativo);
                  return (
                    <div
                      key={g.id}
                      onClick={() => handleGrupoClick(g.id)}
                      className={`${CARD_CLASS} p-5`}
                    >
                      <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-[#749c5b] opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {g.anoCriacao && (
                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                              {String(g.anoCriacao)}
                            </span>
                          )}
                          {situacao !== "—" && (
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                situacao === "Ativo"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {situacao}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold leading-tight text-gray-900 line-clamp-2">
                          {g.nome || "Sem nome"}
                        </h3>
                        {paisTema !== "—" && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{paisTema}</span>
                          </div>
                        )}
                        <div className="mt-auto flex items-center justify-end gap-2 text-[#749c5b]">
                          <span className="text-sm font-medium">Ver detalhes</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <Card className="flex flex-wrap items-center justify-between gap-4 border-gray-100 p-4">
                  <span className="text-sm text-gray-600">
                    Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="border-gray-100 p-12 text-center">
              <Globe className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-bold text-gray-800">Nenhum grupo encontrado</h3>
              <p className="mt-2 text-sm text-gray-500">
                {filterPaisTema || nomeSubmit
                  ? "Tente outro filtro ou busca."
                  : "Verifique o proxy /api/camara/grupos."}
              </p>
            </Card>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}
