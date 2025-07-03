"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApexOptions } from "apexcharts";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
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
        <div className="hidden md:block">
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
      </div>
      <div className="grid w-full grid-cols-1 items-center gap-4 px-2 md:grid-cols-11 md:px-0 xl:gap-4">
        <div className="flex h-full w-full flex-row gap-8 lg:col-span-2">
          <Image
            src="/static/politician2.png"
            alt=""
            width={500}
            height={1000}
            className="w-1/2 rounded-xl object-contain lg:h-full lg:w-full xl:object-cover"
          />
          <div className="flex h-full flex-1 flex-col justify-between rounded-lg md:hidden">
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
            <div className="bg-primary/20 flex w-full flex-row items-center justify-center gap-2 rounded-lg p-2">
              <span className="text-primary text-lg">Partido:</span>
              <span className="text-primary text-lg">PL</span>
            </div>
            <div className="bg-primary/20 flex w-full flex-col items-center justify-center gap-2 rounded-lg p-2">
              <span className="text-primary text-lg">Samuel Viana</span>
            </div>
          </div>
        </div>
        <div className="border-secondary flex h-full w-full flex-col rounded-xl border-2 p-1 lg:col-span-5">
          <div className="flex w-full justify-between">
            <div className="flex flex-col">
              <span className="text-secondary font-bold">
                GASTOS E RECURSOS
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm">Custos de Maio:</span>
                <span className="font-semibold text-red-500">R$40.688,29</span>
              </div>
            </div>
            <div className="flex h-8 items-center justify-between gap-2 rounded-md px-1 text-sm text-white">
              <span className="border-secondary bg-secondary cursor-pointer rounded-md border p-0.5 font-semibold">
                Filtro
              </span>
            </div>
          </div>
          <ReactApexChart
            options={state.options as ApexOptions}
            series={state.series}
            type="line"
            width="100%"
          />
        </div>
        <div className="border-secondary text-primary flex h-full w-full flex-col rounded-xl border p-2 lg:col-span-4">
          <div className="flex w-full flex-row items-center justify-between">
            <span className="text-lg font-bold">CUSTOS DETALHADOS</span>
            <div className="bg-primary flex items-center justify-center rounded-lg p-1 text-sm text-white">
              Detalhes <ChevronRight />
            </div>
          </div>
          <div className="flex w-full flex-1 flex-col justify-between gap-2">
            <div className="border-b-primary flex w-full flex-row items-center justify-between border-b p-2">
              <div className="flex items-center border-r border-b border-r-white border-b-white px-1 font-semibold">
                Pessoal do Gabinete
              </div>
              <span className="text-center text-sm font-bold">
                Até 22 pessoas
              </span>
            </div>
            <div className="border-b-primary flex w-full flex-row items-center justify-between border-b p-2">
              <div className="flex items-center border-r border-b border-r-white border-b-white px-1 font-semibold">
                Salário mensal bruto
              </div>
              <span className="text-center text-xs font-bold">R$44.008,52</span>
            </div>
            <div className="border-b-primary flex w-full flex-row items-center justify-between border-b p-2">
              <div className="flex items-center border-r border-b border-r-white border-b-white px-1 font-semibold">
                Imóvel funcional
              </div>
              <span className="text-xs font-bold">x</span>
            </div>
            <div className="border-b-primary flex w-full flex-row items-center justify-between border-b p-2">
              <div className="flex items-center border-r border-b border-r-white border-b-white px-1 font-semibold">
                Auxílio-moradia
              </div>
              <span className="h-max text-xs font-bold">R$51.036,00</span>
            </div>
            <div className="border-b-primary flex w-full flex-row items-center justify-between border-b p-2">
              <div className="flex items-center border-r border-b border-r-white border-b-white px-1 font-semibold">
                Viagens em missão oficial
              </div>
              <span className="text-xs font-bold">x</span>
            </div>
            <div className="border-b-primary flex w-full flex-row items-center justify-between border-b p-2">
              <div className="flex items-center border-r border-b border-r-white border-b-white px-1 font-semibold">
                Passaporte diplomático
              </div>
              <span className="h-max text-sm font-bold">POSSUI</span>
            </div>{" "}
          </div>
        </div>
      </div>
    </div>
  );
}
