"use client";

import { CustomPagination } from "@/components/CustomPagination";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApiContext } from "@/context/ApiContext";
import moment from "moment";
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
  const [selectedDateFilter, setSelectedDateFilter] = useState<Date | null>(
    null,
  );

  async function handleGetPlenary() {
    let data = "";
    if (currentPage) {
      data += `?page=${currentPage}`;
    }
    if (selectedDateFilter) {
      data += `&date=${moment(selectedDateFilter).format("YYYY-MM-DD")}`;
    }
    const response = await GetAPI(`/event${data}&type=PLENARY`, true);
    if (response.status === 200) {
      setPlenaries(response.body.events);
      setPlenaryPages(response.body.pages);
      setLoadingPlenaries(false);
      window.dispatchEvent(new CustomEvent("navigationComplete"));
      // return response.body.plenaries;
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    handleGetPlenary();
  }, [currentPage, selectedDateFilter]);

  return (
    <div className="flex h-full w-full flex-col items-center gap-4 rounded-xl bg-white lg:gap-12">
      <div className="flex w-full flex-col gap-2 px-2 lg:gap-6 lg:px-8">
        <div className="flex w-full items-center justify-end py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-32 cursor-pointer items-center justify-center gap-2 rounded border border-zinc-200 px-2 py-1 text-center text-zinc-400 transition duration-200 hover:bg-zinc-200">
                {selectedDateFilter
                  ? moment(selectedDateFilter).format("DD/MM/YYYY")
                  : "Filtrar por data"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="left"
              align="start"
              className="flex items-center justify-center text-center"
            >
              <Calendar
                mode="single"
                selected={selectedDateFilter || undefined}
                onSelect={(date) => setSelectedDateFilter(date || null)}
                initialFocus
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-col gap-4 overflow-hidden p-1 lg:gap-8">
          {plenaries.length === 0 && loadingPlenaries ? (
            Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="h-18 w-full animate-pulse rounded-md bg-zinc-200"
              />
            ))
          ) : !loadingPlenaries && plenaries.length > 0 ? (
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
            <p className="m-auto h-full w-full text-center text-gray-500">
              Nenhum Plenário encontrada no período Selecionado
            </p>
          )}
        </div>
      </div>
      {plenaries.length > 0 && (
        <div className="w-full pb-10 lg:pb-2">
          <CustomPagination
            pages={plenaryPages}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
          />
        </div>
      )}
    </div>
  );
}
