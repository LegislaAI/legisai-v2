"use client";

import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Clock,
  FileText,
  Mic2,
} from "lucide-react";
import { BrevesComunicacoesResponse } from "./types";

interface BriefCommTabContentProps {
  loadingBreves: boolean;
  brevesComunicacoes: BrevesComunicacoesResponse | null;
  expandedSpeakers: Set<number>;
  toggleSpeaker: (index: number) => void;
  setSelectedSpeakerForModal: (speaker: {
    name: string;
    party?: string;
    time: string;
    duration?: string;
    transcription: string;
  } | null) => void;
}

export function BriefCommTabContent({
  loadingBreves,
  brevesComunicacoes,
  expandedSpeakers,
  toggleSpeaker,
  setSelectedSpeakerForModal,
}: BriefCommTabContentProps) {
  if (loadingBreves) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white py-16 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#749c5b] border-t-transparent"></div>
        <p className="mt-4 text-sm text-gray-500">
          Carregando breves comunicações...
        </p>
      </div>
    );
  }

  if (brevesComunicacoes?.exists) {
    return (
      <div className="space-y-6">
        {/* Summary card */}
        {brevesComunicacoes.summary && (
          <div className="rounded-xl border border-[#749c5b]/20 bg-[#749c5b]/5 p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#1a1d1f]">
              <div className="rounded-lg bg-[#749c5b]/15 p-1.5">
                <FileText className="text-[#749c5b]" size={18} />
              </div>
              Resumo das Breves Comunicações
            </h3>
            <div className="space-y-1 text-sm leading-relaxed text-gray-700">
              {brevesComunicacoes.summary.split('\n').map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return null;

                // Section headers (bold text like **Temas principais:**)
                const headerMatch = trimmed.match(/^\*\*(.+?)\*\*$/);
                if (headerMatch) {
                  return (
                    <p key={i} className="mt-3 mb-1 text-xs font-bold tracking-wide text-[#749c5b] uppercase first:mt-0">
                      {headerMatch[1]}
                    </p>
                  );
                }

                // Bullet points
                if (trimmed.startsWith('- ')) {
                  const content = trimmed.slice(2);
                  // Render inline bold
                  const parts = content.split(/\*\*(.+?)\*\*/g);
                  return (
                    <div key={i} className="flex gap-2 pl-1">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#749c5b]/60" />
                      <p>
                        {parts.map((part, j) =>
                          j % 2 === 1 ? (
                            <strong key={j} className="font-semibold text-[#1a1d1f]">{part}</strong>
                          ) : (
                            <span key={j}>{part}</span>
                          )
                        )}
                      </p>
                    </div>
                  );
                }

                // Regular text (fallback for old-format summaries)
                return (
                  <p key={i} className="text-gray-600">
                    {trimmed}
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {/* Speakers list */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#1a1d1f]">
            <Mic2 className="text-[#749c5b]" size={20} />
            Oradores ({brevesComunicacoes.speakers.length})
          </h3>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {brevesComunicacoes.speakers.map((speaker, index) => {
              const isExpanded = expandedSpeakers.has(index);
              const hasSummary =
                speaker.speechSummary &&
                speaker.speechSummary.trim().length > 0;

              return (
                <div
                  key={index}
                  className={cn(
                    "h-min rounded-lg border border-gray-100 bg-gray-50 transition-all",
                    hasSummary
                      ? "cursor-pointer hover:border-[#749c5b]/30 hover:bg-gray-100"
                      : "",
                  )}
                  onClick={() => hasSummary && toggleSpeaker(index)}
                >
                  {/* Header row */}
                  <div className="flex items-center gap-3 p-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#749c5b]/10 text-[#749c5b]">
                      <Mic2 size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#1a1d1f]">
                        {speaker.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{speaker.time}</span>
                        {speaker.party && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-[#749c5b]">
                              {speaker.party}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {hasSummary && (
                      <ChevronDown
                        size={20}
                        className={cn(
                          "flex-shrink-0 text-gray-400 transition-transform duration-200",
                          isExpanded && "rotate-180",
                        )}
                      />
                    )}
                  </div>

                  {/* Expandable summary */}
                  {hasSummary && (
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-200 ease-in-out",
                        isExpanded
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0",
                      )}
                    >
                      <div className="border-t border-gray-200 bg-white/50 px-4 py-3">
                        <p className="text-sm leading-relaxed text-gray-600">
                          {speaker.speechSummary}
                        </p>
                        {speaker.transcription && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSpeakerForModal({
                                name: speaker.name,
                                party: speaker.party,
                                time: speaker.time,
                                duration: speaker.duration,
                                transcription: speaker.transcription!,
                              });
                            }}
                            className="mt-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#1a1d1f] hover:bg-gray-50"
                          >
                            <FileText size={14} />
                            Ver discurso completo
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-400">
        <Mic2 size={32} />
      </div>
      <h3 className="text-lg font-semibold text-gray-700">
        {brevesComunicacoes?.error || "Dados não disponíveis"}
      </h3>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        {brevesComunicacoes?.error
          ? "Não foi possível carregar as informações de Breves Comunicações para esta sessão."
          : "Esta sessão não possui a seção de Breves Comunicações ou a transcrição ainda não está disponível."}
      </p>
    </div>
  );
}
