"use client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowRight,
  Calendar as CalendarIcon,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FileText,
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
type MainPlenaryTab = "pauta" | "sessoes";
type SessionType = "solene" | "deliberativa";
type ApiEventType = "SOLEMN" | "DELIBERATIVE";
type SessoesSubView = "hoje" | "resultados";

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
  const [mainTab, setMainTab] = useState<MainPlenaryTab>("sessoes");
  const [sessoesSubView, setSessoesSubView] =
    useState<SessoesSubView>("resultados");
  const [activeTab, setActiveTab] = useState<SessionType>("deliberativa");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventProps[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  // Pauta da semana: próximas sessões (próximos 7 dias)
  const [pautaEvents, setPautaEvents] = useState<EventProps[]>([]);
  const [loadingPauta, setLoadingPauta] = useState(false);

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

  // Helper function to map session type to API type
  const getApiType = (type: SessionType): ApiEventType => {
    switch (type) {
      case "solene":
        return "SOLEMN";
      case "deliberativa":
        return "DELIBERATIVE";
    }
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

  // Fetch events from API (com ou sem filtro de data; ordenado por data no backend)
  async function fetchEvents() {
    setLoading(true);
    let queryParams = `?page=${currentPage}`;

    if (dateRange?.from) {
      const fromStr = moment(dateRange.from).format("YYYY-MM-DD");
      queryParams += `&startDate=${fromStr}`;
      if (dateRange.to) {
        queryParams += `&endDate=${moment(dateRange.to).format("YYYY-MM-DD")}`;
      } else {
        queryParams += `&endDate=${fromStr}`;
      }
    }

    const apiType = getApiType(activeTab);
    const response = await GetAPI(`/event${queryParams}&type=${apiType}`, true);

    if (response.status === 200) {
      setEvents(response.body.events || []);
      setTotalPages(response.body.pages || 0); // Assuming API returns 'pages' for total pages
    }
    setLoading(false);
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchEvents();
  }, [currentPage, dateRange, activeTab]);

  // Pauta da semana: buscar sessões da semana corrente (domingo a sábado)
  useEffect(() => {
    if (mainTab !== "pauta") return;
    async function fetchPautaSemana() {
      setLoadingPauta(true);
      const start = moment().startOf("week").format("YYYY-MM-DD");
      const end = moment().endOf("week").format("YYYY-MM-DD");
      try {
        const [delRes, solRes] = await Promise.all([
          GetAPI(
            `/event?page=1&startDate=${start}&endDate=${end}&type=DELIBERATIVE`,
            true,
          ),
          GetAPI(
            `/event?page=1&startDate=${start}&endDate=${end}&type=SOLEMN`,
            true,
          ),
        ]);
        const delEvents = delRes.status === 200 ? delRes.body.events || [] : [];
        const solEvents = solRes.status === 200 ? solRes.body.events || [] : [];
        const combined = [...delEvents, ...solEvents].sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        );
        setPautaEvents(combined);
      } finally {
        setLoadingPauta(false);
      }
    }
    fetchPautaSemana();
  }, [mainTab]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [dateRange, activeTab]); // statusFilters are client-side only now, or do we want to re-fetch?
  // User asked: "faça a paginaçao somente conter a quantidade total de paginas, que vai vir no body.pages, faça rebuscar toda ves que trocar de tab zerando as pages se trocar de tab"
  // So adding activeTab to dependency of fetchEvents covers the re-fetch.
  // Resetting page on activeTab change is handled here.

  // --- FILTROS ---
  const filteredSessions = useMemo(() => {
    return events
      .filter((event) => {
        const eventStatus = getStatus(event.situation);

        // Filter by status checkboxes
        if (!statusFilters[eventStatus]) return false;

        return true;
      })
      .map(
        (event): SessionSummary => ({
          id: event.id,
          type: activeTab, // Use the active tab to determine the type
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
      router.push(`/plenario/solene/${session.id}`);
    } else {
      // Default fallback for deliberativa
      router.push(`/plenario/deliberativa/${session.id}`);
    }
  };

  const toggleStatusFilter = (status: keyof typeof statusFilters) => {
    setStatusFilters((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  const setFiltroHoje = () => {
    const today = new Date();
    setDateRange({ from: today, to: today });
    setSessoesSubView("hoje");
  };

  const limparFiltros = () => {
    setDateRange(undefined);
    setSessoesSubView("resultados");
  };

  const handlePautaNavigation = (
    id: string,
    type: "deliberativa" | "solene",
  ) => {
    if (type === "solene") router.push(`/plenario/solene/${id}`);
    else router.push(`/plenario/deliberativa/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-6 font-sans text-[#1a1d1f]">
      <div className="mx-auto space-y-8">
        {/* --- CABEÇALHO E ABAS PRINCIPAIS (Pauta | Sessões | Sessão em texto) --- */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold text-[#1a1d1f]">Plenário</h1>
          <p className="mb-4 text-gray-700">
            Acompanhe a pauta da semana, pesquise sessões e acesse o registro em
            texto quando disponível.
          </p>
          <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
            {[
              {
                id: "pauta" as const,
                label: "Pauta da semana",
                icon: FileText,
              },
              { id: "sessoes" as const, label: "Sessões", icon: CalendarIcon },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMainTab(id)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  mainTab === id
                    ? "border-[#749c5b] bg-[#749c5b] text-white"
                    : "border-gray-200 bg-white text-[#6f767e] hover:border-[#749c5b]/50 hover:text-[#749c5b]"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* --- CONTEÚDO: PAUTA DA SEMANA --- */}
        {mainTab === "pauta" && (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-[#1a1d1f]">
              Pauta da semana (Plenário)
            </h2>
            <p className="mb-4 text-sm text-[#6f767e]">
              Próximas sessões nos próximos 7 dias. Clique em &quot;Ver
              detalhes&quot; para pauta completa e votações.
            </p>
            {loadingPauta ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-lg bg-gray-100"
                  />
                ))}
              </div>
            ) : pautaEvents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-[#6f767e]">
                Nenhuma sessão prevista para os próximos 7 dias.
              </div>
            ) : (
              <div className="space-y-3">
                {pautaEvents.map((ev) => {
                  const type: SessionType = ev.eventType?.name
                    ?.toLowerCase()
                    .includes("solene")
                    ? "solene"
                    : "deliberativa";
                  return (
                    <div
                      key={ev.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-100 bg-[#f4f4f4]/50 p-4"
                    >
                      <div>
                        <span className="mr-2 rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-[#1a1d1f]">
                          {format(new Date(ev.startDate), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                        <span className="font-semibold text-[#1a1d1f]">
                          {ev.eventType?.name || ev.description}
                        </span>
                        <p className="mt-1 text-sm text-[#6f767e]">
                          {ev.description}
                        </p>
                        <p className="mt-1 text-xs text-[#6f767e]">
                          Itens principais: consulte o detalhe da sessão.
                        </p>
                      </div>
                      <button
                        onClick={() => handlePautaNavigation(ev.id, type)}
                        className="flex items-center gap-1 rounded-lg bg-[#749c5b] px-4 py-2 text-sm font-medium text-white hover:bg-[#749c5b]/90"
                      >
                        Ver detalhes
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- CONTEÚDO: SESSÕES (lista + filtros) --- */}
        {mainTab === "sessoes" && (
          <>
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full flex-col gap-1 rounded-lg border border-gray-200 bg-gray-50/80 p-1 sm:w-auto sm:flex-row">
                  {[
                    { id: "deliberativa", label: "Sessões Deliberativas" },
                    { id: "solene", label: "Sessões Solenes" },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => handleTabChange(id as SessionType)}
                      className={`flex-1 rounded-md px-6 py-2.5 text-sm font-semibold transition-all duration-200 sm:flex-none ${
                        activeTab === id
                          ? "border border-gray-200/50 bg-white text-[#749c5b] shadow-sm"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <div className="flex w-full flex-1 gap-2 rounded-lg border border-gray-200 bg-gray-50/80 p-1 sm:w-auto">
                    {[
                      { id: "resultados" as const, label: "Todas" },
                      { id: "hoje" as const, label: "Hoje" },
                    ].map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => {
                          setSessoesSubView(id);
                          if (id === "hoje") setFiltroHoje();
                        }}
                        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
                          sessoesSubView === id
                            ? "bg-[#749c5b] text-white shadow-sm"
                            : "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
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
                              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#749c5b] px-4 py-3 text-white shadow-sm transition-all hover:bg-[#749c5b]/90 sm:w-auto sm:py-2"
                            >
                              <span className="text-sm font-medium">
                                Detalhes
                              </span>
                              <ArrowRight size={18} />
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
                      Não encontramos resultados para os filtros selecionados.
                      Tente limpar as datas ou trocar a categoria.
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
                      <span className="font-bold text-[#1a1d1f]">
                        {totalPages}
                      </span>
                    </div>

                    <div className="mx-auto flex items-center gap-2 sm:mx-0">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ChevronLeft size={16} />
                        <span className="hidden sm:inline">Anterior</span>
                      </button>

                      {/* Números de página */}
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(totalPages, 5) },
                          (_, i) => {
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
                          },
                        )}
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

              {/* --- COLUNA DIREITA: SIDEBAR (Pesquisa) --- */}
              <div className="sticky top-6 space-y-6 lg:col-span-1">
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    onClick={limparFiltros}
                    className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50"
                  >
                    <X size={14} />
                    Limpar filtros
                  </button>
                </div>
                {/* 1. PESQUISA - FILTROS DE STATUS */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
                    <h2 className="flex items-center gap-2 font-bold text-[#1a1d1f]">
                      <SlidersHorizontal size={18} className="text-[#749c5b]" />
                      Pesquisa
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
                            {statusFilters.agendada && (
                              <CheckSquare size={10} />
                            )}
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
                            {statusFilters.realizada && (
                              <CheckSquare size={10} />
                            )}
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
                            {statusFilters.cancelada && (
                              <CheckSquare size={10} />
                            )}
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
                        setDateRange(
                          date ? { from: date, to: date } : undefined,
                        )
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
                          {format(dateRange.from, "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
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
          </>
        )}
      </div>
    </div>
  );
}
