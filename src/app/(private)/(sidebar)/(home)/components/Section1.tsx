"use client";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePoliticianContext } from "@/context/PoliticianContext";
import { cn } from "@/lib/utils";
import { ApexOptions } from "apexcharts";
import debounce from "lodash.debounce";
import { Check, ChevronDown, ChevronRight, Info, Loader2 } from "lucide-react";
import { useCookies } from "next-client-cookies";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function Section1() {
  const cookies = useCookies();
  const {
    politicians,
    GetPoliticians,
    selectedPolitician,
    selectedYear,
    setSelectedYear,
    selectedPoliticianId,
    setSelectedPoliticianId,
  } = usePoliticianContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [graphOptions, setGraphOptions] = useState({
    series: [
      {
        name: "",
        data: [200, 400, 325, 300, 260, 220, 200, 280, 300, 320, 190, 230],
      },
      {
        name: "",
        data: [150, 320, 180, 250, 350, 220, 200, 150, 120, 100, 400, 350],
      },
    ],
    options: {
      chart: {
        type: "line",
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
        background: "transparent",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      colors: ["#00A15D", "#FF5E4B"],
      title: {
        show: false,
      },
      subtitle: {
        show: false,
      },
      grid: {
        show: true,
        borderColor: "#a1a1aa",
        strokeDashArray: 10,
        position: "back",
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      xaxis: {
        categories: [
          "Jan",
          "Fev",
          "Mar",
          "Abr",
          "Maio",
          "Jun",
          "Jul",
          "Ago",
          "Set",
          "Out",
          "Nov",
          "Dez",
        ],
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: true,
        },
      },
      legend: {
        show: false,
      },
      responsive: [
        {
          breakpoint: 2160,
          options: {
            chart: {
              height: 250,
            },
          },
        },
      ],
    },
  });

  useEffect(() => {
    if (selectedPolitician) {
      // Create arrays for all 12 months, defaulting to 0
      const cabinetQuotaData = Array(12).fill(0);
      const parliamentaryQuotaData = Array(12).fill(0);

      // Fill in the actual data where available
      selectedPolitician.finance.monthlyCosts.forEach((cost) => {
        const monthIndex = cost.month - 1; // Convert to 0-based index
        if (monthIndex >= 0 && monthIndex < 12) {
          cabinetQuotaData[monthIndex] = cost.cabinetQuota || 0;
          parliamentaryQuotaData[monthIndex] = cost.parliamentaryQuota || 0;
        }
      });

      setGraphOptions({
        ...graphOptions,
        series: [
          {
            name: "Verba de Gabinete GastO",
            data: cabinetQuotaData,
          },
          {
            name: "Cota Parlamentar GastO",
            data: parliamentaryQuotaData,
          },
        ],
      });
    } else {
      setGraphOptions({
        ...graphOptions,
        series: [
          {
            name: "",
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          },
          {
            name: "",
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          },
        ],
      });
    }
  }, [selectedPolitician]);

  const handleStopTyping = (value: string) => {
    GetPoliticians({ page: "1", query: value });
  };

  const debouncedHandleStopTyping = useCallback(
    debounce(handleStopTyping, 500),
    [],
  );

  return (
    <div className="flex h-full flex-col gap-2 rounded-lg bg-white p-2 xl:p-4">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-dark font-semibold">Dados de Políticos</span>
          <Info
            onClick={() => {
              if (!selectedPoliticianId) return;
              window.open(
                `https://www.camara.leg.br/deputados/${selectedPoliticianId}`,
                "_blank",
              );
            }}
            className="text-light-dark cursor-pointer"
          />
        </div>
        <div className="hidden md:block">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <div className="text-secondary border-secondary flex cursor-pointer items-center justify-between rounded-xl border-2 px-2 py-1 font-semibold">
                <span>
                  {selectedPolitician
                    ? selectedPolitician.name
                    : "Selecione um político"}
                </span>
                <ChevronDown />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[9999]">
              <Command
                className="z-[99999]"
                filter={(value, search) => {
                  if (
                    value
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .includes(search.toLowerCase())
                  )
                    return 1;
                  return 0;
                }}
              >
                <CommandInput
                  onValueChange={(e) => {
                    debouncedHandleStopTyping(e);
                  }}
                  placeholder="Pesquisar..."
                />
                <CommandEmpty>Não encontrado.</CommandEmpty>
                {politicians
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((user, index) => (
                    <CommandItem
                      key={`politician-${index}`}
                      value={user.name}
                      onSelect={() => {
                        setSelectedPoliticianId(user.id);
                        setIsDropdownOpen(false);
                        cookies.set("selectedPoliticianId", user.id);
                      }}
                      className={cn(
                        "hover:bg-secondary/20 pointer-events-auto flex w-full cursor-pointer items-center justify-between transition duration-200",
                        user.id === selectedPolitician?.id && "bg-secondary/20",
                      )}
                    >
                      {user.name}
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          user.id !== selectedPolitician?.id && "hidden",
                        )}
                      />
                    </CommandItem>
                  ))}
              </Command>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="grid w-full grid-cols-1 items-center gap-4 px-2 md:grid-cols-11 md:px-0 xl:gap-4">
        <div className="md:hidden">
          <DropdownMenu
            open={isMobileDropdownOpen}
            onOpenChange={setIsMobileDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <div className="text-secondary border-secondary flex cursor-pointer items-center justify-between rounded-xl border-2 px-2 py-1 font-semibold">
                <span>
                  {selectedPolitician
                    ? selectedPolitician.name
                    : "Selecione um político"}
                </span>
                <ChevronDown />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[9999]">
              <Command
                className="z-[99999]"
                filter={(value, search) => {
                  if (
                    value
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .includes(search.toLowerCase())
                  )
                    return 1;
                  return 0;
                }}
              >
                <CommandInput
                  onValueChange={(e) => {
                    debouncedHandleStopTyping(e);
                  }}
                  placeholder="Pesquisar..."
                />
                <CommandEmpty>Não encontrado.</CommandEmpty>
                {politicians
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((user, index) => (
                    <CommandItem
                      key={`politician-${index}`}
                      value={user.name}
                      onSelect={() => {
                        setSelectedPoliticianId(user.id);
                        setIsMobileDropdownOpen(false);
                        cookies.set("selectedPoliticianId", user.id);
                      }}
                      className={cn(
                        "hover:bg-secondary/20 pointer-events-auto flex w-full cursor-pointer items-center justify-between transition duration-200",
                        user.id === selectedPolitician?.id && "bg-secondary/20",
                      )}
                    >
                      {user.name}
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          user.id !== selectedPolitician?.id && "hidden",
                        )}
                      />
                    </CommandItem>
                  ))}
              </Command>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex h-full w-full flex-row gap-8 lg:col-span-2">
          {selectedPoliticianId && selectedPolitician?.imageUrl ? (
            <Image
              src={selectedPolitician?.imageUrl}
              alt=""
              width={500}
              height={1000}
              className="border-secondary w-1/2 rounded-xl border-2 object-contain lg:h-[22rem] lg:w-full xl:object-cover"
            />
          ) : (
            <div className="flex w-1/2 animate-pulse items-center justify-center rounded-xl bg-zinc-200 lg:h-full lg:w-full">
              <Loader2 className="m-auto animate-spin" />
            </div>
          )}
          <div className="MOBILE flex h-full flex-1 flex-col items-center justify-center rounded-lg md:hidden">
            <div className="bg-primary/20 flex w-full flex-row items-center justify-center gap-2 rounded-lg p-2">
              <span className="text-primary text-lg">Partido:</span>
              <span className="text-primary text-lg">
                {selectedPolitician?.politicalPartyAcronym}
              </span>
            </div>
          </div>
        </div>
        <div className="border-secondary flex h-full w-full flex-col rounded-xl border-2 p-1 lg:col-span-5">
          <div className="flex w-full justify-between">
            <div className="flex w-full flex-col">
              <span className="text-secondary font-bold">
                GASTOS E RECURSOS
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex h-8 items-center justify-between gap-2 rounded-md px-1 text-sm text-white">
                  <span className="border-secondary bg-secondary cursor-pointer rounded-md border p-0.5 font-semibold">
                    {selectedYear}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setSelectedYear("2025")}
                  className={cn(
                    "hover:bg-secondary/20 cursor-pointer",
                    selectedYear === "2025" && "bg-secondary/20",
                  )}
                >
                  2025
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedYear("2024")}
                  className={cn(
                    "hover:bg-secondary/20 cursor-pointer",
                    selectedYear === "2024" && "bg-secondary/20",
                  )}
                >
                  2024
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedYear("2023")}
                  className={cn(
                    "hover:bg-secondary/20 cursor-pointer",
                    selectedYear === "2023" && "bg-secondary/20",
                  )}
                >
                  2023
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedYear("2022")}
                  className={cn(
                    "hover:bg-secondary/20 cursor-pointer",
                    selectedYear === "2022" && "bg-secondary/20",
                  )}
                >
                  2022
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div
            className={cn(
              "flex w-full items-center justify-between gap-2",
              !selectedPolitician && "hidden",
            )}
          >
            <div className="flex flex-col gap-1 lg:flex-row">
              <span className="text-sm">Cota Parlamentar:</span>
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-red-500">
                  Gasto:{" "}
                  {selectedPolitician?.finance.usedParliamentaryQuota
                    ? selectedPolitician?.finance.usedParliamentaryQuota.toLocaleString(
                        "pt-BR",
                        { style: "currency", currency: "BRL" },
                      )
                    : "N/A"}
                </span>
                <span className="font-semibold text-green-500">
                  Não utilizado:{" "}
                  {selectedPolitician?.finance.unusedParliamentaryQuota
                    ? selectedPolitician?.finance.unusedParliamentaryQuota.toLocaleString(
                        "pt-BR",
                        { style: "currency", currency: "BRL" },
                      )
                    : "N/A"}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1 lg:flex-row">
              <span className="text-sm">Verba de Gabinete:</span>
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-red-500">
                  Gasto:{" "}
                  {selectedPolitician?.finance.usedCabinetQuota
                    ? selectedPolitician?.finance.usedCabinetQuota.toLocaleString(
                        "pt-BR",
                        { style: "currency", currency: "BRL" },
                      )
                    : "N/A"}
                </span>
                <span className="font-semibold text-green-500">
                  Não utilizado:{" "}
                  {selectedPolitician?.finance.unusedCabinetQuota
                    ? selectedPolitician?.finance.unusedCabinetQuota.toLocaleString(
                        "pt-BR",
                        { style: "currency", currency: "BRL" },
                      )
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
          <ReactApexChart
            options={graphOptions.options as ApexOptions}
            series={graphOptions.series}
            type="line"
            width="100%"
          />
        </div>
        <div className="border-secondary text-primary flex h-full w-full flex-col rounded-xl border-2 p-2 lg:col-span-4">
          <div className="flex w-full flex-row items-center justify-between">
            <span className="text-lg font-bold">CUSTOS DETALHADOS</span>
            <div
              onClick={() => {
                if (!selectedPoliticianId) return;
                window.open(
                  `https://www.camara.leg.br/deputados/${selectedPoliticianId}`,
                  "_blank",
                );
              }}
              className="bg-primary flex items-center justify-center rounded-lg p-1 text-sm text-white"
            >
              Detalhes <ChevronRight />
            </div>
          </div>
          <div className="flex w-full flex-1 flex-col justify-between gap-2">
            <div className="border-b-primary flex w-full flex-row items-center justify-between border-b p-2">
              <div className="flex items-center border-r border-b border-r-white border-b-white px-1 font-semibold">
                Pessoal do Gabinete
              </div>
              <span className="text-center text-xs font-bold">
                {selectedPolitician?.finance.contractedPeople
                  ? selectedPolitician?.finance.contractedPeople.split(
                      "Pessoal de gabinete",
                    )[1]
                  : "N/A"}
              </span>
            </div>
            <div className="border-b-primary flex w-full flex-row items-center justify-between border-b p-2">
              <div className="flex items-center border-r border-b border-r-white border-b-white px-1 font-semibold">
                Salário mensal bruto
              </div>
              <span className="text-center text-xs font-bold">
                {selectedPolitician?.finance.grossSalary
                  ? selectedPolitician?.finance.grossSalary.split(
                      "Salário mensal bruto",
                    )[1]
                  : "N/A"}
              </span>
            </div>
            <div className="border-b-primary flex w-full flex-row items-center justify-between border-b p-2">
              <div className="flex items-center border-r border-b border-r-white border-b-white px-1 font-semibold">
                Imóvel funcional
              </div>
              <span className="text-center text-xs font-bold">
                {selectedPolitician?.finance.functionalPropertyUsage
                  ? selectedPolitician?.finance.functionalPropertyUsage.split(
                      "Imóvel funcional",
                    )[1]
                  : "N/A"}
              </span>
            </div>
            <div className="border-b-primary flex w-full flex-row items-center justify-between border-b p-2">
              <div className="flex items-center border-r border-b border-r-white border-b-white px-1 font-semibold">
                Auxílio-moradia
              </div>
              <span className="text-center text-xs font-bold">
                {selectedPolitician?.finance.housingAssistant
                  ? selectedPolitician?.finance.housingAssistant.split(
                      "Auxílio-moradia",
                    )[1]
                  : "N/A"}
              </span>
            </div>
            <div className="border-b-primary flex w-full flex-row items-center justify-between border-b p-2">
              <div className="flex items-center border-r border-b border-r-white border-b-white px-1 font-semibold">
                Viagens em missão oficial
              </div>
              <span className="text-center text-xs font-bold">
                {selectedPolitician?.finance.trips
                  ? selectedPolitician?.finance.trips.split(
                      "Viagens em missão oficial",
                    )[1]
                  : "N/A"}
              </span>
            </div>
            <div className="border-b-primary flex w-full flex-row items-center justify-between border-b p-2">
              <div className="flex items-center border-r border-b border-r-white border-b-white px-1 font-semibold">
                Passaporte diplomático
              </div>
              <span className="text-center text-xs font-bold">
                {selectedPolitician?.finance.diplomaticPassport
                  ? selectedPolitician?.finance.diplomaticPassport.split(
                      "Passaporte diplomático",
                    )[1]
                  : "N/A"}
              </span>
            </div>{" "}
          </div>
        </div>
      </div>
    </div>
  );
}
