"use client";

import { useApiContext } from "@/context/ApiContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/v2/components/ui/accordion";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Calendar,
  User,
  Tag,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";

interface Proposition {
  id: string;
  number: number;
  year: number;
  type: {
    id: string;
    name: string;
    acronym: string;
  };
  situation?: {
    id: string;
    name: string;
    acronym: string;
  };
  description: string;
  presentationDate: string;
  url: string;
  topic: string;
  title: string;
  regime: string;
  sequence: number;
}

interface PropositionDetails {
  id: string;
  number: number;
  year: number;
  description: string;
  keywords: string;
  presentationDate: string;
  lastMovementDate: string;
  situationDescription?: string;
  movementDescription?: string;
  fullPropositionUrl: string;
  url: string;
  type: {
    id: string;
    name: string;
    acronym: string;
  };
  situation?: {
    id: string;
    name: string;
    acronym: string;
  };
  authors: Array<{
    id: string;
    name: string;
    politicianId?: string;
  }>;
}

interface PropositionsTabProps {
  eventId: string;
}

export function PropositionsTab({ eventId }: PropositionsTabProps) {
  const { GetAPI } = useApiContext();
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [expandedProposition, setExpandedProposition] = useState<string | null>(
    null
  );
  const [propositionDetails, setPropositionDetails] = useState<
    Record<string, PropositionDetails>
  >({});
  const [loadingDetails, setLoadingDetails] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    async function fetchPropositions() {
      setLoading(true);
      const response = await GetAPI(
        `/event/${eventId}/propositions?page=${currentPage}`,
        true
      );
      if (response.status === 200) {
        setPropositions(response.body.propositions || []);
        setTotalPages(response.body.pages || 0);
      }
      setLoading(false);
    }

    if (eventId) {
      fetchPropositions();
    }
  }, [eventId, currentPage, GetAPI]);

  useEffect(() => {
    async function fetchPropositionDetails(propositionId: string) {
      if (propositionDetails[propositionId]) {
        return; // Já foi carregado
      }

      setLoadingDetails((prev) => ({ ...prev, [propositionId]: true }));
      const response = await GetAPI(`/proposition/${propositionId}`, true);
      if (response.status === 200 && response.body) {
        setPropositionDetails((prev) => ({
          ...prev,
          [propositionId]: response.body,
        }));
      }
      setLoadingDetails((prev) => ({ ...prev, [propositionId]: false }));
    }

    if (expandedProposition) {
      fetchPropositionDetails(expandedProposition);
    }
  }, [expandedProposition, GetAPI, propositionDetails]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#749c5b] border-t-transparent" />
      </div>
    );
  }

  if (propositions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h3 className="text-lg font-bold text-[#1a1d1f]">
          Nenhuma proposta encontrada
        </h3>
        <p className="mx-auto mt-2 max-w-xs text-sm text-[#6f767e]">
          Nenhuma proposta legislativa encontrada para este evento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Accordion
        type="single"
        collapsible
        className="w-full space-y-4"
        value={expandedProposition || undefined}
        onValueChange={(value) => setExpandedProposition(value)}
      >
        {propositions.map((proposition) => {
          const details = propositionDetails[proposition.id];
          const isLoadingDetails = loadingDetails[proposition.id];

          return (
            <AccordionItem
              key={proposition.id}
              value={proposition.id}
              className="border border-gray-100 rounded-xl bg-white px-6 shadow-sm overflow-hidden data-[state=open]:border-[#749c5b] transition-all"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4 w-full text-left">
                  <div className="min-w-[140px]">
                    <div className="font-bold text-[#749c5b] text-base">
                      {proposition.type.acronym} {proposition.number}/
                      {proposition.year}
                    </div>
                    <div className="text-xs text-gray-400">
                      {format(
                        new Date(proposition.presentationDate),
                        "dd 'de' MMMM 'de' yyyy",
                        { locale: ptBR }
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#1a1d1f] mb-1">
                      {proposition.title ||
                        `${proposition.type.name} ${proposition.number}/${proposition.year}`}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-1">
                      {proposition.description ||
                        proposition.topic ||
                        "Sem descrição disponível"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mr-4 flex-wrap">
                    <span className="rounded bg-[#749c5b]/10 px-2 py-1 text-xs font-medium text-[#749c5b]">
                      {proposition.situation?.acronym ||
                        proposition.situation?.name ||
                        "Sem situação"}
                    </span>
                    {proposition.sequence && (
                      <span className="rounded border border-gray-200 bg-blue-50 px-2 py-1 text-xs text-blue-700">
                        Ordem: {proposition.sequence}
                      </span>
                    )}
                    {proposition.regime &&
                      proposition.regime !== "Ordinário" && (
                        <span className="rounded border border-orange-200 bg-orange-50 px-2 py-1 text-xs text-orange-700">
                          {proposition.regime}
                        </span>
                      )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2 border-t border-gray-50 mt-2">
                {isLoadingDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#749c5b] border-t-transparent" />
                  </div>
                ) : details ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-bold uppercase text-gray-400 mb-2 flex items-center gap-2">
                          <Calendar size={14} />
                          Data de Apresentação
                        </h4>
                        <p className="text-sm text-[#1a1d1f]">
                          {format(
                            new Date(details.presentationDate),
                            "dd 'de' MMMM 'de' yyyy",
                            { locale: ptBR }
                          )}
                        </p>
                      </div>
                      {details.lastMovementDate && (
                        <div>
                          <h4 className="text-xs font-bold uppercase text-gray-400 mb-2 flex items-center gap-2">
                            <Calendar size={14} />
                            Última Movimentação
                          </h4>
                          <p className="text-sm text-[#1a1d1f]">
                            {format(
                              new Date(details.lastMovementDate),
                              "dd 'de' MMMM 'de' yyyy",
                              { locale: ptBR }
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    {details.authors && details.authors.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase text-gray-400 mb-2 flex items-center gap-2">
                          <User size={14} />
                          Autores
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {details.authors.map((author) => (
                            <span
                              key={author.id}
                              className="rounded bg-gray-100 px-3 py-1 text-sm text-[#1a1d1f]"
                            >
                              {author.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-bold uppercase text-gray-400 mb-2 flex items-center gap-2">
                        <FileText size={14} />
                        Ementa Completa
                      </h4>
                      <p className="text-sm text-[#1a1d1f] leading-relaxed">
                        {details.description || "Sem descrição disponível"}
                      </p>
                    </div>

                    {details.keywords && (
                      <div>
                        <h4 className="text-xs font-bold uppercase text-gray-400 mb-2 flex items-center gap-2">
                          <Tag size={14} />
                          Palavras-chave
                        </h4>
                        <p className="text-sm text-[#6f767e]">
                          {details.keywords}
                        </p>
                      </div>
                    )}

                    {details.situationDescription && (
                      <div>
                        <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">
                          Situação
                        </h4>
                        <p className="text-sm text-[#1a1d1f]">
                          {details.situationDescription}
                        </p>
                      </div>
                    )}

                    {details.movementDescription && (
                      <div>
                        <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">
                          Última Movimentação
                        </h4>
                        <p className="text-sm text-[#1a1d1f]">
                          {details.movementDescription}
                        </p>
                      </div>
                    )}

                    {(details.fullPropositionUrl || details.url) && (
                      <div className="flex justify-end pt-2 border-t border-gray-100">
                        <a
                          href={details.fullPropositionUrl || details.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm font-medium text-[#749c5b] hover:underline"
                        >
                          Ver Inteiro Teor <ExternalLink size={14} />
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 py-4 text-center">
                    Não foi possível carregar os detalhes da proposta.
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          <span className="text-sm text-[#6f767e]">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Próxima
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}


