"use client";

import {
  BarChart3,
  Check,
  Clock,
  FileText,
  Info,
  Mic2,
  Users,
} from "lucide-react";
import moment from "moment";
import { BrevesComunicacoesResponse, EventDetailsAPI } from "./types";

interface OverviewTabContentProps {
  eventDetails: EventDetailsAPI | null;
  brevesComunicacoes: BrevesComunicacoesResponse | null;
  setActiveTab: (tab: string) => void;
}

export function OverviewTabContent({
  eventDetails,
  brevesComunicacoes,
  setActiveTab,
}: OverviewTabContentProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Propositions Count */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1a1d1f]">
                {eventDetails?.EventProposition?.length || 0}
              </p>
              <p className="text-xs text-gray-500">Proposições em Pauta</p>
            </div>
          </div>
        </div>

        {/* Votings Count */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <Check size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1a1d1f]">
                {eventDetails?.voting?.length || 0}
              </p>
              <p className="text-xs text-gray-500">Votações Realizadas</p>
            </div>
          </div>
        </div>

        {/* Approval Rate */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2 text-green-600">
              <BarChart3 size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1a1d1f]">
                {eventDetails?.voting?.length
                  ? `${Math.round((eventDetails.voting.filter((v) => v.result).length / eventDetails.voting.length) * 100)}%`
                  : "—"}
              </p>
              <p className="text-xs text-gray-500">Taxa Bruta de Aprovação</p>
            </div>
          </div>
        </div>

        {/* Presence Count */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1a1d1f]">
                {eventDetails?.politicians?.length || 0}
              </p>
              <p className="text-xs text-gray-500">Parlamentares Presentes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Voting Results Summary - Left Column */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-[#1a1d1f]">
              <Check className="text-[#749c5b]" size={20} />
              Resultado das Votações
            </h3>
            {eventDetails?.voting?.length ? (
              <button
                onClick={() => setActiveTab("voting")}
                className="text-sm font-medium text-[#749c5b] hover:underline"
              >
                Ver todas →
              </button>
            ) : null}
          </div>
          {eventDetails?.voting?.length ? (
            <div className="space-y-4">
              {/* Summary Stats Bar */}
              <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="text-xs font-medium text-gray-700">
                    Aprovadas:{" "}
                    <span className="font-bold text-green-600">
                      {eventDetails.voting.filter((v) => v.result).length}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="text-xs font-medium text-gray-700">
                    Rejeitadas:{" "}
                    <span className="font-bold text-red-600">
                      {eventDetails.voting.filter((v) => !v.result).length}
                    </span>
                  </span>
                </div>
                <div className="ml-auto max-w-[120px] flex-1">
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{
                        width: `${(eventDetails.voting.filter((v) => v.result).length / eventDetails.voting.length) * 100}%`,
                      }}
                    />
                    <div
                      className="h-full bg-red-500 transition-all"
                      style={{
                        width: `${(eventDetails.voting.filter((v) => !v.result).length / eventDetails.voting.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Voting Cards */}
              <div className="space-y-2">
                {eventDetails.voting.slice(0, 5).map((vote, index) => {
                  const isSymbolic = vote.totalVotes === 0;
                  return (
                    <div
                      key={vote.id}
                      onClick={() => setActiveTab("voting")}
                      className="cursor-pointer rounded-lg border border-gray-100 p-3 transition-colors hover:border-[#749c5b]/30 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex items-center gap-2">
                            <span className="text-[10px] font-semibold tracking-wide text-[#749c5b] uppercase">
                              {index + 1}ª Votação
                            </span>
                            {isSymbolic && (
                              <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                                Simbólica
                              </span>
                            )}
                          </div>
                          <p className="line-clamp-1 text-sm font-semibold text-[#1a1d1f]">
                            {vote.title || vote.description || "Votação"}
                          </p>
                          {vote.proposition && (
                            <p className="mt-0.5 text-xs text-gray-500">
                              {vote.proposition.typeAcronym}{" "}
                              {vote.proposition.number}/{vote.proposition.year}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              vote.result
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {vote.result ? "Aprovado" : "Rejeitado"}
                          </span>
                          {!isSymbolic && (
                            <div className="flex items-center gap-1 text-[10px]">
                              <span className="font-semibold text-green-700">
                                {vote.positiveVotes} SIM
                              </span>
                              <span className="text-gray-300">|</span>
                              <span className="font-semibold text-red-700">
                                {vote.negativeVotes} NÃO
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {!isSymbolic && vote.totalVotes > 0 && (
                        <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full bg-green-500"
                            style={{
                              width: `${(vote.positiveVotes / vote.totalVotes) * 100}%`,
                            }}
                          />
                          <div
                            className="h-full bg-red-500"
                            style={{
                              width: `${(vote.negativeVotes / vote.totalVotes) * 100}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {eventDetails.voting.length > 5 && (
                <button
                  onClick={() => setActiveTab("voting")}
                  className="w-full rounded-lg border border-dashed border-gray-200 py-2 text-center text-xs font-medium text-gray-500 transition-colors hover:border-[#749c5b] hover:text-[#749c5b]"
                >
                  Ver mais {eventDetails.voting.length - 5} votações →
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
              <Check size={32} className="mb-2 opacity-30" />
              <p className="text-sm">
                Nenhuma votação registrada nesta sessão.
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Session Info & Quick Links */}
        <div className="space-y-6">
          {/* Session Duration */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#1a1d1f]">
              <Clock className="text-[#749c5b]" size={20} />
              Duração da Sessão
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500">Início</p>
                <p className="font-bold text-[#1a1d1f]">
                  {moment(eventDetails?.startDate).utc().format("HH:mm")}
                </p>
              </div>
              <div className="text-gray-300">→</div>
              <div className="flex-1 rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500">Término</p>
                <p className="font-bold text-[#1a1d1f]">
                  {eventDetails?.endDate
                    ? moment(eventDetails.endDate).utc().format("HH:mm")
                    : "Em andamento"}
                </p>
              </div>
              <div className="flex-1 rounded-lg bg-[#749c5b]/10 p-3 text-center">
                <p className="text-xs text-[#749c5b]">Duração</p>
                <p className="font-bold text-[#749c5b]">
                  {eventDetails?.endDate
                    ? `${moment(eventDetails.endDate).diff(moment(eventDetails.startDate), "hours")}h ${moment(eventDetails.endDate).diff(moment(eventDetails.startDate), "minutes") % 60}m`
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Breves Comunicações Preview (if available) */}
          {brevesComunicacoes?.exists && (
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-[#1a1d1f]">
                <Mic2 className="text-[#749c5b]" size={20} />
                Breves Comunicações
              </h3>
              {brevesComunicacoes.summary && (
                <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-gray-600">
                  {brevesComunicacoes.summary}
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users size={14} />
                <span>{brevesComunicacoes.speakers.length} oradores</span>
              </div>
              <button
                onClick={() => setActiveTab("brief_comm")}
                className="mt-3 text-sm font-medium text-[#749c5b] hover:underline"
              >
                Ver detalhes →
              </button>
            </div>
          )}

          {/* Quick Navigation */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#1a1d1f]">
              <Info className="text-[#749c5b]" size={20} />
              Navegação Rápida
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab("order_day")}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left text-sm font-medium text-gray-700 transition-colors hover:border-[#749c5b] hover:bg-[#749c5b]/5 hover:text-[#749c5b]"
              >
                <FileText size={16} />
                Ordem do Dia
              </button>
              <button
                onClick={() => setActiveTab("voting")}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left text-sm font-medium text-gray-700 transition-colors hover:border-[#749c5b] hover:bg-[#749c5b]/5 hover:text-[#749c5b]"
              >
                <Check size={16} />
                Votações
              </button>
              <button
                onClick={() => setActiveTab("presence")}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left text-sm font-medium text-gray-700 transition-colors hover:border-[#749c5b] hover:bg-[#749c5b]/5 hover:text-[#749c5b]"
              >
                <Users size={16} />
                Presenças
              </button>
              <button
                onClick={() => setActiveTab("brief_comm")}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left text-sm font-medium text-gray-700 transition-colors hover:border-[#749c5b] hover:bg-[#749c5b]/5 hover:text-[#749c5b]"
              >
                <Mic2 size={16} />
                Breves Comunicações
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
