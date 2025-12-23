"use client";
import {
  EventPropositionProps,
  VoteDetailsProps,
  VotesProps,
} from "@/@types/proposition";
import { useApiContext } from "@/context/ApiContext";
import { cn } from "@/lib/utils";
import * as Progress from "@radix-ui/react-progress";
import * as Tabs from "@radix-ui/react-tabs";
import {
  BarChart3,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  FileText,
  Info,
  MapPin,
  Mic2,
  Search,
  Users,
  Video,
  X,
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
  const [selectedVote, setSelectedVote] = useState<VotesProps | null>(null);
  const [positiveVotesList, setPositiveVotesList] = useState<
    VoteDetailsProps[]
  >([]);
  const [negativeVotesList, setNegativeVotesList] = useState<
    VoteDetailsProps[]
  >([]);
  const [loadingPositiveVotes, setLoadingPositiveVotes] = useState(false);
  const [loadingNegativeVotes, setLoadingNegativeVotes] = useState(false);
  const [positiveVotesPage, setPositiveVotesPage] = useState(1);
  const [negativeVotesPage, setNegativeVotesPage] = useState(1);
  const [positiveVotesPages, setPositiveVotesPages] = useState(1);
  const [negativeVotesPages, setNegativeVotesPages] = useState(1);
  const [positiveVotesSearch, setPositiveVotesSearch] = useState("");
  const [negativeVotesSearch, setNegativeVotesSearch] = useState("");

  const [presenceList, setPresenceList] = useState<PoliticianPresence[]>([]);
  const [loadingPresence, setLoadingPresence] = useState(false);
  const [presencePage, setPresencePage] = useState(1);
  const [presencePages, setPresencePages] = useState(1);
  const [presenceSearch, setPresenceSearch] = useState("");
  const [presenceTotal, setPresenceTotal] = useState(0);

  // Fetch event details from API
  useEffect(() => {
    async function fetchEventDetails() {
      const eventId = pathname.split("/").pop();
      if (!eventId) return;

      setLoading(true);
      const response = await GetAPI(`/event/details/${eventId}`, true);
      console.log("response: ", response);
      if (response.status === 200) {
        setEventDetails(response.body);
        setOrderPropositions(response.body.EventProposition || []);
        setVotesList(response.body.voting || []);
        const politicians = response.body.politicians || [];
        setPresenceList(politicians);
        setPresenceTotal(politicians.length);
        setPresencePages(Math.ceil(politicians.length / 20)); // 20 items per page
      }
      setLoading(false);
    }

    fetchEventDetails();
  }, [pathname]);

  console.log("selectedVote: ", selectedVote);

  // Fetch vote details when a vote is selected
  useEffect(() => {
    async function fetchVoteDetails() {
      if (!selectedVote || selectedVote.totalVotes === 0) return;

      setLoadingPositiveVotes(true);
      setLoadingNegativeVotes(true);

      try {
        const [positiveRes, negativeRes] = await Promise.all([
          GetAPI(
            `/voting-politician/positive/${selectedVote.id}?page=${positiveVotesPage}&query=${positiveVotesSearch}`,
            true,
          ),
          GetAPI(
            `/voting-politician/negative/${selectedVote.id}?page=${negativeVotesPage}&query=${negativeVotesSearch}`,
            true,
          ),
        ]);
        console.log("positiveRes: ", positiveRes);
        console.log("negativeRes: ", negativeRes);
        if (positiveRes.status === 200) {
          setPositiveVotesList(positiveRes.body.votes || []);
          setPositiveVotesPages(positiveRes.body.pages || 1);
        }

        if (negativeRes.status === 200) {
          setNegativeVotesList(negativeRes.body.votes || []);
          setNegativeVotesPages(negativeRes.body.pages || 1);
        }
      } finally {
        setLoadingPositiveVotes(false);
        setLoadingNegativeVotes(false);
      }
    }

    fetchVoteDetails();
  }, [
    selectedVote,
    positiveVotesPage,
    negativeVotesPage,
    positiveVotesSearch,
    negativeVotesSearch,
  ]);

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
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-400">
                  <Check size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Nenhuma votação registrada
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Não há votações registradas para este evento.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {votesList.map((vote) => {
                  const isExpanded = selectedVote?.id === vote.id;
                  const isSymbolic = vote.totalVotes === 0;

                  return (
                    <div
                      key={vote.id}
                      className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all"
                    >
                      {/* Vote Header - Always Visible */}
                      <div
                        onClick={() =>
                          setSelectedVote(isExpanded ? null : vote)
                        }
                        className="cursor-pointer p-6 transition-colors hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-[#1a1d1f]">
                              {vote.title || vote.description}
                            </h3>
                            {vote.proposition && (
                              <p className="mt-1 text-sm text-gray-600">
                                {vote.proposition.typeAcronym}{" "}
                                {vote.proposition.number}/
                                {vote.proposition.year}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {/* Votos ou Simbólica */}
                            {isSymbolic ? (
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                                Votação Simbólica
                              </span>
                            ) : (
                              <div className="flex items-center gap-3 text-sm">
                                <span className="rounded-md bg-green-50 px-2 py-1 font-semibold text-green-700">
                                  {vote.positiveVotes} SIM
                                </span>
                                <span className="rounded-md bg-red-50 px-2 py-1 font-semibold text-red-700">
                                  {vote.negativeVotes} NÃO
                                </span>
                              </div>
                            )}
                            {/* Resultado */}
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                vote.result
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {vote.result ? "Aprovado" : "Rejeitado"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                          <Clock size={14} />
                          {moment(vote.date).format("DD/MM/YYYY HH:mm")}
                        </div>
                      </div>

                      {/* Expanded Details - Only when selected and not symbolic */}
                      {isExpanded && !isSymbolic && (
                        <div className="border-t border-gray-100 bg-gray-50 p-6">
                          {/* Detalhes da Votação */}
                          <div className="mb-6 rounded-lg border border-[#749c5b] bg-white p-4">
                            <h4 className="mb-3 font-bold text-[#749c5b]">
                              Detalhes da Votação
                            </h4>
                            <div className="space-y-2 text-sm">
                              {vote.proposition && (
                                <div>
                                  <span className="font-semibold text-[#1a1d1f]">
                                    {vote.proposition.typeAcronym}{" "}
                                    {vote.proposition.number}/
                                    {vote.proposition.year}
                                  </span>
                                  {vote.proposition.description && (
                                    <span className="text-gray-600">
                                      {" "}
                                      - {vote.proposition.description}
                                    </span>
                                  )}
                                </div>
                              )}
                              {vote.description && (
                                <div>
                                  <span className="font-semibold text-gray-700">
                                    Resultado:{" "}
                                  </span>
                                  <span className="text-gray-600">
                                    {vote.description}
                                  </span>
                                </div>
                              )}
                              <div className="pt-2 text-xs text-gray-400">
                                Última atualização:{" "}
                                {moment(vote.date).format("DD/MM/YYYY HH:mm")}
                              </div>
                            </div>
                          </div>

                          {/* Vote Statistics */}
                          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                              {/* Positive Votes Bar */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600">
                                    <Check size={14} className="text-white" />
                                  </div>
                                  <h4 className="text-lg font-bold">
                                    Votos SIM
                                  </h4>
                                </div>
                                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                                  <div
                                    className="h-full bg-green-600 transition-all duration-500"
                                    style={{
                                      width: `${(vote.positiveVotes / vote.totalVotes) * 100}%`,
                                    }}
                                  />
                                </div>
                                <div className="flex items-baseline justify-between">
                                  <span className="text-3xl font-bold text-green-600">
                                    {vote.positiveVotes}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    de {vote.totalVotes} votos
                                  </span>
                                </div>
                              </div>

                              {/* Negative Votes Bar */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600">
                                    <X size={14} className="text-white" />
                                  </div>
                                  <h4 className="text-lg font-bold">
                                    Votos NÃO
                                  </h4>
                                </div>
                                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                                  <div
                                    className="ml-auto h-full bg-red-600 transition-all duration-500"
                                    style={{
                                      width: `${(vote.negativeVotes / vote.totalVotes) * 100}%`,
                                    }}
                                  />
                                </div>
                                <div className="flex items-baseline justify-between">
                                  <span className="text-3xl font-bold text-red-600">
                                    {vote.negativeVotes}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    de {vote.totalVotes} votos
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Lists of Voters */}
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Positive Voters */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-green-700">
                                  Votaram SIM
                                </h4>
                                <div className="relative">
                                  <Search
                                    className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                                    size={14}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={positiveVotesSearch}
                                    onChange={(e) => {
                                      setPositiveVotesSearch(e.target.value);
                                      setPositiveVotesPage(1);
                                    }}
                                    className="w-48 rounded-lg border border-green-200 bg-white py-1 pr-3 pl-8 text-xs focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                                {loadingPositiveVotes ? (
                                  Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className="h-16 animate-pulse rounded-lg bg-gray-200"
                                    />
                                  ))
                                ) : positiveVotesList.length === 0 ? (
                                  <div className="col-span-full py-8 text-center text-sm text-gray-500">
                                    Nenhum voto encontrado
                                  </div>
                                ) : (
                                  positiveVotesList.map((voteDetail) => (
                                    <div
                                      key={voteDetail.id}
                                      className="flex items-center justify-between rounded-lg border border-green-200 bg-white p-3"
                                    >
                                      <div className="flex-1">
                                        <p className="text-sm font-bold text-[#1a1d1f]">
                                          {voteDetail.politician.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {voteDetail.politician.politicalParty}
                                        </p>
                                      </div>
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600">
                                        <Check
                                          size={14}
                                          className="text-white"
                                        />
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                              {positiveVotesPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-2">
                                  <button
                                    onClick={() => setPositiveVotesPage(1)}
                                    disabled={positiveVotesPage === 1}
                                    className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                                  >
                                    <ChevronsLeft size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setPositiveVotesPage((p) =>
                                        Math.max(1, p - 1),
                                      )
                                    }
                                    disabled={positiveVotesPage === 1}
                                    className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                                  >
                                    <ChevronLeft size={14} />
                                  </button>
                                  <span className="text-xs text-gray-600">
                                    {positiveVotesPage} / {positiveVotesPages}
                                  </span>
                                  <button
                                    onClick={() =>
                                      setPositiveVotesPage((p) =>
                                        Math.min(positiveVotesPages, p + 1),
                                      )
                                    }
                                    disabled={
                                      positiveVotesPage === positiveVotesPages
                                    }
                                    className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                                  >
                                    <ChevronRight size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setPositiveVotesPage(positiveVotesPages)
                                    }
                                    disabled={
                                      positiveVotesPage === positiveVotesPages
                                    }
                                    className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                                  >
                                    <ChevronsRight size={14} />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Negative Voters */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-red-700">
                                  Votaram NÃO
                                </h4>
                                <div className="relative">
                                  <Search
                                    className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                                    size={14}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={negativeVotesSearch}
                                    onChange={(e) => {
                                      setNegativeVotesSearch(e.target.value);
                                      setNegativeVotesPage(1);
                                    }}
                                    className="w-48 rounded-lg border border-red-200 bg-white py-1 pr-3 pl-8 text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                                {loadingNegativeVotes ? (
                                  Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className="h-16 animate-pulse rounded-lg bg-gray-200"
                                    />
                                  ))
                                ) : negativeVotesList.length === 0 ? (
                                  <div className="col-span-full py-8 text-center text-sm text-gray-500">
                                    Nenhum voto encontrado
                                  </div>
                                ) : (
                                  negativeVotesList.map((voteDetail) => (
                                    <div
                                      key={voteDetail.id}
                                      className="flex items-center justify-between rounded-lg border border-red-200 bg-white p-3"
                                    >
                                      <div className="flex-1">
                                        <p className="text-sm font-bold text-[#1a1d1f]">
                                          {voteDetail.politician.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {voteDetail.politician.politicalParty}
                                        </p>
                                      </div>
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600">
                                        <X size={14} className="text-white" />
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                              {negativeVotesPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-2">
                                  <button
                                    onClick={() => setNegativeVotesPage(1)}
                                    disabled={negativeVotesPage === 1}
                                    className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                                  >
                                    <ChevronsLeft size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setNegativeVotesPage((p) =>
                                        Math.max(1, p - 1),
                                      )
                                    }
                                    disabled={negativeVotesPage === 1}
                                    className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                                  >
                                    <ChevronLeft size={14} />
                                  </button>
                                  <span className="text-xs text-gray-600">
                                    {negativeVotesPage} / {negativeVotesPages}
                                  </span>
                                  <button
                                    onClick={() =>
                                      setNegativeVotesPage((p) =>
                                        Math.min(negativeVotesPages, p + 1),
                                      )
                                    }
                                    disabled={
                                      negativeVotesPage === negativeVotesPages
                                    }
                                    className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                                  >
                                    <ChevronRight size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setNegativeVotesPage(negativeVotesPages)
                                    }
                                    disabled={
                                      negativeVotesPage === negativeVotesPages
                                    }
                                    className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                                  >
                                    <ChevronsRight size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Message for symbolic votes */}
                      {isExpanded && isSymbolic && (
                        <div className="border-t border-gray-100 bg-gray-50 p-6">
                          {/* Detalhes da Votação */}
                          <div className="mb-4 rounded-lg border border-[#749c5b] bg-white p-4">
                            <h4 className="mb-3 font-bold text-[#749c5b]">
                              Detalhes da Votação
                            </h4>
                            <div className="space-y-2 text-sm">
                              {vote.proposition && (
                                <div>
                                  <span className="font-semibold text-[#1a1d1f]">
                                    {vote.proposition.typeAcronym}{" "}
                                    {vote.proposition.number}/
                                    {vote.proposition.year}
                                  </span>
                                  {vote.proposition.description && (
                                    <span className="text-gray-600">
                                      {" "}
                                      - {vote.proposition.description}
                                    </span>
                                  )}
                                </div>
                              )}
                              {vote.description && (
                                <div>
                                  <span className="font-semibold text-gray-700">
                                    Resultado:{" "}
                                  </span>
                                  <span className="text-gray-600">
                                    {vote.description}
                                  </span>
                                </div>
                              )}
                              <div className="pt-2 text-xs text-gray-400">
                                Última atualização:{" "}
                                {moment(vote.date).format("DD/MM/YYYY HH:mm")}
                              </div>
                            </div>
                          </div>

                          {/* Aviso de votação simbólica */}
                          <div className="rounded-lg bg-blue-50 p-4 text-center">
                            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                              <Info size={20} className="text-blue-600" />
                            </div>
                            <h4 className="font-bold text-blue-900">
                              Votação Simbólica
                            </h4>
                            <p className="mt-1 text-sm text-blue-700">
                              Esta votação foi aprovada simbolicamente, sem
                              registro individual de votos.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Tabs.Content>

          {/* --- CONTEÚDO: PRESENÇAS --- */}
          <Tabs.Content
            value="presence"
            className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500"
          >
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#1a1d1f]">
                    Registro de Presença
                  </h2>
                  <div className="text-sm text-gray-500">
                    {presenceTotal} parlamentares • Página {presencePage} de{" "}
                    {presencePages}
                  </div>
                </div>
                <div className="relative">
                  <Search
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Buscar por nome, partido ou estado..."
                    value={presenceSearch}
                    onChange={(e) => {
                      setPresenceSearch(e.target.value);
                      setPresencePage(1); // Reset to first page on search
                    }}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-4 pl-10 text-sm transition-colors focus:border-[#749c5b] focus:bg-white focus:ring-2 focus:ring-[#749c5b]/20 focus:outline-none"
                  />
                </div>
              </div>

              {loadingPresence ? (
                <div className="flex h-40 items-center justify-center">
                  <span className="animate-pulse text-[#749c5b]">
                    Carregando lista de presença...
                  </span>
                </div>
              ) : (
                (() => {
                  const filteredList = presenceList.filter((p) => {
                    if (!presenceSearch) return true;
                    const searchLower = presenceSearch.toLowerCase();
                    return (
                      p.politician.name.toLowerCase().includes(searchLower) ||
                      p.politician.politicalParty
                        ?.toLowerCase()
                        .includes(searchLower) ||
                      p.politician.state?.toLowerCase().includes(searchLower) ||
                      p.politician.uf?.toLowerCase().includes(searchLower)
                    );
                  });

                  // Empty state: no data at all
                  if (presenceList.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-400">
                          <Users size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700">
                          Nenhuma presença registrada
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                          Não há registros de presença para este evento.
                        </p>
                      </div>
                    );
                  }

                  // Empty state: search with no results
                  if (filteredList.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-400">
                          <Search size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700">
                          Nenhum resultado encontrado
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                          Não encontramos parlamentares com o termo "
                          {presenceSearch}".
                        </p>
                        <button
                          onClick={() => setPresenceSearch("")}
                          className="mt-4 rounded-lg bg-[#749c5b] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#658a4e]"
                        >
                          Limpar busca
                        </button>
                      </div>
                    );
                  }

                  // Normal state: show results
                  return (
                    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {filteredList
                        .slice((presencePage - 1) * 20, presencePage * 20)
                        .map((p) => (
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
                                {p.politician.politicalParty} -{" "}
                                {p.politician.state}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  );
                })()
              )}

              {/* Pagination Controls */}
              {presenceList.length > 0 &&
                presenceList.filter((p) => {
                  if (!presenceSearch) return true;
                  const searchLower = presenceSearch.toLowerCase();
                  return (
                    p.politician.name.toLowerCase().includes(searchLower) ||
                    p.politician.politicalParty
                      ?.toLowerCase()
                      .includes(searchLower) ||
                    p.politician.state?.toLowerCase().includes(searchLower) ||
                    p.politician.uf?.toLowerCase().includes(searchLower)
                  );
                }).length > 0 && (
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
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
