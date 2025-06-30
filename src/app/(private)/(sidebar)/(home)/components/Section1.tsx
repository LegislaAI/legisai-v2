"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApexOptions } from "apexcharts";
import { ChevronDown, Info } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function Section1() {
  const [state] = useState({
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
      tooltip: {
        enabled: false,
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

  return (
    <div className="flex h-full flex-col gap-2 rounded-lg bg-white p-2 xl:p-4">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-dark font-semibold">Dados de Políticos</span>
          <Info className="text-light-dark" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="text-secondary border-secondary flex items-center justify-between rounded-xl border-2 px-2 py-1 font-semibold">
              <span>Trocar Político</span>
              <ChevronDown />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Lorem Ipsum</DropdownMenuItem>
            <DropdownMenuItem>Lorem Ipsum</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex w-full flex-col items-center gap-2 xl:flex-row xl:gap-4">
        <Image
          src="/static/politician.png"
          alt=""
          width={500}
          height={1000}
          className="h-40 w-full rounded-xl object-contain lg:w-28 xl:h-full xl:w-40 xl:object-cover"
        />
        <div className="border-secondary flex h-full w-full flex-col rounded-xl border-2 p-1 xl:w-1/2">
          <div className="flex w-full justify-between">
            <div className="flex flex-col">
              <span className="font-semibold">GASTOS E RECURSOS</span>
              <div className="flex items-center gap-1">
                <span className="text-sm">Custos de Maio:</span>
                <span className="font-semibold text-red-500">R$40.688,29</span>
              </div>
            </div>
            <div className="bg-secondary/40 flex h-8 w-40 items-center justify-between gap-2 rounded-md px-1 text-sm text-white">
              <span className="border-secondary bg-secondary cursor-pointer rounded-md border p-0.5 font-semibold">
                Mês
              </span>
              <span className="cursor-pointer font-semibold">2023</span>
              <span className="cursor-pointer font-semibold">2024</span>
            </div>
          </div>
          <ReactApexChart
            options={state.options as ApexOptions}
            series={state.series}
            type="line"
            width="100%"
          />
        </div>
        <div className="bg-secondary flex h-full w-full flex-col rounded-xl p-1 text-white xl:w-1/4">
          <span className="text-lg font-semibold">CUSTOS DETALHADOS</span>
          <div className="grid w-full grid-cols-2">
            <div className="flex items-center border-r border-b border-r-white border-b-white p-1 font-semibold">
              Pessoal do Gabinete
            </div>
            <div className="flex gap-1 border-r border-b border-r-white border-b-white p-1">
              <span className="text-sm font-bold">22</span>
              <span className="text-xs">
                pessoas neste ano, sendo 15 ativas atualmente
              </span>
            </div>

            <div className="flex items-center border-r border-b border-r-white border-b-white p-1 font-semibold">
              Salário mensal bruto
            </div>
            <div className="flex items-center gap-1 border-r border-b border-r-white border-b-white p-1">
              <span className="text-sm font-bold">44k</span>
              <span className="text-xs">R$44.008,52</span>
            </div>

            <div className="flex items-center border-r border-b border-r-white border-b-white p-1 font-semibold">
              Imóvel funcional
            </div>
            <div className="flex gap-1 border-r border-b border-r-white border-b-white p-1">
              <span className="text-xs">NÃO FAZ USO</span>
            </div>

            <div className="flex items-center border-r border-b border-r-white border-b-white p-1 font-semibold">
              Auxílio-moradia
            </div>
            <div className="flex flex-col items-center gap-1 border-r border-b border-r-white border-b-white p-1">
              <span className="h-max text-sm font-bold">RECEBEU</span>
              <span className="h-max text-xs">R$51.036,00</span>
            </div>

            <div className="flex items-center border-r border-b border-r-white border-b-white p-1 font-semibold">
              Viagens em missão oficial
            </div>
            <div className="flex items-center justify-center gap-1 border-r border-b border-r-white border-b-white p-1">
              <span className="text-xs">VIAGENS</span>
            </div>

            <div className="flex items-center border-r border-b border-r-white border-b-white p-1 font-semibold">
              Passaporte diplomático
            </div>
            <div className="flex flex-col gap-1 border-r border-b border-r-white border-b-white p-1">
              <span className="h-max text-sm font-bold">POSSUI</span>
              <span className="h-max text-xs">PASSAPORTE DIPLOMÁTICO</span>
            </div>
          </div>
        </div>
        <div className="bg-secondary/20 border-secondary h-full flex-1 rounded-xl border" />
      </div>
    </div>
  );
}
