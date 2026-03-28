"use client";

import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Users,
} from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { EventPolitician } from "./types";

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

interface PresenceTabContentProps {
  presenceList: EventPolitician[];
  loadingPresence: boolean;
  presencePage: number;
  setPresencePage: Dispatch<SetStateAction<number>>;
  presencePages: number;
  presenceSearch: string;
  setPresenceSearch: Dispatch<SetStateAction<string>>;
  presenceTotal: number;
  presencePartyFilter: string;
  setPresencePartyFilter: Dispatch<SetStateAction<string>>;
  presenceStateFilter: string;
  setPresenceStateFilter: Dispatch<SetStateAction<string>>;
  presenceSortOrder: "asc" | "desc";
  setPresenceSortOrder: Dispatch<SetStateAction<"asc" | "desc">>;
}

export function PresenceTabContent({
  presenceList,
  loadingPresence,
  presencePage,
  setPresencePage,
  presencePages,
  presenceSearch,
  setPresenceSearch,
  presenceTotal,
  presencePartyFilter,
  setPresencePartyFilter,
  presenceStateFilter,
  setPresenceStateFilter,
  presenceSortOrder,
  setPresenceSortOrder,
}: PresenceTabContentProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1a1d1f]">
            Registro de Presença
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              {presenceTotal} parlamentares • Página {presencePage} de{" "}
              {presencePages}
            </div>
            <button
              onClick={() =>
                setPresenceSortOrder(
                  presenceSortOrder === "asc" ? "desc" : "asc",
                )
              }
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              title={
                presenceSortOrder === "asc"
                  ? "Ordenar Z-A"
                  : "Ordenar A-Z"
              }
            >
              <ArrowUpDown size={14} />
              {presenceSortOrder === "asc" ? "A-Z" : "Z-A"}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search
              className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={presenceSearch}
              onChange={(e) => {
                setPresenceSearch(e.target.value);
                setPresencePage(1);
              }}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-4 pl-10 text-sm transition-colors focus:border-[#749c5b] focus:bg-white focus:ring-2 focus:ring-[#749c5b]/20 focus:outline-none"
            />
          </div>
          <select
            value={presencePartyFilter}
            onChange={(e) => {
              setPresencePartyFilter(e.target.value);
              setPresencePage(1);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#749c5b] focus:ring-2 focus:ring-[#749c5b]/20 focus:outline-none"
          >
            <option value="">Todos os Partidos</option>
            {PARTY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={presenceStateFilter}
            onChange={(e) => {
              setPresenceStateFilter(e.target.value);
              setPresencePage(1);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#749c5b] focus:ring-2 focus:ring-[#749c5b]/20 focus:outline-none"
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

      {loadingPresence ? (
        <div className="flex h-40 items-center justify-center">
          <span className="animate-pulse text-[#749c5b]">
            Carregando lista de presença...
          </span>
        </div>
      ) : presenceList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-400">
            <Users size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">
            {presenceSearch ||
            presencePartyFilter ||
            presenceStateFilter
              ? "Nenhum resultado encontrado"
              : "Nenhuma presença registrada"}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {presenceSearch ||
            presencePartyFilter ||
            presenceStateFilter
              ? "Tente ajustar os filtros para encontrar parlamentares."
              : "Não há registros de presença para este evento."}
          </p>
          {(presenceSearch ||
            presencePartyFilter ||
            presenceStateFilter) && (
            <button
              onClick={() => {
                setPresenceSearch("");
                setPresencePartyFilter("");
                setPresenceStateFilter("");
                setPresencePage(1);
              }}
              className="mt-4 rounded-lg bg-[#749c5b] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#658a4e]"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {presenceList.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <Users size={20} />
                </div>
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-bold text-[#1a1d1f]">
                  {p.politician.name}
                </p>
                <p className="text-xs text-gray-500">
                  {p.politician.politicalParty} - {p.politician.state}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {presenceList.length > 0 && presencePages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 p-4">
          {/* Left side: First and Previous buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPresencePage(1)}
              disabled={presencePage === 1}
              className="flex items-center gap-1 rounded border border-gray-200 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              title="Primeira página"
            >
              <ChevronsLeft size={16} />
              <span className="hidden sm:inline">Início</span>
            </button>
            <button
              onClick={() =>
                setPresencePage((prev) => Math.max(1, prev - 1))
              }
              disabled={presencePage === 1}
              className="flex items-center gap-1 rounded border border-gray-200 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              title="Página anterior"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Anterior</span>
            </button>
          </div>

          {/* Center: Page indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Página</span>
            <span className="rounded-lg bg-[#749c5b] px-3 py-1 text-sm font-bold text-white">
              {presencePage}
            </span>
            <span className="text-sm text-gray-600">
              de {presencePages}
            </span>
          </div>

          {/* Right side: Next and Last buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setPresencePage((prev) =>
                  Math.min(presencePages, prev + 1),
                )
              }
              disabled={presencePage === presencePages}
              className="flex items-center gap-1 rounded border border-gray-200 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              title="Próxima página"
            >
              <span className="hidden sm:inline">Próxima</span>
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPresencePage(presencePages)}
              disabled={presencePage === presencePages}
              className="flex items-center gap-1 rounded border border-gray-200 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              title="Última página"
            >
              <span className="hidden sm:inline">Fim</span>
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
