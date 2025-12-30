"use client";
import { VoteDetailsProps } from "@/@types/proposition";
import { BackButton } from "@/components/v2/components/ui/BackButton";
import { useApiContext } from "@/context/ApiContext";
import { cn } from "@/lib/utils";
import * as Tabs from "@radix-ui/react-tabs";
import {
  ArrowUpDown,
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  ExternalLink,
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

interface Department {
  id: string;
  name: string;
  surname: string;
  acronym: string;
  type: string;
  uri: string;
}

interface EventType {
  id: string;
  name: string;
  acronym: string;
  description: string;
  code: string;
}

interface Politician {
  id: string;
  name: string;
  fullName: string;
  email: string;
  imageUrl: string;
  siglaPartido?: string;
  siglaUf?: string;
  politicalParty?: string;
  state?: string;
  uf?: string;
}

interface EventPolitician {
  id: string;
  eventId: string;
  politicianId: string;
  politician: Politician;
}

interface PropositionDetails {
  id: string;
  number: number;
  year: number;
  typeAcronym: string;
  description: string;
  fullPropositionUrl: string;
  presentationDate: string;
  situationId: string;
  situationDescription: string;
  keywords: string;
}

interface EventProposition {
  id: string;
  eventId: string;
  propositionId: string;
  title: string;
  topic: string;
  sequence: number;
  regime: string;
  situation: string;
  situationId: string;
  reporterId: string;
  proposition: PropositionDetails | null;
}

interface EventVoting {
  id: string;
  uri: string;
  title: string;
  description: string;
  date: string;
  result: boolean;
  propositionId: string;
  proposition?: PropositionDetails | null;
  positiveVotes: number;
  negativeVotes: number;
  totalVotes: number;
  otherVotes?: number;
}

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
  politicians: EventPolitician[];
  reporterId: string;

  EventProposition: EventProposition[];
  voting: EventVoting[];
  createdAt: string;
  updatedAt: string;
}

interface BrevesComunicacoesResponse {
  exists: boolean;
  speakers: Array<{
    name: string;
    time: string;
    party?: string;
    speechSummary?: string;
  }>;
  summary: string | null;
  error: string | null;
  processing?: boolean; // True when data is still being collected
}

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
  const [selectedProposition, setSelectedProposition] =
    useState<EventProposition | null>(null);
  const [indexViewMode, setIndexViewMode] = useState<"numeric" | "proposition">(
    "numeric",
  );
  // API state for Order of Day, Voting, and Presence
  const [orderPropositions, setOrderPropositions] = useState<
    EventProposition[]
  >([]);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const [votesList, setVotesList] = useState<EventVoting[]>([]);
  const [loadingVotes, setLoadingVotes] = useState(false);
  const [selectedVote, setSelectedVote] = useState<EventVoting | null>(null);
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
  // Voting section filters
  const [positivePartyFilter, setPositivePartyFilter] = useState("");
  const [positiveStateFilter, setPositiveStateFilter] = useState("");
  const [positiveSortOrder, setPositiveSortOrder] = useState<"asc" | "desc">(
    "asc",
  );
  const [negativePartyFilter, setNegativePartyFilter] = useState("");
  const [negativeStateFilter, setNegativeStateFilter] = useState("");
  const [negativeSortOrder, setNegativeSortOrder] = useState<"asc" | "desc">(
    "asc",
  );

  const [presenceList, setPresenceList] = useState<EventPolitician[]>([]);
  const [loadingPresence, setLoadingPresence] = useState(false);
  const [presencePage, setPresencePage] = useState(1);
  const [presencePages, setPresencePages] = useState(1);
  const [presenceSearch, setPresenceSearch] = useState("");
  const [presenceTotal, setPresenceTotal] = useState(0);
  // Presence section filters
  const [presencePartyFilter, setPresencePartyFilter] = useState("");
  const [presenceStateFilter, setPresenceStateFilter] = useState("");
  const [presenceSortOrder, setPresenceSortOrder] = useState<"asc" | "desc">(
    "asc",
  );

  // Breves Comunicações state
  const [brevesComunicacoes, setBrevesComunicacoes] =
    useState<BrevesComunicacoesResponse | null>(null);
  const [loadingBreves, setLoadingBreves] = useState(false);
  const [expandedSpeakers, setExpandedSpeakers] = useState<Set<number>>(
    new Set(),
  );

  const toggleSpeaker = (index: number) => {
    setExpandedSpeakers((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Fetch event details from API
  useEffect(() => {
    async function fetchEventDetails() {
      const eventId = pathname.split("/").pop();
      if (!eventId) return;

      setLoading(true);
      const response = await GetAPI(`/event/details/${eventId}`, true);
      if (response.status === 200) {
        setEventDetails(response.body);
        setOrderPropositions(response.body.EventProposition || []);
        setVotesList(response.body.voting || []);
      }
      setLoading(false);
    }

    fetchEventDetails();
  }, [pathname]);

  // Fetch presence with server-side filtering
  useEffect(() => {
    async function fetchPresence() {
      const eventId = pathname.split("/").pop();
      if (!eventId) return;

      setLoadingPresence(true);
      const response = await GetAPI(
        `/event-politician/${eventId}/paginated?page=${presencePage}&query=${presenceSearch}&party=${presencePartyFilter}&state=${presenceStateFilter}&sortOrder=${presenceSortOrder}`,
        true,
      );

      if (response.status === 200) {
        setPresenceList(response.body.politicians || []);
        setPresencePages(response.body.pages || 1);
        setPresenceTotal(response.body.total || 0);
      }
      setLoadingPresence(false);
    }

    fetchPresence();
  }, [
    pathname,
    presencePage,
    presenceSearch,
    presencePartyFilter,
    presenceStateFilter,
    presenceSortOrder,
  ]);

  // Fetch Breves Comunicações when tab is active
  useEffect(() => {
    async function fetchBrevesComunicacoes() {
      const eventId = pathname.split("/").pop();
      if (!eventId || activeTab !== "brief_comm" || brevesComunicacoes) return;

      setLoadingBreves(true);
      try {
        const response = await GetAPI(
          `/event/${eventId}/breves-comunicacoes`,
          true,
        );
        if (response.status === 200) {
          setBrevesComunicacoes(response.body);
        }
      } catch (error) {
        // Error fetching breves comunicações
      }
      setLoadingBreves(false);
    }

    fetchBrevesComunicacoes();
  }, [pathname, activeTab]);

  function getCategoriaPorCodigo(codigo?: string): string {
    // Lista de códigos para situações iniciais ou burocráticas
    if (!codigo) return "nao_apreciado";
    const naoApreciado = [
      "901",
      "902",
      "905",
      "906",
      "907",
      "912",
      "917",
      "1010",
      "1030",
      "1110",
      "1170",
      "1180",
      "1185",
      "1200",
      "1201",
      "1210",
      "1220",
      "1221",
      "1223",
      "1290",
      "1291",
      "1312",
      "1381",
    ];

    // Lista de códigos para proposições em trâmite ativo ou aguardando decisão
    const emApreciacao = [
      "900",
      "903",
      "904",
      "910",
      "911",
      "914",
      "915",
      "918",
      "920",
      "921",
      "922",
      "924",
      "925",
      "926",
      "927",
      "928",
      "929",
      "932",
      "933",
      "934",
      "935",
      "936",
      "939",
      "1000",
      "1020",
      "1040",
      "1050",
      "1052",
      "1060",
      "1070",
      "1080",
      "1090",
      "1150",
      "1160",
      "1161",
      "1270",
      "1280",
      "1293",
      "1294",
      "1295",
      "1296",
      "1297",
      "1298",
      "1299",
      "1300",
      "1301",
      "1302",
      "1303",
      "1304",
      "1305",
      "1310",
      "1313",
      "1314",
      "1350",
      "1355",
      "1360",
      "1380",
    ];

    // Lista de códigos para proposições com trâmite finalizado ou arquivado
    const jaApreciado = [
      "923",
      "930",
      "931",
      "937",
      "940",
      "941",
      "950",
      "1120",
      "1140",
      "1222",
      "1230",
      "1250",
      "1260",
      "1285",
      "1292",
    ];

    // 1º If: Verifica se é "Não Apreciado"
    if (naoApreciado.includes(codigo)) {
      return "nao_apreciado";
    }

    // 2º If: Verifica se está "Em Apreciação"
    if (emApreciacao.includes(codigo)) {
      return "em_apreciacao";
    }

    // 3º If: Verifica se "Já Apreciado"
    if (jaApreciado.includes(codigo)) {
      return "ja_apreciado";
    }

    return "Código não categorizado";
  }

  // Fetch vote details when a vote is selected
  useEffect(() => {
    async function fetchVoteDetails() {
      if (!selectedVote || selectedVote.totalVotes === 0) return;

      setLoadingPositiveVotes(true);
      setLoadingNegativeVotes(true);

      try {
        const [positiveRes, negativeRes] = await Promise.all([
          GetAPI(
            `/voting-politician/positive/${selectedVote.id}?page=${positiveVotesPage}&query=${positiveVotesSearch}&party=${positivePartyFilter}&state=${positiveStateFilter}&sortOrder=${positiveSortOrder}`,
            true,
          ),
          GetAPI(
            `/voting-politician/negative/${selectedVote.id}?page=${negativeVotesPage}&query=${negativeVotesSearch}&party=${negativePartyFilter}&state=${negativeStateFilter}&sortOrder=${negativeSortOrder}`,
            true,
          ),
        ]);
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
    positivePartyFilter,
    positiveStateFilter,
    positiveSortOrder,
    negativePartyFilter,
    negativeStateFilter,
    negativeSortOrder,
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

  const quorumCount = eventDetails?.politicians?.length || 0;
  const propCount = eventDetails?.EventProposition?.length || 0;
  const findIfRelactorIsPresent = (id: string) =>
    eventDetails?.politicians?.find(
      (politician) => politician.politicianId === id,
    );
  const findRelactorName = (id: string) =>
    eventDetails?.politicians?.find(
      (politician) => politician.politicianId === id,
    )?.politician.fullName;
  return (
    <div className="min-h-screen bg-[#f4f4f4] p-6 font-sans text-[#1a1d1f]">
      <div className="mx-auto space-y-8">
        <BackButton />
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
                    <p className="text-xs text-gray-500">Votações Realizadas</p>
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
                            {eventDetails.voting.filter((v) => v.result).length}
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
                              {vote.description?.substring(0, 60) || "Votação"}
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
                        {moment(eventDetails?.startDate).utc().format("HH:mm")}
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
                      <span>{brevesComunicacoes.speakers.length} oradores</span>
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
          </Tabs.Content>

          {/* --- CONTEÚDO: BREVES COMUNICAÇÕES --- */}
          <Tabs.Content
            value="brief_comm"
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {loadingBreves ? (
              // Loading state
              <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white py-16 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#749c5b] border-t-transparent"></div>
                <p className="mt-4 text-sm text-gray-500">
                  Carregando breves comunicações...
                </p>
              </div>
            ) : brevesComunicacoes?.exists ? (
              // Success state - show speakers
              <div className="space-y-6">
                {/* Summary card */}
                {brevesComunicacoes.summary && (
                  <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-[#1a1d1f]">
                      <Info className="text-[#749c5b]" size={20} />
                      Resumo
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600">
                      {brevesComunicacoes.summary}
                    </p>
                  </div>
                )}

                {/* Speakers list */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#1a1d1f]">
                    <Mic2 className="text-[#749c5b]" size={20} />
                    Oradores ({brevesComunicacoes.speakers.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                    {brevesComunicacoes.speakers.map((speaker, index) => {
                      const isExpanded = expandedSpeakers.has(index);
                      const hasSummary =
                        speaker.speechSummary &&
                        speaker.speechSummary.trim().length > 0;

                      return (
                        <div
                          key={index}
                          className={cn(
                            "h-min rounded-lg border border-gray-100 bg-gray-50 transition-all",
                            hasSummary
                              ? "cursor-pointer hover:border-[#749c5b]/30 hover:bg-gray-100"
                              : "",
                          )}
                          onClick={() => hasSummary && toggleSpeaker(index)}
                        >
                          {/* Header row */}
                          <div className="flex items-center gap-3 p-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#749c5b]/10 text-[#749c5b]">
                              <Mic2 size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-[#1a1d1f]">
                                {speaker.name}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock size={12} />
                                <span>{speaker.time}</span>
                                {speaker.party && (
                                  <>
                                    <span>•</span>
                                    <span className="font-semibold text-[#749c5b]">
                                      {speaker.party}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            {hasSummary && (
                              <ChevronDown
                                size={20}
                                className={cn(
                                  "flex-shrink-0 text-gray-400 transition-transform duration-200",
                                  isExpanded && "rotate-180",
                                )}
                              />
                            )}
                          </div>

                          {/* Expandable summary */}
                          {hasSummary && (
                            <div
                              className={cn(
                                "overflow-hidden transition-all duration-200 ease-in-out",
                                isExpanded
                                  ? "max-h-96 opacity-100"
                                  : "max-h-0 opacity-0",
                              )}
                            >
                              <div className="border-t border-gray-200 bg-white/50 px-4 py-3">
                                <p className="text-sm leading-relaxed text-gray-600">
                                  {speaker.speechSummary}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              // Not available state
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
                <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-400">
                  <Mic2 size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">
                  {brevesComunicacoes?.error || "Dados não disponíveis"}
                </h3>
                <p className="mt-2 max-w-md text-sm text-gray-500">
                  {brevesComunicacoes?.error
                    ? "Não foi possível carregar as informações de Breves Comunicações para esta sessão."
                    : "Esta sessão não possui a seção de Breves Comunicações ou a transcrição ainda não está disponível."}
                </p>
              </div>
            )}
          </Tabs.Content>

          {/* --- CONTEÚDO: ORDEM DO DIA (NEW CLASSIC VIEW + TABLE) --- */}
          <Tabs.Content
            value="order_day"
            className="animate-in fade-in slide-in-from-bottom-2 space-y-8 duration-500"
          >
            {/* Unified Section with Toggle */}
            <div className="space-y-6">
              {/* Main Box: Index Selector with Toggle */}
              {orderPropositions.length > 0 && (
                <div className="rounded-xl border border-gray-100 bg-[#fefcf8] p-6 shadow-sm">
                  {/* Header with Toggle Buttons */}
                  <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
                    <h3 className="text-lg font-bold text-[#1a1d1f]">
                      Índice das Proposições
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIndexViewMode("numeric")}
                        className={cn(
                          "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                          indexViewMode === "numeric"
                            ? "bg-[#3e5f48] text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                        )}
                      >
                        Índice Numérico
                      </button>
                      <button
                        onClick={() => setIndexViewMode("proposition")}
                        className={cn(
                          "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                          indexViewMode === "proposition"
                            ? "bg-[#3e5f48] text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                        )}
                      >
                        Índice por Proposição
                      </button>
                    </div>
                  </div>

                  {/* Index Display Area */}
                  {indexViewMode === "numeric" ? (
                    // Numeric Index View
                    <div className="flex w-full gap-2 overflow-x-auto p-4">
                      {orderPropositions.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (item.id === selectedProposition?.id) {
                              setSelectedProposition(null);
                            } else {
                              setSelectedProposition(item);
                            }
                          }}
                          className={cn(
                            "group relative flex h-12 w-12 flex-shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border font-bold transition-all",
                            selectedProposition?.id === item.id
                              ? "border-secondary bg-secondary ring-secondary scale-110 text-white ring-2 ring-offset-2"
                              : getCategoriaPorCodigo(
                                    item.proposition?.situationId || "",
                                  ) === "ja_apreciado"
                                ? "border-[#3e5f48] bg-[#3e5f48] text-white"
                                : getCategoriaPorCodigo(
                                      item.proposition?.situationId || "",
                                    ) === "em_apreciacao"
                                  ? "border-[#d4a017] bg-[#d4a017] text-white"
                                  : "border-[#4a6b7c] bg-[#4a6b7c] text-white hover:bg-[#3b5563]",
                          )}
                        >
                          <span className="text-lg">{index + 1}</span>

                          {item.reporterId &&
                            findIfRelactorIsPresent(item.reporterId) && (
                              <div className="absolute right-1/2 -bottom-2 translate-x-1/2 rounded-full bg-white p-0.5 shadow-sm">
                                <Users size={10} className="text-[#3e5f48]" />
                              </div>
                            )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    // Proposition Name Index View
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {orderPropositions.map((prop, idx) => (
                        <button
                          onClick={() => {
                            if (prop.id === selectedProposition?.id) {
                              setSelectedProposition(null);
                            } else {
                              setSelectedProposition(prop);
                            }
                          }}
                          key={idx}
                          className={cn(
                            "relative cursor-pointer rounded-md border px-3 py-2 text-center text-sm font-bold shadow-sm transition-all",
                            selectedProposition?.id === prop.id
                              ? "border-secondary bg-secondary ring-secondary scale-105 text-white ring-2 ring-offset-2"
                              : getCategoriaPorCodigo(
                                    prop.proposition?.situationId || "",
                                  ) === "ja_apreciado"
                                ? "border-[#3e5f48] bg-[#3e5f48] text-white"
                                : getCategoriaPorCodigo(
                                      prop.proposition?.situationId || "",
                                    ) === "em_apreciacao"
                                  ? "border-[#d4a017] bg-[#d4a017] text-white"
                                  : "border-[#4a6b7c] bg-[#4a6b7c] text-white hover:bg-[#3b5563]",
                          )}
                        >
                          {prop.title}
                          {prop.reporterId &&
                            findIfRelactorIsPresent(prop.reporterId) && (
                              <div className="absolute right-1/2 -bottom-2 translate-x-1/2 rounded-full bg-white p-0.5 shadow-sm">
                                <Users size={10} className="text-[#3e5f48]" />
                              </div>
                            )}
                        </button>
                      ))}
                    </div>
                  )}

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
              )}

              {/* Description Card - Shows when a proposition is selected */}
              {selectedProposition && (
                <div className="overflow-hidden rounded-lg border border-[#3e5f48] bg-[#eef5f0] shadow-md">
                  <div className="bg-[#3e5f48] px-4 py-2 text-center text-sm font-bold tracking-wider text-white uppercase">
                    Matéria Sobre a Mesa
                  </div>
                  <div className="space-y-4 p-6">
                    <h4 className="text-lg font-bold text-[#1a1d1f] underline decoration-gray-300 underline-offset-4">
                      {selectedProposition.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-gray-700">
                      {selectedProposition.proposition?.description}
                    </p>

                    {/* Additional Details */}
                    {(selectedProposition.proposition?.situationDescription ||
                      selectedProposition.topic ||
                      selectedProposition.regime ||
                      (selectedProposition.reporterId &&
                        findIfRelactorIsPresent(
                          selectedProposition.reporterId,
                        ))) && (
                      <div className="space-y-3 rounded border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm">
                        {selectedProposition.proposition
                          ?.situationDescription && (
                          <div>
                            <span className="block font-bold text-gray-700">
                              Situação:
                            </span>
                            <span className="text-gray-600">
                              {
                                selectedProposition.proposition
                                  .situationDescription
                              }
                            </span>
                          </div>
                        )}

                        {selectedProposition.topic && (
                          <div>
                            <span className="block font-bold text-gray-700">
                              Tópico:
                            </span>
                            <span className="text-gray-600">
                              {selectedProposition.topic}
                            </span>
                          </div>
                        )}

                        {selectedProposition.regime && (
                          <div>
                            <span className="block font-bold text-gray-700">
                              Regime:
                            </span>
                            <span className="text-gray-600">
                              {selectedProposition.regime}
                            </span>
                          </div>
                        )}

                        {selectedProposition.reporterId &&
                          findIfRelactorIsPresent(
                            selectedProposition.reporterId,
                          ) && (
                            <div>
                              <span className="block font-bold text-gray-700">
                                Relator:
                              </span>
                              <span className="text-gray-600">
                                {findRelactorName(
                                  selectedProposition.reporterId,
                                )}
                              </span>
                            </div>
                          )}
                      </div>
                    )}

                    {/* Action Button - Link to Full Proposition */}
                    {selectedProposition.proposition?.fullPropositionUrl && (
                      <div className="pt-2">
                        <a
                          href={
                            selectedProposition.proposition.fullPropositionUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-[#749c5b] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#5f7d4a] hover:shadow-lg"
                        >
                          <ExternalLink size={16} />
                          Ver Detalhes Completos
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Empty State - When no proposition is selected */}
              {!selectedProposition && orderPropositions.length > 0 && (
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                  <p className="text-sm text-gray-500">
                    Selecione uma proposição acima para ver seus detalhes
                  </p>
                </div>
              )}

              {/* No Data State */}
              {orderPropositions.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-12 text-center">
                  <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-400">
                    <FileText size={32} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-700">
                    Nenhuma proposição encontrada
                  </h3>
                  <p className="text-sm text-gray-500">
                    Não há proposições na ordem do dia para este evento.
                  </p>
                </div>
              )}
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
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold text-green-700">
                                    Votaram SIM
                                  </h4>
                                  <button
                                    onClick={() =>
                                      setPositiveSortOrder(
                                        positiveSortOrder === "asc"
                                          ? "desc"
                                          : "asc",
                                      )
                                    }
                                    className="flex items-center gap-1 rounded-lg border border-green-200 px-2 py-1 text-xs text-green-700 hover:bg-green-50"
                                    title={
                                      positiveSortOrder === "asc"
                                        ? "Ordenar Z-A"
                                        : "Ordenar A-Z"
                                    }
                                  >
                                    <ArrowUpDown size={12} />
                                    {positiveSortOrder === "asc"
                                      ? "A-Z"
                                      : "Z-A"}
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <div className="relative min-w-[120px] flex-1">
                                    <Search
                                      className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-400"
                                      size={12}
                                    />
                                    <input
                                      type="text"
                                      placeholder="Nome..."
                                      value={positiveVotesSearch}
                                      onChange={(e) => {
                                        setPositiveVotesSearch(e.target.value);
                                        setPositiveVotesPage(1);
                                      }}
                                      className="w-full rounded-lg border border-green-200 bg-white py-1 pr-2 pl-7 text-xs focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                                    />
                                  </div>
                                  <select
                                    value={positivePartyFilter}
                                    onChange={(e) => {
                                      setPositivePartyFilter(e.target.value);
                                      setPositiveVotesPage(1);
                                    }}
                                    className="rounded-lg border border-green-200 bg-white px-2 py-1 text-xs focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                                  >
                                    <option value="">Partido</option>
                                    <option value="PT">PT</option>
                                    <option value="PL">PL</option>
                                    <option value="UNIÃO">UNIÃO</option>
                                    <option value="PP">PP</option>
                                    <option value="MDB">MDB</option>
                                    <option value="PSD">PSD</option>
                                    <option value="REPUBLICANOS">
                                      REPUBLICANOS
                                    </option>
                                    <option value="PSDB">PSDB</option>
                                    <option value="PDT">PDT</option>
                                    <option value="PSB">PSB</option>
                                    <option value="PODE">PODE</option>
                                    <option value="PSOL">PSOL</option>
                                    <option value="PV">PV</option>
                                    <option value="NOVO">NOVO</option>
                                    <option value="PCdoB">PCdoB</option>
                                    <option value="CIDADANIA">CIDADANIA</option>
                                    <option value="SOLIDARIEDADE">
                                      SOLID.
                                    </option>
                                    <option value="AVANTE">AVANTE</option>
                                    <option value="PRD">PRD</option>
                                    <option value="REDE">REDE</option>
                                  </select>
                                  <select
                                    value={positiveStateFilter}
                                    onChange={(e) => {
                                      setPositiveStateFilter(e.target.value);
                                      setPositiveVotesPage(1);
                                    }}
                                    className="rounded-lg border border-green-200 bg-white px-2 py-1 text-xs focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                                  >
                                    <option value="">UF</option>
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
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold text-red-700">
                                    Votaram NÃO
                                  </h4>
                                  <button
                                    onClick={() =>
                                      setNegativeSortOrder(
                                        negativeSortOrder === "asc"
                                          ? "desc"
                                          : "asc",
                                      )
                                    }
                                    className="flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                                    title={
                                      negativeSortOrder === "asc"
                                        ? "Ordenar Z-A"
                                        : "Ordenar A-Z"
                                    }
                                  >
                                    <ArrowUpDown size={12} />
                                    {negativeSortOrder === "asc"
                                      ? "A-Z"
                                      : "Z-A"}
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <div className="relative min-w-[120px] flex-1">
                                    <Search
                                      className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-400"
                                      size={12}
                                    />
                                    <input
                                      type="text"
                                      placeholder="Nome..."
                                      value={negativeVotesSearch}
                                      onChange={(e) => {
                                        setNegativeVotesSearch(e.target.value);
                                        setNegativeVotesPage(1);
                                      }}
                                      className="w-full rounded-lg border border-red-200 bg-white py-1 pr-2 pl-7 text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                                    />
                                  </div>
                                  <select
                                    value={negativePartyFilter}
                                    onChange={(e) => {
                                      setNegativePartyFilter(e.target.value);
                                      setNegativeVotesPage(1);
                                    }}
                                    className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                                  >
                                    <option value="">Partido</option>
                                    <option value="PT">PT</option>
                                    <option value="PL">PL</option>
                                    <option value="UNIÃO">UNIÃO</option>
                                    <option value="PP">PP</option>
                                    <option value="MDB">MDB</option>
                                    <option value="PSD">PSD</option>
                                    <option value="REPUBLICANOS">
                                      REPUBLICANOS
                                    </option>
                                    <option value="PSDB">PSDB</option>
                                    <option value="PDT">PDT</option>
                                    <option value="PSB">PSB</option>
                                    <option value="PODE">PODE</option>
                                    <option value="PSOL">PSOL</option>
                                    <option value="PV">PV</option>
                                    <option value="NOVO">NOVO</option>
                                    <option value="PCdoB">PCdoB</option>
                                    <option value="CIDADANIA">CIDADANIA</option>
                                    <option value="SOLIDARIEDADE">
                                      SOLID.
                                    </option>
                                    <option value="AVANTE">AVANTE</option>
                                    <option value="PRD">PRD</option>
                                    <option value="REDE">REDE</option>
                                  </select>
                                  <select
                                    value={negativeStateFilter}
                                    onChange={(e) => {
                                      setNegativeStateFilter(e.target.value);
                                      setNegativeVotesPage(1);
                                    }}
                                    className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                                  >
                                    <option value="">UF</option>
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
                    value={presenceStateFilter}
                    onChange={(e) => {
                      setPresenceStateFilter(e.target.value);
                      setPresencePage(1);
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
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
