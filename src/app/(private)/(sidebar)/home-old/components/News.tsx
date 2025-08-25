"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePoliticianContext } from "@/context/PoliticianContext";
import { ChevronRight, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { NewsCard } from "./NewsCard";

export function News() {
  const { politicianNews, isLoadingPoliticianNews } = usePoliticianContext();
  const router = useRouter();

  return (
    <div className="lg:w-col-span-1 flex h-96 w-full flex-col rounded-lg bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-dark font-semibold">Notícias de Políticos</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="text-light-dark" />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="start"
                className="border-secondary bg-secondary w-60 border"
              >
                <p className="text-white">
                  Acompanhe notícias recentes relacionadas ao político
                  selecionado ou acesse a lista completa.
                </p>
                <TooltipArrow className="fill-secondary" />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <button
          onClick={() => router.push("/news")}
          className="flex items-center gap-2"
        >
          <span className="text-secondary font-semibold">Ver Últimos</span>
          <ChevronRight className="text-secondary" />
        </button>
      </div>
      <ScrollArea>
        {politicianNews.length === 0 && isLoadingPoliticianNews && (
          <p>Carregando...</p>
        )}
        {!isLoadingPoliticianNews &&
          (politicianNews.length > 0 ? (
            politicianNews.map((news) => (
              <NewsCard
                key={news.id}
                title={news.title}
                summary={news.summary}
              />
            ))
          ) : (
            <p className="absolute top-1/2 left-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center text-gray-500">
              Nenhuma notícia desse(a) político(a) encontrada.
            </p>
          ))}
        {/* {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            onClick={() => router.push("/news")}
            className="group flex h-16 w-full items-center justify-between rounded-lg border border-transparent px-4 py-2 transition duration-200 hover:cursor-pointer hover:border-zinc-200 hover:shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
                <ArrowUpRight className="text-green-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">Título x...</span>
                <span className="text-secondary">Sites Diversos</span>
              </div>
            </div>
            <ChevronRight className="fill-secondary text-secondary" />
          </div>
        ))} */}
      </ScrollArea>
    </div>
  );
}
