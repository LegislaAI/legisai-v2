"use client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    ArrowRight,
    Calendar as CalendarIcon,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";

// --- IMPORT SOLICITADO ---
import { Calendar } from "@/components/ui/calendar";
import { useApiContext } from "@/context/ApiContext";
import { useRouter } from "next/navigation";

// --- TIPOS ---
type SessionType = "solene" | "deliberativa" | "geral";

interface SessionSummary {
  id: string;
  type: SessionType;
  date: string;
  title: string;
  subtitle: string;
  status: "agendada" | "realizada" | "cancelada";
}

// API Event Interface (from plenary page)
interface EventProps {
  createdAt: string;
  departmentId: string;
  description: string;
  endDate: string | null;
  eventTypeId: string;
  eventType: {
    name: string;
    acronym?: string;
  };
  id: string;
  local: string;
  situation: string;
  startDate: string;
  updatedAt: string;
  uri: string;
  videoUrl: string | null;
}

export default function SessionListScreen() {
  const router = useRouter();
  const { GetAPI } = useApiContext();
  const [activeTab, setActiveTab] = useState<SessionType>("solene");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventProps[]>([]);
  const [totalPages, setTotalPages] = useState(0);

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

  // Helper function to determine session type from event name
  const getSessionType = (eventTypeName: string): SessionType => {
    const name = eventTypeName.toLowerCase();
    if (name.includes("solene")) return "solene";
    if (name.includes("deliberativa")) return "deliberativa";
    return "geral";
  };

  // Helper function to map situation to status
  const getStatus = (
    situation: string,
  ): "agendada" | "realizada" | "cancelada" => {
    const sit = situation.toLowerCase();
    if (sit.includes("realizada") || sit.includes("encerrada"))
      return "realizada";
    if (sit.includes("cancelada")) return "cancelada";
    return "agendada";
  };

  // Fetch events from API
  async function fetchEvents() {
    setLoading(true);
    let queryParams = `?page=${currentPage}`;

    if (dateRange?.from) {
      queryParams += `&date=${moment(dateRange.from).format("YYYY-MM-DD")}`;
    }

    const response = await GetAPI(`/event${queryParams}&type=ALL`, true);
    if (response.status === 200) {
      setEvents(response.body.events || []);
      setTotalPages(response.body.pages || 0);
    }
    setLoading(false);
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchEvents();
  }, [currentPage, dateRange]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [dateRange, activeTab, statusFilters]);

  // --- FILTROS ---
  const filteredSessions = useMemo(() => {
    return events
      .filter((event) => {
        const eventType = getSessionType(event.eventType.name);
        const eventStatus = getStatus(event.situation);

        // Filter by active tab (session type)
        if (eventType !== activeTab) return false;

        // Filter by status checkboxes
        if (!statusFilters[eventStatus]) return false;

        return true;
      })
      .map(
        (event): SessionSummary => ({
          id: event.id,
          type: getSessionType(event.eventType.name),
          date: event.startDate,
          title: event.eventType.name,
          subtitle: event.description,
          status: getStatus(event.situation),
        }),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events, activeTab, statusFilters]);

  const handleTabChange = (tab: SessionType) => {
    setActiveTab(tab);
  };

  const handleNavigation = (session: SessionSummary) => {
    // Route to test2 for solene, test3 for deliberativa/geral
    if (session.type === "solene") {
      router.push(`/commisions2/${session.id}`);
    } else {
      router.push(`/commisions3/${session.id}`);
    }
  };

  const toggleStatusFilter = (status: keyof typeof statusFilters) => {
    setStatusFilters((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-6 font-sans text-[#1a1d1f]">
      <div className="mx-auto space-y-8">
        {/* --- CABEÇALHO --- */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold text-[#1a1d1f]">
            Acompanhe as Sessões
          </h1>
          <p className="text-gray-700">
            Selecione o tipo de sessão e utilize os filtros para refinar sua
            busca.
          </p>
          <div className="mt-4 flex w-fit flex-col gap-2 rounded-lg border border-gray-300 bg-white p-1 sm:flex-row">
            {(["solene", "deliberativa", "geral"] as SessionType[]).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => handleTabChange(type)}
                  className={`rounded-md px-6 py-2 text-sm font-medium capitalize transition-all duration-200 ${
                    activeTab === type
                      ? "bg-[#749c5b] text-white shadow-sm"
                      : "text-[#6f767e] hover:bg-gray-50 hover:text-[#749c5b]"
                  }`}
                >
                  {type === "geral" ? "Comissões Gerais" : `Sessões ${type}s`}
                </button>
              ),
            )}
          </div>
        </div>

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
            ) : filteredSessions.length > 0 ? (
              <div className="min-h-[400px] space-y-4">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-[#749c5b]/30 hover:shadow-md"
                  >
                    {/* Barra decorativa lateral */}
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#749c5b] opacity-0 transition-opacity group-hover:opacity-100" />

                    <div className="flex flex-col justify-between gap-4 pl-2 sm:flex-row">
                      <div className="flex-1">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="rounded border border-gray-200 bg-[#f4f4f4] px-2 py-1 text-xs font-bold text-[#1a1d1f] uppercase">
                            {format(new Date(session.date), "dd MMM yyyy", {
                              locale: ptBR,
                            })}
                          </span>
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${
                              session.status === "realizada"
                                ? "bg-gray-100 text-gray-600"
                                : session.status === "cancelada"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-[#749c5b]/10 text-[#749c5b]"
                            }`}
                          >
                            {session.status === "realizada"
                              ? "Realizada"
                              : session.status === "cancelada"
                                ? "Cancelada"
                                : "Agendada"}
                          </span>
                        </div>

                        <h3 className="mb-2 text-xl leading-tight font-bold text-[#1a1d1f]">
                          {session.title}
                        </h3>
                        <p className="line-clamp-2 text-sm leading-relaxed text-[#6f767e]">
                          {session.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center sm:self-center">
                        <button
                          onClick={() => handleNavigation(session)}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-[#1a1d1f] shadow-sm transition-all hover:bg-[#749c5b] hover:text-white sm:h-auto sm:w-auto sm:rounded-lg sm:border-transparent sm:bg-[#1a1d1f] sm:px-4 sm:py-2 sm:text-white"
                        >
                          <ArrowRight size={18} className="sm:mr-2" />
                          <span className="hidden text-sm font-medium sm:inline">
                            Detalhes
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <h3 className="text-lg font-bold text-[#1a1d1f]">
                  Nenhuma sessão encontrada
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-[#6f767e]">
                  Não encontramos resultados para os filtros selecionados. Tente
                  limpar as datas ou trocar a categoria.
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
            {filteredSessions.length > 0 && totalPages > 1 && !loading && (
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="hidden text-sm text-[#6f767e] sm:block">
                  Página{" "}
                  <span className="font-bold text-[#1a1d1f]">
                    {currentPage}
                  </span>{" "}
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
                      // Smart pagination: show first, last, current and surrounding pages
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
      </div>
    </div>
  );
}
