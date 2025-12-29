"use client";
import { EventPropositionProps, VotesProps } from "@/@types/proposition";
import { BackButton } from "@/components/v2/components/ui/BackButton";
import { useApiContext } from "@/context/ApiContext";
import { cn } from "@/lib/utils";
import * as Progress from "@radix-ui/react-progress";
import * as Tabs from "@radix-ui/react-tabs";
import {
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Info,
  MapPin,
  Mic2,
  PlayCircle,
  Quote,
  User,
  Users,
  Video,
  Zap,
} from "lucide-react";
import moment from "moment";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// --- MOCK DATA ---

// API Event Details Interface
interface EventDetailsAPI {
  createdAt: string;
  department: {
    id: string;
    name: string;
    surname: string;
  };
  description: string;
  endDate: string | null;
  eventType: {
    acronym: string;
    description: string;
    id: string;
    name: string;
  };
  id: string;
  local: string;
  presences: number;
  propositions: number;
  situation: string;
  startDate: string;
  updatedAt: string;
  uri: string;
  videoUrl: string | null;
}

// Politician/Presence Interface (from API)
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

// 1. Dados da Sessão
const sessionDetails = {
  title: "Sessão Deliberativa Extraordinária",
  description:
    "Votação de pautas prioritárias e medidas provisórias do executivo.",
  date: "2025-12-12",
  startTime: "14:00",
  endTime: "19:30",
  location: "Plenário Ulysses Guimarães",
  status: "em_andamento",
  videoUrl: "#",
  quorum: 412,
  totalPropositions: 15,
};

// 2. Mock Breves Comunicações (NOVA SEÇÃO)
const briefCommStats = {
  startTime: "14:10",
  endTime: "15:00",
  totalSpeakers: 12,
  topThemes: [
    { topic: "Reforma Tributária", count: 8 },
    { topic: "Segurança Pública", count: 5 },
    { topic: "Saúde", count: 3 },
  ],
  polarization: { government: 60, opposition: 40 }, // %
  topParties: [
    { name: "PL", count: 5 },
    { name: "PT", count: 4 },
    { name: "MDB", count: 3 },
  ],
};

const briefCommSpeakers = [
  {
    id: 1,
    name: "Dep. Carlos Silva",
    party: "PL",
    state: "SP",
    timeUsed: "03:00",
    sentiment: "Oposição",
    videoUrl: "#",
    summary:
      "Critica a falta de investimentos em segurança pública no estado de São Paulo.",
    transcription:
      "Senhor Presidente, é inadmissível que continuemos vendo os índices de criminalidade subirem sem uma resposta efetiva do Ministério...",
    highlights: [
      "Indices de criminalidade subirem",
      "Resposta efetiva do Ministério",
    ],
    tags: ["Segurança", "Orçamento"],
  },
  {
    id: 2,
    name: "Dep. Ana Souza",
    party: "PT",
    state: "BA",
    timeUsed: "02:45",
    sentiment: "Governo",
    videoUrl: "#",
    summary:
      "Defende os novos programas de habitação popular lançados pelo governo federal.",
    transcription:
      "Caros colegas, o programa Minha Casa Minha Vida voltou com força total para atender aqueles que mais precisam...",
    highlights: [
      "Minha Casa Minha Vida voltou",
      "Atender aqueles que mais precisam",
    ],
    tags: ["Habitação", "Social"],
  },
];

// --- REMOVED MOCK DATA FOR: orderOfTheDay, votingData, presenceList ---
// These will now be fetched from API

// --- COMPONENTES ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles =
    status === "em_andamento"
      ? "bg-[#749c5b]/20 text-[#749c5b] border-[#749c5b]/30 animate-pulse"
      : "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase ${styles}`}
    >
      {status.replace("_", " ")}
    </span>
  );
};

// Componente de Barra de Progresso Simples
const ProgressBar = ({
  value,
  colorClass,
  label,
}: {
  value: number;
  colorClass: string;
  label?: string;
}) => (
  <div className="w-full">
    {label && (
      <div className="mb-1 flex justify-between text-xs font-medium text-[#6f767e]">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
    )}
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
      <div className={`h-full ${colorClass}`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

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
      if (response.status === 200) {
        const event: EventDetailsAPI = response.body.event;
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

  // Use API data if available, otherwise use mock data
  const displayData = eventDetails
    ? {
        title: eventDetails.eventType.name,
        description: eventDetails.description,
        date: moment(eventDetails.startDate).format("YYYY-MM-DD"),
        startTime: moment(eventDetails.startDate).format("HH:mm"),
        endTime: eventDetails.endDate
          ? moment(eventDetails.endDate).format("HH:mm")
          : sessionDetails.endTime,
        location: eventDetails.local,
        status: eventDetails.situation.toLowerCase().includes("realizada")
          ? "realizada"
          : "em_andamento",
        videoUrl: eventDetails.videoUrl || sessionDetails.videoUrl,
        quorum: eventDetails.presences || sessionDetails.quorum,
        totalPropositions:
          eventDetails.propositions || sessionDetails.totalPropositions,
      }
    : sessionDetails;

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

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-6 font-sans text-[#1a1d1f]">
      <div className="mx-auto space-y-8">
        <BackButton />
        {/* --- 1. CABEÇALHO DA SESSÃO --- */}
        <header className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="p-6 text-[#1a1d1f]">
            {/* Background decorativo sutil */}
            <div className="pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-[#749c5b] opacity-5 blur-3xl"></div>

            <div className="relative z-10 mb-6 flex flex-col items-start justify-between gap-4 md:flex-row">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-[#749c5b] uppercase">
                    <MapPin size={16} />
                    {displayData.location}
                  </div>
                  <StatusBadge status={displayData.status as string} />
                </div>
                <h1 className="text-2xl leading-tight font-bold md:text-4xl">
                  {displayData.title}
                </h1>
                <p className="max-w-2xl text-sm text-gray-400 md:text-base">
                  {displayData.description}
                </p>
              </div>

              {/* Card de Transmissão */}
              <div className="w-full min-w-[280px] rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur-sm md:w-auto">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  <span className="text-xs font-bold tracking-wider uppercase">
                    Ao Vivo
                  </span>
                </div>
                {displayData.videoUrl && (
                  <button className="flex w-full items-center justify-center gap-2 rounded bg-[#749c5b] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#658a4e]">
                    <Video size={16} />
                    Acessar Transmissão
                  </button>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6 md:grid-cols-4 md:gap-8">
              <div>
                <span className="mb-1 block text-xs text-gray-400 uppercase">
                  Data
                </span>
                <span className="flex items-center gap-2 font-semibold">
                  <Calendar size={16} className="text-[#749c5b]" />
                  {new Date(displayData.date).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div>
                <span className="mb-1 block text-xs text-gray-400 uppercase">
                  Horário
                </span>
                <span className="flex items-center gap-2 font-semibold">
                  <Clock size={16} className="text-[#749c5b]" />
                  {displayData.startTime} - {displayData.endTime}
                </span>
              </div>
              <div>
                <span className="mb-1 block text-xs text-gray-400 uppercase">
                  Quórum Atual
                </span>
                <span className="flex items-center gap-2 font-semibold">
                  <Users size={16} className="text-[#749c5b]" />
                  {displayData.quorum} Parlamentares
                </span>
              </div>
              <div>
                <span className="mb-1 block text-xs text-gray-400 uppercase">
                  Proposições
                </span>
                <span className="flex items-center gap-2 font-semibold">
                  <FileText size={16} className="text-[#749c5b]" />
                  {displayData.totalPropositions} Itens
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
              { id: "brief_comm", label: "Breves Comunicações", icon: Mic2 }, // NOVA ABA
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
                  <span className="ml-auto rounded-full border border-orange-300 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700 uppercase">
                    Placeholder
                  </span>
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-[#6f767e]">
                  Esta sessão tem como objetivo principal a deliberação sobre
                  matérias de cunho econômico e administrativo. Destaque para a
                  votação do Marco Legal do Hidrogênio Verde.
                </p>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Status da Pauta</span>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-orange-300 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700 uppercase">
                        Placeholder
                      </span>
                      <span className="text-[#749c5b]">30% Concluído</span>
                    </div>
                  </div>
                  <Progress.Root
                    className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200"
                    value={30}
                  >
                    <Progress.Indicator className="h-full w-[30%] bg-[#749c5b]" />
                  </Progress.Root>
                </div>
              </div>
              {/* Outros cards de visão geral poderiam ir aqui */}
              <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-[#749c5b] p-6 text-white shadow-sm">
                <Quote
                  className="absolute top-4 right-4 text-white/20"
                  size={60}
                />
                <span className="absolute top-4 right-4 rounded-full border border-orange-300 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700 uppercase">
                  Placeholder
                </span>
                <div>
                  <h3 className="mb-2 text-xl font-bold">Destaque do Dia</h3>
                  <p className="text-sm text-white/90">
                    "A aprovação desta matéria é fundamental para a transição
                    energética do país."
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                  <User size={16} />
                  Presidente da Mesa
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* --- CONTEÚDO: BREVES COMUNICAÇÕES (NOVA IMPLEMENTAÇÃO) --- */}
          <Tabs.Content
            value="brief_comm"
            className="animate-in fade-in slide-in-from-bottom-2 relative space-y-6 duration-500"
          >
            {/* PLACEHOLDER BANNER */}
            <div className="sticky top-0 z-20 mb-4 flex items-center justify-center gap-3 rounded-lg border-2 border-orange-400 bg-orange-100 p-4">
              <Info size={20} className="text-orange-700" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-orange-900 uppercase">
                  ⚠️ PLACEHOLDER - Dados Fictícios
                </span>
                <span className="text-xs text-orange-800">
                  API endpoint para Breves Comunicações não está disponível
                  ainda
                </span>
              </div>
            </div>
            {/* Header do Bloco */}
            <div className="flex flex-col items-end justify-between rounded-xl border-l-4 border-[#749c5b] bg-white p-6 shadow-sm md:flex-row">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-[#1a1d1f]">
                  <Mic2 className="text-[#749c5b]" /> Breves Comunicações
                </h2>
                <p className="mt-1 text-sm text-[#6f767e]">
                  Período destinado a discursos livres antes da Ordem do Dia.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm font-medium md:mt-0">
                <div className="flex items-center gap-1 rounded bg-gray-100 px-3 py-1 text-[#1a1d1f]">
                  <Clock size={14} className="text-[#749c5b]" />
                  {briefCommStats.startTime} - {briefCommStats.endTime}
                </div>
                <div className="flex items-center gap-1 rounded bg-gray-100 px-3 py-1 text-[#1a1d1f]">
                  <User size={14} className="text-[#749c5b]" />
                  {briefCommStats.totalSpeakers} Oradores
                </div>
              </div>
            </div>

            {/* PAINEL DE INTELIGÊNCIA (Analytics) */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Card 1: Temas */}
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#6f767e] uppercase">
                  <Zap size={14} /> Temas em Alta (IA)
                </h3>
                <div className="space-y-3">
                  {briefCommStats.topThemes.map((theme, idx) => (
                    <div
                      key={idx}
                      className="group flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-[#1a1d1f] transition-colors group-hover:text-[#749c5b]">
                        {theme.topic}
                      </span>
                      <span className="rounded-full bg-[#749c5b]/10 px-2 py-0.5 text-xs font-bold text-[#749c5b]">
                        {theme.count} discursos
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Polarização */}
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#6f767e] uppercase">
                  <BarChart3 size={14} /> Polarização do Debate
                </h3>
                <div className="flex h-full flex-col justify-center pb-4">
                  <div className="mb-2 flex justify-between text-xs font-bold">
                    <span className="text-blue-600">
                      Governo ({briefCommStats.polarization.government}%)
                    </span>
                    <span className="text-red-600">
                      Oposição ({briefCommStats.polarization.opposition}%)
                    </span>
                  </div>
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${briefCommStats.polarization.government}%`,
                      }}
                    />
                    <div
                      className="h-full bg-red-500"
                      style={{
                        width: `${briefCommStats.polarization.opposition}%`,
                      }}
                    />
                  </div>
                  <p className="mt-3 text-center text-xs text-[#6f767e]">
                    Análise de sentimento baseada nas transcrições via IA.
                  </p>
                </div>
              </div>

              {/* Card 3: Bancadas */}
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#6f767e] uppercase">
                  <Users size={14} /> Bancadas Ativas
                </h3>
                <div className="space-y-2">
                  {briefCommStats.topParties.map((party, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-8 text-xs font-bold">
                        {party.name}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full bg-[#1a1d1f]"
                          style={{ width: `${(party.count / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#6f767e]">
                        {party.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* LISTA DE DISCURSOS & IA */}
            <div className="space-y-4">
              <h3 className="mt-4 text-lg font-bold text-[#1a1d1f]">
                Fila de Oradores e Inteligência
              </h3>

              {briefCommSpeakers.map((speaker) => (
                <div
                  key={speaker.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Header do Card */}
                  <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-100 bg-gray-50/50 p-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-[#6f767e]">
                        <User size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1a1d1f]">
                          {speaker.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-[#6f767e]">
                          <span className="rounded border bg-white px-1 font-semibold">
                            {speaker.party}-{speaker.state}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> {speaker.timeUsed}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full items-center gap-2 md:w-auto">
                      <span
                        className={`rounded px-2 py-1 text-xs font-bold uppercase ${
                          speaker.sentiment === "Governo"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {speaker.sentiment}
                      </span>
                      <button className="flex flex-1 items-center justify-center gap-2 rounded bg-[#1a1d1f] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-black md:flex-none">
                        <PlayCircle size={14} /> Ouvir Trecho
                      </button>
                    </div>
                  </div>

                  {/* Conteúdo IA */}
                  <div className="grid grid-cols-1 gap-6 p-4 md:p-6 lg:grid-cols-3">
                    {/* Coluna 1: Resumo e Tags */}
                    <div className="space-y-4 lg:col-span-1">
                      <div>
                        <span className="mb-2 block text-xs font-bold tracking-wider text-[#749c5b] uppercase">
                          Resumo IA
                        </span>
                        <p className="rounded-lg border border-gray-100 bg-[#f4f4f4] p-3 text-sm text-[#1a1d1f] italic">
                          "{speaker.summary}"
                        </p>
                      </div>
                      <div>
                        <span className="mb-2 block text-xs font-bold tracking-wider text-[#6f767e] uppercase">
                          Tags
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {speaker.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-gray-200 bg-gray-100 px-2 py-1 text-xs text-gray-600"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Coluna 2: Transcrição e Destaques */}
                    <div className="space-y-4 lg:col-span-2">
                      <div>
                        <span className="mb-2 flex items-center gap-2 text-xs font-bold tracking-wider text-[#1a1d1f] uppercase">
                          <Quote size={12} /> Frases em Destaque
                        </span>
                        <div className="grid gap-2">
                          {speaker.highlights.map((highlight, i) => (
                            <div
                              key={i}
                              className="group flex cursor-default items-start gap-3 rounded border-l-2 border-transparent p-2 transition-colors hover:border-yellow-400 hover:bg-yellow-50"
                            >
                              <Quote
                                size={14}
                                className="mt-1 shrink-0 text-gray-300 group-hover:text-yellow-500"
                              />
                              <p className="text-sm font-medium text-gray-700">
                                "{highlight}"
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Transcrição Colapsável (Mock visual) */}
                      <details className="group">
                        <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-bold text-[#749c5b] hover:underline">
                          <ChevronDown
                            size={14}
                            className="group-open:hidden"
                          />
                          <ChevronUp
                            size={14}
                            className="hidden group-open:block"
                          />
                          Ver Transcrição Completa
                        </summary>
                        <div className="mt-3 border-l-2 border-gray-100 pl-4 text-sm leading-relaxed text-[#6f767e]">
                          {speaker.transcription}
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Tabs.Content>

          {/* --- CONTEÚDO: ORDEM DO DIA --- */}
          <Tabs.Content
            value="order_day"
            className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500"
          >
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 p-6">
                <h2 className="text-xl font-bold text-[#1a1d1f]">
                  Ordem do Dia - Pauta de Votação
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
                            <a
                              href={item.proposition.url}
                              target="_blank"
                              className="font-medium text-[#749c5b] hover:underline"
                            >
                              Acessar
                            </a>
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
              <div className="flex h-40 items-center justify-center rounded-xl border border-gray-100 bg-white">
                <span className="animate-pulse text-[#749c5b]">
                  Carregando votações...
                </span>
              </div>
            ) : votesList.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-500">
                Nenhuma votação encontrada para este evento.
              </div>
            ) : (
              votesList.map((vote) => (
                <div
                  key={vote.id}
                  className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="mb-6 flex items-start justify-between">
                    <h3 className="text-lg font-bold text-[#1a1d1f]">
                      {vote.title ||
                        `Votação ${vote.proposition.typeAcronym} ${vote.proposition.number}/${vote.proposition.year}`}
                    </h3>
                    <span
                      className={cn(
                        "rounded px-3 py-1 text-xs font-bold uppercase",
                        vote.result
                          ? "bg-[#749c5b] text-white"
                          : "bg-red-500 text-white",
                      )}
                    >
                      {vote.result ? "Aprovado" : "Não Aprovada"}
                    </span>
                  </div>

                  {vote.totalVotes === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                      <span className="text-sm font-medium text-gray-600">
                        Votação Simbólica
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Placar Visual */}
                      <div className="mb-6 flex items-center gap-4">
                        {/* SIM */}
                        <div className="flex-1 rounded-lg border border-green-100 bg-green-50 p-4 text-center">
                          <span className="block text-3xl font-bold text-green-700">
                            {vote.positiveVotes}
                          </span>
                          <span className="text-xs font-bold text-green-800 uppercase">
                            Sim
                          </span>
                        </div>
                        {/* NÃO */}
                        <div className="flex-1 rounded-lg border border-red-100 bg-red-50 p-4 text-center">
                          <span className="block text-3xl font-bold text-red-700">
                            {vote.negativeVotes}
                          </span>
                          <span className="text-xs font-bold text-red-800 uppercase">
                            Não
                          </span>
                        </div>
                        {/* TOTAL */}
                        <div className="flex-1 rounded-lg border border-gray-100 bg-gray-50 p-4 text-center">
                          <span className="block text-3xl font-bold text-gray-700">
                            {vote.totalVotes}
                          </span>
                          <span className="text-xs font-bold text-gray-600 uppercase">
                            Total
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="text-sm text-gray-600">
                        <strong>Descrição:</strong> {vote.description}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </Tabs.Content>

          {/* --- CONTEÚDO: PRESENÇA --- */}
          <Tabs.Content
            value="presence"
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
                <h2 className="text-xl font-bold text-[#1a1d1f]">
                  Presença de Parlamentares
                </h2>
              </div>

              {loadingPresence ? (
                <div className="flex h-40 items-center justify-center">
                  <span className="animate-pulse text-[#749c5b]">
                    Carregando...
                  </span>
                </div>
              ) : presenceList.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-gray-500">
                  Nenhum registro de presença encontrado.
                </div>
              ) : (
                <>
                  <div className="overflow-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#1a1d1f] text-xs font-semibold text-white uppercase">
                        <tr>
                          <th className="px-6 py-4">Deputado</th>
                          <th className="px-6 py-4 text-center">Partido</th>
                          <th className="px-6 py-4 text-center">Estado</th>
                          <th className="px-6 py-4 text-center">Presença</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {presenceList.map((item) => {
                          const party =
                            item.politician.politicalParty ||
                            item.politician.politicalPartyAcronym ||
                            "-";
                          const state =
                            item.politician.state || item.politician.uf || "-";
                          return (
                            <tr
                              key={item.id}
                              className="transition-colors hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 font-medium">
                                {item.politician.name}
                              </td>
                              <td className="px-6 py-4 text-center">{party}</td>
                              <td className="px-6 py-4 text-center">{state}</td>
                              <td className="px-6 py-4 text-center">
                                <span className="rounded bg-[#749c5b]/20 px-2 py-1 text-xs font-bold text-[#749c5b] uppercase">
                                  Sim
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {presencePages > 1 && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          setPresencePage((p) => Math.max(p - 1, 1))
                        }
                        disabled={presencePage === 1}
                        className={cn(
                          "rounded border border-[#749c5b] px-3 py-1 text-sm font-medium text-[#749c5b]",
                          presencePage === 1 && "cursor-not-allowed opacity-50",
                        )}
                      >
                        Anterior
                      </button>
                      <span className="text-sm text-gray-600">
                        Página {presencePage} de {presencePages}
                      </span>
                      <button
                        onClick={() =>
                          setPresencePage((p) => Math.min(p + 1, presencePages))
                        }
                        disabled={presencePage === presencePages}
                        className={cn(
                          "rounded border border-[#749c5b] px-3 py-1 text-sm font-medium text-[#749c5b]",
                          presencePage === presencePages &&
                            "cursor-not-allowed opacity-50",
                        )}
                      >
                        Próxima
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
