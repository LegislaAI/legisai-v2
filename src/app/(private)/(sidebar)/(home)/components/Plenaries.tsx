"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Info } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useApiContext } from "@/context/ApiContext";
import { usePoliticianContext } from "@/context/PoliticianContext";
import moment from "moment";
import { useEffect, useState } from "react";
interface Event {
  createdAt: string;
  departmentId: string;
  description: string;
  endDate: string | null;
  eventTypeId: string;
  id: string;
  local: string;
  situation: string;
  startDate: string;
  updatedAt: string;
  uri: string;
  videoUrl: string | null;
}
export function Plenaries() {
  const router = useRouter();
  const { GetAPI } = useApiContext();
  const [events, setEvents] = useState<Event[]>([]);
  const { selectedPoliticianId } = usePoliticianContext();
  async function handleGetEvent() {
    const response = await GetAPI(
      `/event?page=1&politicianId=${selectedPoliticianId}`,
      true,
    );
    try {
      if (response.status === 200) {
        setEvents(response.body.events);
        // return response.body.politician;
      }
    } catch (error) {
      console.error("Error carregando politician:", error);
    }
  }

  useEffect(() => {
    handleGetEvent();
  }, [selectedPoliticianId]);

  return (
    <div className="lg:w-col-span-1 flex h-96 w-full flex-col rounded-lg bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-dark font-semibold">Plenários</span>
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
                  Acesse rapidamente as últimas sessões plenárias ou visualize
                  detalhes de uma específica.
                </p>
                <TooltipArrow className="fill-secondary" />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex cursor-pointer items-center gap-2 rounded border border-zinc-200 px-2 py-1 text-zinc-400 transition duration-200 hover:bg-zinc-200">
              {moment().format("DD/MM/YYYY")}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="flex h-20 w-20 items-center justify-center text-center">
            Calendário
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={() => router.push("/plenary")}
          className="flex items-center gap-2"
        >
          <span className="text-secondary font-semibold">Ver todos</span>
          <ChevronRight className="text-secondary" />
        </button>
      </div>
      {selectedPoliticianId && events && events.length > 0 ? (
        <ScrollArea>
          {events.map((event, index) => (
            <div
              onClick={() => router.push(`/plenary/${event.id}`)}
              key={index}
              className="group flex w-full items-center justify-between rounded-lg border border-transparent px-4 py-2 transition duration-200 hover:cursor-pointer hover:border-zinc-200 hover:shadow-sm"
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
                    <br />
                    <span className="line-clamp-2 text-sm overflow-ellipsis text-zinc-600">
                      {event.description}
                    </span>
                  </span>
                  <span className="text-secondary">
                    {moment(event.startDate).format("DD/MM/YYYY HH:mm")}
                  </span>
                </div>
              </div>
              <ChevronRight className="fill-secondary text-secondary w-6 max-w-6 min-w-6" />
            </div>
          ))}
        </ScrollArea>
      ) : selectedPoliticianId && events && events.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <span className="text-zinc-500">
            Nenhum plenário encontrado sobre esse(a) político(a)
          </span>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <span className="text-zinc-500">Selecione um Político</span>
        </div>
      )}
    </div>
  );
}
