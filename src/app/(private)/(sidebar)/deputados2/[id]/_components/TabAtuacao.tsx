"use client";

import { Button } from "@/components/v2/components/ui/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/v2/components/ui/tooltip";
import {
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileText,
  Mic2,
  TrendingUp,
  User,
  Vote,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { DeputadoPageData } from "./useDeputadoPage";
import { SkeletonLoader } from "./SkeletonLoader";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const CARD_3D =
  "relative overflow-hidden rounded-2xl border-0 bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_40px_-8px_rgba(116,156,91,0.18),0_2px_8px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-[2px]";

const GLASS_HEADER =
  "bg-gradient-to-r from-[#749c5b]/[0.04] via-white/80 to-white backdrop-blur-sm";

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
          {subtitle && (
            <p className="text-[11px] text-gray-400">{subtitle}</p>
          )}
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
}: {
  value: number | string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  gradient: string;
  iconBg: string;
  textColor: string;
}) {
  return (
    <div className={`${CARD_3D} group cursor-default p-0`}>
      <div className="relative p-5">
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
          {value}
        </p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
          {label}
        </p>
        <div
          className="absolute bottom-0 left-0 h-1 w-full"
          style={{ background: gradient }}
        />
      </div>
    </div>
  );
}

export function TabAtuacao({ data }: { data: DeputadoPageData }) {
  const {
    politician,
    presenca,
    loadingPresenca,
    discursosResumo,
    loadingDiscursos,
    profile,
  } = data;

  if (!politician) return null;

  const presencaRate =
    presenca && presenca.presencas + presenca.ausencias > 0
      ? (presenca.presencas / (presenca.presencas + presenca.ausencias)) * 100
      : null;

  const profileValues = profile
    ? [
        Number(profile.plenaryPresence) || 0,
        Number(profile.committeesPresence) || 0,
        Number(profile.createdProposals) || 0,
        Number(profile.speeches) || 0,
        Number(profile.rollCallVotes) || 0,
      ]
    : [];
  const hasRadarData = profileValues.some((v) => v > 0);

  const plenaryJust = Number(profile?.plenaryJustifiedAbsences) || 0;
  const plenaryUnjust = Number(profile?.plenaryUnjustifiedAbsences) || 0;
  const committeeJust = Number(profile?.committeesJustifiedAbsences) || 0;
  const committeeUnjust = Number(profile?.committeesUnjustifiedAbsences) || 0;
  const hasAbsenceData =
    plenaryJust + plenaryUnjust + committeeJust + committeeUnjust > 0;

  const radialOptions: ApexOptions = {
    chart: { type: "radialBar", fontFamily: "inherit" },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: { size: "68%", background: "transparent" },
        track: {
          background: "#f3f4f6",
          strokeWidth: "100%",
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            blur: 4,
            opacity: 0.08,
          },
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: "12px",
            color: "#9ca3af",
            offsetY: -10,
          },
          value: {
            show: true,
            fontSize: "32px",
            fontWeight: "800",
            color: "#111827",
            offsetY: 4,
            formatter: (val: number) => `${val.toFixed(0)}%`,
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        colorStops: [
          { offset: 0, color: "#749c5b", opacity: 1 },
          { offset: 50, color: "#4E9F3D", opacity: 1 },
          { offset: 100, color: "#2d5a3d", opacity: 1 },
        ],
      },
    },
    stroke: { lineCap: "round" },
    labels: ["Taxa de Presença"],
  };

  const absenceBarOptions: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "inherit",
      toolbar: { show: false },
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        borderRadiusApplication: "end",
        barHeight: "55%",
      },
    },
    colors: ["#f59e0b", "#ef4444"],
    dataLabels: {
      enabled: true,
      style: { fontSize: "12px", fontWeight: "700" },
      formatter: (val: number) => (val > 0 ? String(val) : ""),
    },
    xaxis: {
      categories: ["Plenário", "Comissões"],
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          fontWeight: "600",
          colors: ["#374151"],
        },
      },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: false } },
    },
    legend: {
      position: "top",
      fontSize: "12px",
      fontWeight: 600,
      markers: { size: 6, shape: "circle" as const },
    },
    tooltip: {
      y: { formatter: (val: number) => `${val} falta(s)` },
    },
  };

  const radarOptions: ApexOptions = {
    chart: {
      type: "radar",
      fontFamily: "inherit",
      toolbar: { show: false },
      dropShadow: {
        enabled: true,
        blur: 4,
        left: 1,
        top: 1,
        opacity: 0.1,
      },
    },
    colors: ["#749c5b"],
    xaxis: {
      categories: [
        "Plenário",
        "Comissões",
        "Proposições",
        "Discursos",
        "Votações",
      ],
      labels: {
        style: {
          colors: Array(5).fill("#6b7280"),
          fontSize: "12px",
          fontWeight: "600",
        },
      },
    },
    yaxis: { show: false },
    fill: { opacity: 0.25, colors: ["#749c5b"] },
    stroke: { width: 2.5, colors: ["#749c5b"] },
    markers: {
      size: 5,
      colors: ["#fff"],
      strokeColors: "#749c5b",
      strokeWidth: 2,
    },
    plotOptions: {
      radar: {
        polygons: {
          strokeColors: "#e5e7eb",
          connectorColors: "#e5e7eb",
          fill: { colors: ["#fafafa", "#fff"] },
        },
      },
    },
    tooltip: { y: { formatter: (val: number) => String(val) } },
  };

  const donutPresencaOptions: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
      dropShadow: {
        enabled: true,
        top: 2,
        left: 0,
        blur: 6,
        opacity: 0.08,
      },
    },
    colors: ["#059669", "#f59e0b", "#ef4444"],
    labels: ["Presenças", "Faltas Justif.", "Faltas Injustif."],
    legend: {
      position: "bottom",
      fontSize: "11px",
      fontWeight: 600,
      markers: { size: 6, shape: "circle" as const },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${Math.round(val)}%`,
      style: { fontSize: "11px", fontWeight: "700" },
      dropShadow: { enabled: false },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            name: { show: true, fontSize: "11px", color: "#9ca3af" },
            value: {
              show: true,
              fontSize: "22px",
              fontWeight: "800",
              color: "#111827",
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "11px",
              color: "#9ca3af",
            },
          },
        },
      },
    },
    stroke: { width: 3, colors: ["#fff"] },
  };

  const plenaryTotal = Number(profile?.plenaryPresence) || 0;
  const plenaryDonutSeries =
    plenaryTotal + plenaryJust + plenaryUnjust > 0
      ? [plenaryTotal, plenaryJust, plenaryUnjust]
      : [];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* ═══════ ROW 1 — KPI Cards ═══════ */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <KPICard
            value={
              presencaRate !== null ? `${presencaRate.toFixed(0)}%` : "—"
            }
            label="Presença"
            icon={CheckCircle2}
            gradient="linear-gradient(90deg, #059669, #10b981)"
            iconBg="#05966918"
            textColor="#059669"
          />
          <KPICard
            value={profile?.plenaryPresence ?? "—"}
            label="Plenário"
            icon={User}
            gradient="linear-gradient(90deg, #749c5b, #4E9F3D)"
            iconBg="#749c5b18"
            textColor="#749c5b"
          />
          <KPICard
            value={profile?.committeesPresence ?? "—"}
            label="Comissões"
            icon={Briefcase}
            gradient="linear-gradient(90deg, #2563eb, #3b82f6)"
            iconBg="#2563eb18"
            textColor="#2563eb"
          />
          <KPICard
            value={discursosResumo?.total ?? profile?.speeches ?? "—"}
            label="Discursos"
            icon={Mic2}
            gradient="linear-gradient(90deg, #7c3aed, #8b5cf6)"
            iconBg="#7c3aed18"
            textColor="#7c3aed"
          />
          <KPICard
            value={profile?.rollCallVotes ?? "—"}
            label="Votações"
            icon={Vote}
            gradient="linear-gradient(90deg, #d97706, #f59e0b)"
            iconBg="#d9770618"
            textColor="#d97706"
          />
        </div>

        {/* ═══════ ROW 2 — Presença Gauge + Faltas Bar ═══════ */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Presença — Radial Gauge */}
          <div className={CARD_3D}>
            <div className={`${GLASS_HEADER} px-6 pt-5 pb-3`}>
              <SectionTitle
                icon={Calendar}
                title="Presença no Período"
                subtitle={
                  presenca
                    ? `${new Date(presenca.dataInicio).toLocaleDateString("pt-BR")} — ${new Date(presenca.dataFim).toLocaleDateString("pt-BR")}`
                    : "Período legislativo"
                }
                accentColor="#059669"
              />
            </div>
            <div className="px-4 pb-2">
              {loadingPresenca ? (
                <div className="flex items-center justify-center py-16">
                  <SkeletonLoader className="h-48 w-48 rounded-full" />
                </div>
              ) : presencaRate !== null && presenca ? (
                <>
                  <div className="flex items-center justify-center">
                    <ReactApexChart
                      options={radialOptions}
                      series={[Math.round(presencaRate)]}
                      type="radialBar"
                      height={260}
                      width="100%"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-0 border-t border-gray-100">
                    <div className="flex flex-col items-center border-r border-gray-100 py-4">
                      <span className="text-2xl font-extrabold text-emerald-600">
                        {presenca.presencas}
                      </span>
                      <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                        Presenças
                      </span>
                    </div>
                    <div className="flex flex-col items-center py-4">
                      <span className="text-2xl font-extrabold text-red-500">
                        {presenca.ausencias}
                      </span>
                      <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-red-400">
                        Ausências
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Calendar className="mb-3 h-10 w-10 text-gray-200" />
                  <p className="text-sm font-medium text-gray-400">
                    Sem dados de presença para o período.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Faltas — Stacked Bar ou Donut Plenário */}
          <div className={CARD_3D}>
            <div className={`${GLASS_HEADER} px-6 pt-5 pb-3`}>
              <SectionTitle
                icon={XCircle}
                title="Detalhamento de Faltas"
                subtitle="Justificadas vs. injustificadas"
                accentColor="#ef4444"
              />
            </div>
            <div className="px-4 pb-4">
              {loadingPresenca ? (
                <div className="flex items-center justify-center py-16">
                  <SkeletonLoader className="h-40 w-full rounded-xl" />
                </div>
              ) : hasAbsenceData ? (
                <>
                  <ReactApexChart
                    options={absenceBarOptions}
                    series={[
                      {
                        name: "Justificadas",
                        data: [plenaryJust, committeeJust],
                      },
                      {
                        name: "Injustificadas",
                        data: [plenaryUnjust, committeeUnjust],
                      },
                    ]}
                    type="bar"
                    height={180}
                    width="100%"
                  />
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-amber-50 p-3 text-center">
                      <span className="text-xl font-extrabold text-amber-600">
                        {plenaryJust + committeeJust}
                      </span>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                        Justificadas
                      </p>
                    </div>
                    <div className="rounded-xl bg-red-50 p-3 text-center">
                      <span className="text-xl font-extrabold text-red-600">
                        {plenaryUnjust + committeeUnjust}
                      </span>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                        Injustificadas
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle2 className="mb-3 h-10 w-10 text-emerald-200" />
                  <p className="text-sm font-medium text-gray-400">
                    Sem dados detalhados de faltas.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══════ ROW 3 — Radar — Full Width ═══════ */}
        {profile && hasRadarData && (
          <div className={CARD_3D}>
            <div className={`${GLASS_HEADER} px-6 pt-5 pb-3`}>
              <SectionTitle
                icon={TrendingUp}
                title={`Visão Radar (${profile.year})`}
                subtitle="Performance multidimensional"
              />
            </div>
            <div className="px-0 pb-0">
              <ReactApexChart
                options={radarOptions}
                series={[{ name: "Atuação", data: profileValues }]}
                type="radar"
                height={380}
                width="100%"
              />
            </div>
            <div className="grid grid-cols-5 gap-0 border-t border-gray-100">
              {[
                { label: "Plenário", val: profile.plenaryPresence, color: "#749c5b" },
                { label: "Comissões", val: profile.committeesPresence, color: "#2563eb" },
                { label: "Props.", val: profile.createdProposals, color: "#d97706" },
                { label: "Disc.", val: profile.speeches, color: "#7c3aed" },
                { label: "Votações", val: profile.rollCallVotes, color: "#059669" },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className={`flex flex-col items-center py-4 ${i < 4 ? "border-r border-gray-100" : ""}`}
                >
                  <span
                    className="text-2xl font-extrabold"
                    style={{ color: item.color }}
                  >
                    {item.val ?? "—"}
                  </span>
                  <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════ ROW 3b — Donut Plenário — Full Width ═══════ */}
        {profile && plenaryDonutSeries.length > 0 && (
          <div className={CARD_3D}>
            <div className={`${GLASS_HEADER} px-6 pt-5 pb-3`}>
              <SectionTitle
                icon={User}
                title={`Composição Plenário (${profile.year})`}
                subtitle="Presenças vs. faltas justificadas e injustificadas"
                accentColor="#059669"
              />
            </div>
            <div className="flex items-center justify-center px-0 pb-4">
              <ReactApexChart
                options={donutPresencaOptions}
                series={plenaryDonutSeries}
                type="donut"
                height={320}
                width="100%"
              />
            </div>
          </div>
        )}

        {/* ═══════ ROW 4 — Cards Detalhados ═══════ */}
        {profile && (
          <div className={CARD_3D}>
            <div className={`${GLASS_HEADER} px-6 pt-5 pb-4`}>
              <SectionTitle
                icon={FileText}
                title={`Detalhes da Atuação (${profile.year})`}
                subtitle="Proposições, discursos, votações e links oficiais"
              />
            </div>
            <div className="grid gap-0 border-t border-gray-100 sm:grid-cols-2 lg:grid-cols-3">
              {/* Proposições */}
              <div className="border-b border-r border-gray-100 p-6 transition-colors hover:bg-gray-50/50">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                    <BookOpen className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Proposições
                    </p>
                  </div>
                </div>
                <div className="mb-3 flex items-baseline gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-default">
                        <span className="text-2xl font-extrabold text-amber-600">
                          {profile.createdProposals ?? "—"}
                        </span>
                        <span className="ml-1 text-xs font-medium text-gray-400">
                          criadas
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Proposições de autoria</TooltipContent>
                  </Tooltip>
                  <span className="text-gray-300">|</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-default">
                        <span className="text-2xl font-extrabold text-orange-500">
                          {profile.relatedProposals ?? "—"}
                        </span>
                        <span className="ml-1 text-xs font-medium text-gray-400">
                          relac.
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Proposições relacionadas</TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/procedures?authorId=${politician.id}`}>
                    <Button
                      variant="outline"
                      className="h-8 rounded-lg border-secondary/30 bg-secondary/5 text-xs font-bold text-secondary hover:bg-secondary hover:text-white"
                    >
                      Buscar na LegisAI
                    </Button>
                  </Link>
                  {profile.createdProposalsUrl && (
                    <a
                      href={profile.createdProposalsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="h-8 rounded-lg border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
                      >
                        Câmara
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              {/* Discursos */}
              <div className="border-b border-r border-gray-100 p-6 transition-colors hover:bg-gray-50/50">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                    <Mic2 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Discursos
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-extrabold text-purple-600">
                    {profile.speeches ?? "—"}
                  </span>
                  {discursosResumo?.ultimaData && (
                    <p className="mt-1 text-xs text-gray-400">
                      Último:{" "}
                      {new Date(
                        discursosResumo.ultimaData,
                      ).toLocaleDateString("pt-BR", { dateStyle: "short" })}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.speechesAudiosUrl && (
                    <a
                      href={profile.speechesAudiosUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="h-8 rounded-lg border-purple-200 bg-purple-50 text-xs font-bold text-purple-600 hover:bg-purple-100"
                      >
                        Áudios
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </a>
                  )}
                  {profile.speechesVideosUrl && (
                    <a
                      href={profile.speechesVideosUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="h-8 rounded-lg border-purple-200 bg-purple-50 text-xs font-bold text-purple-600 hover:bg-purple-100"
                      >
                        Vídeos
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </a>
                  )}
                  {discursosResumo?.link && (
                    <a
                      href={discursosResumo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="h-8 rounded-lg border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
                      >
                        Câmara
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              {/* Votações */}
              <div className="border-b border-gray-100 p-6 transition-colors hover:bg-gray-50/50">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                    <Vote className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Votações Nominais
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-extrabold text-emerald-600">
                    {profile.rollCallVotes ?? "—"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.rollCallVotesUrl && (
                    <a
                      href={profile.rollCallVotesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="h-8 rounded-lg border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-600 hover:bg-emerald-100"
                      >
                        Ver votações
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ Sem dados ═══════ */}
        {!profile && !loadingPresenca && !loadingDiscursos && (
          <div className={CARD_3D}>
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                <User className="h-8 w-8 text-gray-300" />
              </div>
              <h4 className="text-base font-bold text-gray-600">
                Sem dados de atuação parlamentar
              </h4>
              <p className="mt-2 max-w-sm text-sm text-gray-400">
                Não há informações disponíveis para o ano selecionado.
              </p>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
