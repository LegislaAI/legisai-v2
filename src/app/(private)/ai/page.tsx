"use client";
import { aiHistory } from "@/@staticData/ai";
import { Input } from "@/components/ui/Input";
import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { Section } from "./components/chat/SectionGemini";

export default function BranchesList() {
  const [loadNewChat, setLoadNewChat] = useState(false);
  return (
    <div className="flex w-full items-center justify-center gap-2">
      <div className="flex h-[calc(100vh-150px)] w-9/12 flex-col justify-between rounded-2xl bg-white p-4">
        <div className="relative">
          <h1 className="text-4xl font-bold">Olá Leonardo</h1>
          <br />
          <h2 className="text-2xl font-medium">Como podemos te ajudar hoje?</h2>
          <button className="bg-primary absolute top-4 right-4 flex items-center gap-2 rounded-full px-4 py-2 text-xl font-medium text-white">
            Mudar IA <ChevronDown />
          </button>
        </div>
        <div className="flex w-full flex-1 flex-col">
          <div className="mt-16 flex flex-1 flex-col">
            <Section
              loadNewChat={loadNewChat}
              setLoadNewChat={setLoadNewChat}
            />
          </div>
        </div>
      </div>
      <div className="flex h-[calc(100vh-150px)] w-3/12 flex-col justify-between rounded-2xl bg-white">
        <div className="flex h-full flex-col justify-between gap-4 pb-8">
          <div>
            <div className="relative w-full border-b border-gray-400 p-2">
              <Search className="text-dark absolute top-1/2 left-6 h-5 w-5 -translate-y-1/2" />
              <Input
                className="w-full border-none bg-transparent pl-10"
                placeholder="Pesquisar"
              />
            </div>
            <div className="flex flex-col gap-4 p-4">
              {aiHistory.map((historic, index) => (
                <div key={index}>
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
