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
import {
  Building2,
  ArrowRight,
  Info,
  ChevronLeft,
  ChevronRight,
  Search,
  BarChart3,
  Layers,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const CARD_3D =
  "relative overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-[#749c5b]/20 hover:shadow-[0_8px_32px_-8px_rgba(116,156,91,0.2)] hover:-translate-y-0.5";

const GLASS_HEADER =
  "bg-gradient-to-r from-[#749c5b]/[0.04] via-white to-white/95 backdrop-blur-sm";

const CHART_COLORS = [
  "#749c5b",
  "#4E9F3D",
  "#2d5a3d",
  "#5a8c4a",
  "#8ab86e",
  "#3d7a5c",
  "#6bc28c",
  "#2e6b4a",
  "#1B3B2B",
  "#a0d88a",
];

interface TipoOrgaoRef {
  cod: number;
  sigla?: string;
  nome: string;
}

interface Orgao {
  id: number;
  sigla: string;
  nome: string;
  apelido?: string;
  codTipoOrgao?: number;
  tipoOrgao?: string;
  uri?: string;
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm"
        style={{
          background: "linear-gradient(135deg, #749c5b22, #749c5b0a)",
        }}
      >
        <Icon className="h-5 w-5 text-[#749c5b]" />
      </div>
      <div>
        <h3 className="text-[15px] font-bold tracking-tight text-gray-900">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[11px] text-gray-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default function OrgaosPage() {
  const router = useRouter();
  const [orgaos, setOrgaos] = useState<Orgao[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [tipos, setTipos] = useState<TipoOrgaoRef[]>([]);

  useEffect(() => {
    async function loadTipos() {
      const { ok, dados } = await fetchCamara<TipoOrgaoRef[]>(
        "referencias/orgaos/codTipoOrgao"
      );
      if (ok && Array.isArray(dados)) {
        setTipos(dados);
      }
    }
    loadTipos();
  }, []);

  useEffect(() => {
    async function loadOrgaos() {
      setLoading(true);
      const params: Record<string, string | number> = {
        itens: 50,
        pagina: currentPage,
      };
      const { ok, body, dados } = await fetchCamara<Orgao[]>("orgaos", params);
      if (ok) {
        setOrgaos(Array.isArray(dados) ? dados : []);
        setTotalPages(getTotalPagesFromLinks(body.links) || 1);
      } else {
        setOrgaos([]);
      }
      setLoading(false);
    }
    loadOrgaos();
  }, [currentPage]);

  const filteredOrgaos = useMemo(() => {
    let list = orgaos;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          (o.nome && o.nome.toLowerCase().includes(q)) ||
          (o.sigla && o.sigla.toLowerCase().includes(q)) ||
          (o.apelido && o.apelido.toLowerCase().includes(q))
      );
    }
    if (filterTipo !== "todos") {
      const cod = parseInt(filterTipo, 10);
      if (!Number.isNaN(cod)) {
        list = list.filter((o) => o.codTipoOrgao === cod);
      } else {
        list = list.filter(
          (o) => (o.tipoOrgao || "").toLowerCase() === filterTipo.toLowerCase()
        );
      }
    }
    return list;
  }, [orgaos, search, filterTipo]);

  const chartData = useMemo(() => {
    const byTipo: Record<string, number> = {};
    filteredOrgaos.forEach((o) => {
      const key = o.tipoOrgao || (o.codTipoOrgao != null ? `Tipo ${o.codTipoOrgao}` : "Outros");
      byTipo[key] = (byTipo[key] || 0) + 1;
    });
    const labels = Object.keys(byTipo).sort((a, b) => (byTipo[b] ?? 0) - (byTipo[a] ?? 0));
    const series = labels.map((l) => byTipo[l] ?? 0);
    return {
      series,
      labels,
    };
  }, [filteredOrgaos]);

  const totalEstimado = totalPages * 50;

  const handleOrgaoClick = (id: number) => {
    router.push(`/orgaos/${id}`);
  };

  const hasActiveFilters = !!(search.trim() || filterTipo !== "todos");
  const clearAllFilters = () => {
    setSearch("");
    setFilterTipo("todos");
  };
  const selectedTipoLabel =
    filterTipo !== "todos"
      ? tipos.find((t) => String(t.cod) === filterTipo)?.nome ||
        tipos.find((t) => String(t.cod) === filterTipo)?.sigla ||
        `Tipo ${filterTipo}`
      : null;

  return (
    <div className="min-h-screen w-full font-sans text-[#1a1d1f]">
      <BackButton />

      <TooltipProvider delayDuration={250}>
        <div className="space-y-6 pb-20">
          {/* ── HERO (estilo /deputados) ── */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#5a8a42] via-secondary to-[#8bb574] p-8 text-white shadow-xl md:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Building2 size={22} />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  Órgãos da Câmara
                </h1>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-white/80 hover:text-white">
                      <Info className="h-5 w-5" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[260px] border-gray-200 bg-white text-xs shadow-lg">
                    Dados da API Dados Abertos da Câmara. Comissões permanentes, temporárias e demais órgãos.
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="mt-2 max-w-lg text-sm text-white/75">
                Comissões, plenário, Mesa Diretora e demais órgãos. Clique para ver detalhes, eventos e membros.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm backdrop-blur-sm">
                  <Layers size={14} className="text-white/60" />
                  <span className="text-white/60">Exibindo</span>
                  <span className="font-bold">
                    {loading ? "—" : `${filteredOrgaos.length} / ${orgaos.length}`}
                  </span>
                  <span className="text-white/60">nesta página</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm backdrop-blur-sm">
                  <Building2 size={14} className="text-white/60" />
                  <span className="text-white/60">Total (est.)</span>
                  <span className="font-bold">
                    {loading ? "—" : totalEstimado.toLocaleString("pt-BR")} órgãos
                  </span>
                </div>
                {selectedTipoLabel && (
                  <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm backdrop-blur-sm">
                    <span className="text-white/60">Tipo</span>
                    <span className="font-bold">{selectedTipoLabel}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── FILTROS (estilo /deputados) ── */}
          <div className="sticky top-0 z-20 rounded-2xl border border-gray-200/60 bg-white/80 p-5 shadow-md backdrop-blur-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou sigla..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm transition-all placeholder:text-gray-400 focus:border-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="h-9 w-[220px] rounded-lg border-gray-200 bg-gray-50/50 text-xs">
                  <SelectValue placeholder="Tipo de órgão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  {tipos.map((t) => (
                    <SelectItem key={t.cod} value={String(t.cod)}>
                      {t.nome || t.sigla || `Tipo ${t.cod}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <>
                  <div className="h-5 w-px bg-gray-200" />
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    {search.trim() && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary transition-colors hover:bg-secondary/20"
                      >
                        &ldquo;{search.trim()}&rdquo;
                        <X size={11} />
                      </button>
                    )}
                    {filterTipo !== "todos" && selectedTipoLabel && (
                      <button
                        type="button"
                        onClick={() => setFilterTipo("todos")}
                        className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary transition-colors hover:bg-secondary/20"
                      >
                        {selectedTipoLabel}
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
          {!loading && filteredOrgaos.length > 0 && (
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-[#1a1d1f]">
                  {filteredOrgaos.length}
                </span>{" "}
                órgãos nesta página
                {totalPages > 1 && (filterTipo === "todos" && !search.trim()) && (
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

          {/* Gráfico por tipo */}
          {!loading && chartData.series.length > 0 && (
            <Card className={CARD_3D}>
              <div className={cn(GLASS_HEADER, "px-6 py-4")}>
                <SectionTitle
                  icon={BarChart3}
                  title="Distribuição por tipo (nesta página)"
                  subtitle={
                    filteredOrgaos.length !== orgaos.length
                      ? "Filtrado por busca e/ou tipo"
                      : undefined
                  }
                />
              </div>
              <div className="px-4 pb-6">
                <ReactApexChart
                  type="bar"
                  series={[
                    {
                      name: "Órgãos",
                      data: [...chartData.series].reverse(),
                    },
                  ]}
                  options={{
                    chart: { fontFamily: "inherit", toolbar: { show: false } },
                    colors: [CHART_COLORS[0]],
                    plotOptions: {
                      bar: {
                        horizontal: true,
                        borderRadius: 6,
                        barHeight: "70%",
                        distributed: false,
                      },
                    },
                    dataLabels: { enabled: true },
                    xaxis: {
                      categories: [...chartData.labels].reverse(),
                      labels: { maxWidth: 280 },
                      axisBorder: { show: false },
                      axisTicks: { show: false },
                    },
                    yaxis: {
                      labels: { maxWidth: 200 },
                    },
                    grid: {
                      borderColor: "#f1f1f1",
                      strokeDashArray: 4,
                      xaxis: { lines: { show: true } },
                      yaxis: { lines: { show: false } },
                    },
                    tooltip: {
                      y: { formatter: (v: number) => `${v} órgão(s)` },
                    },
                  }}
                  height={Math.max(220, chartData.labels.length * 36)}
                />
              </div>
            </Card>
          )}

          {/* Lista */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-36 animate-pulse rounded-2xl bg-gray-100"
                />
              ))}
            </div>
          ) : filteredOrgaos.length > 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredOrgaos.map((orgao) => (
                  <div
                    key={orgao.id}
                    onClick={() => handleOrgaoClick(orgao.id)}
                    className={`${CARD_3D} group cursor-pointer p-5`}
                  >
                    <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-[#749c5b] opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <span className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-gray-700">
                          {orgao.sigla || "—"}
                        </span>
                        <span className="rounded-full bg-[#749c5b]/10 px-2.5 py-0.5 text-xs font-medium text-[#749c5b]">
                          {orgao.tipoOrgao ??
                            (orgao.codTipoOrgao != null
                              ? `Tipo ${orgao.codTipoOrgao}`
                              : "Órgão")}
                        </span>
                      </div>
                      <h3 className="font-bold leading-tight text-gray-900 line-clamp-2">
                        {orgao.nome || orgao.apelido || "Sem nome"}
                      </h3>
                      <div className="mt-auto flex items-center justify-end gap-2 text-[#749c5b]">
                        <span className="text-sm font-medium">Ver detalhes</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (filterTipo === "todos" && !search.trim()) && (
                <Card className="flex flex-wrap items-center justify-between gap-4 border-gray-100 p-4">
                  <span className="text-sm text-gray-600">
                    Página <strong>{currentPage}</strong> de{" "}
                    <strong>{totalPages}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
                      disabled={currentPage === 1}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              )}

              {(filterTipo !== "todos" || search.trim()) &&
                filteredOrgaos.length === 0 && (
                  <Card className="border-gray-100 p-8 text-center">
                    <p className="text-sm text-gray-500">
                      Nenhum órgão corresponde aos filtros. Tente outra busca ou
                      tipo.
                    </p>
                  </Card>
                )}
            </>
          ) : (
            <Card className="border-gray-100 p-12 text-center">
              <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-bold text-gray-800">
                Nenhum órgão encontrado
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Verifique se o proxy da API da Câmara está configurado em{" "}
                <code className="rounded bg-gray-100 px-1">
                  /camara/orgaos
                </code>
                .
              </p>
            </Card>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}
