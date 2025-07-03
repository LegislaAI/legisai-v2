"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, ChevronRight, Info, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Procedures() {
  const router = useRouter();
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
  const [selectedDocument, setSelectedDocument] = useState("");
  const [value, setValue] = useState("");
  return (
    <div className="flex h-96 w-full flex-col justify-between rounded-lg bg-white p-2 lg:w-1/2 lg:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-dark font-semibold">
            Tramitações e Informações
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="text-light-dark" />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="start"
                className="border-primary bg-primary border"
              >
                <p className="text-white">Loren Ipsum</p>
                <TooltipArrow className="fill-primary" />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <button
          onClick={() => router.push("/procedures")}
          className="flex items-center gap-2"
        >
          <span className="text-secondary font-semibold">Detalhes aqui</span>
          <ChevronRight className="text-secondary" />
        </button>
      </div>
      <div className="flex flex-col items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="text-light-dark border-light-dark flex w-2/3 cursor-pointer items-center justify-center gap-1 rounded-t-lg border border-b-0 p-1 text-sm lg:w-1/2 lg:gap-2 lg:p-2">
              <span>Selecionar Tipo de Documentos</span>
              <ChevronDown />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align="center"
            className="max-h-[40vh] w-full gap-2 overflow-auto p-2"
          >
            {items.map((item, index) => (
              <DropdownMenuItem
                key={index}
                className="group rounded-none border-b border-b-zinc-400 hover:bg-transparent"
              >
                <div
                  onClick={() => setSelectedDocument(item.label)}
                  className="w-full cursor-pointer rounded-md p-2 text-lg group-hover:bg-zinc-400"
                >
                  {item.label}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="border-light-dark flex h-12 w-full items-center overflow-hidden rounded-lg border lg:w-4/5">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-full w-full px-2 focus:outline-none lg:px-4"
            placeholder="Procure Tramitações de preposições."
          />
          <button
            onClick={() =>
              router.push(
                `/ai?param1=${encodeURIComponent(selectedDocument)}&param2=${encodeURIComponent(
                  value,
                )}`,
              )
            }
            className="bg-primary flex h-12 w-12 items-center justify-center rounded-r-lg text-white"
          >
            <Search />
          </button>
        </div>
      </div>
    </div>
  );
}
