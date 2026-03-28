"use client";

import { cn } from "@/lib/utils";
import { ExternalLink, FileText, Users } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { EventPolitician, EventProposition } from "./types";

interface OrderDayTabContentProps {
  orderPropositions: EventProposition[];
  selectedProposition: EventProposition | null;
  setSelectedProposition: Dispatch<SetStateAction<EventProposition | null>>;
  indexViewMode: "numeric" | "proposition";
  setIndexViewMode: Dispatch<SetStateAction<"numeric" | "proposition">>;
  getCategoriaPorCodigo: (codigo?: string) => string;
  findIfRelactorIsPresent: (id: string) => EventPolitician | undefined;
  findRelactorName: (id: string) => string | undefined;
}

export function OrderDayTabContent({
  orderPropositions,
  selectedProposition,
  setSelectedProposition,
  indexViewMode,
  setIndexViewMode,
  getCategoriaPorCodigo,
  findIfRelactorIsPresent,
  findRelactorName,
}: OrderDayTabContentProps) {
  return (
    <div className="space-y-6">
      {/* Main Box: Index Selector with Toggle */}
      {orderPropositions.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-[#fefcf8] p-6 shadow-sm">
          {/* Header with Toggle Buttons */}
          <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
            <h3 className="text-lg font-bold text-[#1a1d1f]">
              Índice das Proposições
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIndexViewMode("numeric")}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  indexViewMode === "numeric"
                    ? "bg-[#3e5f48] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                )}
              >
                Índice Numérico
              </button>
              <button
                onClick={() => setIndexViewMode("proposition")}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  indexViewMode === "proposition"
                    ? "bg-[#3e5f48] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                )}
              >
                Índice por Proposição
              </button>
            </div>
          </div>

          {/* Index Display Area */}
          {indexViewMode === "numeric" ? (
            // Numeric Index View
            <div className="flex w-full gap-2 overflow-x-auto p-4">
              {orderPropositions.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (item.id === selectedProposition?.id) {
                      setSelectedProposition(null);
                    } else {
                      setSelectedProposition(item);
                    }
                  }}
                  className={cn(
                    "group relative flex h-12 w-12 flex-shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border font-bold transition-all",
                    selectedProposition?.id === item.id
                      ? "border-secondary bg-secondary ring-secondary scale-110 text-white ring-2 ring-offset-2"
                      : getCategoriaPorCodigo(
                            item.proposition?.situationId || "",
                          ) === "ja_apreciado"
                        ? "border-[#3e5f48] bg-[#3e5f48] text-white"
                        : getCategoriaPorCodigo(
                              item.proposition?.situationId || "",
                            ) === "em_apreciacao"
                          ? "border-[#d4a017] bg-[#d4a017] text-white"
                          : "border-[#4a6b7c] bg-[#4a6b7c] text-white hover:bg-[#3b5563]",
                  )}
                >
                  <span className="text-lg">{index + 1}</span>

                  {item.reporterId &&
                    findIfRelactorIsPresent(item.reporterId) && (
                      <div className="absolute right-1/2 -bottom-2 translate-x-1/2 rounded-full bg-white p-0.5 shadow-sm">
                        <Users size={10} className="text-[#3e5f48]" />
                      </div>
                    )}
                </button>
              ))}
            </div>
          ) : (
            // Proposition Name Index View
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {orderPropositions.map((prop, idx) => (
                <button
                  onClick={() => {
                    if (prop.id === selectedProposition?.id) {
                      setSelectedProposition(null);
                    } else {
                      setSelectedProposition(prop);
                    }
                  }}
                  key={idx}
                  className={cn(
                    "relative cursor-pointer rounded-md border px-3 py-2 text-center text-sm font-bold shadow-sm transition-all",
                    selectedProposition?.id === prop.id
                      ? "border-secondary bg-secondary ring-secondary scale-105 text-white ring-2 ring-offset-2"
                      : getCategoriaPorCodigo(
                            prop.proposition?.situationId || "",
                          ) === "ja_apreciado"
                        ? "border-[#3e5f48] bg-[#3e5f48] text-white"
                        : getCategoriaPorCodigo(
                              prop.proposition?.situationId || "",
                            ) === "em_apreciacao"
                          ? "border-[#d4a017] bg-[#d4a017] text-white"
                          : "border-[#4a6b7c] bg-[#4a6b7c] text-white hover:bg-[#3b5563]",
                  )}
                >
                  {prop.title}
                  {prop.reporterId &&
                    findIfRelactorIsPresent(prop.reporterId) && (
                      <div className="absolute right-1/2 -bottom-2 translate-x-1/2 rounded-full bg-white p-0.5 shadow-sm">
                        <Users size={10} className="text-[#3e5f48]" />
                      </div>
                    )}
                </button>
              ))}
            </div>
          )}

          {/* Legenda */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-gray-600">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#4a6b7c]"></div>
              <span>não apreciado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#d4a017]"></div>
              <span>em apreciação</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#3e5f48]"></div>
              <span>já apreciado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-gray-500" />
              <span>relator presente</span>
            </div>
          </div>
        </div>
      )}

      {/* Description Card - Shows when a proposition is selected */}
      {selectedProposition && (
        <div className="overflow-hidden rounded-lg border border-[#3e5f48] bg-[#eef5f0] shadow-md">
          <div className="bg-[#3e5f48] px-4 py-2 text-center text-sm font-bold tracking-wider text-white uppercase">
            Matéria Sobre a Mesa
          </div>
          <div className="space-y-4 p-6">
            <h4 className="text-lg font-bold text-[#1a1d1f] underline decoration-gray-300 underline-offset-4">
              {selectedProposition.title}
            </h4>
            <p className="text-sm leading-relaxed text-gray-700">
              {selectedProposition.proposition?.description}
            </p>

            {/* Additional Details */}
            {(selectedProposition.proposition?.situationDescription ||
              selectedProposition.topic ||
              selectedProposition.regime ||
              (selectedProposition.reporterId &&
                findIfRelactorIsPresent(
                  selectedProposition.reporterId,
                ))) && (
              <div className="space-y-3 rounded border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm">
                {selectedProposition.proposition
                  ?.situationDescription && (
                  <div>
                    <span className="block font-bold text-gray-700">
                      Situação:
                    </span>
                    <span className="text-gray-600">
                      {
                        selectedProposition.proposition
                          .situationDescription
                      }
                    </span>
                  </div>
                )}

                {selectedProposition.topic && (
                  <div>
                    <span className="block font-bold text-gray-700">
                      Tópico:
                    </span>
                    <span className="text-gray-600">
                      {selectedProposition.topic}
                    </span>
                  </div>
                )}

                {selectedProposition.regime && (
                  <div>
                    <span className="block font-bold text-gray-700">
                      Regime:
                    </span>
                    <span className="text-gray-600">
                      {selectedProposition.regime}
                    </span>
                  </div>
                )}

                {selectedProposition.reporterId &&
                  findIfRelactorIsPresent(
                    selectedProposition.reporterId,
                  ) && (
                    <div>
                      <span className="block font-bold text-gray-700">
                        Relator:
                      </span>
                      <span className="text-gray-600">
                        {findRelactorName(
                          selectedProposition.reporterId,
                        )}
                      </span>
                    </div>
                  )}
              </div>
            )}

            {/* Action Button - Link to Full Proposition */}
            {selectedProposition.proposition?.fullPropositionUrl && (
              <div className="pt-2">
                <a
                  href={
                    selectedProposition.proposition.fullPropositionUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#749c5b] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#5f7d4a] hover:shadow-lg"
                >
                  <ExternalLink size={16} />
                  Ver Detalhes Completos
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State - When no proposition is selected */}
      {!selectedProposition && orderPropositions.length > 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-500">
            Selecione uma proposição acima para ver seus detalhes
          </p>
        </div>
      )}

      {/* No Data State */}
      {orderPropositions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-12 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-400">
            <FileText size={32} />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-700">
            Nenhuma proposição encontrada
          </h3>
          <p className="text-sm text-gray-500">
            Não há proposições na ordem do dia para este evento.
          </p>
        </div>
      )}
    </div>
  );
}
