"use client";

import { staticPlenary } from "@/@staticData/plenary";
import { ChevronDown } from "lucide-react";
import { PlenaryCard } from "./components/Plenary";

export default function Plenary() {
  return (
    <div className="flex h-full w-full flex-col items-center gap-12 rounded-xl bg-white">
      <div className="flex w-full gap-6 px-8 pt-10">
        <button className="flex items-center justify-center rounded-xl border border-gray-400 px-4 py-2">
          Calendário
          <ChevronDown className="ml-2" />
        </button>
      </div>
      <div className="flex w-full flex-col gap-6 px-8">
        <p className="text-sm font-medium text-gray-600">Próximos 7 dias</p>
        <div className="flex flex-col gap-8">
          {staticPlenary.map((plenary, index) => (
            <PlenaryCard
              key={index}
              id={plenary.id}
              summary={plenary.summary}
              title={plenary.title}
            />
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col gap-8 px-8">
        <p className="text-sm font-medium text-gray-600">Anterior</p>
        <div className="flex flex-col gap-6">
          {staticPlenary.map((plenary, index) => (
            <PlenaryCard
              key={index}
              id={plenary.id}
              summary={plenary.summary}
              title={plenary.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
