"use client";

import { Button } from "@/components/v2/components/ui/Button";
import { Input } from "@/components/v2/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/v2/components/ui/select";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { TooltipProvider } from "@/components/v2/components/ui/tooltip";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  ChevronRight,
  ExternalLink,
  Facebook,
  Globe,
  GraduationCap,
  History,
  Instagram,
  Mail,
  MapPin,
  Mic2,
  Phone,
  Search,
  Share2,
  Tag,
  TrendingUp,
  User,
  Vote,
  Youtube,
} from "lucide-react";
import dynamic from "next/dynamic";
import type { DeputadoPageData } from "./useDeputadoPage";
import { SkeletonLoader } from "./SkeletonLoader";
import { HISTORICO_YEARS, HISTORICO_PAGE_SIZES } from "./constants";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

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

function parsePositionDate(dateStr: string | null | undefined): string {
  if (!dateStr || dateStr.trim() === "") return "Data não informada";

  // Tenta parsear formato ISO (YYYY-MM-DD)
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString("pt-BR", { dateStyle: "long" });
  }

  // Tenta parsear formato brasileiro (DD/MM/YYYY)
  const brMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("pt-BR", { dateStyle: "long" });
    }
  }

  // Tenta extrair apenas o ano (ex: "2023")
  const yearMatch = dateStr.match(/^(\d{4})$/);
  if (yearMatch) {
    return yearMatch[1];
  }

  return "Data não informada";
}

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
  icon: React.ComponentType<{ className?: string }>;
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
          style={{
            background: `${accentColor}15`,
            color: accentColor,
          }}
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
  trend,
}: {
  value: number | string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconBg: string;
  textColor: string;
  trend?: string;
}) {
  return (
    <div
      className={`${CARD_3D} group cursor-default p-0`}
      style={{ perspective: "800px" }}
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, currentColor 0%, transparent 50%)",
        }}
      />
      <div className="relative p-5">
        <div className="mb-4 flex items-center justify-between">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
            style={{ background: iconBg }}
          >
            <Icon className="h-5 w-5" style={{ color: textColor }} />
          </div>
          {trend && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </span>
          )}
        </div>
        <p
          className="text-3xl font-extrabold tracking-tight"
          style={{ color: textColor }}
        >
          {value}
        </p>
        <p className="mt-1 text-xs font-semibold tracking-widest text-gray-400 uppercase">
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

function getSocialIcon(label: string) {
  const lower = label.toLowerCase();
  if (lower.includes("facebook")) return Facebook;
  if (lower.includes("instagram")) return Instagram;
  if (lower.includes("youtube")) return Youtube;
  return Globe;
}

function getSocialColor(label: string) {
  const lower = label.toLowerCase();
  if (lower.includes("facebook"))
    return {
      hover: "hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30",
      color: "#1877F2",
    };
  if (lower.includes("instagram"))
    return {
      hover: "hover:bg-[#E4405F]/10 hover:border-[#E4405F]/30",
      color: "#E4405F",
    };
  if (lower.includes("youtube"))
    return {
      hover: "hover:bg-[#FF0000]/10 hover:border-[#FF0000]/30",
      color: "#FF0000",
    };
  if (lower.includes("tiktok"))
    return {
      hover: "hover:bg-[#010101]/10 hover:border-[#010101]/30",
      color: "#010101",
    };
  return {
    hover: "hover:bg-secondary/10 hover:border-secondary/30",
    color: "#749c5b",
  };
}

export function TabPerfil({ data }: { data: DeputadoPageData }) {
  const {
    politician,
    profile,
    contadores,
    presenca,
    temas,
    profissoes,
    ocupacoes,
    biografia,
    loadingBio,
    socialLinks,
    historico,
    loadingHistorico,
    historicoPage,
    setHistoricoPage,
    historicoPageSize,
    setHistoricoPageSize,
    historicoYear,
    historicoSearch,
    setHistoricoSearch,
    handleHistoricoYearChange,
    handleHistoricoSearchApply,
  } = data;

  if (!politician) return null;

  const presencaRate =
    presenca && presenca.presencas + presenca.ausencias > 0
      ? (presenca.presencas / (presenca.presencas + presenca.ausencias)) * 100
      : null;

  const totalContadores = contadores
    ? contadores.eventos +
      contadores.proposicoes +
      contadores.discursos +
      contadores.votacoes
    : 0;

  const temasTop = temas?.temas?.slice(0, 10) ?? [];

  const profileValues = profile
    ? [
        Number(profile.plenaryPresence) || 0,
        Number(profile.committeesPresence) || 0,
        Number(profile.createdProposals) || 0,
        Number(profile.relatedProposals) || 0,
        Number(profile.speeches) || 0,
        Number(profile.rollCallVotes) || 0,
      ]
    : [];
  const hasRadarData = profileValues.some((v) => v > 0);

  const activityCategories = contadores
    ? [
        { label: "Eventos", value: contadores.eventos, color: "#749c5b" },
        {
          label: "Proposições",
          value: contadores.proposicoes,
          color: "#4E9F3D",
        },
        { label: "Discursos", value: contadores.discursos, color: "#2d5a3d" },
        { label: "Votações", value: contadores.votacoes, color: "#8ab86e" },
      ].sort((a, b) => b.value - a.value)
    : [];

  const barActivityOptions: ApexOptions = {
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
        barHeight: "72%",
        distributed: true,
        dataLabels: { position: "top" as const },
      },
    },
    colors: activityCategories.map((c) => c.color),
    dataLabels: {
      enabled: true,
      textAnchor: "start",
      offsetX: 6,
      style: { fontSize: "11px", fontWeight: "700", colors: ["#374151"] },
      formatter: (_val: number, opt: { dataPointIndex: number }) => {
        const item = activityCategories[opt.dataPointIndex];
        const pct =
          totalContadores > 0
            ? ((item?.value ?? 0) / totalContadores) * 100
            : 0;
        return `${item?.value ?? 0} (${pct.toFixed(1)}%)`;
      },
    },
    xaxis: {
      categories: activityCategories.map((c) => c.label),
      labels: { style: { fontSize: "11px", colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          fontWeight: "600",
          colors: activityCategories.map(() => "#374151"),
        },
      },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: false } },
      padding: { top: 8, right: 16, bottom: 0, left: 4 },
    },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (val: number) =>
          `${val} (${totalContadores > 0 ? ((val / totalContadores) * 100).toFixed(1) : 0}% do total)`,
      },
    },
  };

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
        "Props. Criadas",
        "Props. Relac.",
        "Discursos",
        "Votações",
      ],
      labels: {
        style: {
          colors: Array(6).fill("#6b7280"),
          fontSize: "11px",
          fontWeight: "600",
        },
      },
    },
    yaxis: { show: false },
    fill: {
      opacity: 0.25,
      colors: ["#749c5b"],
    },
    stroke: { width: 2.5, colors: ["#749c5b"] },
    markers: {
      size: 4,
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
    tooltip: {
      y: { formatter: (val: number) => String(val) },
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
        t.tema_nome.length > 30 ? t.tema_nome.slice(0, 28) + "…" : t.tema_nome,
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
        maxWidth: 200,
      },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: false } },
    },
    legend: { show: false },
    tooltip: {
      y: { formatter: (val: number) => `${val} proposições` },
    },
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* ═══════ ROW 1 — KPI Cards ═══════ */}
        {contadores && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KPICard
              value={contadores.eventos}
              label="Eventos"
              icon={Calendar}
              gradient="linear-gradient(90deg, #749c5b, #4E9F3D)"
              iconBg="#749c5b18"
              textColor="#749c5b"
            />
            <KPICard
              value={contadores.proposicoes}
              label="Proposições"
              icon={BookOpen}
              gradient="linear-gradient(90deg, #4E9F3D, #2d5a3d)"
              iconBg="#4E9F3D18"
              textColor="#4E9F3D"
            />
            <KPICard
              value={contadores.discursos}
              label="Discursos"
              icon={Mic2}
              gradient="linear-gradient(90deg, #2d5a3d, #1B3B2B)"
              iconBg="#2d5a3d18"
              textColor="#2d5a3d"
            />
            <KPICard
              value={contadores.votacoes}
              label="Votações"
              icon={Vote}
              gradient="linear-gradient(90deg, #5a8c4a, #749c5b)"
              iconBg="#5a8c4a18"
              textColor="#5a8c4a"
            />
          </div>
        )}

        {/* ═══════ ROW 2 — Gráficos: Donut + Treemap + Presença ═══════ */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Barras — Distribuição de Atividades */}
          {contadores &&
            totalContadores > 0 &&
            activityCategories.length > 0 && (
              <div className={CARD_3D}>
                <div className={`${GLASS_HEADER} px-6 pt-5 pb-3`}>
                  <SectionTitle
                    icon={BarChart3}
                    title="Distribuição de Atividades"
                    subtitle="Proporção por tipo de atuação"
                    badge={`${totalContadores} total`}
                  />
                </div>
                <div className="px-4 pt-1 pb-4">
                  <ReactApexChart
                    options={barActivityOptions}
                    series={[
                      {
                        name: "Quantidade",
                        data: activityCategories.map((c) => c.value),
                      },
                    ]}
                    type="bar"
                    height={220}
                    width="100%"
                  />
                </div>
                <div className="grid grid-cols-4 gap-0 border-t border-gray-100">
                  {activityCategories.map((item, i) => (
                    <div
                      key={item.label}
                      className={`flex flex-col items-center py-3 ${i < activityCategories.length - 1 ? "border-r border-gray-100" : ""}`}
                    >
                      <div
                        className="mb-1 h-2 w-2 rounded-full"
                        style={{ background: item.color }}
                      />
                      <span className="text-lg font-extrabold text-gray-900">
                        {item.value}
                      </span>
                      <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                        {item.label === "Proposições"
                          ? "Props."
                          : item.label === "Discursos"
                            ? "Disc."
                            : item.label === "Votações"
                              ? "Vot."
                              : item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Presença — Radial Gauge */}
          {presencaRate !== null && presenca && (
            <div className={CARD_3D}>
              <div className={`${GLASS_HEADER} px-6 pt-5 pb-3`}>
                <SectionTitle
                  icon={User}
                  title="Presença Parlamentar"
                  subtitle={`${new Date(presenca.dataInicio).toLocaleDateString("pt-BR")} — ${new Date(presenca.dataFim).toLocaleDateString("pt-BR")}`}
                />
              </div>
              <div className="flex flex-col items-center px-4 pb-2">
                <ReactApexChart
                  options={radialOptions}
                  series={[Math.round(presencaRate)]}
                  type="radialBar"
                  height={285}
                  width="100%"
                />
              </div>
              <div className="grid grid-cols-2 gap-0 border-t border-gray-100">
                <div className="flex flex-col items-center border-r border-gray-100 py-4">
                  <span className="text-2xl font-extrabold text-emerald-600">
                    {presenca.presencas}
                  </span>
                  <span className="mt-0.5 text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                    Presenças
                  </span>
                </div>
                <div className="flex flex-col items-center py-4">
                  <span className="text-2xl font-extrabold text-red-500">
                    {presenca.ausencias}
                  </span>
                  <span className="mt-0.5 text-[10px] font-bold tracking-widest text-red-400 uppercase">
                    Ausências
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══════ ROW 3 — Perfil Parlamentar (Radar) — Full Width ═══════ */}
        {profile && hasRadarData && (
          <div className={CARD_3D}>
            <div className={`${GLASS_HEADER} px-6 pt-5 pb-3`}>
              <SectionTitle
                icon={TrendingUp}
                title={`Perfil Parlamentar (${profile.year})`}
                subtitle="Visão radar da atuação"
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
            <div className="grid grid-cols-6 gap-0 border-t border-gray-100">
              {[
                {
                  label: "Plenário",
                  val: profile.plenaryPresence,
                  color: "#059669",
                },
                {
                  label: "Comissões",
                  val: profile.committeesPresence,
                  color: "#2563eb",
                },
                {
                  label: "Props. Criadas",
                  val: profile.createdProposals,
                  color: "#d97706",
                },
                {
                  label: "Props. Relac.",
                  val: profile.relatedProposals,
                  color: "#ea580c",
                },
                { label: "Discursos", val: profile.speeches, color: "#7c3aed" },
                {
                  label: "Votações",
                  val: profile.rollCallVotes,
                  color: "#749c5b",
                },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className={`flex flex-col items-center py-4 ${i < 5 ? "border-r border-gray-100" : ""}`}
                >
                  <span
                    className="text-2xl font-extrabold"
                    style={{ color: item.color }}
                  >
                    {item.val ?? "—"}
                  </span>
                  <span className="mt-0.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════ ROW 3b — Temas (Bar) — Full Width ═══════ */}
        {temasTop.length > 0 && (
          <div className={CARD_3D}>
            <div className={`${GLASS_HEADER} px-6 pt-5 pb-3`}>
              <SectionTitle
                icon={Tag}
                title="Temas de Atuação"
                subtitle="Ranking de temas nas proposições"
                badge={`Top ${temasTop.length}`}
                accentColor="#4E9F3D"
              />
            </div>
            <div className="px-0 pb-4">
              <ReactApexChart
                options={barTemasOptions}
                series={[
                  { name: "Proposições", data: temasTop.map((t) => t.count) },
                ]}
                type="bar"
                height={Math.max(temasTop.length * 42, 220)}
                width="100%"
              />
            </div>
          </div>
        )}

        {/* ═══════ ROW 4 — Indicadores Detalhados (DESATIVADO — descomentar para reativar) ═══════ */}
        {/* {profile && (
          <div className={CARD_3D}>
            <div className={`${GLASS_HEADER} px-6 pt-5 pb-4`}>
              <SectionTitle
                icon={Vote}
                title={`Indicadores Detalhados (${profile.year})`}
                subtitle="Plenário, comissões, proposições, discursos e votações"
              />
            </div>
            <div className="grid grid-cols-2 gap-0 border-t border-gray-100 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: "Plenário", val: profile.plenaryPresence, color: "#059669", bg: "#ecfdf5" },
                { label: "Comissões", val: profile.committeesPresence, color: "#2563eb", bg: "#eff6ff" },
                { label: "Props. Criadas", val: profile.createdProposals, color: "#d97706", bg: "#fffbeb" },
                { label: "Props. Relac.", val: profile.relatedProposals, color: "#ea580c", bg: "#fff7ed" },
                { label: "Discursos", val: profile.speeches, color: "#7c3aed", bg: "#f5f3ff" },
                { label: "Votações", val: profile.rollCallVotes, color: "#749c5b", bg: "#f0fdf4" },
              ].map((item, i) => (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    <div
                      className="flex flex-col items-center justify-center border-b border-r border-gray-100 py-5 transition-colors duration-200 hover:bg-gray-50/50 cursor-default"
                      style={{ borderColor: "#f3f4f6" }}
                    >
                      <div
                        className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ background: item.bg }}
                      >
                        <span
                          className="text-sm font-extrabold"
                          style={{ color: item.color }}
                        >
                          {item.val ?? "—"}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {item.label}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{item.label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )} */}

        {/* ═══════ ROW 5 — Identidade + Contato ═══════ */}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className={`${CARD_3D} lg:col-span-3`}>
            <div className={`${GLASS_HEADER} px-6 pt-5 pb-4`}>
              <SectionTitle
                icon={User}
                title="Identidade & Mandato"
                subtitle="Dados pessoais e informações do exercício"
              />
            </div>
            <div className="px-6 pb-6">
              <div className="mt-1 grid gap-3 sm:grid-cols-3">
                {politician.birthDate && (
                  <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="bg-secondary/10 mb-3 flex h-9 w-9 items-center justify-center rounded-lg">
                      <Calendar className="text-secondary h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Nascimento
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {new Date(politician.birthDate).toLocaleDateString(
                        "pt-BR",
                        { dateStyle: "long" },
                      )}
                    </p>
                  </div>
                )}
                {politician.placeOfBirth && (
                  <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="bg-secondary/10 mb-3 flex h-9 w-9 items-center justify-center rounded-lg">
                      <MapPin className="text-secondary h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Naturalidade
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {politician.placeOfBirth}
                    </p>
                  </div>
                )}
                {politician.mandatoDataInicio && (
                  <div className="group rounded-xl bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="bg-secondary/10 mb-3 flex h-9 w-9 items-center justify-center rounded-lg">
                      <Globe className="text-secondary h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Início do Exercício
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {new Date(
                        politician.mandatoDataInicio,
                      ).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}
              </div>
              {!politician.birthDate &&
                !politician.placeOfBirth &&
                !politician.mandatoDataInicio && (
                  <p className="py-8 text-center text-sm text-gray-400">
                    Nenhum dado de identidade disponível.
                  </p>
                )}
            </div>
          </div>

          <div className={`${CARD_3D} lg:col-span-2`}>
            <div className={`${GLASS_HEADER} px-6 pt-5 pb-4`}>
              <SectionTitle
                icon={Building2}
                title="Contato"
                subtitle="Gabinete e canais"
              />
            </div>
            <div className="space-y-0.5 px-4 pb-5">
              {politician.email && (
                <a
                  href={`mailto:${politician.email}`}
                  className="group hover:bg-secondary/5 flex items-center gap-3 rounded-xl p-3 transition-all"
                >
                  <div className="bg-secondary/10 group-hover:bg-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors group-hover:text-white">
                    <Mail className="text-secondary h-4 w-4 group-hover:text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      E-mail
                    </p>
                    <p className="group-hover:text-secondary truncate text-sm font-semibold text-gray-700">
                      {politician.email}
                    </p>
                  </div>
                  <ChevronRight className="group-hover:text-secondary h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-1" />
                </a>
              )}
              {politician.phone && (
                <a
                  href={`tel:${politician.phone}`}
                  className="group hover:bg-secondary/5 flex items-center gap-3 rounded-xl p-3 transition-all"
                >
                  <div className="bg-secondary/10 group-hover:bg-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors group-hover:text-white">
                    <Phone className="text-secondary h-4 w-4 group-hover:text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Telefone
                    </p>
                    <p className="group-hover:text-secondary text-sm font-semibold text-gray-700">
                      {politician.phone}
                    </p>
                  </div>
                  <ChevronRight className="group-hover:text-secondary h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-1" />
                </a>
              )}
              {(politician.gabinetePredio ||
                politician.gabineteAndar ||
                politician.gabineteSala) && (
                <div className="flex items-center gap-3 rounded-xl p-3">
                  <div className="bg-secondary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <Building2 className="text-secondary h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Gabinete
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {[
                        politician.gabinetePredio,
                        politician.gabineteAndar,
                        politician.gabineteSala,
                      ]
                        .filter(Boolean)
                        .join(" / ")}
                    </p>
                  </div>
                </div>
              )}
              {politician.address && (
                <div className="flex items-center gap-3 rounded-xl p-3">
                  <div className="bg-secondary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <MapPin className="text-secondary h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Endereço
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {politician.address}
                    </p>
                  </div>
                </div>
              )}
              {!politician.email &&
                !politician.phone &&
                !politician.gabinetePredio &&
                !politician.address && (
                  <p className="py-8 text-center text-sm text-gray-400">
                    Nenhum contato disponível.
                  </p>
                )}
              <a
                href={`https://www.camara.leg.br/deputados/${politician.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group hover:border-secondary/30 hover:bg-secondary/5 hover:text-secondary mt-2 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50/50 py-3 text-sm font-semibold text-gray-700 transition-all"
              >
                Ver mais
                <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>

        {/* ═══════ ROW 6 — Cargos (Timeline) ═══════ */}
        {politician.positions && politician.positions.length > 0 && (
          <div className={CARD_3D}>
            <div className={`${GLASS_HEADER} px-6 pt-5 pb-4`}>
              <SectionTitle
                icon={Briefcase}
                title="Cargos & Mandatos"
                subtitle="Linha do tempo das posições ocupadas"
                badge={`${politician.positions.length} posição(ões)`}
              />
            </div>
            <div className="px-6 pb-6">
              <div className="border-secondary/20 relative ml-5 border-l-2 pl-8">
                {politician.positions.map((pos) => (
                  <div key={pos.id} className="group relative pb-7 last:pb-0">
                    <div className="from-secondary shadow-secondary/20 absolute top-1.5 -left-[37px] flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br to-[#4E9F3D] shadow-lg transition-transform group-hover:scale-110">
                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    </div>
                    <div className="group-hover:border-secondary/20 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50/50 to-white p-4 shadow-sm transition-all group-hover:shadow-md">
                      <p className="font-bold text-gray-900">{pos.position}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          Desde {parsePositionDate(pos.startDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ ROW 7 — Biografia ═══════ */}
        <div className={CARD_3D}>
          <div className={`${GLASS_HEADER} px-6 pt-5 pb-4`}>
            <SectionTitle
              icon={GraduationCap}
              title="Biografia"
              subtitle="Escolaridade, profissões e ocupações"
              accentColor="#2d5a3d"
            />
          </div>
          <div className="px-6 pb-6">
            {loadingBio ? (
              <div className="space-y-3">
                <SkeletonLoader className="h-10 w-full rounded-xl" />
                <SkeletonLoader className="h-16 w-full rounded-xl" />
              </div>
            ) : (
              <div className="space-y-6">
                {biografia?.escolaridade && (
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      <GraduationCap className="h-3 w-3" />
                      Escolaridade
                    </h4>
                    <div className="border-secondary/20 from-secondary/10 to-secondary/5 text-secondary inline-flex items-center gap-2 rounded-xl border bg-gradient-to-r px-4 py-3 text-sm font-semibold shadow-sm">
                      <GraduationCap className="h-4 w-4" />
                      {biografia.escolaridade}
                    </div>
                  </div>
                )}
                {profissoes.length > 0 && (
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      <Briefcase className="h-3 w-3" />
                      Profissões
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profissoes.map((p, i) => (
                        <span
                          key={i}
                          className="from-secondary/15 to-secondary/5 text-secondary inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-semibold shadow-sm transition-all hover:shadow-md"
                        >
                          {p.titulo}
                          {p.data && (
                            <span className="text-secondary/60 rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-bold">
                              {p.data}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {ocupacoes.length > 0 && (
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      <BookOpen className="h-3 w-3" />
                      Ocupações
                    </h4>
                    <div className="space-y-2">
                      {ocupacoes.map((o, i) => (
                        <div
                          key={i}
                          className="group hover:border-secondary/20 flex items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-4 py-3 transition-all hover:shadow-sm"
                        >
                          <div className="bg-secondary/40 group-hover:bg-secondary h-2 w-2 shrink-0 rounded-full transition-colors" />
                          <div>
                            <span className="text-sm font-bold text-gray-800">
                              {o.titulo}
                            </span>
                            {(o.entidade || o.periodo) && (
                              <span className="ml-2 text-xs text-gray-400">
                                {[o.entidade, o.periodo]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!biografia?.escolaridade &&
                  profissoes.length === 0 &&
                  ocupacoes.length === 0 &&
                  !loadingBio && (
                    <p className="py-8 text-center text-sm text-gray-400">
                      Nenhuma informação biográfica disponível.
                    </p>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* ═══════ ROW 8 — Redes Sociais ═══════ */}
        {socialLinks.length > 0 && (
          <div className={CARD_3D}>
            <div className={`${GLASS_HEADER} px-6 pt-5 pb-4`}>
              <SectionTitle
                icon={Share2}
                title="Redes Sociais"
                subtitle="Perfis oficiais"
              />
            </div>
            <div className="flex flex-wrap gap-3 px-6 pb-6">
              {socialLinks.map((s) => {
                const SocialIcon = getSocialIcon(s.label);
                const social = getSocialColor(s.label);
                return (
                  <a
                    key={s.label}
                    href={s.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${social.hover}`}
                  >
                    <SocialIcon
                      className="h-5 w-5 transition-transform group-hover:scale-110"
                      style={{ color: social.color }}
                    />
                    {s.label}
                    <ExternalLink className="h-3.5 w-3.5 text-gray-300" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════ ROW 9 — Histórico de Movimentações ═══════ */}
        <div className={CARD_3D}>
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <SectionTitle
                icon={History}
                title="Histórico de Movimentações"
                subtitle="Comissões, cargos e posse (fonte: CSV Câmara)"
                accentColor="#1B3B2B"
              />
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Ano
                  </label>
                  <Select
                    value={historicoYear || "todos"}
                    onValueChange={handleHistoricoYearChange}
                  >
                    <SelectTrigger className="h-9 w-[110px] rounded-xl border-gray-200 bg-white text-sm shadow-sm">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {HISTORICO_YEARS.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Buscar
                  </label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                      <Input
                        className="h-9 w-[200px] rounded-xl border-gray-200 bg-white pl-8 text-sm shadow-sm placeholder:text-gray-300"
                        placeholder="Ex.: comissão, CPI..."
                        value={historicoSearch}
                        onChange={(e) => setHistoricoSearch(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleHistoricoSearchApply()
                        }
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="border-secondary/30 bg-secondary/5 text-secondary hover:bg-secondary h-9 rounded-xl text-sm font-bold transition-all hover:text-white"
                      onClick={handleHistoricoSearchApply}
                    >
                      Filtrar
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Por página
                  </label>
                  <Select
                    value={String(historicoPageSize)}
                    onValueChange={(v) => {
                      setHistoricoPageSize(Number(v));
                      setHistoricoPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 w-[80px] rounded-xl border-gray-200 bg-white text-sm shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HISTORICO_PAGE_SIZES.map((s) => (
                        <SelectItem key={s} value={String(s)}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loadingHistorico ? (
              <div className="space-y-4 py-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4"
                  >
                    <SkeletonLoader className="h-7 w-20 shrink-0 rounded-lg" />
                    <SkeletonLoader className="h-5 flex-1 rounded" />
                  </div>
                ))}
              </div>
            ) : historico && historico.movimentacoes.length > 0 ? (
              <>
                <div className="mb-5">
                  <span className="bg-secondary/10 text-secondary inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold">
                    <BarChart3 className="h-3.5 w-3.5" />
                    {historico.total} movimentação(ões)
                  </span>
                </div>
                <div className="border-secondary/15 relative ml-5 border-l-2 border-dashed pl-8">
                  <ul className="space-y-4" role="list">
                    {historico.movimentacoes.map((mov, idx) => (
                      <li key={`${mov.data}-${idx}`} className="group relative">
                        <div className="bg-secondary/70 group-hover:bg-secondary absolute top-4 -left-[37px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow-sm transition-colors" />
                        <div className="group-hover:border-secondary/20 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all group-hover:shadow-md">
                          <div className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {mov.data}
                          </div>
                          <p className="text-sm leading-relaxed text-gray-700">
                            {mov.descricao}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                {historico.totalPages > 1 && (
                  <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50/30 p-3">
                    <CustomPagination
                      pages={historico.totalPages}
                      currentPage={historicoPage}
                      setCurrentPage={setHistoricoPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/30 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                  <History className="h-8 w-8 text-gray-300" />
                </div>
                <h4 className="text-base font-bold text-gray-600">
                  Nenhuma movimentação encontrada
                </h4>
                <p className="mt-2 max-w-sm text-sm text-gray-400">
                  Não há registros para este deputado no período selecionado.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
