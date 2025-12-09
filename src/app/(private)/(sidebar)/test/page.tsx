"use client";
import { endOfDay, format, isWithinInterval, startOfDay } from "date-fns";
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
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";

// --- IMPORT SOLICITADO ---
import { Calendar } from "@/components/ui/calendar";
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

// --- MOCK DATA ---
// Adicionei mais itens para garantir que a paginação apareça
const mockSessions: SessionSummary[] = [
  {
    id: "1",
    type: "solene",
    date: "2023-10-25T10:00:00",
    title: "Sessão Solene em Homenagem ao Empreendedorismo",
    subtitle: "Comemoração do Dia Nacional da Micro e Pequena Empresa.",
    status: "realizada",
  },
  {
    id: "2",
    type: "deliberativa",
    date: "2023-10-26T14:00:00",
    title: "Sessão Deliberativa Extraordinária",
    subtitle: "Votação da PL 1234/2023 sobre Energia Renovável.",
    status: "agendada",
  },
  {
    id: "3",
    type: "geral",
    date: "2023-10-27T09:00:00",
    title: "Comissão Geral sobre Segurança Pública",
    subtitle: "Debate com o Ministro da Justiça e especialistas.",
    status: "realizada",
  },
  {
    id: "4",
    type: "solene",
    date: "2023-11-01T10:00:00",
    title: "Sessão Solene - Dia do Médico",
    subtitle: "Homenagem aos profissionais de saúde do Brasil.",
    status: "agendada",
  },
  {
    id: "5",
    type: "solene",
    date: "2023-10-15T15:00:00",
    title: "Sessão Solene - Dia do Professor",
    subtitle: "Entrega de medalhas de mérito educacional.",
    status: "realizada",
  },
  {
    id: "6",
    type: "solene",
    date: "2023-11-05T10:00:00",
    title: "Sessão Solene - 50 Anos da Embrapa",
    subtitle: "Reconhecimento à pesquisa agropecuária.",
    status: "agendada",
  },
  {
    id: "7",
    type: "deliberativa",
    date: "2023-11-06T14:00:00",
    title: "Sessão Deliberativa Ordinária",
    subtitle: "Discussão de pautas trancadas.",
    status: "agendada",
  },
  {
    id: "8",
    type: "solene",
    date: "2023-10-25T10:00:00",
    title: "Sessão Solene em Homenagem ao Empreendedorismo",
    subtitle: "Comemoração do Dia Nacional da Micro e Pequena Empresa.",
    status: "realizada",
  },
  {
    id: "9",
    type: "deliberativa",
    date: "2023-10-26T14:00:00",
    title: "Sessão Deliberativa Extraordinária",
    subtitle: "Votação da PL 1234/2023 sobre Energia Renovável.",
    status: "agendada",
  },
  {
    id: "10",
    type: "geral",
    date: "2023-10-27T09:00:00",
    title: "Comissão Geral sobre Segurança Pública",
    subtitle: "Debate com o Ministro da Justiça e especialistas.",
    status: "realizada",
  },
  {
    id: "11",
    type: "solene",
    date: "2023-11-01T10:00:00",
    title: "Sessão Solene - Dia do Médico",
    subtitle: "Homenagem aos profissionais de saúde do Brasil.",
    status: "agendada",
  },
  {
    id: "12",
    type: "solene",
    date: "2023-10-15T15:00:00",
    title: "Sessão Solene - Dia do Professor",
    subtitle: "Entrega de medalhas de mérito educacional.",
    status: "realizada",
  },
  {
    id: "13",
    type: "solene",
    date: "2023-11-05T10:00:00",
    title: "Sessão Solene - 50 Anos da Embrapa",
    subtitle: "Reconhecimento à pesquisa agropecuária.",
    status: "agendada",
  },
  {
    id: "14",
    type: "deliberativa",
    date: "2023-11-06T14:00:00",
    title: "Sessão Deliberativa Ordinária",
    subtitle: "Discussão de pautas trancadas.",
    status: "agendada",
  },
];

const ITEMS_PER_PAGE = 5; // Reduzi para 4 para forçar a paginação visualmente com poucos dados

export default function SessionListScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SessionType>("solene");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);

  // --- FILTROS ---
  const filteredSessions = useMemo(() => {
    return mockSessions
      .filter((session) => {
        if (session.type !== activeTab) return false;

        if (dateRange?.from) {
          const sessionDate = new Date(session.date);
          const start = startOfDay(dateRange.from);
          const end = dateRange.to
            ? endOfDay(dateRange.to)
            : endOfDay(dateRange.from);
          if (!isWithinInterval(sessionDate, { start, end })) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeTab, dateRange]);

  // --- PAGINAÇÃO ---
  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
  const currentSessions = filteredSessions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleTabChange = (tab: SessionType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setDateRange(undefined); // Opcional: limpar data ao trocar aba
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

        {/* --- ABAS --- */}

        {/* --- GRID LAYOUT --- */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          {/* --- COLUNA ESQUERDA: LISTA --- */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {currentSessions.length > 0 ? (
              <div className="min-h-[400px] space-y-4">
                {" "}
                {/* Altura mínima para evitar pulos layout */}
                {currentSessions.map((session) => (
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
                                : "bg-[#749c5b]/10 text-[#749c5b]"
                            }`}
                          >
                            {session.status === "realizada"
                              ? "Realizada"
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
                          onClick={() => router.push(`/test`)}
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
            {totalPages > 1 && (
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="hidden text-sm text-[#6f767e] sm:block">
                  Mostrando{" "}
                  <span className="font-bold text-[#1a1d1f]">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{" "}
                  a{" "}
                  <span className="font-bold text-[#1a1d1f]">
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredSessions.length,
                    )}
                  </span>{" "}
                  de {filteredSessions.length}
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-all ${
                            currentPage === page
                              ? "bg-[#749c5b] text-white shadow-md shadow-[#749c5b]/20"
                              : "text-[#6f767e] hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ),
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

          {/* --- COLUNA DIREITA: SIDEBAR --- */}
          <div className="sticky top-6 space-y-6 lg:col-span-1">
            {/* 1. MOCK DE FILTROS (LOREM) */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="flex items-center gap-2 font-bold text-[#1a1d1f]">
                  <SlidersHorizontal size={18} className="text-[#749c5b]" />
                  Filtros
                </h2>
              </div>

              <div className="space-y-4">
                {/* Mock Select */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#6f767e] uppercase">
                    Categorias
                  </label>
                  <div className="relative">
                    <select className="w-full appearance-none rounded-lg border border-gray-200 bg-[#f4f4f4] p-2.5 text-sm text-[#1a1d1f] focus:border-[#749c5b] focus:ring-1 focus:ring-[#749c5b] focus:outline-none">
                      <option>Sessões Solenes</option>
                      <option>Sessões Deliberativas</option>
                      <option>Commissões Gerais</option>
                    </select>
                    <ChevronRight
                      className="pointer-events-none absolute top-3 right-3 rotate-90 text-gray-400"
                      size={14}
                    />
                  </div>
                </div>

                {/* Mock Checkboxes */}
                <div>
                  <label className="mb-2 block text-xs font-bold text-[#6f767e] uppercase">
                    Status
                  </label>
                  <div className="space-y-2">
                    <label className="group flex cursor-pointer items-center gap-2">
                      <div className="flex h-4 w-4 items-center justify-center rounded border border-gray-300 transition-colors group-hover:border-[#749c5b]">
                        {/* Fake check */}
                      </div>
                      <span className="text-sm text-[#1a1d1f]">Agendadas</span>
                    </label>
                    <label className="group flex cursor-pointer items-center gap-2">
                      <div className="flex h-4 w-4 items-center justify-center rounded border border-[#749c5b] bg-[#749c5b] text-white">
                        <CheckSquare size={10} />
                      </div>
                      <span className="text-sm font-medium text-[#1a1d1f]">
                        Realizadas
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
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
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
                      Intervalo selecionado:
                    </span>
                    <span className="text-sm font-bold text-[#1a1d1f]">
                      {format(dateRange.from, "dd/MM")}
                      {dateRange.to
                        ? ` - ${format(dateRange.to, "dd/MM/yyyy")}`
                        : ` - ${format(dateRange.from, "dd/MM/yyyy")}`}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-[#6f767e] italic">
                    Selecione uma data ou período
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
