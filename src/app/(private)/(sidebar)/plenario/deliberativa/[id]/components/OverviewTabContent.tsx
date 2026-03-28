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
              <p className="text-xs text-gray-500">
                Proposições em Pauta
              </p>
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
              <p className="text-xs text-gray-500">
                Votações Realizadas
              </p>
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
              <p className="text-xs text-gray-500">Taxa de Aprovação</p>
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
              <p className="text-xs text-gray-500">
                Parlamentares Presentes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Voting Results Summary */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#1a1d1f]">
            <Check className="text-[#749c5b]" size={20} />
            Resultado das Votações
          </h3>
          {eventDetails?.voting?.length ? (
            <div className="space-y-4">
              {/* Approved vs Rejected */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-green-600">
                      Aprovadas
                    </span>
                    <span className="font-bold">
                      {
                        eventDetails.voting.filter((v) => v.result)
                          .length
                      }
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{
                        width: `${(eventDetails.voting.filter((v) => v.result).length / eventDetails.voting.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-red-600">
                      Rejeitadas
                    </span>
                    <span className="font-bold">
                      {
                        eventDetails.voting.filter((v) => !v.result)
                          .length
                      }
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full bg-red-500 transition-all"
                      style={{
                        width: `${(eventDetails.voting.filter((v) => !v.result).length / eventDetails.voting.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Most Recent Votings */}
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="mb-2 text-xs font-medium text-gray-500 uppercase">
                  Últimas Votações
                </p>
                <div className="space-y-2">
                  {eventDetails.voting.slice(0, 3).map((vote) => (
                    <div
                      key={vote.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-2 text-sm"
                    >
                      <span className="flex-1 truncate pr-2 text-gray-700">
                        {vote.description?.substring(0, 60) ||
                          "Votação"}
                        {(vote.description?.length || 0) > 60
                          ? "..."
                          : ""}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          vote.result
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {vote.result ? "Aprovada" : "Rejeitada"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
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

        {/* Session Info & Quick Links */}
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
                  {moment(eventDetails?.startDate)
                    .utc()
                    .format("HH:mm")}
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
                <span>
                  {brevesComunicacoes.speakers.length} oradores
                </span>
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
