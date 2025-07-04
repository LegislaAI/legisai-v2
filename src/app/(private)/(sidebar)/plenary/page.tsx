"use client";

import { staticPlenary } from "@/@staticData/plenary";
import { useApiContext } from "@/context/ApiContext";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { PlenaryCard } from "./components/Plenary";

export default function Plenary() {
  const { GetAPI } = useApiContext();
  const [plenaries, setPlenaries] = useState(staticPlenary);
  async function handleGetPlenary() {
    const response = await GetAPI(`/event?page=1`, true);
    console.log("response", response);
    try {
      if (response.status === 200) {
        setPlenaries(response.body.events);
        // return response.body.plenaries;
      }
    } catch (error) {
      console.error("Error carregando plenaries:", error);
    }
  }
  useEffect(() => {
    handleGetPlenary();
  }, []);
  return (
    <div className="flex h-full w-full flex-col items-center gap-4 rounded-xl bg-white lg:gap-12">
      <div className="flex w-full gap-6 p-2 lg:px-8 lg:pt-10">
        <button className="flex items-center justify-center rounded-xl border border-gray-400 px-2 py-1 lg:px-4 lg:py-2">
          Calendário
          <ChevronDown className="ml-2" />
        </button>
      </div>
      <div className="flex w-full flex-col gap-2 px-2 lg:gap-6 lg:px-8">
        <p className="text-sm font-medium text-gray-600">Próximos 7 dias</p>
        <div className="flex flex-col gap-4 overflow-hidden p-1 lg:gap-8">
          {plenaries?.map((plenary, index) => (
            <PlenaryCard
              key={index}
              id={plenary.id}
              summary={plenary.description}
              title={"Plenário"}
              date={plenary.startDate}
            />
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 px-2 lg:gap-6 lg:px-8">
        <p className="text-sm font-medium text-gray-600">Anterior</p>
        <div className="flex flex-col gap-4 overflow-hidden p-1 lg:gap-8">
          {plenaries?.map((plenary, index) => (
            <PlenaryCard
              key={index}
              id={plenary.id}
              summary={plenary.description}
              title={"Plenário"}
              date={plenary.date}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
