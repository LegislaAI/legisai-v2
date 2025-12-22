"use client";

import { ChevronDown, Info, Search } from "lucide-react";
import { useCookies } from "next-client-cookies";
import { useEffect, useState } from "react";
// Dynamically import ReactApexChart to avoid window not defined error in SSR
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

import { PoliticianDetailsProps } from "@/@types/v2/politician";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/v2/components/ui/avatar";
import { Button } from "@/components/v2/components/ui/Button";
import { Card } from "@/components/v2/components/ui/Card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/v2/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/v2/components/ui/select";
import { usePoliticianContext } from "@/context/PoliticianContext";
import Link from "next/link";
import { ScrollArea } from "../ui/scroll-area";

// Basic Skeleton component since it wasn't created yet but useful here
const SkeletonLoader = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
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



  const [displayPolitician, setDisplayPolitician] = useState<PoliticianDetailsProps | null>(null);
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
      categories: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
        show: true,
        labels: {
            formatter: (value) => `R$ ${value > 1000 ? (value/1000).toFixed(0) + 'k' : value?.toFixed(0)}`
        }
    },
    grid: { borderColor: "#f1f1f1" },
    legend: { show: true, position: 'top' },
  };

  const cota = displayPolitician?.finance?.monthlyCosts?.map((item) => item.parliamentaryQuota);
  const gabinete = displayPolitician?.finance?.monthlyCosts?.map((item) => item.cabinetQuota);
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
  console.log("displayPolitician1", displayPolitician)
  console.log("selectedPolitician", selectedPolitician)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Politician Profile Card */}
      <Card className="col-span-1 p-6 flex flex-col items-center text-center relative overflow-hidden shadow-sm border-gray-100 hover:shadow-md transition-shadow">
        {/* Search & Select */}
        <div className="w-full mb-6">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-surface border-0 hover:bg-gray-100">
                        {displayPolitician ? displayPolitician?.name : "Selecione um Político"}
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[300px] p-2">
                    <div className="flex items-center border border-gray-200 rounded-md px-2 mb-2">
                        <Search className="h-4 w-4 text-gray-400 mr-2" />
                        <input 
                            className="flex-1 py-2 text-sm outline-none bg-transparent"
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
                                className="cursor-pointer w-full flex flex-row items-center"
                            >
                                <div className="flex w-full flex-row items-center  ">

                                <Avatar className="h-6 w-6 mr-2">
                                    <AvatarImage src={pol?.urlFoto} />
                                    <AvatarFallback>{pol?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex w-full flex-col  flex-1">
                                   
                                    <div className="font-medium text-black truncate">{pol?.name}</div>
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
             <div className="space-y-4 w-full flex flex-col items-center">
                 <SkeletonLoader className="h-32 w-32 rounded-full" />
                 <SkeletonLoader className="h-6 w-3/4" />
                 <SkeletonLoader className="h-4 w-1/2" />
             </div>
        ) : displayPolitician ? (
            <>
                <div className="relative mb-4 group ring-4 ring-surface rounded-full">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                        <AvatarImage src={displayPolitician?.imageUrl} alt={displayPolitician?.name || ""} className="object-cover" />
                        <AvatarFallback className="text-4xl bg-secondary text-white">{displayPolitician?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <a 
                            href={`https://www.camara.leg.br/deputados/${displayPolitician?.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-white bg-secondary p-2 rounded-full hover:bg-secondary/80 transform hover:scale-110 transition-transform"
                        >
                            <Info className="h-6 w-6" />
                        </a>
                    </div>
                </div>
                
                <h3 className="text-xl font-bold text-dark">{displayPolitician?.name}</h3>
                <div className="flex items-center gap-2 mt-1 mb-6">
                    <span className="bg-secondary/10 text-secondary text-xs font-bold px-2 py-0.5 rounded-full uppercase">
                        {displayPolitician?.politicalParty}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">
                        {displayPolitician?.positions[0]?.position}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full mb-6">
                     <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                         <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Estado</p>
                         <p className="font-bold text-dark text-lg">{displayPolitician?.state}</p>
                     </div>
                     <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                         <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Legislatura</p>
                         <p className="font-bold text-dark text-lg">{displayPolitician?.positions[0]?.startDate}</p>
                     </div>
                </div>

                <Link href={`https://www.camara.leg.br/deputados/${displayPolitician.id}`} target="_blank" className="w-full">
                    <Button className="w-full font-semibold shadow-secondary/20 shadow-md hover:shadow-lg transition-all" variant="primary">
                        Ver Detalhes na Câmara
                    </Button>
                </Link>
            </>
        ) : (
            <div className="py-10 text-gray-400 flex flex-col items-center gap-2">
                <Search className="h-8 w-8 opacity-20" />
                <p>Selecione um político para visualizar os dados.</p>
            </div>
        )}
      </Card>

      {/* Financial Charts */}
      {/* Financial Charts & Detailed Costs */}
      <div className="col-span-1 h-full lg:col-span-2">
          <Card className="p-0 h-full overflow-hidden shadow-sm border-gray-100 hover:shadow-md transition-all group">
             {/* Header Section */}
             <div className="p-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100/50">
                 <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-dark flex items-center gap-2">
                        Execução Financeira
                        <span className="text-xs font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">Mensal</span>
                    </h3>
                    <p className="text-sm text-gray-500">Panorama de gastos e uso da cota parlamentar</p>
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
                 <div className="lg:col-span-2 p-4 h-[350px] relative">
                    {loading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <SkeletonLoader className="w-full h-[300px]" />
                        </div>
                    ) : (
                        <ReactApexChart 
                            options={{
                                ...chartOptions,
                                chart: { ...chartOptions.chart, toolbar: { show: false } },
                                grid: { borderColor: '#f3f4f6', strokeDashArray: 4 },
                            }} 
                            series={chartSeries} 
                            type="area" 
                            height={320} 
                            width="100%"
                        />
                    )}
                 </div>

                 {/* Detailed Costs Column (1/3) - styled as a side panel */}
                 <div className="lg:col-span-1 bg-gray-50/50 border-t lg:border-t-0 lg:border-l border-gray-100 p-5 flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Detalhamento Mensal</h4>
                      <ScrollArea className="h-[280px] pr-3">
                          <div className="space-y-3">
                              {[
                                { label: displayPolitician?.finance?.contractedPeople,  icon: "👥" },
                                { label: displayPolitician?.finance?.grossSalary, icon: "💰" },
                                { label: displayPolitician?.finance?.functionalPropertyUsage, icon: "🏠" },
                                { label: displayPolitician?.finance?.trips, icon: "✈️" },
                                { label: displayPolitician?.finance?.diplomaticPassport, icon: "🛂" },
                                { label: displayPolitician?.finance?.housingAssistant, icon: "🛏️" },
                              ].map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:border-secondary/30 transition-colors">
                                      <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                                              {item.icon === "bed" ? <div className="w-4 h-4 rounded-sm bg-gray-300" /> : item.icon}
                                          </div>
                                          <div className="flex flex-col">
                                              <span className="text-xs font-medium text-gray-500">{item.label}</span>
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
