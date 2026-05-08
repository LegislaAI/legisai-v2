"use client";

import { BackButton } from "@/components/v2/components/ui/BackButton";
import { LegislativeSyncLoader } from "@/components/v2/components/ui/LegislativeSyncLoader";
import { useApiContext } from "@/context/ApiContext";
import type { ApexOptions } from "apexcharts";
import {
  Activity,
  Award,
  Brain,
  Calendar,
  Check,
  Clock,
  Flame,
  Gauge,
  Lightbulb,
  Mic2,
  PieChart,
  Quote,
  RefreshCw,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import moment from "moment";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AiDashboardJson,
  BrevesComunicacoesResponse,
  EventDetailsAPI,
} from "../components/types";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// ----------- helpers -----------
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

// Iniciais para avatares
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

// ----------- página -----------
export default function SessionAiDashboardPage() {
  const pathname = usePathname();
  const { GetAPI } = useApiContext();

  const eventId = pathname.split("/").filter(Boolean).slice(-2, -1)[0];

  const [eventDetails, setEventDetails] = useState<EventDetailsAPI | null>(
    null,
  );
  const [brevesComunicacoes, setBrevesComunicacoes] =
    useState<BrevesComunicacoesResponse | null>(null);
  const [transcricao, setTranscricao] = useState<{
    exists: boolean;
    fullText: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const [dashboard, setDashboard] = useState<AiDashboardJson | null>(null);
  const [generatingDashboard, setGeneratingDashboard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Boot: carrega evento + breves + transcricao em paralelo
  useEffect(() => {
    let cancel = false;
    async function boot() {
      if (!eventId) return;
      setLoading(true);
      const [evRes, brRes, trRes] = await Promise.all([
        GetAPI(`/event/details/${eventId}`, true),
        GetAPI(`/event/${eventId}/breves-comunicacoes`, true),
        GetAPI(`/event/${eventId}/transcricao-completa`, true),
      ]);
      if (cancel) return;
      if (evRes.status === 200 && evRes.body) {
        setEventDetails(evRes.body);
        if (evRes.body.aiDashboardJson) setDashboard(evRes.body.aiDashboardJson);
      }
      if (brRes.status === 200) setBrevesComunicacoes(brRes.body);
      if (trRes.status === 200 && trRes.body) {
        setTranscricao({
          exists: trRes.body.exists === true,
          fullText: trRes.body.fullText ?? null,
        });
      }
      setLoading(false);
    }
    boot();
    return () => {
      cancel = true;
    };
  }, [eventId]);

  const fullText = useMemo(() => {
    if (transcricao?.fullText) return transcricao.fullText;
    return (
      brevesComunicacoes?.speakers
        ?.map((s) => s.transcription?.trim() || s.speechSummary?.trim() || "")
        .filter(Boolean)
        .join("\n\n") || null
    );
  }, [transcricao, brevesComunicacoes]);

  async function regenerate() {
    if (!fullText || !eventDetails?.id) return;
    setGeneratingDashboard(true);
    setError(null);
    try {
      const res = await fetch("/api/plenary/session-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: fullText,
          eventId: eventDetails.id,
          format: "json",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.dashboard) {
        setError(data.error || "Falha ao gerar dashboard.");
      } else {
        setDashboard(data.dashboard as AiDashboardJson);
      }
    } catch {
      setError("Erro de rede ao gerar dashboard.");
    } finally {
      setGeneratingDashboard(false);
    }
  }

  // ----------- métricas derivadas -----------
  const votingStats = useMemo(() => {
    const list = eventDetails?.voting ?? [];
    const total = list.length;
    const aprovadas = list.filter((v) => v.result).length;
    const rejeitadas = list.filter((v) => !v.result).length;
    const simbolicas = list.filter((v) => v.totalVotes === 0).length;
    const taxaAprov = total ? Math.round((aprovadas / total) * 100) : 0;
    return { total, aprovadas, rejeitadas, simbolicas, taxaAprov };
  }, [eventDetails]);

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
      .slice(0, 12);
  }, [brevesComunicacoes]);

  const oradoresHaveDuration = topOradores.some((o) => o.seconds > 0);

  // Distribuição de partidos entre os oradores
  const partyMix = useMemo(() => {
    const speakers = brevesComunicacoes?.speakers ?? [];
    const map = new Map<string, number>();
    for (const sp of speakers) {
      const p = (sp.party || "").trim() || "Sem partido";
      map.set(p, (map.get(p) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [brevesComunicacoes]);

  // Mix de tipos de decisão (para polar area chart)
  const decisionTypes = useMemo(() => {
    const list = dashboard?.principaisDecisoes ?? [];
    const map = new Map<string, number>();
    for (const d of list) {
      const k = (d.tipo || "Outros").trim();
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [dashboard]);

  // Temas mencionados (decisões + embates + insights)
  const themes = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of dashboard?.principaisDecisoes ?? []) {
      if (d.tema) map.set(d.tema, (map.get(d.tema) ?? 0) + 2);
    }
    for (const e of dashboard?.embates ?? []) {
      if (e.tema) map.set(e.tema, (map.get(e.tema) ?? 0) + 3);
    }
    for (const i of dashboard?.insights ?? []) {
      const tag = (i.tipo || "").trim();
      if (tag) map.set(tag, (map.get(tag) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [dashboard]);

  if (loading) return <LegislativeSyncLoader />;

  if (!eventDetails) {
    return (
      <div className="p-10 text-center text-gray-500">
        Sessão não encontrada.
      </div>
    );
  }

  const dims = dashboard?.dimensoes;
  const hasDims = !!dims;

  // ===== Apex configs =====
  const dimSeries = hasDims
    ? [
        dimensionScore("conflito", dims!.conflito),
        dimensionScore("efetividade", dims!.efetividade),
        dimensionScore("fluidez", dims!.fluidez),
      ]
    : [];

  const dimRadialOptions: ApexOptions = {
    chart: { type: "radialBar", sparkline: { enabled: true } },
    colors: ["#ef4444", "#10b981", "#3b82f6"],
    plotOptions: {
      radialBar: {
        track: { background: "rgba(255,255,255,0.15)", margin: 8 },
        dataLabels: {
          name: { fontSize: "13px", color: "#fff", offsetY: 6 },
          value: {
            fontSize: "20px",
            color: "#fff",
            fontWeight: 700,
            offsetY: -6,
            formatter: (v) => `${Math.round(Number(v))}%`,
          },
          total: {
            show: true,
            label: "Equilíbrio",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 600,
            formatter: () => {
              const avg =
                dimSeries.reduce((a, b) => a + b, 0) /
                Math.max(dimSeries.length, 1);
              return `${Math.round(avg)}%`;
            },
          },
        },
        hollow: { size: "45%" },
      },
    },
    labels: ["Conflito", "Efetividade", "Fluidez"],
    legend: {
      show: true,
      position: "bottom",
      labels: { colors: "#fff" },
      markers: { size: 6 },
      fontSize: "12px",
    },
    stroke: { lineCap: "round" },
  };

  const votingDonutOptions: ApexOptions = {
    chart: { type: "donut" },
    labels: ["Aprovadas", "Rejeitadas", "Simbólicas"],
    colors: ["#10b981", "#ef4444", "#3b82f6"],
    legend: { position: "bottom", fontSize: "12px" },
    dataLabels: {
      style: { fontSize: "13px", fontWeight: 600 },
      formatter: (val) => `${Math.round(Number(val))}%`,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              color: "#1a1d1f",
              fontSize: "13px",
              formatter: () => `${votingStats.total}`,
            },
            value: {
              color: "#1a1d1f",
              fontSize: "28px",
              fontWeight: 700,
            },
          },
        },
      },
    },
    stroke: { width: 3, colors: ["#fff"] },
  };

  const oradoresOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        barHeight: "70%",
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        gradientToColors: ["#4E9F3D"],
        stops: [0, 100],
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
      offsetX: 6,
    },
    xaxis: {
      categories: topOradores.map((o) =>
        o.party ? `${o.name} · ${o.party}` : o.name,
      ),
      labels: { style: { fontSize: "11px", colors: "#6f767e" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { fontSize: "12px", colors: "#1a1d1f" } } },
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

  const partyMixOptions: ApexOptions = {
    chart: { type: "polarArea" },
    labels: partyMix.map(([p]) => p),
    fill: { opacity: 0.85 },
    stroke: { colors: ["#fff"] },
    legend: { position: "bottom", fontSize: "11px" },
    colors: [
      "#749c5b",
      "#4E9F3D",
      "#2d5a3d",
      "#8ab86e",
      "#f59e0b",
      "#ef4444",
      "#3b82f6",
      "#a855f7",
    ],
    plotOptions: { polarArea: { rings: { strokeColor: "#e5e7eb" } } },
  };

  const decisionTypesOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: { horizontal: false, borderRadius: 6, columnWidth: "50%" },
    },
    colors: ["#10b981"],
    dataLabels: { enabled: true, style: { fontSize: "11px" } },
    xaxis: {
      categories: decisionTypes.map(([k]) => k),
      labels: { style: { fontSize: "11px", colors: "#6f767e" } },
    },
    yaxis: { labels: { style: { colors: "#6f767e" } } },
    grid: { borderColor: "#f3f4f6", strokeDashArray: 4 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6 pb-24 font-sans text-[#1a1d1f]">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <BackButton />

        {/* HERO */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a3a2e] via-[#2d5a3d] to-[#4E9F3D] p-8 text-white shadow-2xl">
          {/* glow decorativo */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[#749c5b] opacity-30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#8ab86e] opacity-20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.08),transparent_50%)]" />

          <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="space-y-4 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
                <Sparkles size={14} />
                Análise gerada por IA
              </div>
              <h1 className="text-3xl leading-tight font-bold md:text-4xl">
                {eventDetails.description || eventDetails.eventType?.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/85">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={14} />
                  {moment(eventDetails.startDate)
                    .utc()
                    .locale("pt-br")
                    .format("DD [de] MMM [de] YYYY")}
                </span>
                <span className="text-white/40">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} />
                  {moment(eventDetails.startDate).utc().format("HH:mm")}
                  {eventDetails.endDate
                    ? ` → ${moment(eventDetails.endDate).utc().format("HH:mm")}`
                    : ""}
                </span>
                <span className="text-white/40">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Users size={14} />
                  {eventDetails.politicians?.length || 0} parlamentares
                </span>
              </div>
              {dashboard?.resumoExecutivo && (
                <p className="max-w-3xl text-sm leading-relaxed text-white/90 md:text-[15px]">
                  {dashboard.resumoExecutivo}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {dashboard?.meta?.tom && (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-md">
                    Tom: {dashboard.meta.tom}
                  </span>
                )}
                {dashboard?.meta?.duracaoEstimada && (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-md">
                    Duração: {dashboard.meta.duracaoEstimada}
                  </span>
                )}
                {eventDetails.aiDashboardGeneratedAt && (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-md">
                    Gerado em{" "}
                    {new Date(
                      eventDetails.aiDashboardGeneratedAt,
                    ).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                )}
                <button
                  onClick={regenerate}
                  disabled={generatingDashboard || !fullText}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#2d5a3d] shadow transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generatingDashboard ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#2d5a3d] border-t-transparent" />
                      Regerando…
                    </>
                  ) : (
                    <>
                      <RefreshCw size={12} />
                      {dashboard ? "Regerar análise" : "Gerar análise"}
                    </>
                  )}
                </button>
              </div>
              {error && (
                <p className="text-xs text-rose-200">{error}</p>
              )}
            </div>

            {/* Anel de dimensões dentro do hero */}
            {hasDims && dimSeries.some((s) => s > 0) && (
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-wider text-white/80 uppercase">
                    <Gauge size={14} />
                    Pulso da sessão
                  </div>
                  <ReactApexChart
                    type="radialBar"
                    options={dimRadialOptions}
                    series={dimSeries}
                    height={280}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Estado vazio: sem dashboard ainda */}
        {!dashboard && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#749c5b]/10 text-[#749c5b]">
              <Sparkles size={28} />
            </div>
            <h3 className="text-xl font-semibold text-[#1a1d1f]">
              Análise IA ainda não gerada
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Clique em "Gerar análise" no topo. O custo é aplicado uma única
              vez por sessão e o resultado fica em cache.
            </p>
            {!fullText && (
              <p className="mt-3 text-xs text-rose-600">
                Esta sessão não tem transcrição disponível — não é possível
                gerar.
              </p>
            )}
          </div>
        )}

        {/* KPIs grandes e impactantes */}
        {dashboard && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <KpiCard
              icon={Award}
              label="Decisões"
              value={dashboard.principaisDecisoes?.length ?? 0}
              accent="from-emerald-500 to-emerald-600"
            />
            <KpiCard
              icon={Swords}
              label="Embates"
              value={dashboard.embates?.length ?? 0}
              accent="from-rose-500 to-rose-600"
            />
            <KpiCard
              icon={Lightbulb}
              label="Insights"
              value={dashboard.insights?.length ?? 0}
              accent="from-amber-500 to-amber-600"
            />
            <KpiCard
              icon={Mic2}
              label="Discursos"
              value={dashboard.destaquesDiscursos?.length ?? 0}
              accent="from-violet-500 to-violet-600"
            />
            <KpiCard
              icon={Check}
              label="Aprovação"
              value={`${votingStats.taxaAprov}%`}
              sub={`${votingStats.aprovadas}/${votingStats.total} votações`}
              accent="from-blue-500 to-blue-600"
            />
            <KpiCard
              icon={Users}
              label="Oradores"
              value={
                dashboard.meta?.oradoresUnicos ??
                new Set(brevesComunicacoes?.speakers?.map((s) => s.name)).size
              }
              accent="from-[#749c5b] to-[#2d5a3d]"
            />
          </div>
        )}

        {/* Linha de gráficos: Votações + Partidos + Tipos de decisão */}
        {dashboard && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {votingStats.total > 0 && (
              <SectionCard
                title="Resultado das votações"
                subtitle="Distribuição entre aprovadas, rejeitadas e simbólicas"
                icon={PieChart}
                className="lg:col-span-4"
              >
                <ReactApexChart
                  type="donut"
                  options={votingDonutOptions}
                  series={[
                    votingStats.aprovadas,
                    votingStats.rejeitadas,
                    votingStats.simbolicas,
                  ]}
                  height={300}
                />
              </SectionCard>
            )}

            {partyMix.length > 0 && (
              <SectionCard
                title="Pluralidade no microfone"
                subtitle="Mix de partidos representados nas Breves Comunicações"
                icon={Users}
                className="lg:col-span-4"
              >
                <ReactApexChart
                  type="polarArea"
                  options={partyMixOptions}
                  series={partyMix.map(([, n]) => n)}
                  height={300}
                />
              </SectionCard>
            )}

            {decisionTypes.length > 0 && (
              <SectionCard
                title="Tipos de decisão"
                subtitle="Como a IA classificou as deliberações"
                icon={Target}
                className="lg:col-span-4"
              >
                <ReactApexChart
                  type="bar"
                  options={decisionTypesOptions}
                  series={[
                    {
                      name: "Decisões",
                      data: decisionTypes.map(([, n]) => n),
                    },
                  ]}
                  height={300}
                />
              </SectionCard>
            )}
          </div>
        )}

        {/* Top oradores em destaque (full width) */}
        {topOradores.length > 0 && (
          <SectionCard
            title="Quem ocupou mais o microfone"
            subtitle={
              oradoresHaveDuration
                ? "Soma do tempo no microfone por parlamentar nas Breves Comunicações"
                : "Ranking pelo número de falas registradas"
            }
            icon={Mic2}
          >
            <ReactApexChart
              type="bar"
              options={oradoresOptions}
              series={[
                {
                  name: oradoresHaveDuration
                    ? "Tempo de fala"
                    : "Falas registradas",
                  data: topOradores.map((o) =>
                    oradoresHaveDuration ? o.seconds : o.falas,
                  ),
                },
              ]}
              height={Math.max(260, topOradores.length * 42)}
            />
          </SectionCard>
        )}

        {/* Temas em destaque */}
        {dashboard && themes.length > 0 && (
          <SectionCard
            title="Temas em destaque"
            subtitle="Pauta que mais mobilizou decisões, embates e insights"
            icon={Flame}
          >
            <div className="flex flex-wrap gap-2">
              {themes.map(([name, weight]) => {
                const max = themes[0][1];
                const intensity = weight / max; // 0–1
                const fontSize = 0.75 + intensity * 0.7; // rem
                const opacity = 0.55 + intensity * 0.45;
                return (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 rounded-full border border-[#749c5b]/30 bg-gradient-to-br from-[#749c5b]/10 to-[#4E9F3D]/15 px-3 py-1 font-semibold text-[#2d5a3d] shadow-sm transition hover:scale-105"
                    style={{
                      fontSize: `${fontSize}rem`,
                      opacity,
                    }}
                  >
                    {name}
                    <span className="rounded-full bg-white/70 px-1.5 py-0 text-[10px] font-bold text-[#2d5a3d]">
                      {weight}
                    </span>
                  </span>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* Decisões — cards grandes */}
        {dashboard?.principaisDecisoes &&
          dashboard.principaisDecisoes.length > 0 && (
            <SectionCard
              title="Principais decisões"
              subtitle={`${dashboard.principaisDecisoes.length} deliberações registradas pela IA`}
              icon={Award}
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {dashboard.principaisDecisoes.map((d, i) => (
                  <div
                    key={i}
                    className="group relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-white p-4 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-200/40 blur-2xl transition group-hover:bg-emerald-300/50" />
                    <div className="relative">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-700 uppercase">
                          {d.tipo}
                        </span>
                        {d.tema && (
                          <span className="rounded-md bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-gray-600 ring-1 ring-gray-200">
                            {d.tema}
                          </span>
                        )}
                      </div>
                      <h5 className="text-sm font-bold text-[#1a1d1f]">
                        {d.titulo}
                      </h5>
                      {d.detalhe && (
                        <p className="mt-2 text-xs leading-relaxed text-gray-600">
                          {d.detalhe}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

        {/* Embates + Insights lado a lado */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {dashboard?.embates && dashboard.embates.length > 0 && (
            <SectionCard
              title="Embates da sessão"
              subtitle="Tensões e confrontos identificados"
              icon={Swords}
              accent="rose"
            >
              <div className="space-y-3">
                {dashboard.embates.map((e, i) => (
                  <div
                    key={i}
                    className="rounded-xl border-l-4 border-rose-400 bg-rose-50/60 p-4 transition hover:bg-rose-50"
                  >
                    <p className="text-sm font-bold text-[#1a1d1f]">
                      {e.tema}
                    </p>
                    {e.atores?.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {e.atores.map((a, j) => (
                          <span
                            key={j}
                            className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200"
                          >
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-200 text-[9px] font-bold text-rose-800">
                              {initials(a)}
                            </span>
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                    {e.resumo && (
                      <p className="mt-2 text-xs leading-relaxed text-gray-700">
                        {e.resumo}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {dashboard?.insights && dashboard.insights.length > 0 && (
            <SectionCard
              title="Insights analíticos"
              subtitle="Padrões e leituras estratégicas pela IA"
              icon={Lightbulb}
              accent="amber"
            >
              <div className="space-y-3">
                {dashboard.insights.map((insight, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50/60 to-white p-4"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Zap size={14} className="text-amber-500" />
                      <h5 className="text-sm font-bold text-[#1a1d1f]">
                        {insight.titulo}
                      </h5>
                      <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 uppercase">
                        {insight.tipo}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#1a1d1f]">
                      {insight.interpretacao}
                    </p>
                    {insight.evidencia && (
                      <p className="mt-2 rounded-md bg-white/80 px-2 py-1.5 text-[11px] text-gray-600 italic ring-1 ring-amber-100">
                        {insight.evidencia}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* Destaques de discursos — citações grandes */}
        {dashboard?.destaquesDiscursos &&
          dashboard.destaquesDiscursos.length > 0 && (
            <SectionCard
              title="Citações em destaque"
              subtitle="Trechos selecionados pela IA"
              icon={Quote}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {dashboard.destaquesDiscursos.map((d, i) => (
                  <figure
                    key={i}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a3a2e] to-[#4E9F3D] p-6 text-white shadow-lg"
                  >
                    <Quote
                      size={64}
                      className="pointer-events-none absolute -top-2 -right-2 text-white/15"
                    />
                    <blockquote className="relative text-base leading-relaxed font-medium italic">
                      “{d.trecho}”
                    </blockquote>
                    <figcaption className="relative mt-4 flex items-center gap-3 border-t border-white/20 pt-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                        {initials(d.deputado)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{d.deputado}</p>
                        {d.partido && (
                          <p className="text-xs text-white/75">{d.partido}</p>
                        )}
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </SectionCard>
          )}

        {/* Síntese final */}
        {dashboard?.sinteseFinal && (
          <div className="rounded-2xl border border-[#749c5b]/30 bg-gradient-to-br from-[#749c5b]/10 via-white to-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg bg-[#749c5b] p-2 text-white">
                <Activity size={18} />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#1a1d1f]">
                  Síntese final
                </h4>
                <p className="text-xs text-gray-500">
                  Conclusão executiva da IA sobre a sessão
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-[#1a1d1f]">
              {dashboard.sinteseFinal}
            </p>
          </div>
        )}

        {dashboard?.dimensoes?.justificativa && (
          <p className="rounded-xl bg-gray-50 p-4 text-xs text-gray-500 italic">
            <strong className="text-gray-700">Sobre as dimensões:</strong>{" "}
            {dashboard.dimensoes.justificativa}
          </p>
        )}
      </div>
    </div>
  );
}

// ====== sub-componentes ======
function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number | string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl transition group-hover:opacity-40`}
      />
      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
            {label}
          </p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#1a1d1f]">
            {value}
          </p>
          {sub && <p className="mt-0.5 text-[10px] text-gray-500">{sub}</p>}
        </div>
        <div
          className={`rounded-xl bg-gradient-to-br ${accent} p-2 text-white shadow-md`}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  children,
  className = "",
  accent,
}: {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  className?: string;
  accent?: "rose" | "amber";
}) {
  const accentClass =
    accent === "rose"
      ? "bg-rose-100 text-rose-600"
      : accent === "amber"
        ? "bg-amber-100 text-amber-600"
        : "bg-[#749c5b]/10 text-[#749c5b]";

  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="mb-3 flex items-start gap-3">
        <div className={`rounded-lg p-2 ${accentClass}`}>
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="flex items-center gap-2 text-sm font-bold text-[#1a1d1f]">
            <Brain size={0} className="hidden" /> {title}
            <TrendingUp size={0} className="hidden" />
          </h4>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
