"use client";
import * as Tabs from "@radix-ui/react-tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Filter,
  MapPin,
  Newspaper,
  Search,
  SlidersHorizontal,
  Users,
  Video,
  X
} from "lucide-react";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { useApiContext } from "@/context/ApiContext";
import { cn } from "@/lib/utils";

interface Commission {
  id: string;
  name: string;
  acronym: string;
  surname: string;
  type: string;
  uri: string;
  contact?: {
    email?: string | null;
    phone?: string | null;
    secretary?: string | null;
    address?: string | null;
    room?: string | null;
  };
}

interface EventProps {
  id: string;
  startDate: string;
  endDate: string | null;
  situation: string;
  description: string;
  local: string | null;
  videoUrl: string | null;
  uri: string;
  eventType: {
    name: string;
    acronym?: string;
  };
  department: {
    id: string;
    name: string;
    acronym: string;
  };
}

export default function CommissionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { GetAPI } = useApiContext();
  const commissionId = params.id as string;

  const [commission, setCommission] = useState<Commission | null>(null);
  const [events, setEvents] = useState<EventProps[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingCommission, setLoadingCommission] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [activeTab, setActiveTab] = useState("eventos");
  
  // Members state
  const [members, setMembers] = useState<any[]>([]);
  const [allMembers, setAllMembers] = useState<any[]>([]); // Todos os membros (sem paginação)
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersPage, setMembersPage] = useState(1);
  const [membersTotalPages, setMembersTotalPages] = useState(0);
  
  // Members filters
  const [membersNameFilter, setMembersNameFilter] = useState("");
  const [membersPartyFilter, setMembersPartyFilter] = useState("");
  const [membersRoleFilter, setMembersRoleFilter] = useState<"all" | "titular" | "suplente">("all");
  const [membersStateFilter, setMembersStateFilter] = useState("");

  // Propositions state
  const [propositions, setPropositions] = useState<any[]>([]);
  const [loadingPropositions, setLoadingPropositions] = useState(false);
  const [propositionsPage, setPropositionsPage] = useState(1);
  const [propositionsTotalPages, setPropositionsTotalPages] = useState(0);

  // News state
  const [news, setNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [newsPage, setNewsPage] = useState(1);
  const [newsTotalPages, setNewsTotalPages] = useState(0);

  // Status filter state
  const [statusFilters, setStatusFilters] = useState<{
    agendada: boolean;
    realizada: boolean;
    cancelada: boolean;
  }>({
    agendada: true,
    realizada: true,
    cancelada: true,
  });

  // Fetch commission details
  useEffect(() => {
    async function fetchCommission() {
      setLoadingCommission(true);
      const response = await GetAPI(`/department/${commissionId}`, true);
      if (response.status === 200) {
        setCommission(response.body);
      }
      setLoadingCommission(false);
    }

    if (commissionId) {
      fetchCommission();
    }
  }, [commissionId, GetAPI]);

  // Fetch events for this commission
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      let queryParams = `?page=${currentPage}&departmentId=${commissionId}`;

      if (dateRange?.from) {
        queryParams += `&date=${moment(dateRange.from).format("YYYY-MM-DD")}`;
      }

      const response = await GetAPI(`/event${queryParams}`, true);
      if (response.status === 200) {
        setEvents(response.body.events || []);
        setTotalPages(response.body.pages || 0);
      }
      setLoading(false);
    }

    if (commissionId) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      fetchEvents();
    }
  }, [currentPage, commissionId, dateRange, GetAPI]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [dateRange]);

  // Fetch members when membros tab is active
  useEffect(() => {
    async function fetchMembers() {
      if (activeTab === "membros" && commissionId) {
        setLoadingMembers(true);
        // Buscar todos os membros de uma vez (sem paginação) para aplicar filtros
        const response = await GetAPI(
          `/department/${commissionId}/members?page=1`,
          true
        );
        if (response.status === 200) {
          const allMembersData = response.body.members || [];
          setAllMembers(allMembersData);
          // Aplicar paginação inicial
          const pageSize = 20;
          const paginated = allMembersData.slice(0, pageSize);
          setMembers(paginated);
          setMembersTotalPages(Math.ceil(allMembersData.length / pageSize));
        }
        setLoadingMembers(false);
      }
    }

    fetchMembers();
  }, [activeTab, commissionId, GetAPI]);

  // Aplicar filtros e paginação nos membros
  const { filteredMembers, totalFilteredPages } = useMemo(() => {
    // Remover duplicatas baseado no ID antes de aplicar filtros
    const uniqueMembersMap = new Map<string, any>();
    allMembers.forEach((member) => {
      if (member.id && !uniqueMembersMap.has(member.id)) {
        uniqueMembersMap.set(member.id, member);
      } else if (member.id) {
        // Se já existe, manter o primeiro (ou poderia manter o mais recente)
        console.warn('[Filtros] Membro duplicado encontrado:', member.id);
      }
    });
    let filtered = Array.from(uniqueMembersMap.values());

    // Filtro por nome
    if (membersNameFilter.trim()) {
      const searchTerm = membersNameFilter.toLowerCase().trim();
      filtered = filtered.filter((m) => {
        const name = m.politician?.name?.toLowerCase() || "";
        const fullName = m.politician?.fullName?.toLowerCase() || "";
        return name.includes(searchTerm) || fullName.includes(searchTerm);
      });
    }

    // Filtro por partido
    if (membersPartyFilter.trim()) {
      const searchTerm = membersPartyFilter.toLowerCase().trim();
      filtered = filtered.filter((m) => {
        const party = m.politician?.politicalPartyAcronym?.toLowerCase() || "";
        const partyName = m.politician?.politicalParty?.toLowerCase() || "";
        return party.includes(searchTerm) || partyName.includes(searchTerm);
      });
    }

    // Filtro por tipo (titular/suplente)
    if (membersRoleFilter !== "all") {
      filtered = filtered.filter((m) => {
        const role = m.role?.toLowerCase() || "";
        if (membersRoleFilter === "titular") {
          return !role.includes("suplente");
        } else if (membersRoleFilter === "suplente") {
          return role.includes("suplente");
        }
        return true;
      });
    }

    // Filtro por estado
    if (membersStateFilter.trim()) {
      const searchTerm = membersStateFilter.toLowerCase().trim();
      filtered = filtered.filter((m) => {
        const state = m.politician?.state?.toLowerCase() || "";
        return state.includes(searchTerm);
      });
    }

    // Calcular total de páginas
    const pageSize = 20;
    const totalPages = Math.ceil(filtered.length / pageSize);

    // Aplicar paginação
    const skip = (membersPage - 1) * pageSize;
    const paginated = filtered.slice(skip, skip + pageSize);

    return { filteredMembers: paginated, totalFilteredPages: totalPages };
  }, [allMembers, membersNameFilter, membersPartyFilter, membersRoleFilter, membersStateFilter, membersPage]);

  // Atualizar membros e total de páginas quando os filtros mudarem
  useEffect(() => {
    setMembers(filteredMembers);
    setMembersTotalPages(totalFilteredPages);
  }, [filteredMembers, totalFilteredPages]);

  // Resetar para página 1 quando filtros mudarem (exceto quando já está na página 1)
  useEffect(() => {
    if (membersPage !== 1) {
      setMembersPage(1);
    }
  }, [membersNameFilter, membersPartyFilter, membersRoleFilter, membersStateFilter]);

  // Fetch propositions when propostas tab is active
  useEffect(() => {
    async function fetchPropositions() {
      if (activeTab === "propostas" && commissionId) {
        setLoadingPropositions(true);
        const response = await GetAPI(
          `/department/${commissionId}/propositions?page=${propositionsPage}`,
          true
        );
        if (response.status === 200) {
          setPropositions(response.body.propositions || []);
          setPropositionsTotalPages(response.body.pages || 0);
        }
        setLoadingPropositions(false);
      }
    }

    fetchPropositions();
  }, [activeTab, commissionId, propositionsPage, GetAPI]);

  // Fetch news when noticias tab is active
  useEffect(() => {
    async function fetchNews() {
      if (activeTab === "noticias" && commissionId) {
        setLoadingNews(true);
        const response = await GetAPI(
          `/department/${commissionId}/news?page=${newsPage}`,
          true
        );
      console.log("news: ", response);
      if (response.status === 200) {
          setNews(response.body.news || []);
          setNewsTotalPages(response.body.pages || 0);
        }
        setLoadingNews(false);
      }
    }

    fetchNews();
  }, [activeTab, commissionId, newsPage, GetAPI]);

  const getStatus = (
    situation: string,
  ): "agendada" | "realizada" | "cancelada" => {
    const sit = situation.toLowerCase();
    if (sit.includes("realizada") || sit.includes("encerrada"))
      return "realizada";
    if (sit.includes("cancelada")) return "cancelada";
    return "agendada";
  };

  // --- FILTROS ---
  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        const eventStatus = getStatus(event.situation);

        // Filter by status checkboxes
        if (!statusFilters[eventStatus]) return false;

        return true;
      })
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [events, statusFilters]);

  const handleEventClick = (event: EventProps) => {
    // Navigate to event details page
    router.push(`/commissions/${commissionId}/${event.id}`);
  };

  const toggleStatusFilter = (status: keyof typeof statusFilters) => {
    setStatusFilters((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  if (loadingCommission) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f4f4]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#749c5b] border-t-transparent" />
      </div>
    );
  }

  if (!commission) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] p-6">
        <div className="mx-auto max-w-7xl">
          <button
            onClick={() => router.push("/commissions")}
            className="mb-6 flex items-center gap-2 text-[#6f767e] hover:text-[#1a1d1f]"
          >
            <ArrowLeft size={20} />
            <span>Voltar para Comissões</span>
          </button>
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h3 className="text-lg font-bold text-[#1a1d1f]">
              Comissão não encontrada
            </h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-[#6f767e]">
              A comissão solicitada não foi encontrada.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-6 font-sans text-[#1a1d1f]">
      <div className="mx-auto space-y-8">
        {/* --- CABEÇALHO --- */}
        <div>
          <button
            onClick={() => router.push("/commissions")}
            className="mb-6 flex items-center gap-2 text-[#6f767e] transition-colors hover:text-[#1a1d1f]"
          >
            <ArrowLeft size={20} />
            <span>Voltar para Comissões</span>
          </button>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                {commission.acronym && (
                  <span className="mb-2 inline-block rounded border border-gray-200 bg-[#f4f4f4] px-3 py-1 text-sm font-bold text-[#1a1d1f] uppercase">
                    {commission.acronym}
                  </span>
                )}
                <h1 className="mt-2 text-3xl font-bold text-[#1a1d1f]">
                  {commission.name}
                </h1>
                {commission.surname && commission.surname !== commission.name && (
                  <p className="mt-2 text-lg text-[#6f767e]">
                    {commission.surname}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded bg-[#749c5b]/10 px-3 py-1 text-sm font-medium text-[#749c5b]">
                    {commission.type}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- NAVEGAÇÃO DE ABAS --- */}
        <Tabs.Root
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <Tabs.List className="scrollbar-hide mb-6 flex flex-nowrap gap-2 overflow-x-auto border-b border-gray-200 pb-1">
            {[
              { id: "eventos", label: "Eventos", icon: CalendarIcon },
              { id: "membros", label: "Membros", icon: Users },
              // { id: "subcomissoes", label: "Subcomissões", icon: FolderTree }, // Comentado temporariamente
              {
                id: "propostas",
                label: "Propostas Legislativas",
                icon: FileText,
              },
              { id: "noticias", label: "Notícias", icon: Newspaper },
              // { id: "documentos", label: "Documentos", icon: FileText }, // Comentado temporariamente
              // { id: "contatos", label: "Contatos", icon: Phone }, // Comentado temporariamente - API não fornece dados de contato
            ].map((tab) => (
              <Tabs.Trigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all",
                  activeTab === tab.id
                    ? "border-[#749c5b] text-[#749c5b]"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-[#1a1d1f]",
                )}
              >
                <tab.icon size={16} />
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* --- CONTEÚDO: EVENTOS --- */}
          <Tabs.Content
            value="eventos"
            className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500"
          >
            {/* --- GRID LAYOUT --- */}
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
              {/* --- COLUNA ESQUERDA: LISTA --- */}
              <div className="flex flex-col gap-6 lg:col-span-2">
                {loading ? (
              <div className="min-h-[400px] space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 w-full animate-pulse rounded-xl bg-gray-200"
                  />
                ))}
              </div>
                ) : filteredEvents.length > 0 ? (
                  <div className="min-h-[400px] space-y-4">
                    {filteredEvents.map((event) => {
                      const status = getStatus(event.situation);
                      return (
                        <div
                          key={event.id}
                          className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-[#749c5b]/30 hover:shadow-md"
                        >
                          {/* Barra decorativa lateral */}
                          <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#749c5b] opacity-0 transition-opacity group-hover:opacity-100" />

                          <div className="flex flex-col justify-between gap-4 pl-2 sm:flex-row">
                            <div className="flex-1">
                              <div className="mb-3 flex flex-wrap items-center gap-2">
                                <span className="rounded border border-gray-200 bg-[#f4f4f4] px-2 py-1 text-xs font-bold text-[#1a1d1f] uppercase">
                                  {format(new Date(event.startDate), "dd MMM yyyy", {
                                    locale: ptBR,
                                  })}
                                </span>
                                <span
                                  className={`rounded px-2 py-1 text-xs font-medium ${
                                    status === "realizada"
                                      ? "bg-gray-100 text-gray-600"
                                      : status === "cancelada"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-[#749c5b]/10 text-[#749c5b]"
                                  }`}
                                >
                                  {status === "realizada"
                                    ? "Realizada"
                                    : status === "cancelada"
                                      ? "Cancelada"
                                      : "Agendada"}
                                </span>
                                {event.local && (
                                  <span className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">
                                    <MapPin size={12} />
                                    {event.local}
                                  </span>
                                )}
                              </div>

                              <h3 className="mb-2 text-xl leading-tight font-bold text-[#1a1d1f]">
                                {event.eventType.name}
                              </h3>
                              <p className="line-clamp-2 text-sm leading-relaxed text-[#6f767e]">
                                {event.description}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 sm:self-center">
                              {event.videoUrl && (
                                <a
                                  href={event.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-[#1a1d1f] shadow-sm transition-all hover:bg-[#749c5b] hover:text-white"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Video size={18} />
                                </a>
                              )}
                              <button
                                onClick={() => handleEventClick(event)}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-[#1a1d1f] shadow-sm transition-all hover:bg-[#749c5b] hover:text-white sm:h-auto sm:w-auto sm:rounded-lg sm:border-transparent sm:bg-[#1a1d1f] sm:px-4 sm:py-2 sm:text-white"
                              >
                                <ArrowRight size={18} className="sm:mr-2" />
                                <span className="hidden text-sm font-medium sm:inline">
                                  Ver Detalhes
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                    <Search className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                    <h3 className="text-lg font-bold text-[#1a1d1f]">
                      Nenhum evento encontrado
                    </h3>
                    <p className="mx-auto mt-2 max-w-xs text-sm text-[#6f767e]">
                      Não encontramos resultados para os filtros selecionados. Tente
                      limpar as datas ou ajustar os filtros de status.
                    </p>
                    {dateRange && (
                      <button
                        onClick={() => setDateRange(undefined)}
                        className="mt-6 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-gray-200"
                      >
                        Limpar Filtros de Data
                      </button>
                    )}
                  </div>
                )}

                {/* --- COMPONENTE DE PAGINAÇÃO --- */}
                {filteredEvents.length > 0 && totalPages > 1 && !loading && (
                  <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="hidden text-sm text-[#6f767e] sm:block">
                      Página{" "}
                      <span className="font-bold text-[#1a1d1f]">{currentPage}</span>{" "}
                      de{" "}
                      <span className="font-bold text-[#1a1d1f]">{totalPages}</span>
                    </div>

                    <div className="mx-auto flex items-center gap-2 sm:mx-0">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ChevronLeft size={16} />
                        <span className="hidden sm:inline">Anterior</span>
                      </button>

                      {/* Números de página */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                currentPage === pageNum
                                  ? "bg-[#749c5b] text-white shadow-md shadow-[#749c5b]/20"
                                  : "text-[#6f767e] hover:bg-gray-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="hidden sm:inline">Próxima</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* --- COLUNA DIREITA: SIDEBAR --- */}
              <div className="sticky top-6 space-y-6 lg:col-span-1">
                {/* 1. FILTROS DE STATUS */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
                    <h2 className="flex items-center gap-2 font-bold text-[#1a1d1f]">
                      <SlidersHorizontal size={18} className="text-[#749c5b]" />
                      Filtros
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {/* Status Checkboxes */}
                    <div>
                      <label className="mb-2 block text-xs font-bold text-[#6f767e] uppercase">
                        Status
                      </label>
                      <div className="space-y-2">
                        <label
                          className="group flex cursor-pointer items-center gap-2"
                          onClick={() => toggleStatusFilter("agendada")}
                        >
                          <div
                            className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                              statusFilters.agendada
                                ? "border-[#749c5b] bg-[#749c5b] text-white"
                                : "border-gray-300 group-hover:border-[#749c5b]"
                            }`}
                          >
                            {statusFilters.agendada && <CheckSquare size={10} />}
                          </div>
                          <span
                            className={`text-sm ${statusFilters.agendada ? "font-medium text-[#1a1d1f]" : "text-[#6f767e]"}`}
                          >
                            Agendadas
                          </span>
                        </label>
                        <label
                          className="group flex cursor-pointer items-center gap-2"
                          onClick={() => toggleStatusFilter("realizada")}
                        >
                          <div
                            className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                              statusFilters.realizada
                                ? "border-[#749c5b] bg-[#749c5b] text-white"
                                : "border-gray-300 group-hover:border-[#749c5b]"
                            }`}
                          >
                            {statusFilters.realizada && <CheckSquare size={10} />}
                          </div>
                          <span
                            className={`text-sm ${statusFilters.realizada ? "font-medium text-[#1a1d1f]" : "text-[#6f767e]"}`}
                          >
                            Realizadas
                          </span>
                        </label>
                        <label
                          className="group flex cursor-pointer items-center gap-2"
                          onClick={() => toggleStatusFilter("cancelada")}
                        >
                          <div
                            className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                              statusFilters.cancelada
                                ? "border-[#749c5b] bg-[#749c5b] text-white"
                                : "border-gray-300 group-hover:border-[#749c5b]"
                            }`}
                          >
                            {statusFilters.cancelada && <CheckSquare size={10} />}
                          </div>
                          <span
                            className={`text-sm ${statusFilters.cancelada ? "font-medium text-[#1a1d1f]" : "text-[#6f767e]"}`}
                          >
                            Canceladas
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. CALENDÁRIO DE FILTRO */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-bold text-[#1a1d1f]">
                      <CalendarIcon size={18} className="text-[#749c5b]" />
                      Filtrar por Período
                    </h2>
                    {dateRange?.from && (
                      <button
                        onClick={() => setDateRange(undefined)}
                        className="flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-500 hover:text-red-700"
                      >
                        <X size={12} /> Limpar
                      </button>
                    )}
                  </div>

                  {/* Calendário Importado */}
                  <div className="mb-4 flex justify-center rounded-lg border border-gray-100 bg-white p-2">
                    <Calendar
                      mode="single"
                      selected={dateRange?.from}
                      onSelect={(date) =>
                        setDateRange(date ? { from: date, to: date } : undefined)
                      }
                      locale={ptBR}
                      className="rounded-md"
                      styles={{
                        head_cell: { color: "#6f767e", fontSize: "0.8rem" },
                      }}
                    />
                  </div>

                  {/* Display do Range */}
                  <div className="rounded-lg border border-gray-200 bg-[#f4f4f4] p-3 text-center">
                    {dateRange?.from ? (
                      <div className="flex flex-col">
                        <span className="mb-1 text-xs text-[#6f767e]">
                          Data selecionada:
                        </span>
                        <span className="text-sm font-bold text-[#1a1d1f]">
                          {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-[#6f767e] italic">
                        Selecione uma data
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* --- CONTEÚDO: MEMBROS --- */}
          <Tabs.Content
            value="membros"
            className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500"
          >
            {/* --- GRID LAYOUT PARA MEMBROS --- */}
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
              {/* --- COLUNA ESQUERDA: LISTA DE MEMBROS --- */}
              <div className="flex flex-col gap-6 lg:col-span-2">
                {loadingMembers ? (
                  <div className="flex min-h-[400px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#749c5b] border-t-transparent" />
                  </div>
                ) : members.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-[#749c5b]/30 hover:shadow-md"
                    >
                      <div className="flex flex-col items-center text-center">
                        {member.politician?.imageUrl ? (
                          <img
                            src={member.politician.imageUrl}
                            alt={member.politician.name}
                            className="mb-4 h-24 w-24 rounded-full object-cover"
                          />
                        ) : (
                          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[#749c5b]/10">
                            <Users className="h-12 w-12 text-[#749c5b]" />
                          </div>
                        )}
                        
                        {member.role && (
                          <span className="mb-2 rounded-full bg-[#749c5b]/10 px-3 py-1 text-xs font-bold text-[#749c5b] uppercase">
                            {member.role}
                          </span>
                        )}
                        
                        <h3 className="mb-1 text-lg font-bold text-[#1a1d1f]">
                          {member.politician?.name || "Nome não disponível"}
                        </h3>
                        
                        {member.politician?.fullName && member.politician.fullName !== member.politician.name && (
                          <p className="mb-3 text-sm text-[#6f767e]">
                            {member.politician.fullName}
                          </p>
                        )}
                        
                        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                          {member.politician?.politicalPartyAcronym && (
                            <span className="rounded border border-gray-200 bg-[#f4f4f4] px-2 py-1 text-xs font-medium text-[#1a1d1f]">
                              {member.politician.politicalPartyAcronym}
                            </span>
                          )}
                          {member.politician?.state && (
                            <span className="rounded border border-gray-200 bg-[#f4f4f4] px-2 py-1 text-xs font-medium text-[#1a1d1f]">
                              {member.politician.state}
                            </span>
                          )}
                        </div>
                        
                        {member.description && (
                          <p className="mt-3 text-xs text-[#6f767e]">
                            {member.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                    {/* Paginação */}
                    {membersTotalPages > 1 && (
                      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="hidden text-sm text-[#6f767e] sm:block">
                          Página{" "}
                          <span className="font-bold text-[#1a1d1f]">{membersPage}</span>{" "}
                          de{" "}
                          <span className="font-bold text-[#1a1d1f]">{membersTotalPages}</span>
                        </div>

                        <div className="mx-auto flex items-center gap-2 sm:mx-0">
                          <button
                            onClick={() => setMembersPage((p) => Math.max(1, p - 1))}
                            disabled={membersPage === 1}
                            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <ChevronLeft size={16} />
                            <span className="hidden sm:inline">Anterior</span>
                          </button>

                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(membersTotalPages, 5) }, (_, i) => {
                              let pageNum;
                              if (membersTotalPages <= 5) {
                                pageNum = i + 1;
                              } else if (membersPage <= 3) {
                                pageNum = i + 1;
                              } else if (membersPage >= membersTotalPages - 2) {
                                pageNum = membersTotalPages - 4 + i;
                              } else {
                                pageNum = membersPage - 2 + i;
                              }

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setMembersPage(pageNum)}
                                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                    membersPage === pageNum
                                      ? "bg-[#749c5b] text-white shadow-md shadow-[#749c5b]/20"
                                      : "text-[#6f767e] hover:bg-gray-100"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={() =>
                              setMembersPage((p) => Math.min(membersTotalPages, p + 1))
                            }
                            disabled={membersPage === membersTotalPages}
                            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span className="hidden sm:inline">Próxima</span>
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                    <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                    <h3 className="text-lg font-bold text-[#1a1d1f]">
                      Nenhum membro encontrado
                    </h3>
                    <p className="mx-auto mt-2 max-w-xs text-sm text-[#6f767e]">
                      {membersNameFilter || membersPartyFilter || membersRoleFilter !== "all" || membersStateFilter
                        ? "Nenhum membro corresponde aos filtros selecionados."
                        : "Esta comissão ainda não possui membros registrados ou os dados não estão disponíveis."}
                    </p>
                    {(membersNameFilter || membersPartyFilter || membersRoleFilter !== "all" || membersStateFilter) && (
                      <button
                        onClick={() => {
                          setMembersNameFilter("");
                          setMembersPartyFilter("");
                          setMembersRoleFilter("all");
                          setMembersStateFilter("");
                        }}
                        className="mt-4 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-gray-200"
                      >
                        Limpar Filtros
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* --- COLUNA DIREITA: FILTROS DE MEMBROS --- */}
              <div className="sticky top-6 space-y-6 lg:col-span-1">
                {/* 1. FILTROS DE MEMBROS */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
                    <h2 className="flex items-center gap-2 font-bold text-[#1a1d1f]">
                      <Filter size={18} className="text-[#749c5b]" />
                      Filtros
                    </h2>
                    {(membersNameFilter || membersPartyFilter || membersRoleFilter !== "all" || membersStateFilter) && (
                      <button
                        onClick={() => {
                          setMembersNameFilter("");
                          setMembersPartyFilter("");
                          setMembersRoleFilter("all");
                          setMembersStateFilter("");
                        }}
                        className="flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-500 hover:text-red-700"
                      >
                        <X size={12} /> Limpar
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Filtro por Nome */}
                    <div>
                      <label className="mb-2 block text-xs font-bold text-[#6f767e] uppercase">
                        Nome
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar por nome..."
                          value={membersNameFilter}
                          onChange={(e) => setMembersNameFilter(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-[#1a1d1f] placeholder:text-gray-400 focus:border-[#749c5b] focus:outline-none focus:ring-2 focus:ring-[#749c5b]/20"
                        />
                      </div>
                    </div>

                    {/* Filtro por Partido */}
                    <div>
                      <label className="mb-2 block text-xs font-bold text-[#6f767e] uppercase">
                        Partido
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar por partido..."
                          value={membersPartyFilter}
                          onChange={(e) => setMembersPartyFilter(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-[#1a1d1f] placeholder:text-gray-400 focus:border-[#749c5b] focus:outline-none focus:ring-2 focus:ring-[#749c5b]/20"
                        />
                      </div>
                    </div>

                    {/* Filtro por Tipo (Titular/Suplente) */}
                    <div>
                      <label className="mb-2 block text-xs font-bold text-[#6f767e] uppercase">
                        Tipo
                      </label>
                      <div className="space-y-2">
                        <label
                          className="group flex cursor-pointer items-center gap-2"
                          onClick={() => setMembersRoleFilter("all")}
                        >
                          <div
                            className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                              membersRoleFilter === "all"
                                ? "border-[#749c5b] bg-[#749c5b] text-white"
                                : "border-gray-300 group-hover:border-[#749c5b]"
                            }`}
                          >
                            {membersRoleFilter === "all" && <CheckSquare size={10} />}
                          </div>
                          <span
                            className={`text-sm ${membersRoleFilter === "all" ? "font-medium text-[#1a1d1f]" : "text-[#6f767e]"}`}
                          >
                            Todos
                          </span>
                        </label>
                        <label
                          className="group flex cursor-pointer items-center gap-2"
                          onClick={() => setMembersRoleFilter("titular")}
                        >
                          <div
                            className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                              membersRoleFilter === "titular"
                                ? "border-[#749c5b] bg-[#749c5b] text-white"
                                : "border-gray-300 group-hover:border-[#749c5b]"
                            }`}
                          >
                            {membersRoleFilter === "titular" && <CheckSquare size={10} />}
                          </div>
                          <span
                            className={`text-sm ${membersRoleFilter === "titular" ? "font-medium text-[#1a1d1f]" : "text-[#6f767e]"}`}
                          >
                            Titulares
                          </span>
                        </label>
                        <label
                          className="group flex cursor-pointer items-center gap-2"
                          onClick={() => setMembersRoleFilter("suplente")}
                        >
                          <div
                            className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                              membersRoleFilter === "suplente"
                                ? "border-[#749c5b] bg-[#749c5b] text-white"
                                : "border-gray-300 group-hover:border-[#749c5b]"
                            }`}
                          >
                            {membersRoleFilter === "suplente" && <CheckSquare size={10} />}
                          </div>
                          <span
                            className={`text-sm ${membersRoleFilter === "suplente" ? "font-medium text-[#1a1d1f]" : "text-[#6f767e]"}`}
                          >
                            Suplentes
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Filtro por Estado */}
                    <div>
                      <label className="mb-2 block text-xs font-bold text-[#6f767e] uppercase">
                        Estado
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar por estado (ex: SP, RJ)..."
                          value={membersStateFilter}
                          onChange={(e) => setMembersStateFilter(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-[#1a1d1f] placeholder:text-gray-400 focus:border-[#749c5b] focus:outline-none focus:ring-2 focus:ring-[#749c5b]/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* --- CONTEÚDO: SUBCOMISSÕES --- */}
          {/* Comentado temporariamente
          <Tabs.Content
            value="subcomissoes"
            className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500"
          >
            <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
              <FolderTree className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-bold text-[#1a1d1f]">
                Subcomissões
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-[#6f767e]">
                Em breve você poderá visualizar as subcomissões relacionadas.
              </p>
            </div>
          </Tabs.Content>
          */}

          {/* --- CONTEÚDO: PROPOSTAS LEGISLATIVAS --- */}
          <Tabs.Content
            value="propostas"
            className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500"
          >
            {loadingPropositions ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#749c5b] border-t-transparent" />
              </div>
            ) : propositions.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {propositions.map((proposition) => (
                    <div
                      key={proposition.id}
                      className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-[#749c5b]/30 hover:shadow-md"
                    >
                      <div className="flex flex-col gap-4">
                        {/* Header com tipo e número */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-[#749c5b]/10 px-3 py-1 text-xs font-bold text-[#749c5b] uppercase">
                                {proposition.type?.acronym || "N/A"}
                              </span>
                              <span className="text-lg font-bold text-[#1a1d1f]">
                                {proposition.number}/{proposition.year}
                              </span>
                            </div>
                          </div>
                          {proposition.situation && (
                            <span className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-[#6f767e]">
                              {proposition.situation.name}
                            </span>
                          )}
                        </div>

                        {/* Título */}
                        {proposition.title && (
                          <h3 className="text-lg font-bold text-[#1a1d1f]">
                            {proposition.title}
                          </h3>
                        )}

                        {/* Descrição */}
                        {proposition.description && (
                          <p className="line-clamp-3 text-sm leading-relaxed text-[#6f767e]">
                            {proposition.description}
                          </p>
                        )}

                        {/* Informações adicionais */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#6f767e]">
                          {proposition.presentationDate && (
                            <div className="flex items-center gap-1">
                              <CalendarIcon size={14} />
                              <span>
                                Apresentada em{" "}
                                {format(
                                  new Date(proposition.presentationDate),
                                  "dd/MM/yyyy",
                                  { locale: ptBR }
                                )}
                              </span>
                            </div>
                          )}
                          {proposition.regime && (
                            <span className="rounded bg-blue-50 px-2 py-1 text-blue-700">
                              {proposition.regime}
                            </span>
                          )}
                          {proposition.topic && (
                            <span className="rounded bg-purple-50 px-2 py-1 text-purple-700">
                              {proposition.topic}
                            </span>
                          )}
                        </div>

                        {/* Link externo */}
                        {proposition.url && (
                          <div className="flex items-center justify-end">
                            <a
                              href={proposition.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-[#749c5b] hover:text-white"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink size={16} />
                              Ver Detalhes
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginação */}
                {propositionsTotalPages > 1 && (
                  <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="hidden text-sm text-[#6f767e] sm:block">
                      Página{" "}
                      <span className="font-bold text-[#1a1d1f]">{propositionsPage}</span>{" "}
                      de{" "}
                      <span className="font-bold text-[#1a1d1f]">{propositionsTotalPages}</span>
                    </div>

                    <div className="mx-auto flex items-center gap-2 sm:mx-0">
                      <button
                        onClick={() => setPropositionsPage((p) => Math.max(1, p - 1))}
                        disabled={propositionsPage === 1}
                        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ChevronLeft size={16} />
                        <span className="hidden sm:inline">Anterior</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(propositionsTotalPages, 5) }, (_, i) => {
                          let pageNum;
                          if (propositionsTotalPages <= 5) {
                            pageNum = i + 1;
                          } else if (propositionsPage <= 3) {
                            pageNum = i + 1;
                          } else if (propositionsPage >= propositionsTotalPages - 2) {
                            pageNum = propositionsTotalPages - 4 + i;
                          } else {
                            pageNum = propositionsPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPropositionsPage(pageNum)}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                propositionsPage === pageNum
                                  ? "bg-[#749c5b] text-white shadow-md shadow-[#749c5b]/20"
                                  : "text-[#6f767e] hover:bg-gray-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() =>
                          setPropositionsPage((p) => Math.min(propositionsTotalPages, p + 1))
                        }
                        disabled={propositionsPage === propositionsTotalPages}
                        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="hidden sm:inline">Próxima</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <h3 className="text-lg font-bold text-[#1a1d1f]">
                  Nenhuma proposta encontrada
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-[#6f767e]">
                  Esta comissão ainda não possui propostas legislativas registradas ou os dados não estão disponíveis.
                </p>
              </div>
            )}
          </Tabs.Content>

          {/* --- CONTEÚDO: NOTÍCIAS --- */}
          <Tabs.Content
            value="noticias"
            className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500"
          >
            {loadingNews ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#749c5b] border-t-transparent" />
              </div>
            ) : news.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {news.map((newsItem) => (
                    <div
                      key={newsItem.id}
                      className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-[#749c5b]/30 hover:shadow-md"
                    >
                      <div className="flex flex-col gap-4">
                        {/* Header com data */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {newsItem.createdAt && (
                              <div className="mb-2 flex items-center gap-2 text-xs text-[#6f767e]">
                                <CalendarIcon size={14} />
                                <span>
                                  {format(
                                    new Date(newsItem.createdAt),
                                    "dd 'de' MMMM 'de' yyyy",
                                    { locale: ptBR }
                                  )}
                                </span>
                              </div>
                            )}
                            <h3 className="mb-2 text-xl font-bold leading-tight text-[#1a1d1f]">
                              {newsItem.title}
                            </h3>
                          </div>
                        </div>

                        {/* Resumo */}
                        {newsItem.summary && (
                          <p className="line-clamp-3 text-sm leading-relaxed text-[#6f767e]">
                            {newsItem.summary}
                          </p>
                        )}

                        {/* Link externo */}
                        {newsItem.url && (
                          <div className="flex items-center justify-end">
                            <a
                              href={newsItem.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-[#749c5b] hover:text-white"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink size={16} />
                              Ler Notícia Completa
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginação */}
                {newsTotalPages > 1 && (
                  <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="hidden text-sm text-[#6f767e] sm:block">
                      Página{" "}
                      <span className="font-bold text-[#1a1d1f]">{newsPage}</span>{" "}
                      de{" "}
                      <span className="font-bold text-[#1a1d1f]">{newsTotalPages}</span>
                    </div>

                    <div className="mx-auto flex items-center gap-2 sm:mx-0">
                      <button
                        onClick={() => setNewsPage((p) => Math.max(1, p - 1))}
                        disabled={newsPage === 1}
                        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ChevronLeft size={16} />
                        <span className="hidden sm:inline">Anterior</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(newsTotalPages, 5) }, (_, i) => {
                          let pageNum;
                          if (newsTotalPages <= 5) {
                            pageNum = i + 1;
                          } else if (newsPage <= 3) {
                            pageNum = i + 1;
                          } else if (newsPage >= newsTotalPages - 2) {
                            pageNum = newsTotalPages - 4 + i;
                          } else {
                            pageNum = newsPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setNewsPage(pageNum)}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                newsPage === pageNum
                                  ? "bg-[#749c5b] text-white shadow-md shadow-[#749c5b]/20"
                                  : "text-[#6f767e] hover:bg-gray-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() =>
                          setNewsPage((p) => Math.min(newsTotalPages, p + 1))
                        }
                        disabled={newsPage === newsTotalPages}
                        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="hidden sm:inline">Próxima</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <Newspaper className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <h3 className="text-lg font-bold text-[#1a1d1f]">
                  Nenhuma notícia encontrada
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-[#6f767e]">
                  Esta comissão ainda não possui notícias registradas ou os dados não estão disponíveis.
                </p>
              </div>
            )}
          </Tabs.Content>

          {/* --- CONTEÚDO: DOCUMENTOS --- */}
          {/* Comentado temporariamente */}

          {/* --- CONTEÚDO: CONTATOS --- */}
          {/* Comentado temporariamente - API não fornece dados de contato */}
        </Tabs.Root>
      </div>
    </div>
  );
}

