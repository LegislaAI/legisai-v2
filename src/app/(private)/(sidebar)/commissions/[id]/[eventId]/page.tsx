"use client";

import { VoteDetailsProps } from "@/@types/proposition";
import { BackButton } from "@/components/v2/components/ui/BackButton";
import { LegislativeSyncLoader } from "@/components/v2/components/ui/LegislativeSyncLoader";
import { useApiContext } from "@/context/ApiContext";
import { cn } from "@/lib/utils";
import * as Tabs from "@radix-ui/react-tabs";
import {
  ArrowUpDown,
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
  Search,
  Users,
  Video,
  X
} from "lucide-react";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { MembersTab } from "./components/MembersTab";
import { PropositionsTab } from "./components/PropositionsTab";

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

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { GetAPI } = useApiContext();
  const commissionId = params.id as string;
  const eventId = params.eventId as string;

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [eventDetails, setEventDetails] = useState<EventDetailsAPI | null>(
    null,
  );
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Voting state
  const [votesList, setVotesList] = useState<EventVoting[]>([]);
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

  // Format countdown time
  const formatCountdown = (milliseconds: number): string => {
    if (milliseconds <= 0) return "";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
  };

  // Fetch event details from API
  useEffect(() => {
    async function fetchEventDetails() {
      if (!eventId) return;

      setLoading(true);
      const response = await GetAPI(`/event/details/${eventId}`, true);
      if (response.status === 200) {
        setEventDetails(response.body);
        setVotesList(response.body.voting || []);

        // Calculate countdown if event is in the future
        const startDateStr = typeof response.body.startDate === "string"
          ? response.body.startDate.replace("Z", "")
          : response.body.startDate;
        const timeDiff = moment(startDateStr).diff(moment(), "milliseconds");
        if (timeDiff > 0) {
          setTimeLeft(timeDiff);
        } else {
          setTimeLeft(0);
        }
      }
      setLoading(false);
    }

    fetchEventDetails();
  }, [eventId, GetAPI]);

  // Update countdown every second
  useEffect(() => {
    if (!eventDetails || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1000) {
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [eventDetails, timeLeft]);

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
    GetAPI,
  ]);

  if (loading) {
    return <LegislativeSyncLoader />;
  }

  if (!eventDetails) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] p-6">
        <div className="mx-auto max-w-7xl">
          <BackButton />
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h3 className="text-lg font-bold text-[#1a1d1f]">
              Evento não encontrado
            </h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-[#6f767e]">
              O evento solicitado não foi encontrado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const quorumCount = eventDetails?.politicians?.length || 0;
  const propCount = eventDetails?.EventProposition?.length || 0;
  const hasVoting = eventDetails?.voting && eventDetails.voting.length > 0;

  // Define tabs - voting only if there are votes
  const tabs = [
    { id: "overview", label: "Visão Geral", icon: BarChart3 },
    { id: "propositions", label: "Proposições", icon: FileText },
    ...(hasVoting ? [{ id: "voting", label: "Votação", icon: Check }] : []),
    { id: "presence", label: "Presenças", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-6 font-sans text-[#1a1d1f]">
      <div className="mx-auto space-y-8">
        <BackButton />
        {/* --- CABEÇALHO DA SESSÃO --- */}
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
                <h1
                  className="line-clamp-2 overflow-hidden text-2xl leading-tight font-bold md:text-4xl"
                  title={
                    eventDetails?.description || eventDetails?.eventType.name
                  }
                >
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
                  {timeLeft > 0 && eventDetails ? (
                    <span className="text-[#749c5b]">
                      {formatCountdown(timeLeft)}
                    </span>
                  ) : (
                    <>
                      {moment(eventDetails?.startDate).utc().format("HH:mm")}
                      {eventDetails?.endDate &&
                        ` - ${moment(eventDetails?.endDate).utc().format("HH:mm")}`}
                    </>
                  )}
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

        {/* --- NAVEGAÇÃO DE ABAS --- */}
        <Tabs.Root
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <Tabs.List className="scrollbar-hide mb-6 flex flex-nowrap gap-2 overflow-x-auto border-b border-gray-200 pb-1">
            {tabs.map((tab) => (
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
                    <p className="text-xs text-gray-500">
                      Votações Realizadas
                    </p>
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              {/* Voting Results Summary */}
              {hasVoting && (
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:col-span-2">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#1a1d1f]">
                    <Check className="text-[#749c5b]" size={20} />
                    Resultado das Votações
                  </h3>
                  <div className="space-y-4">
                    {/* Approved vs Rejected */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium text-green-600">
                            Aprovadas
                          </span>
                          <span className="font-bold">
                            {
                              eventDetails.voting.filter((v) => v.result)
                                .length
                            }
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
                              {(vote.description?.length || 0) > 60 ? "..." : ""}
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
                </div>
              )}

              {/* Session Duration */}
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:col-span-2">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#1a1d1f]">
                  <Clock className="text-[#749c5b]" size={20} />
                  Duração do Evento
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 rounded-lg bg-gray-50 p-3 text-center">
                    <p className="text-xs text-gray-500">Início</p>
                    <p className="font-bold text-[#1a1d1f]">
                      {moment(eventDetails?.startDate)
                        .utc()
                        .format("HH:mm")}
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

              {/* Quick Navigation */}
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:col-span-2">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#1a1d1f]">
                  <Info className="text-[#749c5b]" size={20} />
                  Navegação Rápida
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveTab("propositions")}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left text-sm font-medium text-gray-700 transition-colors hover:border-[#749c5b] hover:bg-[#749c5b]/5 hover:text-[#749c5b]"
                  >
                    <FileText size={16} />
                    Proposições
                  </button>
                  {hasVoting && (
                    <button
                      onClick={() => setActiveTab("voting")}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left text-sm font-medium text-gray-700 transition-colors hover:border-[#749c5b] hover:bg-[#749c5b]/5 hover:text-[#749c5b]"
                    >
                      <Check size={16} />
                      Votações
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab("presence")}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left text-sm font-medium text-gray-700 transition-colors hover:border-[#749c5b] hover:bg-[#749c5b]/5 hover:text-[#749c5b]"
                  >
                    <Users size={16} />
                    Presenças
                  </button>
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* --- CONTEÚDO: PROPOSIÇÕES --- */}
          <Tabs.Content
            value="propositions"
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <PropositionsTab eventId={eventId} />
          </Tabs.Content>

          {/* --- CONTEÚDO: VOTAÇÃO --- */}
          {hasVoting && (
            <Tabs.Content
              value="voting"
              className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500"
            >
              {votesList.length === 0 ? (
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
                                          setPositiveVotesSearch(
                                            e.target.value,
                                          );
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
                                      <option value="CIDADANIA">
                                        CIDADANIA
                                      </option>
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
                                            {
                                              voteDetail.politician
                                                .politicalParty
                                            }
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
                                          setNegativeVotesSearch(
                                            e.target.value,
                                          );
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
                                      <option value="CIDADANIA">
                                        CIDADANIA
                                      </option>
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
                                            {
                                              voteDetail.politician
                                                .politicalParty
                                            }
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
          )}

          {/* --- CONTEÚDO: PRESENÇAS --- */}
          <Tabs.Content
            value="presence"
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <MembersTab eventId={eventId} />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
