"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Tv } from "lucide-react";
import { Votes } from "./components/Votes";
import { DayOrder } from "./components/dayOrder";
import { Documents } from "./components/documents";
import { General } from "./components/general";
import { Presence } from "./components/presence";

export default function PlenaryDetails() {
  const [selectedStep, setSelectedStep] = useState(0);
  const [animateSection, setAnimateSection] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(12 * 60 * 60 * 1000);

  const formatTime = (time: number): string => {
    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1000) {
          clearInterval(interval); // Limpar o intervalo quando chegar a zero
          return 0;
        }
        return prevTime - 1000; // Subtrair 1 segundo (1000 ms)
      });
    }, 1000);

    // Limpeza do intervalo ao desmontar o componente
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setAnimateSection(true);
    setTimeout(() => {
      setAnimateSection(false);
    }, 300);
  }, [selectedStep]);

  return (
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
            <span className="text-secondary text-lg font-bold">
              SESSÃO DELIBERATIVA EXTRAORDINÁRIA (SEMIPRESENCIAL)
            </span>
          </div>
          <div className="text-secondary flex items-center gap-2">
            20/02/2024
          </div>
        </div>
        <div className="text-secondary grid flex-1 grid-cols-2 items-center gap-2 p-2 md:flex">
          <div className="text-secondary border-secondary flex w-full flex-col gap-2 rounded-lg border p-2 md:w-max">
            <div className="flex flex-row items-center gap-2">
              <span className="text-black">Início:</span>
            </div>
            <div className="flex flex-row gap-4">
              <span className="text-secondary text-start">
                {new Date().toLocaleTimeString("pt-BR")} ás{" "}
                {new Date().toLocaleTimeString("pt-BR")}
              </span>
            </div>
          </div>
          <div className="text-secondary border-secondary flex w-full flex-col gap-2 rounded-lg border p-2 md:w-max">
            <div className="flex flex-row items-center gap-2">
              <span className="text-black">Quórum votação</span>
            </div>
            <div className="flex flex-row gap-4">
              <span className="text-secondary text-start">287</span>
            </div>
          </div>
          <div className="text-secondary border-secondary flex w-full flex-col gap-2 rounded-lg border p-2 md:w-max">
            <div className="flex flex-row items-center gap-2">
              <span className="text-black">Total de Presentes</span>
            </div>
            <div className="flex flex-row gap-4">
              <span className="text-secondary text-start">320</span>
            </div>
          </div>
          <div className="text-secondary border-secondary flex w-full flex-col gap-2 rounded-lg border p-2 md:w-max">
            <div className="flex flex-row items-center gap-2">
              <span className="text-black">Total de Propostas</span>
            </div>
            <div className="flex flex-row gap-4">
              <span className="text-secondary text-start">3</span>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center gap-8 overflow-x-scroll overflow-y-hidden border-t border-t-zinc-200 p-4 lg:h-12 lg:overflow-x-auto lg:p-4">
          <div
            className={cn(
              "hover:text-secondary flex cursor-pointer flex-col items-center whitespace-nowrap",
              selectedStep === 0 ? "text-secondary font-bold" : "text-zinc-400",
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
              selectedStep === 1 ? "text-secondary font-bold" : "text-zinc-400",
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
              selectedStep === 2 ? "text-secondary font-bold" : "text-zinc-400",
            )}
            onClick={() => setSelectedStep(2)}
          >
            DOCUMENTOS
            <div
              className={cn(
                "h-px w-full bg-transparent",
                selectedStep === 2 && "bg-secondary",
              )}
            />
          </span>
          <span
            className={cn(
              "hover:text-secondary cursor-pointer",
              selectedStep === 3 ? "text-secondary font-bold" : "text-zinc-400",
            )}
            onClick={() => setSelectedStep(3)}
          >
            PRESENÇAS
            <div
              className={cn(
                "h-px w-full bg-transparent",
                selectedStep === 3 && "bg-secondary",
              )}
            />
          </span>
          <div
            className={cn(
              "hover:text-secondary flex cursor-pointer flex-col items-center whitespace-nowrap",
              selectedStep === 4 ? "text-secondary font-bold" : "text-zinc-400",
            )}
            onClick={() => setSelectedStep(4)}
          >
            ORDEM DO DIA
            <div
              className={cn(
                "h-px w-full bg-transparent",
                selectedStep === 4 && "bg-secondary",
              )}
            />
          </div>
        </div>
      </div>
      <div className="relative col-span-12 flex h-full flex-col items-center justify-between overflow-hidden rounded-xl bg-[url('/static/livePlenary2.png')] bg-cover bg-no-repeat lg:col-span-4">
        <div className="bg-secondary/60 flex h-full w-full flex-col items-center justify-between gap-4 p-4">
          <div className="text-6xl font-bold text-white">
            {formatTime(timeLeft)}
          </div>
          <div className="px-8 text-center text-sm font-bold text-white uppercase">
            {" "}
            LOGO VOCÊ ACESSARÁ O LINK PARA acompanhamento{" "}
            <span className="font-black">ao vivo</span> O PRÓXIMO PLENÁRIO
          </div>
          <button className="overflow-hidden rounded-full">
            <div className="bg-secondary flex h-full w-full items-center gap-2 p-2 text-white">
              <Tv />
              <span>EM BREVE DISPONÍVEL</span>
            </div>
          </button>
        </div>
      </div>
      <div
        className={`col-span-12 ${animateSection ? "opacity-0" : "opacity-100 transition-all duration-700"} `}
      >
        {selectedStep === 0 && <General setSelectedStep={setSelectedStep} />}
        {selectedStep === 1 && <Votes />}
        {selectedStep === 2 && <Documents />}
        {selectedStep === 3 && <Presence />}
        {selectedStep === 4 && <DayOrder />}
      </div>
    </div>
  );
}
