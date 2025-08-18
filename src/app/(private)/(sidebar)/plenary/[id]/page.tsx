"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

import { EventDetailsProps } from "@/@types/event";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useApiContext } from "@/context/ApiContext";
import { Tv } from "lucide-react";
import moment from "moment";
import { usePathname } from "next/navigation";
import { Votes } from "./components/Votes";
import { DayOrder } from "./components/dayOrder";
import { General } from "./components/general";
import { Presence } from "./components/presence";

export default function PlenaryDetails() {
  const pathname = usePathname();
  const { GetAPI } = useApiContext();
  const [selectedStep, setSelectedStep] = useState(0);
  const [animateSection] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [eventDetails, setEventDetails] = useState<EventDetailsProps | null>(
    null,
  );

  const formatTime = (time: number): string => {
    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); // Fixed this line
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);

    return `${String(days).padStart(2, "0")}:${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  async function GetEventDetails() {
    const eventId = pathname.split("/")[2];
    const details = await GetAPI(`/event/details/${eventId}`, true);
    if (details.status === 200) {
      setEventDetails(details.body.event);
      const time = moment(details.body.event.startDate).diff(
        moment(),
        "seconds",
      );
      if (time > 0) {
        setTimeLeft(
          moment(details.body.event.startDate).diff(moment(), "milliseconds"),
        );
      }
    }
  }

  useEffect(() => {
    GetEventDetails();
  }, []);

  useEffect(() => {
    if (!eventDetails) return;
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1000) {
          clearInterval(interval);
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [eventDetails]);

  // useEffect(() => {
  //   setAnimateSection(true);
  //   setTimeout(() => {
  //     setAnimateSection(false);
  //   }, 300);
  // }, [selectedStep]);

  return (
    <>
      {eventDetails ? (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 flex flex-col rounded-lg bg-white lg:col-span-8">
            <div className="flex w-full items-center justify-between border-b border-b-zinc-200 p-2">
              <div className="flex items-center gap-4">
                <Image
                  src="/static/plenary-logo.png"
                  alt=""
                  width={500}
                  height={500}
                  className="border-secondary/40 h-10 w-10 rounded-lg border object-cover lg:h-10 lg:w-10"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={cn(
                          "text-secondary text-lg font-bold",
                          eventDetails?.description.length > 200 &&
                            "cursor-pointer",
                        )}
                      >
                        {eventDetails?.description.length > 200
                          ? eventDetails.description.slice(0, 200) + "..."
                          : eventDetails.description}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      className={cn(
                        "scrollbar-hide max-h-40 w-80 overflow-y-scroll p-0.5 text-justify text-sm text-white",
                        eventDetails?.description.length <= 200 && "hidden",
                      )}
                    >
                      <p>{eventDetails.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="text-secondary flex w-max items-center gap-2">
                {moment(eventDetails.startDate).format("DD/MM/YYYY HH:mm")}
              </div>
            </div>
            <div className="text-secondary grid flex-1 grid-cols-2 items-center gap-2 p-2 md:flex">
              <div className="text-secondary border-secondary flex w-full flex-col gap-2 rounded-lg border p-2 md:w-max">
                <div className="flex flex-row items-center gap-2">
                  <span className="text-black">Início:</span>
                </div>
                <div className="flex flex-row gap-4">
                  <span className="text-secondary text-start">
                    {moment(eventDetails.startDate).format("DD/MM/YYYY HH:mm")}
                    {eventDetails.endDate &&
                      " às " + moment(eventDetails.endDate).format("HH:mm")}
                  </span>
                </div>
              </div>
              <div className="text-secondary border-secondary flex w-full flex-col gap-2 rounded-lg border p-2 md:w-max">
                <div className="flex flex-row items-center gap-2">
                  <span className="text-black">Quórum votação</span>
                </div>
                <div className="flex flex-row gap-4">
                  <span className="text-secondary text-start">
                    {eventDetails.presences}
                  </span>
                </div>
              </div>
              <div className="text-secondary border-secondary flex w-full flex-col gap-2 rounded-lg border p-2 md:w-max">
                <div className="flex flex-row items-center gap-2">
                  <span className="text-black">Total de Presentes</span>
                </div>
                <div className="flex flex-row gap-4">
                  <span className="text-secondary text-start">
                    {eventDetails.presences}
                  </span>
                </div>
              </div>
              <div className="text-secondary border-secondary flex w-full flex-col gap-2 rounded-lg border p-2 md:w-max">
                <div className="flex flex-row items-center gap-2">
                  <span className="text-black">Total de Propostas</span>
                </div>
                <div className="flex flex-row gap-4">
                  <span className="text-secondary text-start">
                    {eventDetails.propositions}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex w-full items-center gap-8 overflow-x-scroll overflow-y-hidden border-t border-t-zinc-200 p-4 lg:h-12 lg:overflow-x-auto lg:p-4">
              <div
                className={cn(
                  "hover:text-secondary flex cursor-pointer flex-col items-center whitespace-nowrap",
                  selectedStep === 0
                    ? "text-secondary font-bold"
                    : "text-zinc-400",
                )}
                onClick={() => setSelectedStep(0)}
              >
                VISÃO GERAL
                <div
                  className={cn(
                    "h-px w-full bg-transparent",
                    selectedStep === 0 && "bg-secondary",
                  )}
                />
              </div>
              <span
                className={cn(
                  "hover:text-secondary cursor-pointer",
                  selectedStep === 1
                    ? "text-secondary font-bold"
                    : "text-zinc-400",
                )}
                onClick={() => setSelectedStep(1)}
              >
                VOTAÇÃO
                <div
                  className={cn(
                    "h-px w-full bg-transparent",
                    selectedStep === 1 && "bg-secondary",
                  )}
                />
              </span>
              <span
                className={cn(
                  "hover:text-secondary cursor-pointer",
                  selectedStep === 2
                    ? "text-secondary font-bold"
                    : "text-zinc-400",
                )}
                onClick={() => setSelectedStep(2)}
              >
                PRESENÇAS
                <div
                  className={cn(
                    "h-px w-full bg-transparent",
                    selectedStep === 2 && "bg-secondary",
                  )}
                />
              </span>
              <div
                className={cn(
                  "hover:text-secondary flex cursor-pointer flex-col items-center whitespace-nowrap",
                  selectedStep === 3
                    ? "text-secondary font-bold"
                    : "text-zinc-400",
                )}
                onClick={() => setSelectedStep(3)}
              >
                ORDEM DO DIA
                <div
                  className={cn(
                    "h-px w-full bg-transparent",
                    selectedStep === 3 && "bg-secondary",
                  )}
                />
              </div>
            </div>
          </div>
          <div className="relative col-span-12 flex h-full flex-col items-center justify-between overflow-hidden rounded-xl bg-[url('/static/plenary.jpg')] bg-cover bg-no-repeat lg:col-span-4">
            <div className="bg-secondary/60 flex h-full w-full flex-col items-center justify-between gap-4 p-4">
              <div className="text-6xl font-bold text-white">
                {formatTime(timeLeft)}
              </div>
              <div className="px-8 text-center text-sm font-bold text-white uppercase">
                {" "}
                LOGO VOCÊ ACESSARÁ O LINK PARA acompanhamento{" "}
                <span className="font-black">ao vivo</span> O PRÓXIMO PLENÁRIO
              </div>
              <button
                onClick={() => {
                  window.open(eventDetails.videoUrl, "_blank");
                }}
                disabled={!eventDetails.videoUrl}
                className="overflow-hidden rounded-full"
              >
                <div className="bg-secondary flex h-full w-full items-center gap-2 p-2 text-white">
                  <Tv />
                  <span>
                    {eventDetails.videoUrl
                      ? "Acessar ao vivo"
                      : "Em breve disponível"}
                  </span>
                </div>
              </button>
            </div>
          </div>
          <div
            className={`col-span-12 ${animateSection ? "opacity-0" : "opacity-100 transition-all duration-700"} `}
          >
            {selectedStep === 0 && <General />}
            {selectedStep === 1 && <Votes eventUrl={eventDetails.uri} />}
            {selectedStep === 2 && <Presence />}
            {selectedStep === 3 && <DayOrder />}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 flex h-52 animate-pulse flex-col rounded-lg bg-zinc-200 lg:col-span-8"></div>
          <div className="relative col-span-12 flex h-full animate-pulse flex-col items-center justify-between overflow-hidden rounded-xl bg-zinc-200 lg:col-span-4"></div>
          <div className="col-span-12 h-52 animate-pulse bg-zinc-200"></div>
        </div>
      )}
    </>
  );
}
