"use client";

import { useApiContext } from "@/context/ApiContext";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Member {
  id: string;
  politicianId: string;
  politician: {
    id: string;
    name: string;
    fullName: string;
    imageUrl: string;
    state: string;
    politicalParty: string;
    politicalPartyAcronym: string;
    email: string;
    phone: string;
    address: string;
    birthDate: string;
    placeOfBirth: string;
    instagram: string | null;
    youTube: string | null;
    tikTok: string | null;
    facebook: string | null;
    url: string;
  };
}

function MemberCard({ member }: { member: Member }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
        {member.politician.imageUrl && !imageError ? (
          <img
            src={member.politician.imageUrl}
            alt={member.politician.name}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <Users size={20} />
          </div>
        )}
      </div>
      <div className="overflow-hidden">
        <p className="truncate text-sm font-bold text-[#1a1d1f]">
          {member.politician.name}
        </p>
        <p className="text-xs text-gray-500">
          {member.politician.politicalParty || member.politician.politicalPartyAcronym || "N/A"} - {member.politician.state}
        </p>
      </div>
    </div>
  );
}

interface MembersTabProps {
  eventId: string;
}

export function MembersTab({ eventId }: MembersTabProps) {
  const { GetAPI } = useApiContext();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [partyFilter, setPartyFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    async function fetchMembers() {
      setLoading(true);
      const response = await GetAPI(
        `/event/${eventId}/members?page=${currentPage}&query=${search}&party=${partyFilter}&state=${stateFilter}&sortOrder=${sortOrder}`,
        true
      );
      if (response.status === 200) {
        setMembers(response.body.members || []);
        setTotalPages(response.body.pages || 0);
        setTotal(response.body.total || 0);
      }
      setLoading(false);
    }

    if (eventId) {
      fetchMembers();
    }
  }, [eventId, currentPage, search, partyFilter, stateFilter, sortOrder, GetAPI]);

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1a1d1f]">
            Registro de Presença
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              {total} parlamentares • Página {currentPage} de {totalPages}
            </div>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              title={sortOrder === "asc" ? "Ordenar Z-A" : "Ordenar A-Z"}
            >
              <ArrowUpDown size={14} />
              {sortOrder === "asc" ? "A-Z" : "Z-A"}
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
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-4 pl-10 text-sm transition-colors focus:border-[#749c5b] focus:bg-white focus:ring-2 focus:ring-[#749c5b]/20 focus:outline-none"
            />
          </div>
          <select
            value={partyFilter}
            onChange={(e) => {
              setPartyFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#749c5b] focus:ring-2 focus:ring-[#749c5b]/20 focus:outline-none"
          >
            <option value="">Todos os Partidos</option>
            <option value="PT">PT</option>
            <option value="PL">PL</option>
            <option value="UNIÃO">UNIÃO</option>
            <option value="PP">PP</option>
            <option value="MDB">MDB</option>
            <option value="PSD">PSD</option>
            <option value="REPUBLICANOS">REPUBLICANOS</option>
            <option value="PSDB">PSDB</option>
            <option value="PDT">PDT</option>
            <option value="PSB">PSB</option>
            <option value="PODE">PODE</option>
            <option value="PSOL">PSOL</option>
            <option value="PV">PV</option>
            <option value="NOVO">NOVO</option>
            <option value="PCdoB">PCdoB</option>
            <option value="CIDADANIA">CIDADANIA</option>
            <option value="SOLIDARIEDADE">SOLIDARIEDADE</option>
            <option value="AVANTE">AVANTE</option>
            <option value="PRD">PRD</option>
            <option value="REDE">REDE</option>
          </select>
          <select
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#749c5b] focus:ring-2 focus:ring-[#749c5b]/20 focus:outline-none"
          >
            <option value="">Todos os Estados</option>
            <option value="AC">AC</option>
            <option value="AL">AL</option>
            <option value="AP">AP</option>
            <option value="AM">AM</option>
            <option value="BA">BA</option>
            <option value="CE">CE</option>
            <option value="DF">DF</option>
            <option value="ES">ES</option>
            <option value="GO">GO</option>
            <option value="MA">MA</option>
            <option value="MT">MT</option>
            <option value="MS">MS</option>
            <option value="MG">MG</option>
            <option value="PA">PA</option>
            <option value="PB">PB</option>
            <option value="PR">PR</option>
            <option value="PE">PE</option>
            <option value="PI">PI</option>
            <option value="RJ">RJ</option>
            <option value="RN">RN</option>
            <option value="RS">RS</option>
            <option value="RO">RO</option>
            <option value="RR">RR</option>
            <option value="SC">SC</option>
            <option value="SP">SP</option>
            <option value="SE">SE</option>
            <option value="TO">TO</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <span className="animate-pulse text-[#749c5b]">
            Carregando lista de presença...
          </span>
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-400">
            <Users size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">
            {search || partyFilter || stateFilter
              ? "Nenhum resultado encontrado"
              : "Nenhuma presença registrada"}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {search || partyFilter || stateFilter
              ? "Tente ajustar os filtros para encontrar parlamentares."
              : "Não há registros de presença para este evento."}
          </p>
          {(search || partyFilter || stateFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setPartyFilter("");
                setStateFilter("");
                setCurrentPage(1);
              }}
              className="mt-4 rounded-lg bg-[#749c5b] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#658a4e]"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {members.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 p-4">
          {/* Left side: First and Previous buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded border border-gray-200 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              title="Primeira página"
            >
              <ChevronsLeft size={16} />
              <span className="hidden sm:inline">Início</span>
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
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
              {currentPage}
            </span>
            <span className="text-sm text-gray-600">de {totalPages}</span>
          </div>

          {/* Right side: Next and Last buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 rounded border border-gray-200 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              title="Próxima página"
            >
              <span className="hidden sm:inline">Próxima</span>
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
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
