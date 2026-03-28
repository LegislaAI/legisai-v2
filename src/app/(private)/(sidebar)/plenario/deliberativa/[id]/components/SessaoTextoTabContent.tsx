"use client";

import { cn } from "@/lib/utils";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LayoutList,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import {
  preprocessSessionText,
  SessionParagraph,
} from "./SessionParagraph";
import { SessionSummaryReport } from "./SessionSummaryReport";
import { BrevesComunicacoesResponse, EventDetailsAPI } from "./types";

const PARAGRAPHS_PER_PAGE = 30;

interface SessaoTextoTabContentProps {
  loadingTranscricao: boolean;
  loadingBreves: boolean;
  transcricaoCompleta: {
    exists: boolean;
    fullText: string | null;
  } | null;
  brevesComunicacoes: BrevesComunicacoesResponse | null;
  sessaoTextoSubView: "visao_geral" | "texto_integral";
  setSessaoTextoSubView: Dispatch<
    SetStateAction<"visao_geral" | "texto_integral">
  >;
  sessionSummary: string | null;
  setSessionSummary: Dispatch<SetStateAction<string | null>>;
  loadingSessionSummary: boolean;
  setLoadingSessionSummary: Dispatch<SetStateAction<boolean>>;
  sessaoTextoPage: number;
  setSessaoTextoPage: Dispatch<SetStateAction<number>>;
  sessaoTextoSearch: string;
  setSessaoTextoSearch: Dispatch<SetStateAction<string>>;
  sessaoTextoModoLeitura: boolean;
  setSessaoTextoModoLeitura: Dispatch<SetStateAction<boolean>>;
  eventDetails: EventDetailsAPI | null;
}

export function SessaoTextoTabContent({
  loadingTranscricao,
  loadingBreves,
  transcricaoCompleta,
  brevesComunicacoes,
  sessaoTextoSubView,
  setSessaoTextoSubView,
  sessionSummary,
  setSessionSummary,
  loadingSessionSummary,
  setLoadingSessionSummary,
  sessaoTextoPage,
  setSessaoTextoPage,
  sessaoTextoSearch,
  setSessaoTextoSearch,
  sessaoTextoModoLeitura,
  setSessaoTextoModoLeitura,
  eventDetails,
}: SessaoTextoTabContentProps) {
  if (loadingTranscricao) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white py-16 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#749c5b] border-t-transparent" />
        <p className="mt-4 text-sm text-gray-500">
          Carregando transcrição completa...
        </p>
      </div>
    );
  }

  if (loadingBreves) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white py-12 text-center">
        <p className="text-sm text-gray-500">
          Carregando texto disponível...
        </p>
      </div>
    );
  }

  const fullTextFromEscriba =
    transcricaoCompleta?.exists && transcricaoCompleta.fullText
      ? transcricaoCompleta.fullText
      : null;
  const fullTextParts =
    brevesComunicacoes?.speakers
      ?.map(
        (s) =>
          s.transcription?.trim() ||
          s.speechSummary?.trim() ||
          "",
      )
      .filter(Boolean) ?? [];
  const fallbackText = fullTextParts.join("\n\n");
  const fullTextForSession =
    fullTextFromEscriba ??
    (fallbackText.length > 0 ? fallbackText : null);
  const hasAnyText =
    !!fullTextForSession && fullTextForSession.length > 0;
  const sourceLabel = fullTextFromEscriba
    ? "Transcrição completa e original (fonte: Escriba – Câmara dos Deputados)"
    : "Texto processado (Breves Comunicações)";

  if (!hasAnyText) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="text-sm text-[#6f767e]">
          Não há transcrição disponível para esta sessão no
          momento.
        </p>
      </div>
    );
  }

  const paragraphs = preprocessSessionText(fullTextForSession!)
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const searchLower = sessaoTextoSearch.trim().toLowerCase();
  const filteredParagraphs = searchLower
    ? paragraphs.filter((p) =>
        p.toLowerCase().includes(searchLower),
      )
    : paragraphs;
  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredParagraphs.length /
        PARAGRAPHS_PER_PAGE,
    ),
  );
  const safePage = Math.min(
    Math.max(1, sessaoTextoPage),
    totalPages,
  );
  const start =
    (safePage - 1) * PARAGRAPHS_PER_PAGE;
  const pageParagraphs = filteredParagraphs.slice(
    start,
    start + PARAGRAPHS_PER_PAGE,
  );

  async function handleGenerateSummary() {
    if (!fullTextForSession) return;
    setLoadingSessionSummary(true);
    setSessionSummary(null);
    try {
      const res = await fetch("/api/plenary/session-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: fullTextForSession,
          eventId: eventDetails?.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.summary)
        setSessionSummary(data.summary);
    } catch {
      setSessionSummary(
        "*Erro ao gerar resumo. Tente novamente.*",
      );
    }
    setLoadingSessionSummary(false);
  }

  return (
    <div className="space-y-6">
      {/* Submenu: Visão geral | Texto integral */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
        <span className="text-sm font-medium text-[#6f767e]">
          Exibir:
        </span>
        {[
          {
            id: "visao_geral" as const,
            label: "Visão geral (IA)",
            icon: Sparkles,
          },
          {
            id: "texto_integral" as const,
            label: "Texto integral",
            icon: LayoutList,
          },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSessaoTextoSubView(id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
              sessaoTextoSubView === id
                ? "bg-[#749c5b] text-white shadow-md"
                : "bg-gray-100 text-[#6f767e] hover:bg-gray-200 hover:text-[#1a1d1f]",
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {sessaoTextoSubView === "visao_geral" && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gradient-to-r from-[#749c5b]/10 to-emerald-50/50 px-6 py-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-[#1a1d1f]">
              <Sparkles className="text-[#749c5b]" size={20} />
              Visão geral da sessão
            </h3>
            <p className="mt-1 text-xs text-[#6f767e]">
              Pontos relevantes, temas, valores e ações
              importantes extraídos por IA (Legis AI - Legis
              Dados).
            </p>
            {!sessionSummary && !loadingSessionSummary && (
              <button
                onClick={handleGenerateSummary}
                className="mt-4 flex items-center gap-2 rounded-lg bg-[#749c5b] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#64944b] active:scale-[0.98]"
              >
                <Sparkles size={16} />
                Gerar visão geral
              </button>
            )}
          </div>
          <div className="p-6">
            {loadingSessionSummary && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#749c5b] border-t-transparent" />
                <p className="mt-4 text-sm text-gray-500">
                  Gerando visão geral...
                </p>
              </div>
            )}
            {sessionSummary && !loadingSessionSummary && (
              <SessionSummaryReport content={sessionSummary} />
            )}
            {!sessionSummary && !loadingSessionSummary && (
              <p className="text-sm text-[#6f767e]">
                Clique em &quot;Gerar visão geral&quot; para
                obter um resumo com pontos relevantes, temas e
                ações importantes.
              </p>
            )}
          </div>
        </div>
      )}

      {sessaoTextoSubView === "texto_integral" && (
        <div className="space-y-4">
          <p className="text-xs text-[#6f767e]">
            {sourceLabel}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {/* Busca */}
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar no texto..."
                value={sessaoTextoSearch}
                onChange={(e) => {
                  setSessaoTextoSearch(e.target.value);
                  setSessaoTextoPage(1);
                }}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm text-[#1a1d1f] placeholder:text-gray-400 focus:border-[#749c5b] focus:ring-2 focus:ring-[#749c5b]/20 focus:outline-none"
              />
              {sessaoTextoSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setSessaoTextoSearch("");
                    setSessaoTextoPage(1);
                  }}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {/* Toggle Modo lista / Modo leitura */}
            <div className="flex rounded-lg border border-gray-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setSessaoTextoModoLeitura(false)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  !sessaoTextoModoLeitura
                    ? "bg-gray-100 text-[#1a1d1f]"
                    : "text-gray-600 hover:bg-gray-50",
                )}
              >
                <LayoutList size={16} />
                Modo lista
              </button>
              <button
                type="button"
                onClick={() => setSessaoTextoModoLeitura(true)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  sessaoTextoModoLeitura
                    ? "bg-[#749c5b] text-white"
                    : "text-gray-600 hover:bg-gray-50",
                )}
              >
                <BookOpen size={16} />
                Modo leitura
              </button>
            </div>
          </div>
          {sessaoTextoSearch && (
            <p className="text-xs text-[#6f767e]">
              {filteredParagraphs.length} trecho(s)
              encontrado(s).
            </p>
          )}
          {/* Blocos de texto com animação */}
          <div
            className={cn(
              "rounded-xl border border-gray-100 bg-white p-6 shadow-sm",
              sessaoTextoModoLeitura &&
                "mx-auto max-w-[65ch] border-stone-200 bg-stone-50/80",
            )}
          >
            {filteredParagraphs.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#6f767e]">
                Nenhum trecho encontrado para &quot;
                {sessaoTextoSearch}&quot;. Tente outra palavra.
              </p>
            ) : (
              <div
                className={cn(
                  "space-y-4",
                  sessaoTextoModoLeitura &&
                    "space-y-5 font-serif text-base leading-loose",
                )}
              >
                {pageParagraphs.map((paragraph, idx) => {
                  const globalIndex = start + idx;
                  const highlight = !!(
                    sessaoTextoSearch.trim() &&
                    paragraph
                      .toLowerCase()
                      .includes(
                        sessaoTextoSearch.trim().toLowerCase(),
                      )
                  );
                  return (
                    <SessionParagraph
                      key={`${globalIndex}-${paragraph.slice(0, 30)}`}
                      text={paragraph}
                      searchTerm={sessaoTextoSearch}
                      readingMode={sessaoTextoModoLeitura}
                      isHighlighted={highlight}
                      animationDelay={idx * 30}
                    />
                  );
                })}
              </div>
            )}
          </div>
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs text-[#6f767e]">
                Página {safePage} de {totalPages} ·{" "}
                {filteredParagraphs.length} trecho(s)
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSessaoTextoPage(1)}
                  disabled={safePage <= 1}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Primeira página"
                >
                  <ChevronsLeft size={16} />
                  <span className="hidden sm:inline">
                    Início
                  </span>
                </button>
                <button
                  onClick={() =>
                    setSessaoTextoPage((p) =>
                      Math.max(1, p - 1),
                    )
                  }
                  disabled={safePage <= 1}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">
                    Anterior
                  </span>
                </button>
                <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-[#1a1d1f]">
                  {safePage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setSessaoTextoPage((p) =>
                      Math.min(totalPages, p + 1),
                    )
                  }
                  disabled={safePage >= totalPages}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="hidden sm:inline">
                    Próxima
                  </span>
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => setSessaoTextoPage(totalPages)}
                  disabled={safePage >= totalPages}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Última página"
                >
                  <span className="hidden sm:inline">Fim</span>
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
