"use client";

import {
  Banknote,
  BarChart3,
  Building2,
  ChevronDown,
  CreditCard,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import { useCookies } from "next-client-cookies";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

import {
  PoliticianDetailsProps,
  PoliticianProps,
} from "@/@types/v2/politician";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/v2/components/ui/avatar";
import { Button } from "@/components/v2/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/v2/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/v2/components/ui/select";
import { useApiContext } from "@/context/ApiContext";
import { usePoliticianContext } from "@/context/PoliticianContext";
import { generatePoliticianReport } from "@/utils/pdfGenerator";
import Link from "next/link";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { Switch } from "../ui/switch";

/* ───────── Design Tokens ───────── */

const CARD_3D =
  "relative overflow-hidden rounded-2xl border-0 bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_40px_-8px_rgba(116,156,91,0.18),0_2px_8px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-[2px]";

const GLASS_HEADER =
  "bg-gradient-to-r from-[#749c5b]/[0.04] via-white/80 to-white backdrop-blur-sm";

/* ───────── Sub-components ───────── */

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  badge,
  accentColor = "#749c5b",
  rightSlot,
}: {
  icon: React.ComponentType<{ className?: string }>;
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

const SkeletonLoader = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-gray-100 ${className}`} />
);

function formatBRL(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/* ───────── Main Component ───────── */

export function Section1() {
  const {
    politicians,
    GetPoliticians,
    selectedPolitician,
    GetSelectedPoliticianDetails,
    selectedYear,
    setSelectedYear,
    loading,
    selectedLegislature,
    setSelectedLegislature,
    availableLegislatures,
    currentLegislature,
  } = usePoliticianContext();

  const cookies = useCookies();
  const { GetAPI } = useApiContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [localPoliticians, setLocalPoliticians] = useState<PoliticianProps[]>(
    [],
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showCurrentLegislatureOnly, setShowCurrentLegislatureOnly] =
    useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const START_YEAR = 2019;
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let year = currentYear; year >= START_YEAR; year--) {
      years.push(year.toString());
    }
    return years;
  }, []);

  const DEFAULT_YEAR = "2025";
  useEffect(() => {
    const savedYear = cookies.get("selectedYear");
    if (savedYear && availableYears.includes(savedYear)) {
      setSelectedYear(savedYear);
    } else if (!selectedYear || !availableYears.includes(selectedYear)) {
      setSelectedYear(DEFAULT_YEAR);
      cookies.set("selectedYear", DEFAULT_YEAR);
    }
  }, []);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    cookies.set("selectedYear", year);
  };

  const isLoadingRef = useRef(false);

  const fetchPoliticians = useCallback(
    async (currentPage: number, search: string, isNewSearch: boolean) => {
      if (isLoadingRef.current && !isNewSearch) return;

      isLoadingRef.current = true;
      setIsLoadingMore(true);
      try {
        let params = `?page=${currentPage}`;
        if (search) params += `&query=${search}`;
        if (showCurrentLegislatureOnly && currentLegislature) {
          params += `&legislature=${currentLegislature}`;
        }

        const response = await GetAPI(`/politician${params}`, true);

        if (response.status === 200 && response.body) {
          const newPoliticians = response.body.politicians || [];
          const totalPages = response.body.pages || 1;

          setLocalPoliticians((prev) => {
            if (isNewSearch) return newPoliticians;
            const existingIds = new Set(prev.map((p) => p.id));
            const uniqueNewPoliticians = newPoliticians.filter(
              (p: PoliticianProps) => !existingIds.has(p.id),
            );
            return [...prev, ...uniqueNewPoliticians];
          });
          setHasMore(currentPage < totalPages);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Failed to fetch politicians", error);
      } finally {
        isLoadingRef.current = false;
        setIsLoadingMore(false);
      }
    },
    [GetAPI, showCurrentLegislatureOnly, currentLegislature],
  );

  useEffect(() => {
    if (dropdownOpen) {
      const delayDebounceFn = setTimeout(() => {
        setLocalPoliticians([]);
        setPage(1);
        setHasMore(true);
        fetchPoliticians(1, searchTerm, true);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, showCurrentLegislatureOnly, dropdownOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          dropdownOpen
        ) {
          setPage((prev) => {
            const nextPage = prev + 1;
            fetchPoliticians(nextPage, searchTerm, false);
            return nextPage;
          });
        }
      },
      { threshold: 0.5 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoadingMore, searchTerm, dropdownOpen, fetchPoliticians]);

  const handleLegislatureChange = (value: string) => {
    setSelectedLegislature(Number(value));
  };

  const [displayPolitician, setDisplayPolitician] =
    useState<PoliticianDetailsProps | null>(null);
  useEffect(() => {
    if (selectedPolitician) {
      setDisplayPolitician(selectedPolitician);
    }
  }, [selectedPolitician]);

  const handleSelectPolitician = (id: string) => {
    cookies.set("selectedPoliticianId", id);
    setTimeout(() => {
      GetSelectedPoliticianDetails();
    }, 1000);
  };

  const handleExportPDF = () => {
    if (displayPolitician) {
      generatePoliticianReport(displayPolitician, selectedYear);
    }
  };

  /* ── Chart Config ── */

  const chartOptions: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "inherit",
    },
    colors: ["#749c5b", "#1a1d1f"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      show: true,
      labels: {
        formatter: (value) =>
          `R$ ${value > 1000 ? (value / 1000).toFixed(0) + "k" : value?.toFixed(0)}`,
      },
    },
    grid: { borderColor: "#f3f4f6", strokeDashArray: 4 },
    legend: { show: true, position: "top" },
  };

  const cota =
    displayPolitician?.finance?.monthlyCosts?.map(
      (item) => item.parliamentaryQuota,
    ) || [];
  const gabinete =
    displayPolitician?.finance?.monthlyCosts?.map(
      (item) => item.cabinetQuota,
    ) || [];
  const chartSeries = [
    { name: "Cota Parlamentar", data: cota },
    { name: "Verba de Gabinete", data: gabinete },
  ];

  /* ── Computed Totals ── */

  const totalCota = useMemo(() => {
    if (!cota.length) return 0;
    return cota.reduce((sum, v) => sum + (v || 0), 0);
  }, [cota]);

  const totalGabinete = useMemo(() => {
    if (!gabinete.length) return 0;
    return gabinete.reduce((sum, v) => sum + (v || 0), 0);
  }, [gabinete]);

  const hasChartData = useMemo(() => {
    if (!displayPolitician?.finance?.monthlyCosts) return false;
    const monthlyCosts = displayPolitician.finance.monthlyCosts;
    return monthlyCosts.some(
      (item) =>
        (item.parliamentaryQuota !== null &&
          item.parliamentaryQuota !== undefined) ||
        (item.cabinetQuota !== null && item.cabinetQuota !== undefined),
    );
  }, [displayPolitician]);

  const detailItems = useMemo(() => {
    if (!displayPolitician?.finance) return [];
    const finance = displayPolitician.finance;
    return [
      {
        icon: Users,
        label: "Servidores Contratados",
        value: finance.contractedPeople,
      },
      {
        icon: DollarSign,
        label: "Salário Bruto",
        value: finance.grossSalary,
      },
      {
        icon: Building2,
        label: "Imóvel Funcional",
        value: finance.functionalPropertyUsage,
      },
      {
        icon: CreditCard,
        label: "Viagens",
        value: finance.trips,
      },
      {
        icon: FileText,
        label: "Passaporte Diplomático",
        value: finance.diplomaticPassport,
      },
      {
        icon: Banknote,
        label: "Auxílio-Moradia",
        value: finance.housingAssistant,
      },
    ].filter((d) => d.value);
  }, [displayPolitician]);

  const hasFinanceData = detailItems.length > 0;

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* ═══════ Politician Profile Card ═══════ */}
      <div className={`${CARD_3D} col-span-1 flex flex-col`}>
        {/* Controls Header */}
        <div className={`${GLASS_HEADER} border-b border-gray-100/50 p-4`}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center justify-between rounded-xl bg-gray-50/80 px-3 py-2">
                <Label
                  htmlFor="legislature-toggle"
                  className="text-[10px] font-semibold uppercase tracking-wider text-gray-500"
                >
                  {showCurrentLegislatureOnly
                    ? "Legislatura atual"
                    : "Todas"}
                </Label>
                <Switch
                  id="legislature-toggle"
                  checked={showCurrentLegislatureOnly}
                  onCheckedChange={setShowCurrentLegislatureOnly}
                />
              </div>
              <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger className="h-9 w-[80px] rounded-xl border-gray-200 bg-white text-sm shadow-sm">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={handleExportPDF}
                disabled={!displayPolitician || loading}
                title="Exportar Relatório PDF"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:bg-gray-50 hover:text-secondary disabled:opacity-40"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>

            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center justify-between rounded-xl bg-white px-3 py-2.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition-all hover:ring-secondary/30 focus:outline-none">
                  <span className="truncate">
                    {displayPolitician
                      ? displayPolitician?.name
                      : "Selecione um Político"}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[300px] rounded-xl p-2 shadow-lg">
                <div className="mb-2 flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
                  <Search className="mr-2 h-4 w-4 text-gray-400" />
                  <input
                    className="flex-1 bg-transparent py-2 text-sm outline-none"
                    placeholder="Buscar político..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="max-h-[300px] w-full space-y-1 overflow-y-auto">
                  {localPoliticians.map((pol) => (
                    <DropdownMenuItem
                      key={pol.id}
                      onClick={() => {
                        handleSelectPolitician(pol.id);
                        setDropdownOpen(false);
                      }}
                      className="flex w-full cursor-pointer flex-row items-center rounded-lg p-2 transition-colors hover:bg-gray-100"
                    >
                      <Avatar className="mr-3 h-8 w-8 border border-gray-100">
                        <AvatarImage src={pol?.imageUrl} />
                        <AvatarFallback className="bg-secondary text-xs text-white">
                          {pol?.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-medium text-gray-900">
                          {pol?.name}
                        </span>
                        <span className="truncate text-xs text-gray-500">
                          {pol?.politicalPartyAcronym} - {pol?.state}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  {isLoadingMore && (
                    <div className="flex justify-center py-2 text-secondary">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  )}
                  {!hasMore && localPoliticians.length > 0 && (
                    <div className="py-2 text-center text-xs text-gray-400">
                      Fim da lista
                    </div>
                  )}
                  {!isLoadingMore && localPoliticians.length === 0 && (
                    <div className="py-4 text-center text-sm text-gray-500">
                      Nenhum político encontrado
                    </div>
                  )}
                  <div ref={observerTarget} className="h-2 w-full" />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Profile Body */}
        <div className="flex flex-1 flex-col items-center p-6 text-center">
          {loading ? (
            <div className="flex w-full flex-col items-center space-y-4 py-6">
              <SkeletonLoader className="h-28 w-28 rounded-full" />
              <SkeletonLoader className="h-5 w-3/4" />
              <SkeletonLoader className="h-4 w-1/2" />
              <div className="grid w-full grid-cols-2 gap-3 pt-4">
                <SkeletonLoader className="h-16 w-full" />
                <SkeletonLoader className="h-16 w-full" />
              </div>
            </div>
          ) : displayPolitician ? (
            <>
              {/* Avatar with hover glow */}
              <div className="group relative mb-5">
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-secondary/20 via-transparent to-secondary/10 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100" />
                <Avatar className="relative h-28 w-28 border-4 border-white shadow-lg ring-2 ring-gray-100 transition-all duration-300 group-hover:ring-secondary/20">
                  <AvatarImage
                    src={displayPolitician?.imageUrl}
                    alt={displayPolitician?.name || ""}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-secondary text-3xl font-bold text-white">
                    {displayPolitician?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <a
                  href={`https://www.camara.leg.br/deputados/${displayPolitician?.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-gray-100 transition-all hover:ring-secondary/30 hover:shadow-lg"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                </a>
              </div>

              {/* Name & Tags */}
              <h3 className="text-lg font-bold tracking-tight text-gray-900">
                {displayPolitician?.name}
              </h3>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-bold"
                  style={{ background: "#749c5b15", color: "#749c5b" }}
                >
                  {displayPolitician?.politicalParty}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-500">
                  {displayPolitician?.positions[0]?.position}
                </span>
              </div>

              {/* Info Mini Cards */}
              <div className="mt-6 grid w-full grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50/80 p-3 transition-all hover:bg-gray-100/60">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "#749c5b15" }}
                  >
                    <MapPin
                      className="h-4 w-4"
                      style={{ color: "#749c5b" }}
                    />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-lg font-extrabold leading-tight text-gray-900">
                      {displayPolitician?.state}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                      Estado
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50/80 p-3 transition-all hover:bg-gray-100/60">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "#2d5a3d15" }}
                  >
                    <Building2
                      className="h-4 w-4"
                      style={{ color: "#2d5a3d" }}
                    />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-lg font-extrabold leading-tight text-gray-900">
                      {displayPolitician?.positions[0]?.startDate}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                      Legislatura
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex w-full flex-col gap-2">
                <Link
                  href={`/deputados/${displayPolitician.id}`}
                  className="w-full"
                >
                  <Button
                    className="w-full rounded-xl font-bold shadow-md shadow-secondary/15 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    variant="primary"
                  >
                    Ver detalhes do deputado
                  </Button>
                </Link>
                <Link
                  href={`https://www.camara.leg.br/deputados/${displayPolitician.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Ver na Câmara
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
                <Search className="h-7 w-7 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-400">
                Selecione um político para visualizar os dados.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════ Financial Dashboard ═══════ */}
      <div className="col-span-1 h-full lg:col-span-2">
        <div className={`${CARD_3D} flex h-full flex-col`}>
          {/* Glass Header */}
          <div className={`${GLASS_HEADER} px-6 pt-5 pb-3`}>
            <SectionTitle
              icon={Wallet}
              title="Execução Financeira"
              subtitle="Panorama de gastos e uso da cota parlamentar"
              badge={selectedYear}
            />
          </div>

          <div className="grid flex-1 grid-cols-1 lg:grid-cols-3">
            {/* Chart Column (2/3) */}
            <div className="relative h-[350px] px-4 pt-2 lg:col-span-2">
              {loading ? (
                <div className="flex h-full w-full items-center justify-center p-4">
                  <SkeletonLoader className="h-[300px] w-full" />
                </div>
              ) : !displayPolitician ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
                    <BarChart3 className="h-7 w-7 text-gray-300" />
                  </div>
                  <p className="max-w-[220px] text-center text-sm font-medium text-gray-400">
                    Selecione um político para visualizar o gráfico de execução
                    financeira
                  </p>
                </div>
              ) : !hasChartData ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
                    <BarChart3 className="h-7 w-7 text-gray-300" />
                  </div>
                  <p className="max-w-[220px] text-center text-sm font-medium text-gray-400">
                    Sem dados financeiros para {selectedYear}
                  </p>
                </div>
              ) : (
                <ReactApexChart
                  options={chartOptions}
                  series={chartSeries}
                  type="area"
                  height={320}
                  width="100%"
                />
              )}
            </div>

            {/* Detail Panel (1/3) */}
            <div className="flex flex-col border-t border-gray-100 lg:col-span-1 lg:border-t-0 lg:border-l">
              <div className="px-5 pt-5 pb-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Detalhamento
                </h4>
              </div>
              <ScrollArea className="h-[280px] px-4 pb-4">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <SkeletonLoader key={i} className="h-14 w-full" />
                    ))}
                  </div>
                ) : !displayPolitician ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 py-10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
                      <FileText className="h-5 w-5 text-gray-300" />
                    </div>
                    <p className="text-center text-xs font-medium text-gray-400">
                      Selecione um político para ver detalhes
                    </p>
                  </div>
                ) : !hasFinanceData ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 py-10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
                      <FileText className="h-5 w-5 text-gray-300" />
                    </div>
                    <p className="text-center text-xs font-medium text-gray-400">
                      Não há dados de detalhamento para o ano selecionado
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {detailItems.map((item, idx) => {
                      const ItemIcon = item.icon;
                      return (
                        <div
                          key={idx}
                          className="group/item flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 transition-all hover:border-secondary/20 hover:shadow-sm"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 transition-colors group-hover/item:bg-secondary/15">
                            <ItemIcon className="h-4 w-4 text-secondary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                              {item.label}
                            </p>
                            <p className="truncate text-sm font-bold text-gray-900">
                              {item.value}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          {/* Bottom Summary Stats */}
          {hasChartData && displayPolitician && (
            <div className="grid grid-cols-2 gap-0 border-t border-gray-100 lg:grid-cols-4">
              {[
                {
                  label: "Cota Parl.",
                  value: formatBRL(totalCota),
                  color: "#749c5b",
                },
                {
                  label: "Verba Gab.",
                  value: formatBRL(totalGabinete),
                  color: "#1a1d1f",
                },
                {
                  label: "Total Geral",
                  value: formatBRL(totalCota + totalGabinete),
                  color: "#2d5a3d",
                },
                {
                  label: "Média Mensal",
                  value: formatBRL((totalCota + totalGabinete) / 12),
                  color: "#4E9F3D",
                },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className={`flex flex-col items-center py-4 ${i < 3 ? "border-r border-gray-100" : ""}`}
                >
                  <span
                    className="text-base font-extrabold"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </span>
                  <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Gradient bottom accent */}
          <div
            className="h-1 w-full"
            style={{
              background:
                "linear-gradient(90deg, #749c5b, #4E9F3D, #2d5a3d)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
