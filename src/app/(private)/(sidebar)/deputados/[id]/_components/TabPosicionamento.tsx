"use client";

import { CustomPagination } from "@/components/ui/CustomPagination";
import { Button } from "@/components/v2/components/ui/Button";
import { TooltipProvider } from "@/components/v2/components/ui/tooltip";
import { useSignatureContext } from "@/context/SignatureContext";
import { canAccessTramitacoes } from "@/lib/plan-access";
import type { PlanLevel } from "@/@types/signature";
import { cn } from "@/lib/utils";
import type { ApexOptions } from "apexcharts";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileText,
  Hash,
  Mic2,
  Tag,
  TrendingUp,
  Vote,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { SkeletonLoader } from "./SkeletonLoader";
import type { ProposicaoDeputado } from "./types";
import type { DeputadoPageData } from "./useDeputadoPage";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const CARD_3D =
  "relative overflow-hidden rounded-2xl border-0 bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_40px_-8px_rgba(116,156,91,0.18),0_2px_8px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-[2px]";

const GLASS_HEADER =
  "bg-gradient-to-r from-[#749c5b]/[0.04] via-white/80 to-white backdrop-blur-sm";

const BI_PALETTE = [
  "#749c5b",
  "#4E9F3D",
  "#2d5a3d",
  "#1B3B2B",
  "#5a8c4a",
  "#8ab86e",
  "#3d7a5c",
  "#6bc28c",
  "#2e6b4a",
  "#a0d88a",
];

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  badge,
  accentColor = "#749c5b",
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  subtitle?: string;
  badge?: string;
  accentColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}0a)`,
          }}
        >
          <Icon className="h-5 w-5" style={{ color: accentColor }} />
        </div>
        <div>
          <h3 className="text-[15px] font-bold tracking-tight text-gray-900">
            {title}
          </h3>
          {subtitle && <p className="text-[11px] text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {badge && (
        <span
          className="rounded-full px-3 py-1.5 text-[11px] font-bold"
          style={{ background: `${accentColor}15`, color: accentColor }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function KPICard({
  value,
  label,
  icon: Icon,
  gradient,
  iconBg,
  textColor,
  comingSoon,
}: {
  value: number | string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  gradient: string;
  iconBg: string;
  textColor: string;
  comingSoon?: boolean;
}) {
  return (
    <div
      className={`${CARD_3D} group cursor-default p-0 ${comingSoon ? "relative overflow-hidden" : ""}`}
    >
      {comingSoon && (
        <span className="absolute top-3 right-3 z-10 rounded-full bg-gray-200/60 px-2.5 py-1 text-[10px] font-bold tracking-wider text-gray-600 uppercase backdrop-blur-sm">
          Em breve
        </span>
      )}
      <div className={cn("relative p-5", comingSoon && "select-none")}>
        <div className={cn(comingSoon && "pointer-events-none blur-[2px]")}>
          <div className="mb-4 flex items-center justify-between">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
              style={{ background: iconBg }}
            >
              <Icon className="h-5 w-5" style={{ color: textColor }} />
            </div>
          </div>
          <p
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: textColor }}
          >
            {comingSoon ? "-" : value}
          </p>
          <p className="mt-1 text-xs font-semibold tracking-widest text-gray-400 uppercase">
            {label}
          </p>
        </div>
        <div
          className="absolute bottom-0 left-0 h-1 w-full"
          style={{ background: gradient }}
        />
      </div>
    </div>
  );
}

function ProposicaoCard({ prop }: { prop: ProposicaoDeputado }) {
  const dataStr = new Date(prop.dt_apresentacao).toLocaleDateString("pt-BR");
  const identificador = `${prop.sigla_tipo} ${prop.numero}/${prop.ano}`;

  return (
    <Link
      href={`/proposicoes/${prop.id}`}
      className="group hover:border-secondary/30 flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-4 transition-all duration-200 hover:shadow-md sm:flex-row sm:items-start sm:justify-between sm:gap-4"
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-secondary/10 text-secondary inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold">
            <Hash className="h-3.5 w-3.5" />
            {identificador}
          </span>
          {prop.situacao_descricao && (
            <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[10px] font-semibold text-gray-500">
              {prop.situacao_descricao}
            </span>
          )}
        </div>
        <p
          className="line-clamp-2 text-sm leading-relaxed text-gray-700"
          title={prop.ementa || undefined}
        >
          {prop.ementa || "—"}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar className="h-3 w-3" />
          {dataStr}
        </div>
      </div>
      <span className="bg-secondary/5 text-secondary group-hover:bg-secondary inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all group-hover:text-white">
        Ver proposição
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  );
}

export function TabPosicionamento({ data }: { data: DeputadoPageData }) {
  const { activeSignature } = useSignatureContext();
  const planLevel: PlanLevel = activeSignature?.signaturePlan?.level ?? 4;
  const {
    politician,
    proposicoesResumo,
    proposicoes,
    loadingProposicoes,
    proposicoesPage,
    setProposicoesPage,
    proposicoesPages,
    votacoesIndicadores,
    temas,
    loadingTemas,
    presenca,
    loadingPresenca,
    contadores,
    loadingContadores,
    discursosResumo,
  } = data;

  const temasTop = temas?.temas?.slice(0, 10) ?? [];

  const propsPorTipoRaw = proposicoesResumo?.cnt_prop_por_tipo ?? [];
  const totalProposicoes = proposicoesResumo?.total ?? 0;
  const propsPorTipo = [...propsPorTipoRaw].sort((a, b) => b.count - a.count);

  const LIMITE_PCT_OUTROS = 1;
  const propsPorTipoComPct = propsPorTipo.map((t) => ({
    ...t,
    pct: totalProposicoes > 0 ? (t.count / totalProposicoes) * 100 : 0,
  }));
  const principais = propsPorTipoComPct.filter((t) => t.pct > LIMITE_PCT_OUTROS);
  const outrosItens = propsPorTipoComPct.filter((t) => t.pct <= LIMITE_PCT_OUTROS);
  const outrosCount = outrosItens.reduce((s, t) => s + t.count, 0);
  const propsPorTipoExibir =
    outrosItens.length === 0
      ? principais
      : [
          ...principais,
          {
            sigla_tipo: "Outros (≤1%)",
            count: outrosCount,
            pct: totalProposicoes > 0 ? (outrosCount / totalProposicoes) * 100 : 0,
          },
        ];

  const barPropsPorTipoOptions: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "inherit",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: {
        enabled: true,
        speed: 600,
      },
      events: {
        mounted: (chart: { el?: Element }) => {
          const wrap = chart?.el;
          const inner = wrap?.querySelector?.(".apexcharts-inner");
          const dl = wrap?.querySelector?.(".apexcharts-datalabels-group");
          if (inner && dl) {
            inner.appendChild(dl);
          }
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        borderRadiusApplication: "end",
        barHeight: "72%",
        distributed: true,
        dataLabels: { position: "top" as const },
        rangeBarOverlap: false,
      },
    },
    colors: propsPorTipoExibir.map((_, i) =>
      propsPorTipoExibir[i]?.sigla_tipo === "Outros (≤1%)"
        ? "#9ca3af"
        : BI_PALETTE[i % BI_PALETTE.length],
    ),
    dataLabels: {
      enabled: true,
      textAnchor: "start",
      offsetX: 14,
      style: {
        fontSize: "12px",
        fontWeight: "800",
        fontFamily: "inherit",
        colors: propsPorTipoExibir.map(() => "#111827"),
      },
      dropShadow: { enabled: false },
      background: {
        enabled: true,
        padding: 8,
        borderRadius: 6,
        borderColor: "#d1d5db",
        borderWidth: 1,
        backgroundColor: "#ffffff",
        foreColor: "#111827",
      },
      formatter: (_val: number, opt: { dataPointIndex: number }) => {
        const item = propsPorTipoExibir[opt.dataPointIndex];
        const pct =
          totalProposicoes > 0
            ? ((item?.count ?? 0) / totalProposicoes) * 100
            : 0;
        return `${item?.count ?? 0} (${pct.toFixed(1)}%)`;
      },
    },
    xaxis: {
      categories: propsPorTipoExibir.map((t) => t.sigla_tipo),
      labels: {
        show: true,
        style: { fontSize: "11px", colors: "#9ca3af" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tickAmount: 6,
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          fontWeight: "600",
          colors: Array(propsPorTipoExibir.length).fill("#374151"),
        },
        maxWidth: 64,
      },
      reversed: false,
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: false } },
      padding: { top: 8, right: 100, bottom: 0, left: 4 },
    },
    legend: { show: false },
    tooltip: {
      shared: true,
      intersect: false,
      custom: function ({ seriesIndex, dataPointIndex }) {
        const item = propsPorTipoExibir[dataPointIndex];
        if (!item) return "";
        const pct =
          totalProposicoes > 0
            ? ((item.count / totalProposicoes) * 100).toFixed(1)
            : "0";
        const isOutros = item.sigla_tipo === "Outros (≤1%)";
        const cor = isOutros ? "#9ca3af" : BI_PALETTE[seriesIndex % BI_PALETTE.length];
        const detalhesOutros =
          isOutros && outrosItens.length > 0
            ? `
            <div class="mt-2 pt-2 border-t border-gray-100 space-y-1">
              <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Tipos incluídos (≤1% cada)</div>
              ${outrosItens
                .map(
                  (t) =>
                    `<div class="flex justify-between gap-3 text-xs"><span class="text-gray-600">${t.sigla_tipo}</span><span class="font-bold text-gray-900">${t.count} (${t.pct.toFixed(1)}%)</span></div>`,
                )
                .join("")}
            </div>
            `
            : "";
        return `
          <div class="rounded-xl border border-gray-100 bg-white p-3 shadow-lg" style="min-width: 180px;">
            <div class="flex items-center gap-2 border-b border-gray-100 pb-2 mb-2">
              <span class="flex h-2 w-2 rounded-full shrink-0" style="background: ${cor}"></span>
              <span class="text-sm font-bold text-gray-900">${item.sigla_tipo}</span>
            </div>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between gap-4">
                <span class="text-gray-500">Quantidade</span>
                <span class="font-bold text-gray-900">${item.count.toLocaleString("pt-BR")} proposição(ões)</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500">Do total</span>
                <span class="font-bold text-secondary">${pct}%</span>
              </div>
              ${detalhesOutros}
            </div>
          </div>
        `;
      },
    },
  };

  const barTemasOptions: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "inherit",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        borderRadiusApplication: "end",
        barHeight: "70%",
        distributed: true,
        dataLabels: { position: "top" },
      },
    },
    colors: BI_PALETTE,
    dataLabels: {
      enabled: true,
      textAnchor: "start",
      offsetX: 5,
      style: { fontSize: "11px", fontWeight: "700", colors: ["#374151"] },
      formatter: (_val: number, opt: { dataPointIndex: number }) =>
        String(temasTop[opt.dataPointIndex]?.count ?? ""),
    },
    xaxis: {
      categories: temasTop.map((t) =>
        t.tema_nome.length > 32 ? t.tema_nome.slice(0, 30) + "…" : t.tema_nome,
      ),
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "11px",
          fontWeight: "600",
          colors: Array(temasTop.length).fill("#374151"),
        },
        maxWidth: 220,
      },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: false } },
    },
    legend: { show: false },
    tooltip: {
      y: { formatter: (val: number) => `${val} proposição(ões)` },
    },
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* ═══════ ROW 1 — KPI Cards ═══════ */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KPICard
            value={proposicoesResumo?.total ?? "—"}
            label="Proposições"
            icon={FileText}
            gradient="linear-gradient(90deg, #749c5b, #4E9F3D)"
            iconBg="#749c5b18"
            textColor="#749c5b"
          />
          <KPICard
            value={votacoesIndicadores?.baseVotosCount ?? "—"}
            label="Votações"
            icon={Vote}
            gradient="linear-gradient(90deg, #2563eb, #3b82f6)"
            iconBg="#2563eb18"
            textColor="#2563eb"
          />
          <KPICard
            value="—"
            label="Alinhamento"
            icon={TrendingUp}
            gradient="linear-gradient(90deg, #6b7280, #9ca3af)"
            iconBg="#6b728018"
            textColor="#6b7280"
            comingSoon
          />
          <KPICard
            value={temasTop.length > 0 ? temasTop.length : "—"}
            label="Temas Ativos"
            icon={Tag}
            gradient="linear-gradient(90deg, #7c3aed, #8b5cf6)"
            iconBg="#7c3aed18"
            textColor="#7c3aed"
            comingSoon
          />
        </div>

        {/* ═══════ ROW 2 — Presença e Atividade ═══════ */}
        <div className="grid gap-6 lg:grid-cols-1">
          {/* Presença e Atividade */}
          <div className={CARD_3D}>
            <div className={`${GLASS_HEADER} px-6 pt-5 pb-3`}>
              <SectionTitle
                icon={Activity}
                title="Presença e Atividade"
                subtitle={
                  presenca
                    ? `${new Date(presenca.dataInicio).toLocaleDateString("pt-BR")} — ${new Date(presenca.dataFim).toLocaleDateString("pt-BR")}`
                    : "Período legislativo"
                }
                accentColor="#059669"
              />
            </div>
            <div className="px-6 pb-5">
              {loadingPresenca || loadingContadores ? (
                <div className="space-y-3 py-8">
                  {[1, 2, 3].map((i) => (
                    <SkeletonLoader
                      key={i}
                      className="h-12 w-full rounded-xl"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {presenca && presenca.presencas + presenca.ausencias > 0 ? (
                    <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-50/30 p-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-100 shadow-sm">
                        <span className="text-lg font-extrabold text-emerald-600">
                          {Math.round(
                            (presenca.presencas /
                              (presenca.presencas + presenca.ausencias)) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          Taxa de Presença
                        </p>
                        <p className="text-xs text-gray-500">
                          {presenca.presencas} presenças · {presenca.ausencias}{" "}
                          ausências
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                      <CheckCircle2 className="h-5 w-5 text-gray-300" />
                      <p className="text-xs font-medium text-gray-400">
                        Dados de presença indisponíveis
                      </p>
                    </div>
                  )}

                  {contadores && (
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          label: "Eventos",
                          value: contadores.eventos,
                          color: "#2563eb",
                          bg: "bg-blue-50",
                        },
                        {
                          label: "Proposições",
                          value: contadores.proposicoes,
                          color: "#749c5b",
                          bg: "bg-green-50",
                        },
                        {
                          label: "Discursos",
                          value: contadores.discursos,
                          color: "#7c3aed",
                          bg: "bg-purple-50",
                        },
                        {
                          label: "Votações",
                          value: contadores.votacoes,
                          color: "#d97706",
                          bg: "bg-amber-50",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={cn(
                            "rounded-xl p-3 transition-all hover:shadow-sm",
                            item.bg,
                          )}
                        >
                          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                            {item.label}
                          </p>
                          <p
                            className="mt-1 text-xl font-extrabold"
                            style={{ color: item.color }}
                          >
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {discursosResumo && discursosResumo.total > 0 && (
                    <div className="flex items-center justify-between rounded-lg border border-purple-100 bg-purple-50/50 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Mic2 className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-semibold text-gray-700">
                          <span className="font-extrabold text-purple-600">
                            {discursosResumo.total}
                          </span>{" "}
                          discursos no período
                        </span>
                      </div>
                      {discursosResumo.ultimaData && (
                        <span className="text-[10px] text-gray-400">
                          Último:{" "}
                          {new Date(
                            discursosResumo.ultimaData,
                          ).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══════ ROW 3 — Proposições por Tipo + Temas ═══════ */}
        {(propsPorTipo.length > 0 || temasTop.length > 0) && (
          <div
            className={cn(
              "grid gap-6",
              propsPorTipo.length > 0 && temasTop.length > 0
                ? "lg:grid-cols-2"
                : "",
            )}
          >
            {propsPorTipo.length > 0 && (
              <div className={CARD_3D}>
                <div className={`${GLASS_HEADER} px-6 pt-5 pb-3`}>
                  <SectionTitle
                    icon={BarChart3}
                    title="Proposições por Tipo"
                    subtitle="Distribuição das proposições por categoria"
                    badge={`${proposicoesResumo?.total ?? 0} total`}
                    accentColor="#749c5b"
                  />
                </div>
                <div className="px-4 pt-1 pb-4 chart-proposicoes-por-tipo">
                  <style>{`
                    .chart-proposicoes-por-tipo .apexcharts-datalabels-group text {
                      fill: #111827 !important;
                      font-weight: 800 !important;
                    }
                  `}</style>
                  <ReactApexChart
                    options={barPropsPorTipoOptions}
                    series={[
                      {
                        name: "Proposições",
                        data: propsPorTipoExibir.map((t) => t.count),
                      },
                    ]}
                    type="bar"
                    height={Math.max(propsPorTipoExibir.length * 40, 280)}
                    width="100%"
                  />
                </div>
              </div>
            )}

            {temasTop.length > 0 && (
              <div className={CARD_3D}>
                <div className={`${GLASS_HEADER} px-6 pt-5 pb-3`}>
                  <SectionTitle
                    icon={Tag}
                    title="Temas de Atuação"
                    subtitle="Ranking de temas nas proposições (autor/coautor)"
                    badge={`Top ${temasTop.length}`}
                    accentColor="#4E9F3D"
                  />
                </div>
                {loadingTemas ? (
                  <div className="space-y-3 px-6 pb-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <SkeletonLoader
                        key={i}
                        className="h-10 w-full rounded-xl"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="px-0 pb-4">
                    <ReactApexChart
                      options={barTemasOptions}
                      series={[
                        {
                          name: "Proposições",
                          data: temasTop.map((t) => t.count),
                        },
                      ]}
                      type="bar"
                      height={Math.max(temasTop.length * 42, 220)}
                      width="100%"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════ ROW 4 — Lista de Proposições ═══════ */}
        <div className={CARD_3D}>
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <SectionTitle
                icon={FileText}
                title="Proposições"
                subtitle="Autoria e coautoria de projetos de lei"
                badge={
                  proposicoesResumo
                    ? `${proposicoesResumo.total} total`
                    : undefined
                }
              />
              <div className="flex flex-wrap items-center gap-2">
                {politician && canAccessTramitacoes(planLevel) && (
                  <Button
                    variant="outline"
                    className="border-secondary/30 bg-secondary/5 text-secondary hover:bg-secondary h-9 rounded-xl text-xs font-bold hover:text-white"
                    onClick={() => {
                      const nome = politician.name ?? `Deputado (ID: ${politician.id})`;
                      const promptText = `Liste e detalhe as proposições de autoria e coautoria do deputado ${nome} (ID: ${politician.id}). Inclua resumo, status de tramitação e atores políticos envolvidos quando aplicável.`;
                      window.location.href = `/tramitacoes?initialPrompt=${encodeURIComponent(promptText)}`;
                    }}
                  >
                    Buscar na LegisAI
                  </Button>
                )}
                {proposicoesResumo?.link && (
                  <a
                    href={proposicoesResumo.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      className="h-9 rounded-xl border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
                    >
                      Ver na Câmara
                      <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Badges por tipo */}
            {propsPorTipo.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-2">
                {propsPorTipo.slice(0, 8).map((t, i) => (
                  <span
                    key={t.sigla_tipo}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm"
                    style={{
                      background: `${BI_PALETTE[i % BI_PALETTE.length]}15`,
                      color: BI_PALETTE[i % BI_PALETTE.length],
                    }}
                  >
                    {t.sigla_tipo}
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[10px] font-extrabold"
                      style={{
                        background: `${BI_PALETTE[i % BI_PALETTE.length]}20`,
                      }}
                    >
                      {t.count}
                    </span>
                  </span>
                ))}
              </div>
            )}

            {loadingProposicoes ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <SkeletonLoader key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : proposicoes.length > 0 ? (
              <>
                <div className="space-y-3">
                  {proposicoes.map((prop) => (
                    <ProposicaoCard key={prop.id} prop={prop} />
                  ))}
                </div>
                {proposicoesPages > 1 && (
                  <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50/30 p-3">
                    <CustomPagination
                      pages={proposicoesPages}
                      currentPage={proposicoesPage}
                      setCurrentPage={setProposicoesPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/30 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                  <FileText className="h-8 w-8 text-gray-300" />
                </div>
                <h4 className="text-base font-bold text-gray-600">
                  Nenhuma proposição encontrada
                </h4>
                <p className="mt-2 max-w-sm text-sm text-gray-400">
                  Não há proposições de autoria ou coautoria registradas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
