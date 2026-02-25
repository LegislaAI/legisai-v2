"use client";

import { BackButton } from "@/components/v2/components/ui/BackButton";
import { Card } from "@/components/v2/components/ui/Card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/v2/components/ui/tooltip";
import { fetchCamara, getTotalPagesFromLinks } from "@/lib/camara-api";
import { cn } from "@/lib/utils";
import {
  Flag,
  ArrowRight,
  Info,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

interface Partido {
  id: number;
  sigla: string;
  nome: string;
  uri?: string;
}

// Variações da cor da marca (secondary #749c5b) para badges por partido
const ACCENT_PALETTE = [
  { bg: "bg-secondary/10", border: "border-secondary/30", text: "text-secondary" },
  { bg: "bg-[#5a8a42]/10", border: "border-[#5a8a42]/30", text: "text-[#5a8a42]" },
  { bg: "bg-[#8bb574]/15", border: "border-[#8bb574]/30", text: "text-[#5a8a42]" },
  { bg: "bg-secondary/15", border: "border-secondary/40", text: "text-secondary" },
  { bg: "bg-[#5a8a42]/15", border: "border-[#5a8a42]/40", text: "text-[#5a8a42]" },
  { bg: "bg-[#8bb574]/10", border: "border-[#8bb574]/30", text: "text-secondary" },
];

function getPartidoStyle(sigla: string) {
  const idx = Math.abs(sigla.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % ACCENT_PALETTE.length;
  return ACCENT_PALETTE[idx];
}

export default function PartidosPage() {
  const router = useRouter();
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroSigla, setFiltroSigla] = useState("");
  const [filtroNome, setFiltroNome] = useState("");

  useEffect(() => {
    async function loadPartidos() {
      setLoading(true);
      const { ok, body, dados } = await fetchCamara<Partido[]>("partidos", {
        itens: 50,
        pagina: currentPage,
      });
      if (ok) {
        setPartidos(Array.isArray(dados) ? dados : []);
        setTotalPages(getTotalPagesFromLinks(body.links) || 1);
      } else {
        setPartidos([]);
      }
      setLoading(false);
    }
    loadPartidos();
  }, [currentPage]);

  const filteredPartidos = useMemo(() => {
    let list = partidos;
    const sigla = filtroSigla.trim().toUpperCase();
    const nome = filtroNome.trim().toLowerCase();
    if (sigla) list = list.filter((p) => p.sigla?.toUpperCase().includes(sigla));
    if (nome) list = list.filter((p) => p.nome?.toLowerCase().includes(nome));
    return list;
  }, [partidos, filtroSigla, filtroNome]);

  const handlePartidoClick = (id: number) => {
    router.push(`/partidos/${id}`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
      <BackButton />

      <TooltipProvider delayDuration={250}>
        <div className="space-y-8">
          {/* Hero header — cores da marca (alinhado a /deputados) */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#5a8a42] via-secondary to-[#8bb574] p-8 text-white shadow-xl md:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Flag className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                    Partidos
                  </h1>
                  <p className="mt-1 max-w-xl text-sm text-white/75">
                    Partidos políticos com representação na Câmara. Filtre por sigla ou nome e clique para ver líder, membros e informações.
                  </p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-white/70 hover:text-white">
                      <Info className="h-5 w-5" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[260px] border-gray-200 bg-white text-xs shadow-lg">
                    Dados da API Dados Abertos da Câmara. Inclui sigla, nome e link para detalhes.
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Filtros (Lista > Pesquisa — ETL) */}
          <Card className="border-gray-100/80 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-[#1a1d1f]">
                <Search className="h-4 w-4 text-secondary" /> Filtros
              </span>
              <input
                type="text"
                placeholder="Sigla (ex: PT, PL)"
                value={filtroSigla}
                onChange={(e) => setFiltroSigla(e.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
              <input
                type="text"
                placeholder="Nome do partido"
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                className="min-w-[200px] rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
              {(filtroSigla || filtroNome) && (
                <button
                  type="button"
                  onClick={() => {
                    setFiltroSigla("");
                    setFiltroNome("");
                  }}
                  className="text-sm font-medium text-secondary hover:underline"
                >
                  Limpar
                </button>
              )}
            </div>
          </Card>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : filteredPartidos.length > 0 ? (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Sparkles className="h-4 w-4 text-secondary" />
                <span>
                  {filteredPartidos.length === partidos.length
                    ? `${partidos.length} partido(s) nesta página`
                    : `${filteredPartidos.length} de ${partidos.length} nesta página`}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPartidos.map((p) => {
                  const style = getPartidoStyle(p.sigla || "");
                  return (
                    <div
                      key={p.id}
                      onClick={() => handlePartidoClick(p.id)}
                      className={cn(
                        "group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-lg",
                        style.border
                      )}
                    >
                      <div className="bg-secondary absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                      <div className="relative flex flex-col gap-3">
                        <span
                          className={cn(
                            "w-fit rounded-lg border px-2.5 py-1 text-sm font-bold uppercase",
                            style.bg,
                            style.text,
                            style.border
                          )}
                        >
                          {p.sigla || "—"}
                        </span>
                        <h3 className="font-bold leading-tight text-[#1a1d1f] line-clamp-2 transition-colors group-hover:text-secondary">
                          {p.nome || "Sem nome"}
                        </h3>
                        <div className="mt-auto flex items-center justify-end gap-2 text-secondary">
                          <span className="text-sm font-medium">Ver detalhes</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:border-secondary/30 hover:bg-secondary/5 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:border-secondary/30 hover:bg-secondary/5 disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="border-gray-100 p-12 text-center">
              <Flag className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-bold text-gray-800">Nenhum partido encontrado</h3>
              <p className="mt-2 text-sm text-gray-500">
                {filtroSigla || filtroNome
                  ? "Tente outros filtros ou limpe a pesquisa."
                  : "Verifique se o proxy /api/camara/partidos está configurado."}
              </p>
            </Card>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}
