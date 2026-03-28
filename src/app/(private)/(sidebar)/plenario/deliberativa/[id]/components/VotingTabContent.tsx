"use client";

import { VoteDetailsProps } from "@/@types/proposition";
import { VotingOrientationsCard } from "@/components/v2/components/ui/VotingOrientationsCard";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Info,
  Search,
  X,
} from "lucide-react";
import moment from "moment";
import { Dispatch, SetStateAction } from "react";
import { EventVoting } from "./types";

interface VotingTabContentProps {
  loadingVotes: boolean;
  votesList: EventVoting[];
  selectedVote: EventVoting | null;
  setSelectedVote: Dispatch<SetStateAction<EventVoting | null>>;
  votingTypeFilter: "all" | "nominal" | "symbolic";
  setVotingTypeFilter: Dispatch<
    SetStateAction<"all" | "nominal" | "symbolic">
  >;
  sortedAndFilteredVotes: (EventVoting & { voteNumber: number })[];
  positiveVotesList: VoteDetailsProps[];
  negativeVotesList: VoteDetailsProps[];
  loadingPositiveVotes: boolean;
  loadingNegativeVotes: boolean;
  positiveVotesPage: number;
  setPositiveVotesPage: Dispatch<SetStateAction<number>>;
  negativeVotesPage: number;
  setNegativeVotesPage: Dispatch<SetStateAction<number>>;
  positiveVotesPages: number;
  negativeVotesPages: number;
  positiveVotesSearch: string;
  setPositiveVotesSearch: Dispatch<SetStateAction<string>>;
  negativeVotesSearch: string;
  setNegativeVotesSearch: Dispatch<SetStateAction<string>>;
  positivePartyFilter: string;
  setPositivePartyFilter: Dispatch<SetStateAction<string>>;
  positiveStateFilter: string;
  setPositiveStateFilter: Dispatch<SetStateAction<string>>;
  positiveSortOrder: "asc" | "desc";
  setPositiveSortOrder: Dispatch<SetStateAction<"asc" | "desc">>;
  negativePartyFilter: string;
  setNegativePartyFilter: Dispatch<SetStateAction<string>>;
  negativeStateFilter: string;
  setNegativeStateFilter: Dispatch<SetStateAction<string>>;
  negativeSortOrder: "asc" | "desc";
  setNegativeSortOrder: Dispatch<SetStateAction<"asc" | "desc">>;
}

const PARTY_OPTIONS = [
  "PT", "PL", "UNIÃO", "PP", "MDB", "PSD", "REPUBLICANOS", "PSDB",
  "PDT", "PSB", "PODE", "PSOL", "PV", "NOVO", "PCdoB", "CIDADANIA",
  "SOLIDARIEDADE", "AVANTE", "PRD", "REDE",
];

const STATE_OPTIONS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT",
  "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO",
  "RR", "SC", "SP", "SE", "TO",
];

const PARTY_LABELS: Record<string, string> = { SOLIDARIEDADE: "SOLID." };

export function VotingTabContent({
  loadingVotes,
  votesList,
  selectedVote,
  setSelectedVote,
  votingTypeFilter,
  setVotingTypeFilter,
  sortedAndFilteredVotes,
  positiveVotesList,
  negativeVotesList,
  loadingPositiveVotes,
  loadingNegativeVotes,
  positiveVotesPage,
  setPositiveVotesPage,
  negativeVotesPage,
  setNegativeVotesPage,
  positiveVotesPages,
  negativeVotesPages,
  positiveVotesSearch,
  setPositiveVotesSearch,
  negativeVotesSearch,
  setNegativeVotesSearch,
  positivePartyFilter,
  setPositivePartyFilter,
  positiveStateFilter,
  setPositiveStateFilter,
  positiveSortOrder,
  setPositiveSortOrder,
  negativePartyFilter,
  setNegativePartyFilter,
  negativeStateFilter,
  setNegativeStateFilter,
  negativeSortOrder,
  setNegativeSortOrder,
}: VotingTabContentProps) {
  if (loadingVotes) {
    return (
      <div className="flex h-40 items-center justify-center">
        <span className="animate-pulse text-[#749c5b]">
          Carregando votações...
        </span>
      </div>
    );
  }

  if (votesList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-400">
          <Check size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-700">
          Nenhuma votação registrada
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Não há votações registradas para este evento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtro por tipo de votação */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">
          Filtrar:
        </span>
        {(
          [
            { value: "all", label: "Todas" },
            { value: "nominal", label: "Nominais" },
            { value: "symbolic", label: "Simbólicas" },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            onClick={() => setVotingTypeFilter(option.value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              votingTypeFilter === option.value
                ? "bg-[#749c5b] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {sortedAndFilteredVotes.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">
          Nenhuma votação encontrada para este filtro.
        </div>
      ) : (
        sortedAndFilteredVotes.map((vote) => {
          const isExpanded = selectedVote?.id === vote.id;
          const isSymbolic = vote.totalVotes === 0;

          return (
            <div
              key={vote.id}
              className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all"
            >
              {/* Vote Header - Always Visible */}
              <div
                onClick={() =>
                  setSelectedVote(isExpanded ? null : vote)
                }
                className="cursor-pointer p-6 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="mb-1 text-xs font-semibold tracking-wide text-[#749c5b] uppercase">
                      {vote.voteNumber}ª Votação
                    </p>
                    <h3 className="text-lg font-bold text-[#1a1d1f]">
                      {vote.title || vote.description}
                    </h3>
                    {vote.proposition && (
                      <p className="mt-1 text-sm text-gray-600">
                        {vote.proposition.typeAcronym}{" "}
                        {vote.proposition.number}/
                        {vote.proposition.year}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {isSymbolic ? (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        Votação Simbólica
                      </span>
                    ) : (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="rounded-md bg-green-50 px-2 py-1 font-semibold text-green-700">
                          {vote.positiveVotes} SIM
                        </span>
                        <span className="rounded-md bg-red-50 px-2 py-1 font-semibold text-red-700">
                          {vote.negativeVotes} NÃO
                        </span>
                      </div>
                    )}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        vote.result
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {vote.result ? "Aprovado" : "Rejeitado"}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={14} />
                    {moment(vote.date).format("DD/MM/YYYY HH:mm")}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span>
                      {isExpanded
                        ? "Menos detalhes"
                        : "Mais detalhes"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "transition-transform duration-200",
                        isExpanded && "rotate-180",
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Expanded Details - Only when selected and not symbolic */}
              {isExpanded && !isSymbolic && (
                <div className="border-t border-gray-100 bg-gray-50 p-6">
                  {/* Detalhes da Votação */}
                  <div className="mb-6 rounded-lg border border-[#749c5b] bg-white p-4">
                    <h4 className="mb-3 font-bold text-[#749c5b]">
                      Detalhes da Votação
                    </h4>
                    <div className="space-y-2 text-sm">
                      {vote.proposition && (
                        <div>
                          <span className="font-semibold text-[#1a1d1f]">
                            {vote.proposition.typeAcronym}{" "}
                            {vote.proposition.number}/
                            {vote.proposition.year}
                          </span>
                          {vote.proposition.description && (
                            <span className="text-gray-600">
                              {" "}
                              - {vote.proposition.description}
                            </span>
                          )}
                        </div>
                      )}
                      {vote.description && (
                        <div>
                          <span className="font-semibold text-gray-700">
                            Resultado:{" "}
                          </span>
                          <span className="text-gray-600">
                            {vote.description}
                          </span>
                        </div>
                      )}
                      <div className="pt-2 text-xs text-gray-400">
                        Última atualização:{" "}
                        {moment(vote.date).format(
                          "DD/MM/YYYY HH:mm",
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Orientações das Bancadas */}
                  <VotingOrientationsCard votingId={vote.id} />

                  {/* Vote Statistics */}
                  <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {/* Positive Votes Bar */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600">
                            <Check
                              size={14}
                              className="text-white"
                            />
                          </div>
                          <h4 className="text-lg font-bold">
                            Votos SIM
                          </h4>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full bg-green-600 transition-all duration-500"
                            style={{
                              width: `${(vote.positiveVotes / vote.totalVotes) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-3xl font-bold text-green-600">
                            {vote.positiveVotes}
                          </span>
                          <span className="text-sm text-gray-500">
                            de {vote.totalVotes} votos
                          </span>
                        </div>
                      </div>

                      {/* Negative Votes Bar */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600">
                            <X size={14} className="text-white" />
                          </div>
                          <h4 className="text-lg font-bold">
                            Votos NÃO
                          </h4>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="ml-auto h-full bg-red-600 transition-all duration-500"
                            style={{
                              width: `${(vote.negativeVotes / vote.totalVotes) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-3xl font-bold text-red-600">
                            {vote.negativeVotes}
                          </span>
                          <span className="text-sm text-gray-500">
                            de {vote.totalVotes} votos
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lists of Voters */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Positive Voters */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-green-700">
                            Votaram SIM
                          </h4>
                          <button
                            onClick={() =>
                              setPositiveSortOrder(
                                positiveSortOrder === "asc"
                                  ? "desc"
                                  : "asc",
                              )
                            }
                            className="flex items-center gap-1 rounded-lg border border-green-200 px-2 py-1 text-xs text-green-700 hover:bg-green-50"
                            title={
                              positiveSortOrder === "asc"
                                ? "Ordenar Z-A"
                                : "Ordenar A-Z"
                            }
                          >
                            <ArrowUpDown size={12} />
                            {positiveSortOrder === "asc"
                              ? "A-Z"
                              : "Z-A"}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <div className="relative min-w-[120px] flex-1">
                            <Search
                              className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-400"
                              size={12}
                            />
                            <input
                              type="text"
                              placeholder="Nome..."
                              value={positiveVotesSearch}
                              onChange={(e) => {
                                setPositiveVotesSearch(
                                  e.target.value,
                                );
                                setPositiveVotesPage(1);
                              }}
                              className="w-full rounded-lg border border-green-200 bg-white py-1 pr-2 pl-7 text-xs focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                            />
                          </div>
                          <select
                            value={positivePartyFilter}
                            onChange={(e) => {
                              setPositivePartyFilter(
                                e.target.value,
                              );
                              setPositiveVotesPage(1);
                            }}
                            className="rounded-lg border border-green-200 bg-white px-2 py-1 text-xs focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                          >
                            <option value="">Partido</option>
                            {PARTY_OPTIONS.map((p) => (
                              <option key={p} value={p}>
                                {PARTY_LABELS[p] || p}
                              </option>
                            ))}
                          </select>
                          <select
                            value={positiveStateFilter}
                            onChange={(e) => {
                              setPositiveStateFilter(
                                e.target.value,
                              );
                              setPositiveVotesPage(1);
                            }}
                            className="rounded-lg border border-green-200 bg-white px-2 py-1 text-xs focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                          >
                            <option value="">UF</option>
                            {STATE_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                        {loadingPositiveVotes ? (
                          Array.from({ length: 6 }).map((_, i) => (
                            <div
                              key={i}
                              className="h-16 animate-pulse rounded-lg bg-gray-200"
                            />
                          ))
                        ) : positiveVotesList.length === 0 ? (
                          <div className="col-span-full py-8 text-center text-sm text-gray-500">
                            Nenhum voto encontrado
                          </div>
                        ) : (
                          positiveVotesList.map((voteDetail) => (
                            <div
                              key={voteDetail.id}
                              className="flex items-center justify-between rounded-lg border border-green-200 bg-white p-3"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-bold text-[#1a1d1f]">
                                  {voteDetail.politician.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {
                                    voteDetail.politician
                                      .politicalParty
                                  }
                                </p>
                              </div>
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600">
                                <Check
                                  size={14}
                                  className="text-white"
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      {positiveVotesPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <button
                            onClick={() => setPositiveVotesPage(1)}
                            disabled={positiveVotesPage === 1}
                            className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                          >
                            <ChevronsLeft size={14} />
                          </button>
                          <button
                            onClick={() =>
                              setPositiveVotesPage((p) =>
                                Math.max(1, p - 1),
                              )
                            }
                            disabled={positiveVotesPage === 1}
                            className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <span className="text-xs text-gray-600">
                            {positiveVotesPage} /{" "}
                            {positiveVotesPages}
                          </span>
                          <button
                            onClick={() =>
                              setPositiveVotesPage((p) =>
                                Math.min(positiveVotesPages, p + 1),
                              )
                            }
                            disabled={
                              positiveVotesPage ===
                              positiveVotesPages
                            }
                            className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                          >
                            <ChevronRight size={14} />
                          </button>
                          <button
                            onClick={() =>
                              setPositiveVotesPage(
                                positiveVotesPages,
                              )
                            }
                            disabled={
                              positiveVotesPage ===
                              positiveVotesPages
                            }
                            className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                          >
                            <ChevronsRight size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Negative Voters */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-red-700">
                            Votaram NÃO
                          </h4>
                          <button
                            onClick={() =>
                              setNegativeSortOrder(
                                negativeSortOrder === "asc"
                                  ? "desc"
                                  : "asc",
                              )
                            }
                            className="flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                            title={
                              negativeSortOrder === "asc"
                                ? "Ordenar Z-A"
                                : "Ordenar A-Z"
                            }
                          >
                            <ArrowUpDown size={12} />
                            {negativeSortOrder === "asc"
                              ? "A-Z"
                              : "Z-A"}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <div className="relative min-w-[120px] flex-1">
                            <Search
                              className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-400"
                              size={12}
                            />
                            <input
                              type="text"
                              placeholder="Nome..."
                              value={negativeVotesSearch}
                              onChange={(e) => {
                                setNegativeVotesSearch(
                                  e.target.value,
                                );
                                setNegativeVotesPage(1);
                              }}
                              className="w-full rounded-lg border border-red-200 bg-white py-1 pr-2 pl-7 text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                            />
                          </div>
                          <select
                            value={negativePartyFilter}
                            onChange={(e) => {
                              setNegativePartyFilter(
                                e.target.value,
                              );
                              setNegativeVotesPage(1);
                            }}
                            className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                          >
                            <option value="">Partido</option>
                            {PARTY_OPTIONS.map((p) => (
                              <option key={p} value={p}>
                                {PARTY_LABELS[p] || p}
                              </option>
                            ))}
                          </select>
                          <select
                            value={negativeStateFilter}
                            onChange={(e) => {
                              setNegativeStateFilter(
                                e.target.value,
                              );
                              setNegativeVotesPage(1);
                            }}
                            className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                          >
                            <option value="">UF</option>
                            {STATE_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                        {loadingNegativeVotes ? (
                          Array.from({ length: 6 }).map((_, i) => (
                            <div
                              key={i}
                              className="h-16 animate-pulse rounded-lg bg-gray-200"
                            />
                          ))
                        ) : negativeVotesList.length === 0 ? (
                          <div className="col-span-full py-8 text-center text-sm text-gray-500">
                            Nenhum voto encontrado
                          </div>
                        ) : (
                          negativeVotesList.map((voteDetail) => (
                            <div
                              key={voteDetail.id}
                              className="flex items-center justify-between rounded-lg border border-red-200 bg-white p-3"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-bold text-[#1a1d1f]">
                                  {voteDetail.politician.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {
                                    voteDetail.politician
                                      .politicalParty
                                  }
                                </p>
                              </div>
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600">
                                <X
                                  size={14}
                                  className="text-white"
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      {negativeVotesPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <button
                            onClick={() => setNegativeVotesPage(1)}
                            disabled={negativeVotesPage === 1}
                            className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                          >
                            <ChevronsLeft size={14} />
                          </button>
                          <button
                            onClick={() =>
                              setNegativeVotesPage((p) =>
                                Math.max(1, p - 1),
                              )
                            }
                            disabled={negativeVotesPage === 1}
                            className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <span className="text-xs text-gray-600">
                            {negativeVotesPage} /{" "}
                            {negativeVotesPages}
                          </span>
                          <button
                            onClick={() =>
                              setNegativeVotesPage((p) =>
                                Math.min(negativeVotesPages, p + 1),
                              )
                            }
                            disabled={
                              negativeVotesPage ===
                              negativeVotesPages
                            }
                            className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                          >
                            <ChevronRight size={14} />
                          </button>
                          <button
                            onClick={() =>
                              setNegativeVotesPage(
                                negativeVotesPages,
                              )
                            }
                            disabled={
                              negativeVotesPage ===
                              negativeVotesPages
                            }
                            className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                          >
                            <ChevronsRight size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Message for symbolic votes */}
              {isExpanded && isSymbolic && (
                <div className="border-t border-gray-100 bg-gray-50 p-6">
                  {/* Detalhes da Votação */}
                  <div className="mb-4 rounded-lg border border-[#749c5b] bg-white p-4">
                    <h4 className="mb-3 font-bold text-[#749c5b]">
                      Detalhes da Votação
                    </h4>
                    <div className="space-y-2 text-sm">
                      {vote.proposition && (
                        <div>
                          <span className="font-semibold text-[#1a1d1f]">
                            {vote.proposition.typeAcronym}{" "}
                            {vote.proposition.number}/
                            {vote.proposition.year}
                          </span>
                          {vote.proposition.description && (
                            <span className="text-gray-600">
                              {" "}
                              - {vote.proposition.description}
                            </span>
                          )}
                        </div>
                      )}
                      {vote.description && (
                        <div>
                          <span className="font-semibold text-gray-700">
                            Resultado:{" "}
                          </span>
                          <span className="text-gray-600">
                            {vote.description}
                          </span>
                        </div>
                      )}
                      <div className="pt-2 text-xs text-gray-400">
                        Última atualização:{" "}
                        {moment(vote.date).format(
                          "DD/MM/YYYY HH:mm",
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Aviso de votação simbólica */}
                  <div className="rounded-lg bg-blue-50 p-4 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Info size={20} className="text-blue-600" />
                    </div>
                    <h4 className="font-bold text-blue-900">
                      Votação Simbólica
                    </h4>
                    <p className="mt-1 text-sm text-blue-700">
                      Esta votação foi aprovada simbolicamente, sem
                      registro individual de votos.
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
