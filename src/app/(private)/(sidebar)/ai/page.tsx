"use client";
import { aiHistory } from "@/@staticData/ai";
import { Section } from "@/components/chat/SectionGemini";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/Input";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ChevronDown, Minus, Plus, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function BranchesList() {
  const [loadNewChat, setLoadNewChat] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [open, setOpen] = useState(false);
  const items = [
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
  const items2 = [
    { label: "Todos" },
    { label: "Loren Ipsum is simply" },
    { label: "Loren Ipsum is simply" },
    { label: "Loren Ipsum is simply" },
    { label: "Loren Ipsum is simply" },
  ];
  const [selectedAi, setSelectedAi] = useState<string>("IA JURÍDICA");
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("param1");
    const item = items.find((item) => item.id === id);
    console.log("item", item);
    if (item) {
      setSelectedAi(item.label);
    }
  }, []);
  return (
    <>
      <Sheet open={open} onOpenChange={() => setOpen(false)}>
        <SheetContent
          side={"right"}
          forceMount
          className={`transform overflow-y-auto bg-white pt-5 text-black transition-all duration-700 md:min-w-[450px]`}
        >
          <div className={` `}>
            <SheetHeader className="mb-4 flex-row items-center justify-between">
              <span className="text-default-900 text-lg font-black text-[#4C785D]">
                Selecione:
              </span>
            </SheetHeader>
            <div className="flex w-full flex-col gap-4 overflow-auto">
              <Accordion
                type="single"
                collapsible
                className="flex w-full flex-col gap-4"
              >
                {items.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="group group peer w-full rounded-lg px-4 shadow-none shadow-transparent transition-colors duration-300 data-[state=open]:border data-[state=open]:border-[#4C785D] data-[state=open]:text-black"
                  >
                    <AccordionTrigger className="w-full border-b border-b-[#4C785D] text-start text-lg outline-none focus:border-0 focus:outline-none">
                      <div className="flex flex-row items-center justify-center gap-2 text-lg font-bold text-[#4C785D]">
                        <Image
                          src={item.icon}
                          alt="logo"
                          width={20}
                          height={20}
                          className="h-5 max-h-5 min-h-5 w-5 max-w-5 min-w-5"
                        />
                        {item.label}
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="flex w-full flex-col p-2 text-black">
                      {/* Se “item” tiver sub-itens: */}
                      {items2.map((sub, subIndex) => (
                        <button
                          onClick={() => {
                            setSelectedAi(item.label);
                            setOpen(false);
                          }}
                          key={subIndex}
                          className="flex w-full flex-row items-center rounded-md p-2 text-start text-base hover:bg-[#4C785D] hover:text-white"
                        >
                          <div className="border-secondary w-full border-l px-2 text-lg">
                            {sub.label}
                          </div>
                        </button>
                      ))}

                      {/* Ou qualquer outro conteúdo */}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex w-full flex-row-reverse items-center justify-center gap-2">
        <div className="flex h-[calc(100vh-150px)] w-full flex-col justify-between rounded-2xl bg-white p-2 xl:w-9/12 xl:p-4">
          <div className="relative">
            <div className="flex flex-row items-center gap-4">
              <Image
                alt=""
                width={1000}
                height={1000}
                className="h-12 w-12"
                src={"/logos/small-logo.png"}
              />
              <h1 className="text-2xl font-bold xl:text-2xl">Legis.AI</h1>
            </div>
            <h2 className="mt-1 text-lg font-medium xl:text-xl">
              Elaboração de Parecer Jurídico:
            </h2>
            <div className="absolute top-2 right-2 flex items-center gap-2">
              <button
                onClick={() => setOpen(true)}
                className="bg-secondary flex items-center gap-2 rounded-full px-2 py-1 text-base text-white xl:top-4 xl:right-4 xl:px-4 xl:py-2 xl:text-lg"
              >
                {selectedAi} <ChevronDown />
              </button>
              <button
                onClick={() => setOpenInfo(true)}
                className="bg-secondary flex items-center justify-center rounded-full p-1 text-white xl:hidden"
              >
                <Plus />
              </button>
            </div>
          </div>
          <div className="mt-4 flex h-[calc(100vh-300px)] flex-1 flex-col">
            <Section
              loadNewChat={loadNewChat}
              setLoadNewChat={setLoadNewChat}
            />
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
            className="bg-secondary absolute top-4 right-[22px] z-10 flex items-center justify-center rounded-full p-1 text-white xl:hidden"
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
                    <h4 className="font-semibold">{historic.title}</h4>
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
      </div>
    </>
  );
}
