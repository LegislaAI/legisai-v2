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
import { ChevronDown, ChevronRight, Info, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Procedures() {
  const router = useRouter();
  const items = [
    { id: "456123", label: "Todos" },
    { id: "789456", label: "PEC - Proposta de Emenda à Constituição" },
    { id: "654321", label: "PLP - Projeto de Lei Complementar" },
    { id: "963852", label: "PL - Projeto de Lei" },
    { id: "753159", label: "MPV - Medida Provisória" },
    { id: "321654", label: "PLV - Projeto de Lei de Conversão" },
    { id: "985632", label: "PDL - Projeto de Decreto Legislativo" },
    { id: "159753", label: "PRC - Projeto de Resolução" },
    { id: "846219", label: "REQ - Requerimento" },
    { id: "357192", label: "RIC - Requerimento de Informação" },
    { id: "279036", label: "RCP - Requerimento de Inst. de CPI" },
    { id: "943817", label: "MSC - Mensagem" },
    { id: "136598", label: "INC - Indicação" },
  ];
  const [selectedDocument, setSelectedDocument] = useState({
    id: "",
    label: "",
  });
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
                className="border-primary bg-primary w-60 border"
              >
                <p className="text-white">
                  Consulte uma IA especializada para obter dados precisos sobre
                  tramitações legislativas específicas.
                </p>
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
              <span>
                {selectedDocument.label
                  ? selectedDocument.label
                  : "Selecionar Tipo de Documentos"}
              </span>
              <ChevronDown />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align="center"
            className="h-[40vh] w-full gap-2 overflow-auto p-0"
          >
            <ScrollArea className="h-full w-full">
              {items.map((item, index) => (
                <DropdownMenuItem
                  key={index}
                  className="group rounded-none border-b border-b-zinc-400 p-0 hover:bg-transparent"
                >
                  <div
                    onClick={() => setSelectedDocument(item)}
                    className={cn(
                      "group-hover:bg-primary/20 w-full cursor-pointer p-2 text-base transition duration-200 lg:text-lg",
                      selectedDocument.id === item.id && "bg-primary/20",
                    )}
                  >
                    {item.label}
                  </div>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
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
                `/procedures?param1=${encodeURIComponent(selectedDocument.id)}&param2=${encodeURIComponent(
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
