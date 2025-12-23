"use client";

import { ChevronDown, Info, Search } from "lucide-react";
import { useCookies } from "next-client-cookies";
import { useEffect, useState } from "react";
// Dynamically import ReactApexChart to avoid window not defined error in SSR
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

import { PoliticianDetailsProps } from "@/@types/v2/politician";
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
import { usePoliticianContext } from "@/context/PoliticianContext";
import Link from "next/link";
import { ScrollArea } from "../ui/scroll-area";

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
  } = usePoliticianContext();

  const cookies = useCookies();
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      GetPoliticians({ page: "1", query: searchTerm });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

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
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Politician Profile Card */}
      <Card className="relative col-span-1 flex flex-col items-center overflow-hidden border-gray-100 p-6 text-center shadow-sm transition-shadow hover:shadow-md">
        {/* Search & Select */}
        <div className="mb-6 w-full">
          <DropdownMenu>
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
              <div className="mb-2 flex items-center rounded-md border border-gray-200 px-2">
                <Search className="mr-2 h-4 w-4 text-gray-400" />
                <input
                  className="flex-1 bg-transparent py-2 text-sm outline-none"
                  placeholder="Buscar político1..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="max-h-[200px] w-full overflow-y-auto">
                {politicians.map((pol: any) => (
                  <DropdownMenuItem
                    key={pol.id}
                    onClick={() => handleSelectPolitician(pol.id)}
                    className="flex w-full cursor-pointer flex-row items-center"
                  >
                    <div className="flex w-full flex-row items-center">
                      <Avatar className="mr-2 h-6 w-6">
                        <AvatarImage src={pol?.urlFoto} />
                        <AvatarFallback>{pol?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex w-full flex-1 flex-col">
                        <div className="truncate font-medium text-black">
                          {pol?.name}
                        </div>
                        <div className="text-sm text-black">{pol?.partido}</div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
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

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px] border-gray-200 bg-gray-50/50">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Chart Column (2/3) */}
            <div className="relative h-[350px] p-4 lg:col-span-2">
              {loading ? (
                <div className="flex h-full w-full items-center justify-center">
                  <SkeletonLoader className="h-[300px] w-full" />
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
                Detalhamento Mensal
              </h4>
              <ScrollArea className="h-[280px] pr-3">
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
                    { label: displayPolitician?.finance?.trips, icon: "✈️" },
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
              </ScrollArea>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
