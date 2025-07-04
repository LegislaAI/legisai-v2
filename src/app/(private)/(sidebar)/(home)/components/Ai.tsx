"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import { ArrowRight, Check, ChevronDown, Info } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";

interface IaProps {
  id: string;
  icon: string;
  label: string;
  description: string;
}

const items: IaProps[] = [
  {
    id: "827364",
    icon: "/icons/ai-01.svg",
    label: "IA JURÍDICA",
    description: `IA especializada em análise e suporte político, ideal para entender cenários, dados e estratégias no campo público.`,
  },
  {
    id: "264891",
    icon: "/icons/ai-02.svg",
    label: "IA POLÍTICA",
    description: `Assistente jurídica inteligente, ágil na interpretação de normas, decisões e análises legais com precisão.`,
  },
  {
    id: "945672",
    icon: "/icons/ai-03.svg",
    label: "IA CONTABILIDADE",
    description: `Especialista em contabilidade, organiza e analisa dados contábeis de forma eficiente.`,
  },
  {
    id: "536781",
    icon: "/icons/ai-04.svg",
    label: "IA DOC JURÍDICO",
    description: `Focada na busca e análise rápida de documentos jurídicos com precisão.`,
  },
  {
    id: "183947",
    icon: "/icons/ai-05.svg",
    label: "IA GERAL",
    description: `Ferramenta versátil, útil para encontrar informações e responder perguntas em diversos contextos.`,
  },
  {
    id: "678302",
    icon: "/icons/ai-06.svg",
    label: "IA DOC CONTÁBIL",
    description: `Auxilia na busca e análise ágil de documentos contábeis.`,
  },
  {
    id: "491205",
    icon: "/icons/ai-07.svg",
    label: "IA DEPUTADO",
    description: `Especializada em buscar e analisar informações sobre deputados.`,
  },
];

export function Ai() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [selectedAi, setSelectedAi] = useState<IaProps>(items[0]);

  return (
    <div className="relative flex h-96 w-full flex-col justify-between rounded-lg bg-white p-4 lg:w-1/2">
      <div className="flex flex-col items-center justify-between lg:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-dark font-semibold">Legis AI</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="text-light-dark" />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="start"
                className="border-primary bg-primary w-60 border"
              >
                <p className="text-white">
                  Utilize inteligências artificiais temáticas para análise
                  jurídica ou compreensão político-legislativa.
                </p>
                <TooltipArrow className="fill-primary" />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="text-light-dark flex items-center gap-2 rounded-lg border px-2 py-1 lg:px-4 lg:py-2">
              <span className="font-semibold">{selectedAi.label}</span>
              <ChevronDown />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side="left"
            className="h-[20vh] w-full border-zinc-400 p-0"
          >
            <DropdownMenuArrow />
            <ScrollArea className="h-full w-full">
              {items.map((item, index) => (
                <DropdownMenuItem
                  key={index}
                  className="group rounded-none border-b border-b-zinc-400 p-0 hover:bg-transparent"
                >
                  <div
                    onClick={() => setSelectedAi(item)}
                    className={cn(
                      "group-hover:bg-secondary/20 w-full cursor-pointer px-2 py-1 text-base transition duration-200 lg:text-lg",
                      item.label === selectedAi.label && "bg-secondary/20",
                    )}
                  >
                    {item.label}
                  </div>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="w-full 2xl:w-[700px]">
        <Swiper
          slidesPerView={1.2}
          spaceBetween={10}
          centeredSlides
          breakpoints={{
            0: {
              slidesPerView: 1.2,
            },
            768: {
              slidesPerView: 2,
            },
          }}
        >
          {items.map((item, index) => (
            <SwiperSlide key={index}>
              <div
                onClick={() => setSelectedAi(item)}
                className="bg-primary/20 flex h-56 flex-col justify-between rounded-lg p-4"
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={item.icon}
                    width={16}
                    height={16}
                    alt={item.label}
                  />
                  <span className="text-lg font-semibold">{item.label}</span>
                </div>
                <span>{item.description}</span>
                {selectedAi.label === item.label ? (
                  <button className="bg-primary flex h-10 items-center justify-center gap-2 self-start rounded-lg px-4 text-white">
                    Em uso <Check />
                  </button>
                ) : (
                  <button className="text-primary flex h-10 items-center justify-center gap-2 self-start rounded-lg border px-4">
                    Usar essa AI
                  </button>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="bg-surface flex h-12 w-full items-center rounded-full">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-full flex-1 px-4 focus:outline-none"
          placeholder="Dê o primeiro passo escrevendo algo aqui"
        />
        <button
          onClick={() =>
            router.push(
              `/ai?param1=${encodeURIComponent(selectedAi.id)}&param2=${encodeURIComponent(
                value,
              )}`,
            )
          }
          className="bg-primary mr-1 flex h-11 w-11 items-center justify-center rounded-full text-white"
        >
          <ArrowRight />
        </button>
      </div>
    </div>
  );
}
