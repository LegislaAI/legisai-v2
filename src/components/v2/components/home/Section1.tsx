"use client";

import {
  BarChart3,
  ChevronDown,
  Download,
  FileText,
  Info,
  Loader2,
  Search,
} from "lucide-react";
import { useCookies } from "next-client-cookies";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// Dynamically import ReactApexChart to avoid window not defined error in SSR
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
import { Card } from "@/components/v2/components/ui/Card";
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

// Basic Skeleton component since it wasn't created yet but useful here
const SkeletonLoader = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

export function Section1() {
  const {
    politicians,
    GetPoliticians,
    selectedPolitician,
    GetSelectedPoliticianDetails,
    selectedYear,
    setSelectedYear,
    loading,
    // Legislature
    selectedLegislature,
    setSelectedLegislature,
    availableLegislatures,
    currentLegislature,
  } = usePoliticianContext();

  const cookies = useCookies();
  const { GetAPI } = useApiContext();

  // Dropdown state - local pagination for infinite scroll
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

  // Generate years dynamically from current year to 2019
  const START_YEAR = 2019;
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let year = currentYear; year >= START_YEAR; year--) {
      years.push(year.toString());
    }
    return years;
  }, []);

  // Initialize year from cookie or default to current year
  useEffect(() => {
    const savedYear = cookies.get("selectedYear");
    if (savedYear && availableYears.includes(savedYear)) {
      setSelectedYear(savedYear);
    } else if (!selectedYear || !availableYears.includes(selectedYear)) {
      const currentYear = new Date().getFullYear().toString();
      setSelectedYear(currentYear);
      cookies.set("selectedYear", currentYear);
    }
  }, []);

  // Handle year change with cookie persistence
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    cookies.set("selectedYear", year);
  };

  // Ref to track loading state without causing re-renders
  const isLoadingRef = useRef(false);

  // Fetch politicians for dropdown with pagination
  const fetchPoliticians = useCallback(
    async (currentPage: number, search: string, isNewSearch: boolean) => {
      // Use ref to prevent race conditions
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
            if (isNewSearch) {
              return newPoliticians;
            }
            // Filter out duplicates by ID before appending
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

  // Reset and fetch when search or filter changes
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

  // Infinite scroll observer
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

  // Handle legislature change
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
  // Handle Politician Selection
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

  // Chart Config
  const chartOptions: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "inherit",
    },
    colors: ["#749c5b", "#1a1d1f"], // Secondary and Dark
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
    grid: { borderColor: "#f1f1f1" },
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
    {
      name: "Cota Parlamentar",
      data: cota,
    },
    {
      name: "Verba de Gabinete",
      data: gabinete,
    },
  ];

  // Helper functions to check if there's data
  const hasChartData = useMemo(() => {
    if (!displayPolitician?.finance?.monthlyCosts) return false;
    const monthlyCosts = displayPolitician.finance.monthlyCosts;
    const hasCotaData = monthlyCosts.some(
      (item) =>
        item.parliamentaryQuota !== null &&
        item.parliamentaryQuota !== undefined,
    );
    const hasGabineteData = monthlyCosts.some(
      (item) => item.cabinetQuota !== null && item.cabinetQuota !== undefined,
    );
    return hasCotaData || hasGabineteData;
  }, [displayPolitician]);

  const hasFinanceData = useMemo(() => {
    if (!displayPolitician?.finance) return false;
    const finance = displayPolitician.finance;
    return (
      finance.contractedPeople ||
      finance.grossSalary ||
      finance.functionalPropertyUsage ||
      finance.trips ||
      finance.diplomaticPassport ||
      finance.housingAssistant
    );
  }, [displayPolitician]);
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Politician Profile Card */}
      <Card className="relative col-span-1 flex flex-col items-center overflow-hidden border-gray-100 p-6 text-center shadow-sm transition-shadow hover:shadow-md">
        {/* Search & Select */}
        <div className="mb-6 w-full space-y-3">
          {/* Legislature Toggle + Year Selector */}
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center justify-between rounded-lg bg-gray-50 p-2">
              <Label
                htmlFor="legislature-toggle"
                className="text-xs text-gray-600"
              >
                {showCurrentLegislatureOnly
                  ? "Legislatura atual"
                  : "Todas as legislaturas"}
              </Label>
              <Switch
                id="legislature-toggle"
                checked={showCurrentLegislatureOnly}
                onCheckedChange={setShowCurrentLegislatureOnly}
              />
            </div>
            {/* Year Selector */}
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[80px] border-gray-200 bg-gray-50">
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
            <Button
              variant="outline"
              className="border-gray-200 bg-gray-50"
              onClick={handleExportPDF}
              disabled={!displayPolitician || loading}
              title="Exportar Relatório PDF"
            >
              <Download className="h-4 w-4 text-gray-600" />
            </Button>
          </div>

          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-surface w-full justify-between border-0 hover:bg-gray-100"
              >
                {displayPolitician
                  ? displayPolitician?.name
                  : "Selecione um Político"}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[300px] p-2">
              <div className="mb-2 flex items-center rounded-md border border-gray-200 bg-gray-50 px-2">
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

                {/* Loading indicator */}
                {isLoadingMore && (
                  <div className="text-secondary flex justify-center py-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                )}

                {/* End of list indicator */}
                {!hasMore && localPoliticians.length > 0 && (
                  <div className="py-2 text-center text-xs text-gray-400">
                    Fim da lista
                  </div>
                )}

                {/* No results */}
                {!isLoadingMore && localPoliticians.length === 0 && (
                  <div className="py-4 text-center text-sm text-gray-500">
                    Nenhum político encontrado
                  </div>
                )}

                {/* Observer target for infinite scroll */}
                <div ref={observerTarget} className="h-2 w-full" />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {loading ? (
          <div className="flex w-full flex-col items-center space-y-4">
            <SkeletonLoader className="h-32 w-32 rounded-full" />
            <SkeletonLoader className="h-6 w-3/4" />
            <SkeletonLoader className="h-4 w-1/2" />
          </div>
        ) : displayPolitician ? (
          <>
            <div className="group ring-surface relative mb-4 rounded-full ring-4">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage
                  src={displayPolitician?.imageUrl}
                  alt={displayPolitician?.name || ""}
                  className="object-cover"
                />
                <AvatarFallback className="bg-secondary text-4xl text-white">
                  {displayPolitician?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <a
                  href={`https://www.camara.leg.br/deputados/${displayPolitician?.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-secondary hover:bg-secondary/80 transform rounded-full p-2 text-white transition-transform hover:scale-110"
                >
                  <Info className="h-6 w-6" />
                </a>
              </div>
            </div>

            <h3 className="text-dark text-xl font-bold">
              {displayPolitician?.name}
            </h3>
            <div className="mt-1 mb-6 flex items-center gap-2">
              <span className="bg-secondary/10 text-secondary rounded-full px-2 py-0.5 text-xs font-bold uppercase">
                {displayPolitician?.politicalParty}
              </span>
              <span className="text-sm font-medium text-gray-500">
                {displayPolitician?.positions[0]?.position}
              </span>
            </div>

            <div className="mb-6 grid w-full grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="mb-1 text-xs tracking-wider text-gray-400 uppercase">
                  Estado
                </p>
                <p className="text-dark text-lg font-bold">
                  {displayPolitician?.state}
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="mb-1 text-xs tracking-wider text-gray-400 uppercase">
                  Legislatura
                </p>
                <p className="text-dark text-lg font-bold">
                  {displayPolitician?.positions[0]?.startDate}
                </p>
              </div>
            </div>

            <Link
              href={`https://www.camara.leg.br/deputados/${displayPolitician.id}`}
              target="_blank"
              className="w-full"
            >
              <Button
                className="shadow-secondary/20 w-full font-semibold shadow-md transition-all hover:shadow-lg"
                variant="primary"
              >
                Ver Detalhes na Câmara
              </Button>
            </Link>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
            <Search className="h-8 w-8 opacity-20" />
            <p>Selecione um político para visualizar os dados.</p>
          </div>
        )}
      </Card>

      {/* Financial Charts */}
      {/* Financial Charts & Detailed Costs */}
      <div className="col-span-1 h-full lg:col-span-2">
        <Card className="group h-full overflow-hidden border-gray-100 p-0 shadow-sm transition-all hover:shadow-md">
          {/* Header Section */}
          <div className="flex flex-col justify-between gap-4 border-b border-gray-100/50 p-6 pb-2 sm:flex-row sm:items-center">
            <div className="flex flex-col">
              <h3 className="text-dark flex items-center gap-2 text-lg font-bold">
                Execução Financeira
                <span className="text-secondary bg-secondary/10 rounded-full px-2 py-0.5 text-xs font-semibold">
                  Mensal
                </span>
              </h3>
              <p className="text-sm text-gray-500">
                Panorama de gastos e uso da cota parlamentar
              </p>
            </div>

            <div className="flex gap-2">
              {/* Legislature Selector - Commented out for now */}
              {/* <Select
                value={selectedLegislature?.toString() || ""}
                onValueChange={handleLegislatureChange}
              >
                <SelectTrigger className="w-[140px] border-gray-200 bg-gray-50/50">
                  <SelectValue placeholder="Legislatura" />
                </SelectTrigger>
                <SelectContent>
                  {availableLegislatures.map((leg) => (
                    <SelectItem key={leg} value={leg.toString()}>
                      {leg}ª {leg === currentLegislature ? "(Atual)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Chart Column (2/3) */}
            <div className="relative h-[350px] p-4 lg:col-span-2">
              {loading ? (
                <div className="flex h-full w-full items-center justify-center">
                  <SkeletonLoader className="h-[300px] w-full" />
                </div>
              ) : !displayPolitician ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-gray-400">
                  <BarChart3 className="h-12 w-12 opacity-20" />
                  <p className="text-center text-sm">
                    Selecione um político para visualizar o gráfico de execução
                    financeira
                  </p>
                </div>
              ) : !hasChartData ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-gray-400">
                  <BarChart3 className="h-12 w-12 opacity-20" />
                  <p className="text-center text-sm">
                    Não há dados financeiros disponíveis para este político no
                    ano selecionado
                  </p>
                </div>
              ) : (
                <ReactApexChart
                  options={{
                    ...chartOptions,
                    chart: { ...chartOptions.chart, toolbar: { show: false } },
                    grid: { borderColor: "#f3f4f6", strokeDashArray: 4 },
                  }}
                  series={
                    chartSeries ? chartSeries : [{ name: "Gastos", data: [] }]
                  }
                  type="area"
                  height={320}
                  width="100%"
                />
              )}
            </div>

            {/* Detailed Costs Column (1/3) - styled as a side panel */}
            <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/50 p-5 lg:col-span-1 lg:border-t-0 lg:border-l">
              <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                Detalhamento
              </h4>
              <ScrollArea className="h-[280px] pr-3">
                {!displayPolitician ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
                    <FileText className="h-10 w-10 opacity-20" />
                    <p className="text-center text-xs">
                      Selecione um político para visualizar os detalhes
                      financeiros
                    </p>
                  </div>
                ) : !hasFinanceData ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
                    <FileText className="h-10 w-10 opacity-20" />
                    <p className="text-center text-xs">
                      Não há dados de detalhamento financeiro disponíveis para
                      este político no ano selecionado
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      {
                        label: displayPolitician?.finance?.contractedPeople,
                        icon: "👥",
                      },
                      {
                        label: displayPolitician?.finance?.grossSalary,
                        icon: "💰",
                      },
                      {
                        label:
                          displayPolitician?.finance?.functionalPropertyUsage,
                        icon: "🏠",
                      },
                      {
                        label: displayPolitician?.finance?.trips,
                        icon: "✈️",
                      },
                      {
                        label: displayPolitician?.finance?.diplomaticPassport,
                        icon: "🛂",
                      },
                      {
                        label: displayPolitician?.finance?.housingAssistant,
                        icon: "🛏️",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="hover:border-secondary/30 flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3 shadow-sm transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm">
                            {item.icon === "bed" ? (
                              <div className="h-4 w-4 rounded-sm bg-gray-300" />
                            ) : (
                              item.icon
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500">
                              {item.label}
                            </span>
                            {/* <span className="text-sm font-bold text-dark">{item.value} {item.sub && <span className="text-xs font-normal text-gray-400">{item.sub}</span>}</span> */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
