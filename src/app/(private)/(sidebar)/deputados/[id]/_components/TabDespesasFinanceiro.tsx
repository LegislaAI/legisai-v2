"use client";

import { Button } from "@/components/v2/components/ui/Button";
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
import {
  BarChart3,
  Banknote,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileText,
  Receipt,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
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

const BI_PALETTE = [
  "#749c5b", "#4E9F3D", "#2d5a3d", "#1B3B2B", "#5a8c4a",
  "#8ab86e", "#3d7a5c", "#6bc28c", "#2e6b4a", "#a0d88a",
];

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  badge,
  accentColor = "#749c5b",
  rightSlot,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  subtitle?: string;
  badge?: string;
  accentColor?: string;
  rightSlot?: React.ReactNode;
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
      <div className="flex items-center gap-2">
        {badge && (
          <span
            className="rounded-full px-3 py-1.5 text-[11px] font-bold"
            style={{ background: `${accentColor}15`, color: accentColor }}
          >
            {badge}
          </span>
        )}
        {rightSlot}
      </div>
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
  subtitle,
}: {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  gradient: string;
  iconBg: string;
  textColor: string;
  subtitle?: string;
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
          className="text-2xl font-extrabold tracking-tight"
          style={{ color: textColor }}
        >
          {value}
        </p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
          {label}
        </p>
        {subtitle && (
          <p className="mt-0.5 text-[10px] text-gray-400">{subtitle}</p>
        )}
        <div
          className="absolute bottom-0 left-0 h-1 w-full"
          style={{ background: gradient }}
        />
      </div>
    </div>
  );
}

function formatBRL(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function TabDespesasFinanceiro({ data }: { data: DeputadoPageData }) {
  const {
    selectedYear,
    chartOptions,
    chartSeries,
    hasChartData,
    finance,
    availableYears,
    ceapAno,
    setCeapAno,
    ceapPage,
    setCeapPage,
    ceapResumo,
    despesasCeap,
    ceapFornecedores,
    loadingCeapResumo,
    loadingCeapDespesas,
    loadingCeapFornecedores,
    ceapHasMore,
  } = data;

  const topCategorias = ceapResumo?.topCategorias ?? [];

  const catBarOptions: ApexOptions = {
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
        barHeight: "65%",
        distributed: true,
      },
    },
    colors: BI_PALETTE.slice(0, topCategorias.length),
    dataLabels: {
      enabled: true,
      textAnchor: "start",
      offsetX: 5,
      style: { fontSize: "10px", fontWeight: "700", colors: ["#374151"] },
      formatter: (_val: number, opt: { dataPointIndex: number }) => {
        const cat = topCategorias[opt.dataPointIndex];
        return cat ? formatBRL(cat.valor) : "";
      },
    },
    xaxis: {
      categories: topCategorias.map((c) => {
        const name = c.descricao || c.tipoDespesa;
        return name.length > 35 ? name.slice(0, 33) + "…" : name;
      }),
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "10px",
          fontWeight: "600",
          colors: Array(topCategorias.length).fill("#374151"),
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
      y: {
        formatter: (val: number) => formatBRL(val),
      },
    },
  };

  const usedParlamentary = finance?.usedParliamentaryQuota ?? 0;
  const unusedParlamentary = finance?.unusedParliamentaryQuota ?? 0;
  const totalParlamentary = usedParlamentary + unusedParlamentary;

  const usedCabinet = finance?.usedCabinetQuota ?? 0;
  const unusedCabinet = finance?.unusedCabinetQuota ?? 0;
  const totalCabinet = usedCabinet + unusedCabinet;

  const quotaRadialOptions: ApexOptions = {
    chart: { type: "radialBar", fontFamily: "inherit" },
    plotOptions: {
      radialBar: {
        hollow: { size: "55%" },
        track: { background: "#f3f4f6", strokeWidth: "100%" },
        dataLabels: {
          name: { show: true, fontSize: "10px", color: "#9ca3af", offsetY: -5 },
          value: {
            show: true,
            fontSize: "18px",
            fontWeight: "800",
            color: "#111827",
            offsetY: 2,
            formatter: (val: number) => `${val.toFixed(0)}%`,
          },
        },
      },
    },
    colors: ["#749c5b", "#2563eb"],
    labels: ["Cota Parl.", "Verba Gab."],
    stroke: { lineCap: "round" },
  };

  const quotaRadialSeries =
    totalParlamentary > 0 || totalCabinet > 0
      ? [
          totalParlamentary > 0
            ? Math.round((usedParlamentary / totalParlamentary) * 100)
            : 0,
          totalCabinet > 0
            ? Math.round((usedCabinet / totalCabinet) * 100)
            : 0,
        ]
      : [];

  const detailItems = finance
    ? [
        { icon: Users, label: "Servidores contratados", val: finance.contractedPeople, url: finance.contractedPeopleUrl },
        { icon: DollarSign, label: "Salário bruto", val: finance.grossSalary, url: null },
        { icon: Building2, label: "Imóvel funcional", val: finance.functionalPropertyUsage, url: null },
        { icon: CreditCard, label: "Viagens", val: finance.trips, url: null },
        { icon: FileText, label: "Passaporte diplomático", val: finance.diplomaticPassport, url: null },
        { icon: Banknote, label: "Auxílio-moradia", val: finance.housingAssistant, url: null },
      ].filter((d) => d.val)
    : [];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* ═══════ ROW 1 — KPI Cards ═══════ */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KPICard
            value={formatBRL(usedParlamentary)}
            label="Cota Parlamentar"
            icon={Wallet}
            gradient="linear-gradient(90deg, #749c5b, #4E9F3D)"
            iconBg="#749c5b18"
            textColor="#749c5b"
            subtitle={`Utilizada em ${selectedYear}`}
          />
          <KPICard
            value={formatBRL(usedCabinet)}
            label="Verba de Gabinete"
            icon={Building2}
            gradient="linear-gradient(90deg, #2563eb, #3b82f6)"
            iconBg="#2563eb18"
            textColor="#2563eb"
            subtitle={`Utilizada em ${selectedYear}`}
          />
          <KPICard
            value={
              ceapResumo ? formatBRL(ceapResumo.total) : "—"
            }
            label="Total CEAP"
            icon={Receipt}
            gradient="linear-gradient(90deg, #d97706, #f59e0b)"
            iconBg="#d9770618"
            textColor="#d97706"
            subtitle={`Ano ${ceapAno}`}
          />
          <KPICard
            value={formatBRL(
              (unusedParlamentary || 0) + (unusedCabinet || 0),
            )}
            label="Saldo Disponível"
            icon={TrendingDown}
            gradient="linear-gradient(90deg, #059669, #10b981)"
            iconBg="#05966918"
            textColor="#059669"
            subtitle="Cotas não utilizadas"
          />
        </div>

        {/* ═══════ ROW 2 — Gráfico Mensal + Utilização ═══════ */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Execução mensal — Area Chart */}
          <div className={`${CARD_3D} lg:col-span-2`}>
            <div className={`${GLASS_HEADER} px-6 pt-5 pb-3`}>
              <SectionTitle
                icon={BarChart3}
                title={`Execução Financeira (${selectedYear})`}
                subtitle="Cota parlamentar e verba de gabinete — mensal"
              />
            </div>
            <div className="px-2 pb-2">
              {hasChartData ? (
                <ReactApexChart
                  options={chartOptions}
                  series={chartSeries}
                  type="area"
                  height={300}
                  width="100%"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <BarChart3 className="mb-3 h-10 w-10 text-gray-200" />
                  <p className="text-sm font-medium text-gray-400">
                    Sem dados financeiros para {selectedYear}.
                  </p>
                </div>
              )}
            </div>
            {finance && (
              <div className="grid grid-cols-2 gap-0 border-t border-gray-100 lg:grid-cols-4">
                {[
                  { label: "Cota Usada", val: formatBRL(usedParlamentary), color: "#749c5b" },
                  { label: "Cota Disp.", val: formatBRL(unusedParlamentary), color: "#4E9F3D" },
                  { label: "Gab. Usado", val: formatBRL(usedCabinet), color: "#2563eb" },
                  { label: "Gab. Disp.", val: formatBRL(unusedCabinet), color: "#3b82f6" },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className={`flex flex-col items-center py-4 ${i < 3 ? "border-r border-gray-100" : ""}`}
                  >
                    <span
                      className="text-base font-extrabold"
                      style={{ color: item.color }}
                    >
                      {item.val}
                    </span>
                    <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Utilização das cotas — Radial */}
          <div className={CARD_3D}>
            <div className={`${GLASS_HEADER} px-6 pt-5 pb-3`}>
              <SectionTitle
                icon={TrendingUp}
                title="Utilização das Cotas"
                subtitle="% consumida no ano"
              />
            </div>
            <div className="px-4 pb-2">
              {quotaRadialSeries.length > 0 ? (
                <ReactApexChart
                  options={quotaRadialOptions}
                  series={quotaRadialSeries}
                  type="radialBar"
                  height={260}
                  width="100%"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Wallet className="mb-3 h-10 w-10 text-gray-200" />
                  <p className="text-sm font-medium text-gray-400">
                    Sem dados de cotas.
                  </p>
                </div>
              )}
            </div>
            {quotaRadialSeries.length > 0 && (
              <div className="grid grid-cols-2 gap-0 border-t border-gray-100">
                <div className="flex flex-col items-center border-r border-gray-100 py-4">
                  <span className="text-lg font-extrabold text-secondary">
                    {quotaRadialSeries[0]}%
                  </span>
                  <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Cota Parl.
                  </span>
                </div>
                <div className="flex flex-col items-center py-4">
                  <span className="text-lg font-extrabold text-blue-600">
                    {quotaRadialSeries[1]}%
                  </span>
                  <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Verba Gab.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════ ROW 3 — Detalhamento (Benefícios) ═══════ */}
        {detailItems.length > 0 && (
          <div className={CARD_3D}>
            <div className={`${GLASS_HEADER} px-6 pt-5 pb-4`}>
              <SectionTitle
                icon={FileText}
                title="Detalhamento Financeiro"
                subtitle="Benefícios, salário, servidores e imóvel funcional"
                accentColor="#2d5a3d"
              />
            </div>
            <div className="grid gap-0 border-t border-gray-100 sm:grid-cols-2 lg:grid-cols-3">
              {detailItems.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 border-b border-r border-gray-100 p-5 transition-colors hover:bg-gray-50/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                      <ItemIcon className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {item.label}
                      </p>
                      <p className="truncate text-sm font-bold text-gray-900">
                        {item.val}
                      </p>
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-secondary/10 hover:text-secondary"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════ ROW 4 — CEAP — Full Dashboard ═══════ */}
        <div className={CARD_3D}>
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionTitle
                icon={Receipt}
                title="CEAP — Cota para Exercício Parlamentar"
                subtitle="Despesas detalhadas por categoria e fornecedor"
                accentColor="#d97706"
              />
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Ano
                  </label>
                  <Select
                    value={ceapAno}
                    onValueChange={(v) => {
                      setCeapAno(v);
                      setCeapPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 w-[110px] rounded-xl border-gray-200 bg-white text-sm shadow-sm">
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((y) => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {ceapResumo?.link && (
                  <a
                    href={ceapResumo.link}
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
            {loadingCeapResumo ? (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <SkeletonLoader className="h-16 w-40 rounded-xl" />
                  <SkeletonLoader className="h-16 w-40 rounded-xl" />
                </div>
                <SkeletonLoader className="h-48 w-full rounded-xl" />
              </div>
            ) : ceapResumo ? (
              <div className="space-y-6">
                {/* Resumo KPIs */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                      Total no Período
                    </p>
                    <p className="mt-1 text-xl font-extrabold text-amber-700">
                      {formatBRL(ceapResumo.total)}
                    </p>
                  </div>
                  {ceapResumo.ultimaData && (
                    <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Último Lançamento
                      </p>
                      <p className="mt-1 text-sm font-bold text-gray-900">
                        {new Date(ceapResumo.ultimaData).toLocaleDateString(
                          "pt-BR",
                          { dateStyle: "long" },
                        )}
                      </p>
                    </div>
                  )}
                  <div className="rounded-xl bg-gradient-to-br from-secondary/5 to-white p-4 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                      Categorias
                    </p>
                    <p className="mt-1 text-xl font-extrabold text-gray-900">
                      {topCategorias.length}
                    </p>
                  </div>
                </div>

                {/* Bar chart categorias */}
                {topCategorias.length > 0 && (
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      <BarChart3 className="h-3 w-3" />
                      Top Categorias de Despesa
                    </h4>
                    <ReactApexChart
                      options={catBarOptions}
                      series={[
                        {
                          name: "Valor",
                          data: topCategorias.map((c) => c.valor),
                        },
                      ]}
                      type="bar"
                      height={Math.max(topCategorias.length * 44, 180)}
                      width="100%"
                    />
                  </div>
                )}

                {/* Top Fornecedores */}
                {(loadingCeapFornecedores ||
                  (ceapFornecedores?.fornecedores?.length ?? 0) > 0) && (
                  <div className="mt-6">
                    <h4 className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      <BarChart3 className="h-3 w-3" />
                      Top Fornecedores ({ceapAno})
                    </h4>
                    {loadingCeapFornecedores ? (
                      <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <SkeletonLoader
                            key={i}
                            className="h-10 w-full rounded-lg"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {ceapFornecedores!.fornecedores.map((f, i) => {
                          const totalAno =
                            ceapFornecedores!.fornecedores.reduce(
                              (s, x) => s + x.valorTotal,
                              0,
                            ) || 1;
                          const pct = (f.valorTotal / totalAno) * 100;
                          return (
                            <div
                              key={`${f.cnpjCpf ?? "x"}-${i}`}
                              className="rounded-lg border border-gray-100 bg-gray-50/40 p-3"
                            >
                              <div className="flex items-baseline justify-between gap-3">
                                <div className="min-w-0">
                                  <p
                                    className="truncate text-xs font-semibold text-gray-800"
                                    title={f.nome}
                                  >
                                    {f.nome}
                                  </p>
                                  {f.cnpjCpf && (
                                    <p className="text-[10px] tabular-nums text-gray-400">
                                      {f.cnpjCpf}
                                    </p>
                                  )}
                                </div>
                                <div className="shrink-0 text-right">
                                  <p className="text-xs font-bold text-gray-900">
                                    {formatBRL(f.valorTotal)}
                                  </p>
                                  <p className="text-[10px] text-gray-400">
                                    {f.count}{" "}
                                    {f.count === 1 ? "doc." : "docs."}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-gray-100">
                                <div
                                  className="h-full bg-secondary transition-all"
                                  style={{ width: `${Math.min(100, pct)}%` }}
                                />
                              </div>
                              {f.valorGlosa > 0 && (
                                <p className="mt-1 text-[10px] text-rose-600">
                                  Glosa: {formatBRL(f.valorGlosa)}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Receipt className="mb-3 h-10 w-10 text-gray-200" />
                <p className="text-sm font-medium text-gray-400">
                  Sem dados CEAP para {ceapAno}.
                </p>
              </div>
            )}
          </div>

          {/* Tabela de despesas */}
          <div className="border-t border-gray-100">
            <div className="px-6 pt-5 pb-3">
              <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <FileText className="h-3 w-3" />
                Detalhamento por Lançamento
              </h4>
            </div>
            <div className="px-6 pb-6">
              {loadingCeapDespesas ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <SkeletonLoader
                      key={i}
                      className="h-10 w-full rounded-lg"
                    />
                  ))}
                </div>
              ) : despesasCeap.length > 0 ? (
                <>
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/80">
                          <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Data
                          </th>
                          <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Tipo / Descrição
                          </th>
                          <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Fornecedor
                          </th>
                          <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Valor
                          </th>
                          <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Glosa
                          </th>
                          <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Doc.
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {despesasCeap.map((d, i) => (
                          <tr
                            key={i}
                            className="group border-b border-gray-50 transition-colors hover:bg-secondary/5"
                          >
                            <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-gray-600">
                              {d.dataDocumento
                                ? new Date(
                                    d.dataDocumento,
                                  ).toLocaleDateString("pt-BR")
                                : "—"}
                            </td>
                            <td className="max-w-[220px] truncate px-4 py-3 text-xs text-gray-700">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-default">
                                    {d.descricao || d.tipoDespesa || "—"}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  {d.descricao || d.tipoDespesa || "—"}
                                </TooltipContent>
                              </Tooltip>
                            </td>
                            <td
                              className="max-w-[180px] truncate px-4 py-3 text-xs text-gray-600"
                              title={d.nomeFornecedor || undefined}
                            >
                              {d.nomeFornecedor || "—"}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-bold text-gray-900">
                              {formatBRL(
                                Number(
                                  d.valorLiquido ?? d.valorDocumento ?? 0,
                                ),
                              )}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium text-rose-600">
                              {d.valorGlosa && Number(d.valorGlosa) > 0
                                ? formatBRL(Number(d.valorGlosa))
                                : "—"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {d.urlDocumento ? (
                                <a
                                  href={d.urlDocumento}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-secondary/10 hover:text-secondary"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {(ceapHasMore || ceapPage > 1) && (
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-400">
                        Página {ceapPage}
                      </p>
                      <div className="flex gap-2">
                        {ceapPage > 1 && (
                          <Button
                            variant="outline"
                            className="h-9 rounded-xl border-gray-200 text-xs font-bold"
                            onClick={() =>
                              setCeapPage((p) => Math.max(1, p - 1))
                            }
                          >
                            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                            Anterior
                          </Button>
                        )}
                        {ceapHasMore && (
                          <Button
                            variant="outline"
                            className="h-9 rounded-xl border-secondary/30 bg-secondary/5 text-xs font-bold text-secondary hover:bg-secondary hover:text-white"
                            onClick={() => setCeapPage((p) => p + 1)}
                          >
                            Próxima
                            <ChevronRight className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/30 py-12 text-center">
                  <Receipt className="mb-3 h-8 w-8 text-gray-300" />
                  <p className="text-sm font-medium text-gray-400">
                    Nenhuma despesa encontrada para {ceapAno}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
