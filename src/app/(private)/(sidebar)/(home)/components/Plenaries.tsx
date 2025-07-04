"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Info } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
export function Plenaries() {
  const router = useRouter();

  return (
    <div className="flex h-96 w-full flex-col rounded-lg bg-white p-4 lg:w-1/2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-dark font-semibold">Últimos Plenários</span>
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
                  Acesse rapidamente as últimas sessões plenárias ou visualize
                  detalhes de uma específica.
                </p>
                <TooltipArrow className="fill-primary" />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <button
          onClick={() => router.push("/plenary")}
          className="flex items-center gap-2"
        >
          <span className="text-secondary font-semibold">Ver todos</span>
          <ChevronRight className="text-secondary" />
        </button>
      </div>
      <ScrollArea>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            onClick={() => router.push("/plenary/1")}
            key={index}
            className="group flex h-16 w-full items-center justify-between rounded-lg border border-transparent px-4 py-2 transition duration-200 hover:cursor-pointer hover:border-zinc-200 hover:shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Image
                src="/logos/small-logo.png"
                alt=""
                width={500}
                height={500}
                className="h-8 w-8 object-contain"
              />
              <div className="flex flex-col">
                <span className="font-semibold">
                  Plenário - Sessão Deliberativa
                </span>
                <span className="text-secondary">
                  {new Date().toLocaleDateString("pt-BR")} às{" "}
                  {new Date().toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <ChevronRight className="fill-secondary text-secondary" />
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
