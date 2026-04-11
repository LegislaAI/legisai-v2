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

function getStatusStyles(categoria: string) {
  switch (categoria) {
    case "ja_apreciado":
      return {
        bg: "bg-emerald-600",
        bgLight: "bg-emerald-50",
        border: "border-emerald-600",
        borderLight: "border-emerald-200",
        text: "text-emerald-700",
        ring: "ring-emerald-300",
        dot: "bg-emerald-600",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Apreciado",
      };
    case "em_apreciacao":
      return {
        bg: "bg-amber-500",
        bgLight: "bg-amber-50",
        border: "border-amber-500",
        borderLight: "border-amber-200",
        text: "text-amber-700",
        ring: "ring-amber-300",
        dot: "bg-amber-500",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Em apreciação",
      };
    default:
      return {
        bg: "bg-slate-400",
        bgLight: "bg-slate-50",
        border: "border-slate-400",
        borderLight: "border-slate-200",
        text: "text-slate-600",
        ring: "ring-slate-300",
        dot: "bg-slate-400",
        badge: "bg-slate-50 text-slate-600 border-slate-200",
        label: "Não apreciado",
      };
  }
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
  const toggleSelection = (prop: EventProposition) => {
    setSelectedProposition(
      prop.id === selectedProposition?.id ? null : prop,
    );
  };

  return (
    <div className="space-y-6">
      {orderPropositions.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1a1d1f]">
              Índice das Proposições
            </h3>
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setIndexViewMode("numeric")}
                className={cn(
                  "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
                  indexViewMode === "numeric"
                    ? "bg-[#3e5f48] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800",
                )}
              >
                Índice Numérico
              </button>
              <button
                onClick={() => setIndexViewMode("proposition")}
                className={cn(
                  "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
                  indexViewMode === "proposition"
                    ? "bg-[#3e5f48] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800",
                )}
              >
                Índice por Proposição
              </button>
            </div>
          </div>

          {/* Numeric Index View */}
          {indexViewMode === "numeric" ? (
            <div className="flex flex-wrap gap-3 py-2">
              {orderPropositions.map((item, index) => {
                const categoria = getCategoriaPorCodigo(
                  item.proposition?.situationId || "",
                );
                const status = getStatusStyles(categoria);
                const isSelected = selectedProposition?.id === item.id;
                const hasRelator =
                  item.reporterId &&
                  findIfRelactorIsPresent(item.reporterId);

                return (
                  <button
                    key={index}
                    onClick={() => toggleSelection(item)}
                    className={cn(
                      "relative flex flex-col items-center gap-0.5 rounded-2xl border-2 px-3.5 py-2 transition-all",
                      isSelected
                        ? cn(status.bgLight, status.border, "ring-2", status.ring, "shadow-md")
                        : cn(status.bgLight, status.borderLight, "hover:shadow-sm", `hover:${status.border}`),
                    )}
                  >
                    <span
                      className={cn(
                        "text-lg font-bold",
                        isSelected ? status.text : "text-gray-700",
                      )}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={cn(
                        "h-1.5 w-5 rounded-full",
                        status.dot,
                      )}
                    />
                    {hasRelator && (
                      <span className="absolute -top-1.5 -right-1.5 rounded-full bg-white p-0.5 shadow">
                        <Users size={10} className="text-[#3e5f48]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Proposition Name Index View */
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {orderPropositions.map((prop, idx) => {
                const categoria = getCategoriaPorCodigo(
                  prop.proposition?.situationId || "",
                );
                const status = getStatusStyles(categoria);
                const isSelected = selectedProposition?.id === prop.id;
                const hasRelator =
                  prop.reporterId &&
                  findIfRelactorIsPresent(prop.reporterId);

                return (
                  <button
                    key={idx}
                    onClick={() => toggleSelection(prop)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border-2 px-3.5 py-2.5 text-left transition-all",
                      isSelected
                        ? cn(status.bgLight, status.border, "ring-2", status.ring, "shadow-md")
                        : cn(status.bgLight, status.borderLight, "hover:shadow-sm", `hover:${status.border}`),
                    )}
                  >
                    {/* Number pill */}
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white",
                        status.bg,
                      )}
                    >
                      {idx + 1}
                    </span>

                    {/* Name + status */}
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[#1a1d1f]">
                        {prop.title}
                      </span>
                      <span className={cn("text-[10px] font-medium", status.text)}>
                        {status.label}
                      </span>
                    </div>

                    {/* Relator */}
                    {hasRelator && (
                      <Users size={14} className="shrink-0 text-[#3e5f48]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legenda */}
          <div className="mt-4 flex flex-wrap gap-4 border-t border-gray-100 pt-3 text-xs font-medium text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-slate-400" />
              <span>Não apreciado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span>Em apreciação</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-emerald-600" />
              <span>Já apreciado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-gray-400" />
              <span>Relator presente</span>
            </div>
          </div>
        </div>
      )}

      {/* Proposition Detail Card */}
      {selectedProposition && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-[#3e5f48] px-6 py-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold tracking-wide text-white">
                {selectedProposition.title}
              </h4>
              {(() => {
                const cat = getCategoriaPorCodigo(
                  selectedProposition.proposition?.situationId || "",
                );
                const status = getStatusStyles(cat);
                return (
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white">
                    {status.label}
                  </span>
                );
              })()}
            </div>
          </div>

          <div className="space-y-4 p-6">
            {selectedProposition.proposition?.description && (
              <p className="text-sm leading-relaxed text-gray-600">
                {selectedProposition.proposition.description}
              </p>
            )}

            {(selectedProposition.proposition?.situationDescription ||
              selectedProposition.topic ||
              selectedProposition.regime ||
              (selectedProposition.reporterId &&
                findIfRelactorIsPresent(selectedProposition.reporterId))) && (
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 lg:grid-cols-4">
                {selectedProposition.proposition?.situationDescription && (
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                      Situação
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-gray-700">
                      {selectedProposition.proposition.situationDescription}
                    </p>
                  </div>
                )}
                {selectedProposition.topic && (
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                      Tópico
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-gray-700">
                      {selectedProposition.topic}
                    </p>
                  </div>
                )}
                {selectedProposition.regime && (
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                      Regime
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-gray-700">
                      {selectedProposition.regime}
                    </p>
                  </div>
                )}
                {selectedProposition.reporterId &&
                  findIfRelactorIsPresent(selectedProposition.reporterId) && (
                    <div>
                      <p className="text-[10px] font-bold tracking-wider text-[#3e5f48] uppercase">
                        Relator
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-gray-700">
                        {findRelactorName(selectedProposition.reporterId)}
                      </p>
                    </div>
                  )}
              </div>
            )}

            {selectedProposition.proposition?.fullPropositionUrl && (
              <a
                href={selectedProposition.proposition.fullPropositionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#749c5b] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#5f7d4a] hover:shadow-md"
              >
                <ExternalLink size={15} />
                Ver Detalhes Completos
              </a>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
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
