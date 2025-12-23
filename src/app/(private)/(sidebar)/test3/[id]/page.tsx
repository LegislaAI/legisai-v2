"use client";
import { EventPropositionProps, VotesProps } from "@/@types/proposition";
import { useApiContext } from "@/context/ApiContext";
import { cn } from "@/lib/utils";
import * as Progress from "@radix-ui/react-progress";
import * as Tabs from "@radix-ui/react-tabs";
import {
  BarChart3,
  Calendar,
  Check,
  Clock,
  FileText,
  Info,
  MapPin,
  Mic2,
  Users,
  Video,
} from "lucide-react";
import moment from "moment";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// --- INTERFACES MATCHING API ---

interface Department {
  id: string;
  name: string;
  surname: string;
}

interface EventType {
  id: string;
  name: string;
  acronym: string;
  description: string;
}

interface EventPolitician {
  id: string;
  politician: {
    id: string;
    name: string;
    politicalParty: string;
    urlFoto?: string;
  };
}

interface EventProposition {
  id: string;
  title: string;
  topic?: string;
  proposition?: {
    id: string;
    number: number;
    year: number;
    typeAcronym: string;
  };
}

// Full Event Details from /event/details/:id
interface EventDetailsAPI {
  id: string;
  uri: string;
  startDate: string;
  endDate: string | null;
  situation: string;
  description: string;
  local: string | null;
  videoUrl: string | null;
  eventType: EventType;
  department: Department;
  politicians: EventPolitician[]; // For Quorum
  EventProposition: EventProposition[]; // For Total Propositions
}

// Politician/Presence Interface (for Presence Tab)
interface PoliticianPresence {
  id: string;
  eventId: string;
  presence?: "Sim" | "Não" | boolean;
  politician: {
    id: string;
    name: string;
    politicalParty?: string;
    politicalPartyAcronym?: string;
    state?: string;
    uf?: string;
  };
}

// --- MOCK DATA FOR "ORDEM DO DIA" CLASSIC VIEW UX ---
const MOCK_ORDER_INDEX = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  status: i < 3 ? "ja_apreciado" : i === 3 ? "em_apreciacao" : "nao_apreciado",
  relatorPresente: i === 3 || i === 4,
}));

const MOCK_PROPOSITION_CARDS = [
  { label: "PDL 167/2025", status: "nao_apreciado" },
  { label: "PL 331/2020", status: "nao_apreciado" },
  { label: "PLP 453/2017", status: "nao_apreciado" },
  { label: "PL 2664/2003", status: "nao_apreciado" },
  { label: "PL 2829/2025", status: "em_apreciacao" }, // Active
  { label: "PL 4333/2025", status: "nao_apreciado" },
  { label: "REQ 4635/2025", status: "nao_apreciado" },
  { label: "REQ 5097/2025", status: "ja_apreciado" },
];

// --- COMPONENTES AUXILIARES ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles =
    status.toLowerCase() === "em andamento" ||
    status.toLowerCase().includes("em andamento")
      ? "bg-[#749c5b]/20 text-[#749c5b] border-[#749c5b]/30 animate-pulse"
      : "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase ${styles}`}
    >
      {status}
    </span>
  );
};

export default function DeliberativeSessionScreen() {
  const pathname = usePathname();
  const { GetAPI } = useApiContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [eventDetails, setEventDetails] = useState<EventDetailsAPI | null>(
    null,
  );

  // API state for Order of Day, Voting, and Presence
  const [orderPropositions, setOrderPropositions] = useState<
    EventPropositionProps[]
  >([]);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const [votesList, setVotesList] = useState<VotesProps[]>([]);
  const [loadingVotes, setLoadingVotes] = useState(false);

  const [presenceList, setPresenceList] = useState<PoliticianPresence[]>([]);
  const [loadingPresence, setLoadingPresence] = useState(false);
  const [presencePage, setPresencePage] = useState(1);
  const [presencePages, setPresencePages] = useState(1);

  // Fetch event details from API
  useEffect(() => {
    async function fetchEventDetails() {
      const eventId = pathname.split("/").pop();
      if (!eventId) return;

      setLoading(true);
      const response = await GetAPI(`/event/details/${eventId}`, true);
      console.log("response: ", response);
      if (response.status === 200) {
        const event: EventDetailsAPI = response.body; // Adjusted based on backend response structure (body.event)
        setEventDetails(event);
      }
      setLoading(false);
    }

    fetchEventDetails();
  }, [pathname]);

  // Fetch Order of Day when tab is active
  useEffect(() => {
    if (
      activeTab === "order_day" &&
      !loadingOrder &&
      orderPropositions.length === 0
    ) {
      async function fetchOrderOfDay() {
        const eventId = pathname.split("/").pop();
        if (!eventId) return;

        setLoadingOrder(true);
        const response = await GetAPI(`/event-proposition/${eventId}`, true);
        if (response.status === 200) {
          setOrderPropositions(response.body.propositions || []);
        }
        setLoadingOrder(false);
      }
      fetchOrderOfDay();
    }
  }, [activeTab, pathname]);

  // Fetch Voting when tab is active
  useEffect(() => {
    if (activeTab === "voting" && !loadingVotes && votesList.length === 0) {
      async function fetchVotes() {
        const eventId = pathname.split("/").pop();
        if (!eventId) return;

        setLoadingVotes(true);
        const response = await GetAPI(`/voting/${eventId}`, true);
        if (response.status === 200) {
          setVotesList(response.body.voting || []);
        }
        setLoadingVotes(false);
      }
      fetchVotes();
    }
  }, [activeTab, pathname]);

  // Fetch Presence when tab is active
  useEffect(() => {
    if (activeTab === "presence") {
      async function fetchPresence() {
        const eventId = pathname.split("/").pop();
        if (!eventId) return;

        setLoadingPresence(true);
        const response = await GetAPI(
          `/event-politician/${eventId}?page=${presencePage}`,
          true,
        );
        if (response.status === 200) {
          setPresenceList(response.body.politicians || []);
          setPresencePages(response.body.pages || 1);
        }
        setLoadingPresence(false);
      }
      fetchPresence();
    }
  }, [activeTab, presencePage, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] p-6 font-sans text-[#1a1d1f]">
        <div className="mx-auto space-y-8">
          <div className="h-64 w-full animate-pulse rounded-xl bg-gray-200" />
          <div className="h-16 w-full animate-pulse rounded-xl bg-gray-200" />
          <div className="h-96 w-full animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  // Derived Values
  const quorumCount = eventDetails?.politicians?.length || 0;
  const propCount = eventDetails?.EventProposition?.length || 0;

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-6 font-sans text-[#1a1d1f]">
      <div className="mx-auto space-y-8">
        {/* --- 1. CABEÇALHO DA SESSÃO (DADOS REAIS DA API) --- */}
        <header className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="relative p-6 text-[#1a1d1f]">
            {/* Background decorativo sutil */}
            <div className="pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-[#749c5b] opacity-5 blur-3xl"></div>

            <div className="relative z-10 mb-6 flex flex-col items-start justify-between gap-4 md:flex-row">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-[#749c5b] uppercase">
                    <MapPin size={16} />
                    {eventDetails?.local || "Local não informado"}
                  </div>
                  <StatusBadge status={eventDetails?.situation || ""} />
                </div>
                <h1 className="text-2xl leading-tight font-bold md:text-4xl">
                  {eventDetails?.description || eventDetails?.eventType.name}
                </h1>
                <p className="max-w-2xl text-sm text-gray-400 md:text-base">
                  {eventDetails?.eventType.description}
                </p>
              </div>

              {/* Card de Transmissão */}
              <div className="w-full min-w-[280px] rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur-sm md:w-auto">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  <span className="text-xs font-bold tracking-wider uppercase">
                    Status
                  </span>
                </div>
                {eventDetails?.videoUrl ? (
                  <a
                    href={eventDetails?.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded bg-[#749c5b] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#658a4e]"
                  >
                    <Video size={16} />
                    Acessar Transmissão
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-500"
                  >
                    <Video size={16} />
                    Sem Transmissão
                  </button>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 md:grid-cols-4 md:gap-8">
              <div>
                <span className="mb-1 block text-xs text-gray-400 uppercase">
                  Data
                </span>
                <span className="flex items-center gap-2 font-semibold">
                  <Calendar size={16} className="text-[#749c5b]" />
                  {moment(eventDetails?.startDate).format("DD/MM/YYYY")}
                </span>
              </div>
              <div>
                <span className="mb-1 block text-xs text-gray-400 uppercase">
                  Horário
                </span>
                <span className="flex items-center gap-2 font-semibold">
                  <Clock size={16} className="text-[#749c5b]" />
                  {moment(eventDetails?.startDate).utc().format("HH:mm")}
                  {eventDetails?.endDate &&
                    ` - ${moment(eventDetails?.endDate).utc().format("HH:mm")}`}
                </span>
              </div>
              <div>
                <span className="mb-1 block text-xs text-gray-400 uppercase">
                  Quórum (Lista)
                </span>
                <span className="flex items-center gap-2 font-semibold">
                  <Users size={16} className="text-[#749c5b]" />
                  {quorumCount} Parlamentares
                </span>
              </div>
              <div>
                <span className="mb-1 block text-xs text-gray-400 uppercase">
                  Proposições
                </span>
                <span className="flex items-center gap-2 font-semibold">
                  <FileText size={16} className="text-[#749c5b]" />
                  {propCount} Itens
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* --- 2. NAVEGAÇÃO DE ABAS --- */}
        <Tabs.Root
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <Tabs.List className="scrollbar-hide mb-6 flex flex-nowrap gap-2 overflow-x-auto border-b border-gray-200 pb-1">
            {[
              { id: "overview", label: "Visão Geral", icon: BarChart3 },
              { id: "brief_comm", label: "Breves Comunicações", icon: Mic2 },
              { id: "order_day", label: "Ordem do Dia", icon: FileText },
              { id: "voting", label: "Votação", icon: Check },
              { id: "presence", label: "Presenças", icon: Users },
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

          {/* --- CONTEÚDO: VISÃO GERAL --- */}
          <Tabs.Content
            value="overview"
            className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#1a1d1f]">
                  <Info className="text-[#749c5b]" size={20} /> Resumo da Pauta
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-[#6f767e]">
                  {/* Fallback description generated from event type */}
                  Sessão do tipo {eventDetails?.eventType.name} realizada no{" "}
                  {eventDetails?.local}. Consulte a aba &quot;Ordem do Dia&quot;
                  para ver os itens em pauta.
                </p>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Progresso da Sessão</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#749c5b]">
                        {eventDetails?.endDate ? "100%" : "Em andamento"}
                      </span>
                    </div>
                  </div>
                  <Progress.Root
                    className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200"
                    value={eventDetails?.endDate ? 100 : 50}
                  >
                    <Progress.Indicator
                      className="h-full bg-[#749c5b] transition-all duration-500"
                      style={{
                        width: `${eventDetails?.endDate ? 100 : 50}%`,
                      }}
                    />
                  </Progress.Root>
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* --- CONTEÚDO: BREVES COMUNICAÇÕES (DATA UNAVAILABLE) --- */}
          <Tabs.Content
            value="brief_comm"
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-400">
                <Mic2 size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">
                Dados não disponíveis
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                As informações detalhadas sobre os oradores de Pequeno e Grande
                Expediente não estão disponíveis na API para esta sessão.
              </p>
            </div>
          </Tabs.Content>

          {/* --- CONTEÚDO: ORDEM DO DIA (NEW CLASSIC VIEW + TABLE) --- */}
          <Tabs.Content
            value="order_day"
            className="animate-in fade-in slide-in-from-bottom-2 space-y-8 duration-500"
          >
            {/* 1. SEÇÃO CLÁSSICA (MOCK UX VALIDATION) */}
            <div className="space-y-6">
              {/* Box 1: Índice Numérico */}
              <div className="rounded-xl border border-gray-100 bg-[#fefcf8] p-6 shadow-sm">
                <h3 className="mb-4 flex items-center justify-between border-b border-gray-200 pb-2 font-serif text-lg font-bold text-[#1a1d1f]">
                  <span>1. Índice Numérico</span>
                  <span className="font-sans text-xs font-normal tracking-wide text-gray-400 uppercase">
                    Padrão Câmara
                  </span>
                </h3>

                {/* Scroll Horizontal de Números */}
                <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
                  {MOCK_ORDER_INDEX.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "group relative flex h-12 w-12 flex-shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border font-bold transition-all",
                        item.status === "ja_apreciado"
                          ? "border-[#3e5f48] bg-[#3e5f48] text-white" // Greenish
                          : item.status === "em_apreciacao" && item.id === 4 // Highlight active
                            ? "scale-110 border-[#d4a017] bg-[#d4a017] text-white shadow-md" // Yellow/Gold
                            : "border-[#4a6b7c] bg-[#4a6b7c] text-white hover:bg-[#3b5563]", // Blueish/Gray
                      )}
                    >
                      <span className="text-lg">{item.id}</span>

                      {/* Ícone de Relator Presente */}
                      {item.relatorPresente && (
                        <div className="absolute right-1/2 -bottom-2 translate-x-1/2 rounded-full bg-white p-0.5 shadow-sm">
                          <Users size={10} className="text-[#3e5f48]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Legenda */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-[#4a6b7c]"></div>
                    <span>não apreciado</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-[#d4a017]"></div>
                    <span>em apreciação</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-[#3e5f48]"></div>
                    <span>já apreciado</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-gray-500" />
                    <span>relator presente</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Índice por Proposição e Matéria sobre a mesa */}
              <div className="rounded-xl border border-gray-100 bg-[#fefcf8] p-6 shadow-sm">
                <h3 className="mb-4 flex items-center justify-between border-b border-gray-200 pb-2 font-serif text-lg font-bold text-[#1a1d1f]">
                  <span>2. Índice por Proposição</span>
                </h3>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {MOCK_PROPOSITION_CARDS.map((prop, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "cursor-pointer rounded-md border px-3 py-2 text-center text-sm font-bold shadow-sm transition-colors",
                        prop.status === "em_apreciacao"
                          ? "border-[#3e5f48] bg-[#3e5f48] text-white" // As per screenshot logic
                          : "border-[#355e6c] bg-[#355e6c] text-white hover:opacity-90",
                      )}
                    >
                      {prop.label}
                    </div>
                  ))}
                </div>

                {/* Matéria Sobre a Mesa (Active Item) */}
                <div className="mt-6 overflow-hidden rounded-lg border border-[#3e5f48] bg-[#eef5f0]">
                  <div className="bg-[#3e5f48] px-4 py-2 text-center text-sm font-bold tracking-wider text-white uppercase">
                    Matéria Sobre a Mesa
                  </div>
                  <div className="space-y-3 p-4">
                    <h4 className="text-md font-bold text-[#1a1d1f] underline decoration-gray-300 underline-offset-4">
                      PROJETO DE LEI Nº 2829/2025
                    </h4>
                    <p className="text-sm leading-relaxed text-gray-700">
                      Dispõe sobre as diretrizes para a elaboração da Lei
                      Orçamentária de 2026 e dá outras providências.
                    </p>
                    <div className="rounded border border-gray-200 bg-white p-3 text-xs text-gray-500 shadow-sm">
                      <span className="mb-1 block font-bold text-gray-700">
                        Parecer da Comissão Mista de Orçamento:
                      </span>
                      Parecer do Relator, Dep. Fulano de Tal, pela aprovação do
                      projeto com emendas.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. TABELA REAL (DADOS DA API) */}
            <div className="mt-8 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 p-6">
                <h2 className="text-xl font-bold text-[#1a1d1f]">
                  Detalhamento da Pauta (Dados Reais)
                </h2>
              </div>
              <div className="overflow-x-auto">
                {loadingOrder ? (
                  <div className="flex h-40 items-center justify-center">
                    <span className="animate-pulse text-[#749c5b]">
                      Carregando...
                    </span>
                  </div>
                ) : orderPropositions.length === 0 ? (
                  <div className="flex h-40 items-center justify-center text-gray-500">
                    Nenhuma proposição encontrada para este evento.
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#1a1d1f] text-xs font-semibold text-white uppercase">
                      <tr>
                        <th className="px-6 py-4">Proposição</th>
                        <th className="px-6 py-4">Tópico</th>
                        <th className="px-6 py-4">Regime</th>
                        <th className="px-6 py-4">Relator</th>
                        <th className="px-6 py-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orderPropositions.map((item) => (
                        <tr
                          key={item.id}
                          className="transition-colors hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-bold whitespace-nowrap text-[#749c5b]">
                            {item.title}
                          </td>
                          <td className="px-6 py-4 text-[#1a1d1f]">
                            {item.topic || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-[#6f767e]">
                            {item.regime || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-[#6f767e]">
                            {item.reporter ? item.reporter.name : "N/A"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-xs font-medium text-[#749c5b] hover:underline">
                              Ver Detalhes
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </Tabs.Content>

          {/* --- CONTEÚDO: VOTAÇÃO --- */}
          <Tabs.Content
            value="voting"
            className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500"
          >
            {loadingVotes ? (
              <div className="flex h-40 items-center justify-center">
                <span className="animate-pulse text-[#749c5b]">
                  Carregando votações...
                </span>
              </div>
            ) : votesList.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-gray-500">
                Nenhuma votação registrada.
              </div>
            ) : (
              votesList.map((vote) => (
                <div
                  key={vote.id}
                  className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-bold text-[#1a1d1f]">
                    {vote.title || vote.description}
                  </h3>
                  <div className="mt-2 flex gap-4">
                    <span
                      className={`text-sm font-bold ${vote.result ? "text-green-600" : "text-red-600"}`}
                    >
                      Resultado: {vote.result ? "Aprovado" : "Rejeitado"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {moment(vote.date).format("DD/MM/YYYY HH:mm")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </Tabs.Content>

          {/* --- CONTEÚDO: PRESENÇAS --- */}
          <Tabs.Content
            value="presence"
            className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500"
          >
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 p-6">
                <h2 className="text-xl font-bold text-[#1a1d1f]">
                  Registro de Presença
                </h2>
                <div className="text-sm text-gray-500">
                  Página {presencePage} de {presencePages}
                </div>
              </div>

              {loadingPresence ? (
                <div className="flex h-40 items-center justify-center">
                  <span className="animate-pulse text-[#749c5b]">
                    Carregando lista de presença...
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {presenceList.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 shadow-sm"
                    >
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                        {/* Placeholder avatar if no image */}
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
              <div className="flex justify-center gap-2 border-t border-gray-100 p-4">
                <button
                  onClick={() =>
                    setPresencePage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={presencePage === 1}
                  className="rounded border border-gray-200 px-3 py-1 text-sm disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() =>
                    setPresencePage((prev) => Math.min(presencePages, prev + 1))
                  }
                  disabled={presencePage === presencePages}
                  className="rounded border border-gray-200 px-3 py-1 text-sm disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
