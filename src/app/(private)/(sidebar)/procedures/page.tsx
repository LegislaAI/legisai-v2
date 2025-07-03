"use client";
import { aiHistory } from "@/@staticData/ai";
import { Section } from "@/components/chat/SectionGemini";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { ChevronDown, Minus, Plus, Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function BranchesList() {
  const [loadNewChat, setLoadNewChat] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const items = [
    { label: "Todos" },
    { label: "PEC - Proposta de Emenda à Constituição" },
    { label: "PLP - Projeto de Lei Complementar" },
    { label: "PL - Projeto de Lei" },
    { label: "MPV - Medida Provisória" },
    { label: "PLV - Projeto de Lei de Conversão" },
    { label: "PDL - Projeto de Decreto Legislativo" },
    { label: "PRC - Projeto de Resolução" },
    { label: "REQ - Requerimento" },
    { label: "RIC - Requerimento de Informação" },
    { label: "RCP - Requerimento de Inst. de CPI" },
    { label: "MSC - Mensagem" },
    { label: "INC - Indicação" },
  ];

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <div className="flex h-[calc(100vh-150px)] w-full flex-col justify-between rounded-2xl bg-white p-2 xl:w-9/12 xl:p-4">
        <div className="relative">
          <Image
            src="/logos/camara.png"
            alt="logo"
            width={500}
            height={500}
            className="h-14 w-auto"
          />
          <br />
          <h2 className="text-sm font-medium text-zinc-400 xl:text-base">
            Inteligência artificial treinada com dados da Câmara legislativa.
          </h2>
          <h2 className="text-lg font-medium xl:text-2xl">
            Acesse informações diretas da Câmara dos Deputados
          </h2>
          <div className="absolute top-2 right-2 flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="bg-primary flex items-center gap-2 rounded-full px-2 py-1 text-base font-medium text-white focus:outline-none xl:top-4 xl:right-4 xl:px-4 xl:py-2 xl:text-xl">
                  Documentos <ChevronDown />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="max-h-[60vh] w-full gap-2 overflow-auto p-2"
              >
                {items.map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    className="group rounded-none border-b border-b-zinc-400 hover:bg-transparent"
                  >
                    <div className="w-full rounded-md p-2 text-lg group-hover:bg-zinc-400">
                      {item.label}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={() => setOpenInfo(true)}
              className="bg-primary flex items-center justify-center rounded-full p-1 text-white xl:hidden"
            >
              <Plus />
            </button>
          </div>
        </div>
        <div className="mt-4 flex h-[calc(100vh-300px)] flex-1 flex-col">
          <Section loadNewChat={loadNewChat} setLoadNewChat={setLoadNewChat} />
        </div>
      </div>
      <div
        className={cn(
          "relative h-[calc(100vh-150px)] w-3/4 flex-col justify-between rounded-2xl border border-zinc-200 bg-white shadow-sm lg:w-1/2 xl:flex xl:w-3/12",
          openInfo ? "absolute right-0 flex" : "hidden",
        )}
      >
        <button
          onClick={() => setOpenInfo(false)}
          className="bg-primary absolute top-4 right-[22px] z-10 flex items-center justify-center rounded-full p-1 text-white xl:hidden"
        >
          <Minus />
        </button>
        <div className="flex h-full flex-col justify-between gap-4 pb-8">
          <div className="flex h-full flex-col">
            <div className="relative w-full border-b border-gray-400 p-2">
              <Search className="text-dark absolute top-1/2 left-6 h-5 w-5 -translate-y-1/2" />
              <Input
                className="w-full border-none bg-transparent pl-10 focus:outline-none"
                placeholder="Pesquisar"
              />
            </div>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              {aiHistory.map((historic, index) => (
                <div
                  key={index}
                  className="rounded-lg transition-all duration-300 hover:scale-[1.02] hover:bg-gray-100"
                >
                  <h4 className="text-lg font-semibold">{historic.title}</h4>
                  <p className="text-sm text-gray-600">
                    {historic.description}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setLoadNewChat(true);
              }}
              className="bg-primary mt-4 h-12 w-2/3 cursor-pointer self-center rounded-3xl text-2xl font-semibold text-white"
            >
              Novo Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
