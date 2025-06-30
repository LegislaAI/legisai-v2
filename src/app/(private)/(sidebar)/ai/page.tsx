"use client";
import { aiHistory } from "@/@staticData/ai";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { ChevronDown, Minus, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Section } from "./components/Chat/SectionGemini";

export default function BranchesList() {
  const [loadNewChat, setLoadNewChat] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <div className="flex h-[calc(100vh-150px)] w-full flex-col justify-between rounded-2xl bg-white p-2 xl:w-9/12 xl:p-4">
        <div className="relative">
          <h1 className="text-2xl font-bold xl:text-4xl">Olá Leonardo</h1>
          <br />
          <h2 className="text-lg font-medium xl:text-2xl">
            Como podemos te ajudar hoje?
          </h2>
          <div className="absolute top-2 right-2 flex items-center gap-2">
            <button className="bg-primary flex items-center gap-2 rounded-full px-2 py-1 text-base font-medium text-white xl:top-4 xl:right-4 xl:px-4 xl:py-2 xl:text-xl">
              Mudar IA <ChevronDown />
            </button>
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
          <div>
            <div className="relative w-full border-b border-gray-400 p-2">
              <Search className="text-dark absolute top-1/2 left-6 h-5 w-5 -translate-y-1/2" />
              <Input
                className="w-full border-none bg-transparent pl-10 focus:outline-none"
                placeholder="Pesquisar"
              />
            </div>
            <div className="flex flex-col gap-4 p-4">
              {aiHistory.map((historic, index) => (
                <div
                  key={index}
                  className="rounded-lg transition-all duration-300 hover:scale-[1.02] hover:bg-gray-100"
                >
                  <h4 className="text-xl font-semibold">{historic.title}</h4>
                  <p className="text-sm text-gray-600">
                    {historic.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              setLoadNewChat(true);
            }}
            className="bg-primary h-12 w-2/3 cursor-pointer self-center rounded-3xl text-2xl font-semibold text-white"
          >
            Novo Chat
          </button>
        </div>
      </div>
    </div>
  );
}
