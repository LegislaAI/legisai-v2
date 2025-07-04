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
import { useEffect, useState } from "react";

export default function BranchesList() {
  const [loadNewChat, setLoadNewChat] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleOpen = () => {
    setVisible(true);
    setOpenInfo(true);
  };

  const handleClose = () => {
    setOpenInfo(false);
    setTimeout(() => setVisible(false), 300); // Tempo da animação
  };
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
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("param1");
    const item = items.find((item) => item.id === id);
    if (item) {
      setSelectedDocument(item);
    }
  }, []);
  return (
    <div className="flex w-full items-center justify-center gap-2 overflow-x-hidden">
      <div className="flex h-[calc(100vh-100px)] w-full flex-col justify-between rounded-2xl bg-white p-2 lg:h-[calc(100vh-150px)] xl:w-9/12 xl:p-4">
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
          <div className="top-2 right-2 mt-2 flex items-center gap-2 lg:absolute lg:mt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="bg-secondary flex items-center gap-2 rounded-full px-2 py-1 text-base font-medium text-white focus:outline-none xl:top-4 xl:right-4 xl:px-4 xl:py-2 xl:text-xl">
                  {selectedDocument.label || "Selecione um documento"}
                  <ChevronDown />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="max-h-[60vh] w-full gap-2 overflow-auto p-2"
              >
                {items.map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => setSelectedDocument(item)}
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
              onClick={() => handleOpen()}
              className="bg-secondary flex items-center justify-center rounded-full p-1 text-white"
            >
              <Plus />
            </button>
          </div>
        </div>
        <div className="mt-4 flex h-[calc(100vh-300px)] flex-1 flex-col">
          <Section loadNewChat={loadNewChat} setLoadNewChat={setLoadNewChat} />
        </div>
      </div>
      {visible && (
        <div
          className={cn(
            "absolute right-0 h-[calc(100vh-150px)] w-3/4 flex-col justify-between rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 lg:w-1/2 xl:flex xl:w-3/12",
            openInfo ? "animate-slide-in flex" : "animate-slide-out flex",
          )}
        >
          <button
            onClick={handleClose}
            className="bg-secondary absolute top-4 right-[22px] z-10 flex items-center justify-center rounded-full p-1 text-white"
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
              <div className="data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right flex flex-1 flex-col gap-4 overflow-y-auto p-4">
                {aiHistory.map((historic, index) => (
                  <div
                    key={index}
                    className="rounded-lg transition-all duration-300 hover:scale-[1.005] hover:bg-gray-100"
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
                className="bg-secondary mt-4 h-12 w-2/3 cursor-pointer self-center rounded-3xl text-lg font-semibold text-white"
              >
                Novo Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
