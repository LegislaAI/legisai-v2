"use client";

import { CustomPagination } from "@/components/CustomPagination";
import { useApiContext } from "@/context/ApiContext";
import { useEffect, useState } from "react";
import { PlenaryCard } from "./components/Plenary";

interface PlenaryProps {
  createdAt: string;
  departmentId: string;
  description: string;
  endDate: string | null;
  eventTypeId: string;
  id: string;
  local: string;
  situation: string;
  startDate: string;
  updatedAt: string;
  uri: string;
  videoUrl: string | null;
}

export default function Plenary() {
  const { GetAPI } = useApiContext();
  const [loadingPlenaries, setLoadingPlenaries] = useState(true);
  const [plenaries, setPlenaries] = useState<PlenaryProps[]>([]);
  const [plenaryPages, setPlenaryPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);

  async function handleGetPlenary() {
    const response = await GetAPI(`/event?page=${currentPage}`, true);
    try {
      if (response.status === 200) {
        setPlenaries(response.body.events);
        setPlenaryPages(response.body.pages);
        setLoadingPlenaries(false);
        // return response.body.plenaries;
      }
    } catch (error) {
      console.error("Error carregando plenaries:", error);
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    handleGetPlenary();
  }, [currentPage]);

  return (
    <div className="flex h-full w-full flex-col items-center gap-4 rounded-xl bg-white lg:gap-12">
      <div className="flex w-full flex-col gap-2 px-2 lg:gap-6 lg:px-8">
        <div className="flex flex-col gap-4 overflow-hidden p-1 lg:gap-8">
          {plenaries.length === 0 && loadingPlenaries && <p>Carregando...</p>}
          {!loadingPlenaries &&
            (plenaries.length > 0 ? (
              plenaries.map((plenaries) => (
                <PlenaryCard
                  key={plenaries.id}
                  title="Plenário - Sessão Deliberativa"
                  summary={plenaries.description}
                  date={plenaries.startDate}
                  id={plenaries.id}
                />
              ))
            ) : (
              <p className="text-gray-500">Nenhuma notícia anterior.</p>
            ))}
        </div>
      </div>
      <div className="w-full">
        <CustomPagination
          pages={plenaryPages}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}
