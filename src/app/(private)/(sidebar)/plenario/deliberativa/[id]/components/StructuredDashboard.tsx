"use client";

import type { ApexOptions } from "apexcharts";
import {
  AlertTriangle,
  ArrowUpRight,
  Award,
  Brain,
  Clock,
  Gauge,
  Lightbulb,
  Mic2,
  PieChart,
  Sparkles,
  Swords,
  TrendingUp,
  Users,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AiDashboardJson,
  BrevesComunicacoesResponse,
  EventDetailsAPI,
} from "./types";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface StructuredDashboardProps {
  eventDetails: EventDetailsAPI | null;
  fullTextForSession: string | null;
  brevesComunicacoes?: BrevesComunicacoesResponse | null;
  onSaved?: (dashboard: AiDashboardJson) => void;
}

const dimensionColor = (value?: string) => {
  const v = (value ?? "").toLowerCase();
  if (["alto", "alta", "fluida"].some((k) => v.includes(k)))
    return "bg-emerald-50 text-emerald-700";
  if (["moderado", "parcial", "interrompida"].some((k) => v.includes(k)))
    return "bg-amber-50 text-amber-700";
  if (
    ["baixo", "baixa", "fragmentada", "travada", "nenhuma"].some((k) =>
      v.includes(k),
    )
  )
    return "bg-rose-50 text-rose-700";
  return "bg-gray-100 text-gray-700";
};

// Mapeia rótulos qualitativos em valor 0–100 para visualização em radial.
function dimensionScore(
  key: "conflito" | "efetividade" | "fluidez",
  value?: string,
): number {
  const v = (value ?? "").toLowerCase();
  if (key === "conflito") {
    if (v.includes("alto")) return 85;
    if (v.includes("moderado")) return 55;
    if (v.includes("baixo")) return 20;
  }
  if (key === "efetividade") {
    if (v.includes("alta")) return 85;
    if (v.includes("parcial") || v.includes("moderada")) return 55;
    if (v.includes("baixa")) return 20;
  }
  if (key === "fluidez") {
    if (v.includes("fluida")) return 85;
    if (v.includes("interrompida")) return 55;
    if (v.includes("fragmentada") || v.includes("travada")) return 20;
  }
  return 0;
}

function dimensionHex(score: number): string {
  if (score >= 70) return "#10b981"; // emerald
  if (score >= 40) return "#f59e0b"; // amber
  return "#ef4444"; // rose
}

// "HH:MM:SS" ou "MM:SS" ou "Xm Ys" → segundos. Retorna 0 se ininterpretável.
function parseDurationToSeconds(raw?: string | null): number {
  if (!raw) return 0;
  const s = String(raw).trim();
  const colon = s.split(":").map((x) => parseInt(x, 10));
  if (colon.every((n) => !isNaN(n))) {
    if (colon.length === 3) return colon[0] * 3600 + colon[1] * 60 + colon[2];
    if (colon.length === 2) return colon[0] * 60 + colon[1];
    if (colon.length === 1) return colon[0];
  }
  const minMatch = s.match(/(\d+)\s*m/i);
  const secMatch = s.match(/(\d+)\s*s/i);
  if (minMatch || secMatch)
    return (
      (minMatch ? parseInt(minMatch[1], 10) * 60 : 0) +
      (secMatch ? parseInt(secMatch[1], 10) : 0)
    );
  return 0;
}

function formatSeconds(sec: number): string {
  if (sec <= 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}min`;
  return `${m}min ${s}s`;
}

export function StructuredDashboard({
  eventDetails,
  fullTextForSession,
  brevesComunicacoes,
  onSaved,
}: StructuredDashboardProps) {
  const initial = eventDetails?.aiDashboardJson ?? null;
  const [dashboard, setDashboard] = useState<AiDashboardJson | null>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatedAt = eventDetails?.aiDashboardGeneratedAt;
  const hasText = !!fullTextForSession && fullTextForSession.length > 0;
  const pathname = usePathname();
  const aiFullPageHref = `${pathname.replace(/\/$/, "")}/ai`;

  // Métricas derivadas das votações reais (independem da IA)
  const votingStats = useMemo(() => {
    const list = eventDetails?.voting ?? [];
    const total = list.length;
    const aprovadas = list.filter((v) => v.result).length;
    const rejeitadas = list.filter((v) => !v.result).length;
    const simbolicas = list.filter((v) => v.totalVotes === 0).length;
    const nominais = total - simbolicas;
    return { total, aprovadas, rejeitadas, simbolicas, nominais };
  }, [eventDetails]);

  // Top oradores das Breves Comunicações (agregado por nome)
  const topOradores = useMemo(() => {
    const speakers = brevesComunicacoes?.speakers ?? [];
    const acc = new Map<
      string,
      { name: string; party?: string; seconds: number; falas: number }
    >();
    for (const sp of speakers) {
      const key = sp.name || "—";
      const prev = acc.get(key) ?? {
        name: key,
        party: sp.party,
        seconds: 0,
        falas: 0,
      };
      prev.seconds += parseDurationToSeconds(sp.duration);
      prev.falas += 1;
      if (!prev.party && sp.party) prev.party = sp.party;
      acc.set(key, prev);
    }
    return Array.from(acc.values())
      .sort((a, b) => b.seconds - a.seconds || b.falas - a.falas)
      .slice(0, 10);
  }, [brevesComunicacoes]);

  const oradoresHaveDuration = topOradores.some((o) => o.seconds > 0);

  async function handleGenerate(regenerate = false) {
    if (!hasText) {
      setError("Sessão sem transcrição disponível.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/plenary/session-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: fullTextForSession,
          eventId: eventDetails?.id,
          format: "json",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.dashboard) {
        setError(data.error || "Falha ao gerar dashboard.");
        return;
      }
      setDashboard(data.dashboard as AiDashboardJson);
      onSaved?.(data.dashboard as AiDashboardJson);
      void regenerate;
    } catch {
      setError("Erro de rede ao gerar dashboard.");
    } finally {
      setLoading(false);
    }
  }

  // Estado vazio: ainda não gerou o dashboard IA
  if (!dashboard) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#749c5b]/10 text-[#749c5b]">
          <Sparkles size={24} />
        </div>
        <h3 className="text-lg font-semibold text-[#1a1d1f]">
          Dashboard analítico da sessão
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#6f767e]">
          Gere uma análise estruturada (decisões, embates, insights) a partir da
          transcrição completa. Custo de IA aplicado uma vez por sessão.
        </p>
        {!hasText && (
          <p className="mt-3 text-xs text-rose-600">
            Sessão sem transcrição disponível — não é possível gerar.
          </p>
        )}
        {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}
        <button
          onClick={() => handleGenerate(false)}
          disabled={loading || !hasText}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#749c5b] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#749c5b]/90 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Gerando análise…
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Gerar análise estruturada
            </>
          )}
        </button>
      </div>
    );
  }

  // ----------- KPIs -----------
  const kpis = [
    {
      label: "Decisões",
      value: dashboard.principaisDecisoes?.length ?? 0,
      icon: Award,
      tint: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Embates",
      value: dashboard.embates?.length ?? 0,
      icon: Swords,
      tint: "bg-rose-50 text-rose-600",
    },
    {
      label: "Insights",
      value: dashboard.insights?.length ?? 0,
      icon: Lightbulb,
      tint: "bg-amber-50 text-amber-600",
    },
    {
      label: "Oradores",
      value:
        dashboard.meta?.oradoresUnicos ??
        new Set(brevesComunicacoes?.speakers?.map((s) => s.name)).size ??
        0,
      icon: Users,
      tint: "bg-blue-50 text-blue-600",
    },
    {
      label: "Tom",
      value: dashboard.meta?.tom ?? "—",
      icon: TrendingUp,
      tint: "bg-violet-50 text-violet-600",
      isText: true,
    },
  ];

  // ----------- Gráfico: Dimensões (radial bars) -----------
  const dims = dashboard.dimensoes;
  const dimSeries = dims
    ? [
        dimensionScore("conflito", dims.conflito),
        dimensionScore("efetividade", dims.efetividade),
        dimensionScore("fluidez", dims.fluidez),
      ]
    : [];
  const dimColors = dimSeries.map(dimensionHex);
  const dimOptions: ApexOptions = {
    chart: { type: "radialBar", sparkline: { enabled: true } },
    colors: dimColors,
    plotOptions: {
      radialBar: {
        track: { background: "#f3f4f6", margin: 6 },
        dataLabels: {
          name: { fontSize: "11px", color: "#6f767e", offsetY: 4 },
          value: {
            fontSize: "16px",
            color: "#1a1d1f",
            fontWeight: 600,
            offsetY: -4,
            formatter: (v) => `${Math.round(Number(v))}%`,
          },
          total: {
            show: true,
            label: "Sessão",
            color: "#1a1d1f",
            fontSize: "12px",
            fontWeight: 600,
            formatter: () => {
              const avg = dimSeries.reduce((a, b) => a + b, 0) / Math.max(dimSeries.length, 1);
              return `${Math.round(avg)}%`;
            },
          },
        },
        hollow: { size: "40%" },
      },
    },
    labels: ["Conflito", "Efetividade", "Fluidez"],
    legend: {
      show: true,
      position: "bottom",
      fontSize: "11px",
      labels: { colors: "#1a1d1f" },
      markers: { size: 5 },
    },
    stroke: { lineCap: "round" },
  };

  // ----------- Gráfico: Donut votações -----------
  const votingDonutOptions: ApexOptions = {
    chart: { type: "donut" },
    labels: ["Aprovadas", "Rejeitadas", "Simbólicas"],
    colors: ["#10b981", "#ef4444", "#3b82f6"],
    legend: { position: "bottom", fontSize: "11px" },
    dataLabels: {
      style: { fontSize: "12px", fontWeight: 600 },
      formatter: (val) => `${Math.round(Number(val))}%`,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              color: "#1a1d1f",
              fontSize: "12px",
              formatter: () => `${votingStats.total}`,
            },
            value: { color: "#1a1d1f", fontSize: "20px", fontWeight: 700 },
          },
        },
      },
    },
    stroke: { width: 2, colors: ["#fff"] },
  };
  const votingDonutSeries = [
    votingStats.aprovadas,
    votingStats.rejeitadas,
    votingStats.simbolicas,
  ];

  // ----------- Gráfico: Bar oradores -----------
  const oradoresOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: "65%",
        distributed: false,
      },
    },
    colors: ["#749c5b"],
    dataLabels: {
      enabled: true,
      formatter: (val) =>
        oradoresHaveDuration
          ? formatSeconds(Number(val))
          : `${val} ${Number(val) === 1 ? "fala" : "falas"}`,
      style: { fontSize: "11px", colors: ["#1a1d1f"] },
      offsetX: 4,
    },
    xaxis: {
      categories: topOradores.map((o) =>
        o.party ? `${o.name} (${o.party})` : o.name,
      ),
      labels: { style: { fontSize: "11px", colors: "#6f767e" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { fontSize: "11px", colors: "#1a1d1f" } } },
    grid: { borderColor: "#f3f4f6", strokeDashArray: 4 },
    tooltip: {
      y: {
        formatter: (val) =>
          oradoresHaveDuration
            ? formatSeconds(Number(val))
            : `${val} ${Number(val) === 1 ? "fala" : "falas"}`,
      },
    },
  };
  const oradoresSeries = [
    {
      name: oradoresHaveDuration ? "Tempo de fala" : "Falas registradas",
      data: topOradores.map((o) => (oradoresHaveDuration ? o.seconds : o.falas)),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-[#749c5b]/5 to-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#749c5b]/10 p-2 text-[#749c5b]">
            <Brain size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-[#1a1d1f]">
              Dashboard analítico da sessão
            </h3>
            {generatedAt && (
              <p className="text-xs text-[#6f767e]">
                Gerado em{" "}
                {new Date(generatedAt).toLocaleString("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleGenerate(true)}
            disabled={loading || !hasText}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-[#1a1d1f] hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#749c5b] border-t-transparent" />
                Regerando…
              </>
            ) : (
              <>
                <Sparkles size={13} />
                Regerar
              </>
            )}
          </button>
          <Link
            href={aiFullPageHref}
            className="inline-flex items-center gap-2 rounded-lg bg-[#749c5b] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#658a4e]"
          >
            Ver completo
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${k.tint}`}>
                <k.icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-medium tracking-wide text-gray-500 uppercase">
                  {k.label}
                </p>
                <p
                  className={`font-bold text-[#1a1d1f] ${
                    k.isText ? "truncate text-sm" : "text-2xl tabular-nums"
                  }`}
                  title={String(k.value)}
                >
                  {k.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumo executivo */}
      {dashboard.resumoExecutivo && (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#1a1d1f]">
            <Brain size={16} className="text-[#749c5b]" />
            Síntese executiva
          </h4>
          <p className="text-sm leading-relaxed text-[#1a1d1f]">
            {dashboard.resumoExecutivo}
          </p>
          {dashboard.meta && (
            <div className="mt-3 flex flex-wrap gap-3 border-t border-gray-100 pt-3 text-xs text-[#6f767e]">
              {dashboard.meta.tom && (
                <span className="inline-flex items-center gap-1">
                  <Gauge size={12} /> Tom:{" "}
                  <strong className="text-[#1a1d1f]">
                    {dashboard.meta.tom}
                  </strong>
                </span>
              )}
              {dashboard.meta.duracaoEstimada && (
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} /> Duração:{" "}
                  <strong className="text-[#1a1d1f]">
                    {dashboard.meta.duracaoEstimada}
                  </strong>
                </span>
              )}
              {typeof dashboard.meta.oradoresUnicos === "number" && (
                <span className="inline-flex items-center gap-1">
                  <Users size={12} /> Oradores:{" "}
                  <strong className="text-[#1a1d1f]">
                    {dashboard.meta.oradoresUnicos}
                  </strong>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Linha de gráficos: Dimensões + Votações */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {dims && dimSeries.some((s) => s > 0) && (
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-7">
            <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#1a1d1f]">
              <Gauge size={16} className="text-[#749c5b]" />
              Dimensões da sessão
            </h4>
            <p className="mb-2 text-xs text-[#6f767e]">
              Avaliação qualitativa do clima e do andamento, normalizada em
              escala 0–100.
            </p>
            <ReactApexChart
              type="radialBar"
              options={dimOptions}
              series={dimSeries}
              height={260}
            />
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[11px]">
              {(["conflito", "efetividade", "fluidez"] as const).map((key) => (
                <div key={key} className="rounded-md bg-gray-50 px-2 py-1">
                  <span className="block text-[#6f767e] capitalize">{key}</span>
                  <span
                    className={`mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${dimensionColor(
                      dims[key],
                    )}`}
                  >
                    {dims[key] || "—"}
                  </span>
                </div>
              ))}
            </div>
            {dims.justificativa && (
              <p className="mt-3 text-xs text-[#6f767e] italic">
                {dims.justificativa}
              </p>
            )}
          </div>
        )}

        {votingStats.total > 0 && (
          <div
            className={`rounded-xl border border-gray-100 bg-white p-5 shadow-sm ${
              dims && dimSeries.some((s) => s > 0)
                ? "lg:col-span-5"
                : "lg:col-span-12"
            }`}
          >
            <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#1a1d1f]">
              <PieChart size={16} className="text-[#749c5b]" />
              Resultado das votações
            </h4>
            <p className="mb-2 text-xs text-[#6f767e]">
              Distribuição entre votações aprovadas, rejeitadas e simbólicas.
            </p>
            <ReactApexChart
              type="donut"
              options={votingDonutOptions}
              series={votingDonutSeries}
              height={260}
            />
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="rounded-md bg-emerald-50 px-2 py-1">
                <span className="block text-[#6f767e]">Aprovadas</span>
                <strong className="text-emerald-700">
                  {votingStats.aprovadas}
                </strong>
              </div>
              <div className="rounded-md bg-rose-50 px-2 py-1">
                <span className="block text-[#6f767e]">Rejeitadas</span>
                <strong className="text-rose-700">
                  {votingStats.rejeitadas}
                </strong>
              </div>
              <div className="rounded-md bg-blue-50 px-2 py-1">
                <span className="block text-[#6f767e]">Simbólicas</span>
                <strong className="text-blue-700">
                  {votingStats.simbolicas}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top oradores */}
      {topOradores.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#1a1d1f]">
            <Mic2 size={16} className="text-[#749c5b]" />
            Top oradores — Breves Comunicações
          </h4>
          <p className="mb-2 text-xs text-[#6f767e]">
            {oradoresHaveDuration
              ? "Soma do tempo no microfone por parlamentar."
              : "Ranking pela quantidade de falas registradas."}
          </p>
          <ReactApexChart
            type="bar"
            options={oradoresOptions}
            series={oradoresSeries}
            height={Math.max(220, topOradores.length * 38)}
          />
        </div>
      )}

      {/* Principais decisões */}
      {dashboard.principaisDecisoes &&
        dashboard.principaisDecisoes.length > 0 && (
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1a1d1f]">
              <Award size={16} className="text-[#749c5b]" />
              Principais decisões
            </h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {dashboard.principaisDecisoes.map((d, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-100 bg-gradient-to-br from-emerald-50/40 to-white p-3"
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h5 className="text-sm font-semibold text-[#1a1d1f]">
                      {d.titulo}
                    </h5>
                    <span className="rounded-md bg-[#749c5b]/10 px-2 py-0.5 text-xs font-medium text-[#749c5b]">
                      {d.tipo}
                    </span>
                    {d.tema && (
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-[#6f767e]">
                        {d.tema}
                      </span>
                    )}
                  </div>
                  {d.detalhe && (
                    <p className="text-xs leading-relaxed text-[#6f767e]">
                      {d.detalhe}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Embates + Insights lado a lado */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {dashboard.embates && dashboard.embates.length > 0 && (
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1a1d1f]">
              <Swords size={16} className="text-rose-600" />
              Embates ({dashboard.embates.length})
            </h4>
            <div className="space-y-3">
              {dashboard.embates.map((e, i) => (
                <div
                  key={i}
                  className="rounded-lg border-l-4 border-rose-300 bg-rose-50/40 p-3"
                >
                  <p className="text-sm font-semibold text-[#1a1d1f]">
                    {e.tema}
                  </p>
                  {e.atores?.length > 0 && (
                    <p className="mt-1 text-xs text-[#6f767e]">
                      {e.atores.join(" × ")}
                    </p>
                  )}
                  {e.resumo && (
                    <p className="mt-2 text-xs leading-relaxed text-[#1a1d1f]">
                      {e.resumo}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {dashboard.insights && dashboard.insights.length > 0 && (
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1a1d1f]">
              <Lightbulb size={16} className="text-amber-500" />
              Insights analíticos ({dashboard.insights.length})
            </h4>
            <div className="space-y-3">
              {dashboard.insights.map((insight, i) => (
                <div key={i} className="rounded-lg border border-gray-100 p-3">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h5 className="text-sm font-semibold text-[#1a1d1f]">
                      {insight.titulo}
                    </h5>
                    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {insight.tipo}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#1a1d1f]">
                    {insight.interpretacao}
                  </p>
                  {insight.evidencia && (
                    <p className="mt-2 rounded-md bg-gray-50 px-2 py-1 text-xs text-[#6f767e] italic">
                      {insight.evidencia}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Destaques de discursos */}
      {dashboard.destaquesDiscursos &&
        dashboard.destaquesDiscursos.length > 0 && (
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1a1d1f]">
              <Mic2 size={16} className="text-[#749c5b]" />
              Destaques de discursos
            </h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {dashboard.destaquesDiscursos.map((d, i) => (
                <div
                  key={i}
                  className="rounded-lg border-l-4 border-[#749c5b]/40 bg-gray-50 p-3"
                >
                  <p className="text-xs">
                    <strong className="text-[#1a1d1f]">{d.deputado}</strong>
                    {d.partido && (
                      <span className="ml-1 text-[#6f767e]">({d.partido})</span>
                    )}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#1a1d1f] italic">
                    “{d.trecho}”
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Síntese final */}
      {dashboard.sinteseFinal && (
        <div className="rounded-xl border border-[#749c5b]/30 bg-[#749c5b]/5 p-5 shadow-sm">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#1a1d1f]">
            <AlertTriangle size={16} className="text-[#749c5b]" />
            Síntese final
          </h4>
          <p className="text-sm leading-relaxed text-[#1a1d1f]">
            {dashboard.sinteseFinal}
          </p>
        </div>
      )}
    </div>
  );
}
