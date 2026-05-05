"use client";
import { VoteDetailsProps } from "@/@types/proposition";
import { BackButton } from "@/components/v2/components/ui/BackButton";
import { LegislativeSyncLoader } from "@/components/v2/components/ui/LegislativeSyncLoader";
import { SpeechModal } from "@/components/v2/components/ui/SpeechModal";
import { useApiContext } from "@/context/ApiContext";
import { cn } from "@/lib/utils";
import { generateSessionReport } from "@/utils/pdfGenerator";
import * as Tabs from "@radix-ui/react-tabs";
import {
  BarChart3,
  Calendar,
  Check,
  Download,
  FileText,
  Mic2,
  Users,
  Video,
} from "lucide-react";
import moment from "moment";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BriefCommTabContent } from "./components/BriefCommTabContent";
import { OrderDayTabContent } from "./components/OrderDayTabContent";
import { OverviewTabContent } from "./components/OverviewTabContent";
import { PresenceTabContent } from "./components/PresenceTabContent";
import { SessaoTextoTabContent } from "./components/SessaoTextoTabContent";
import {
  BrevesComunicacoesResponse,
  EventDetailsAPI,
  EventPolitician,
  EventProposition,
  EventVoting,
} from "./components/types";
import { VotingTabContent } from "./components/VotingTabContent";


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

/** Horário em pt-BR estilo “14h” ou “14h12” (sem dois-pontos). Usa UTC como no restante da página. */
function formatHoraBr(iso: string | undefined | null) {
  if (!iso) return "—";
  const m = moment(iso.replace("Z", "")).utc();
  const mm = m.minutes();
  const hh = m.hours();
  if (mm === 0) return `${hh}h`;
  return `${hh}h${String(mm).padStart(2, "0")}`;
}

/** Data estilo “Qui, 19 mar 2026” (UTC, alinhado aos demais blocos). */
function formatDataLinhaSessao(iso: string | undefined | null) {
  if (!iso) return "—";
  const m = moment(iso.replace("Z", "")).utc();
  const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const meses = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ];
  return `${dias[m.day()]}, ${m.date()} ${meses[m.month()]} ${m.year()}`;
}

function formatDuracaoSessao(start: string, end: string) {
  const mins = moment(end.replace("Z", ""))
    .utc()
    .diff(moment(start.replace("Z", "")).utc(), "minutes");
  if (mins < 0) return "—";
  const h = Math.floor(mins / 60);
  const min = mins % 60;
  return `${h}h${String(min).padStart(2, "0")}`;
}

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for loading UI
  const [loadingOrder, setLoadingOrder] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for loading UI
  const [loadingVotes, setLoadingVotes] = useState(false);
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
  const [votingTypeFilter, setVotingTypeFilter] = useState<
    "all" | "nominal" | "symbolic"
  >("all");

  // Sorted by date (ascending) and filtered by type, with original numbering
  const sortedAndFilteredVotes = useMemo(() => {
    const sorted = [...votesList].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    // Assign numbering based on chronological order (before filtering)
    const numbered = sorted.map((vote, idx) => ({
      ...vote,
      voteNumber: idx + 1,
    }));
    if (votingTypeFilter === "all") return numbered;
    if (votingTypeFilter === "symbolic")
      return numbered.filter((v) => v.totalVotes === 0);
    return numbered.filter((v) => v.totalVotes > 0);
  }, [votesList, votingTypeFilter]);

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
  // Transcrição completa (fonte: Escriba Câmara - texto original integral)
  const [transcricaoCompleta, setTranscricaoCompleta] = useState<{
    exists: boolean;
    fullText: string | null;
  } | null>(null);
  const [loadingTranscricao, setLoadingTranscricao] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  // Sessão em texto: submenu e resumo IA
  const [sessaoTextoSubView, setSessaoTextoSubView] = useState<
    "visao_geral" | "texto_integral"
  >("texto_integral");
  const [sessionSummary, setSessionSummary] = useState<string | null>(null);
  const [loadingSessionSummary, setLoadingSessionSummary] = useState(false);
  const [sessaoTextoPage, setSessaoTextoPage] = useState(1);
  const [sessaoTextoSearch, setSessaoTextoSearch] = useState("");
  const [sessaoTextoModoLeitura, setSessaoTextoModoLeitura] = useState(false);

  // Format countdown time
  const formatCountdown = (milliseconds: number): string => {
    if (milliseconds <= 0) return "";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      // More than 24h: show days, hours, minutes
      return `${days}d ${hours}h ${minutes}m`;
    } else {
      // Less than 24h: show hours, minutes, seconds
      return `${hours}h ${minutes}m ${seconds}s`;
    }
  };

  const toggleSpeaker = (index: number) => {
    setExpandedSpeakers((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const [selectedSpeakerForModal, setSelectedSpeakerForModal] = useState<{
    name: string;
    party?: string;
    time: string;
    duration?: string;
    transcription: string;
  } | null>(null);

  // Fetch event details from API
  useEffect(() => {
    async function fetchEventDetails() {
      const eventId = pathname.split("/").pop();
      console.log("[DEBUG fetchEventDetails] pathname:", pathname);
      console.log("[DEBUG fetchEventDetails] eventId extraído:", eventId);
      if (!eventId) {
        console.warn(
          "[DEBUG fetchEventDetails] eventId está vazio, abortando fetch.",
        );
        return;
      }

      setLoading(true);
      const apiUrl = `/event/details/${eventId}`;
      console.log("[DEBUG fetchEventDetails] Chamando API:", apiUrl);
      const response = await GetAPI(apiUrl, true);
      console.log(
        "[DEBUG fetchEventDetails] Response status:",
        response.status,
      );
      console.log(
        "[DEBUG fetchEventDetails] Response body:",
        JSON.stringify(response.body, null, 2)?.substring(0, 2000),
      );

      if (response.status === 200) {
        if (!response.body || response.body === null) {
          console.error(
            "[DEBUG fetchEventDetails] ⚠️ Response body é null/undefined! O evento provavelmente NÃO EXISTE no banco de dados.",
          );
        } else {
          console.log(
            "[DEBUG fetchEventDetails] ✅ Dados recebidos com sucesso!",
          );
          console.log(
            "[DEBUG fetchEventDetails] eventType:",
            JSON.stringify(response.body.eventType),
          );
          console.log(
            "[DEBUG fetchEventDetails] description:",
            response.body.description,
          );
          console.log(
            "[DEBUG fetchEventDetails] EventProposition count:",
            response.body.EventProposition?.length ?? "N/A (campo ausente)",
          );
          console.log(
            "[DEBUG fetchEventDetails] voting count:",
            response.body.voting?.length ?? "N/A (campo ausente)",
          );
          console.log(
            "[DEBUG fetchEventDetails] politicians count:",
            response.body.politicians?.length ?? "N/A (campo ausente)",
          );
          console.log(
            "[DEBUG fetchEventDetails] situation:",
            response.body.situation,
          );
          console.log(
            "[DEBUG fetchEventDetails] startDate:",
            response.body.startDate,
          );
          console.log(
            "[DEBUG fetchEventDetails] endDate:",
            response.body.endDate,
          );
        }

        setEventDetails(response.body);
        setOrderPropositions(response.body?.EventProposition || []);
        setVotesList(response.body?.voting || []);
        if (response.body?.aiOverviewSummary) {
          setSessionSummary(response.body.aiOverviewSummary);
        }

        // Calculate countdown if event is in the future
        // Treat dates from database as local time (ignore UTC indicator)
        // If date comes as ISO string with Z, parse as local time
        const startDateStr =
          typeof response.body?.startDate === "string"
            ? response.body.startDate.replace("Z", "")
            : response.body?.startDate;
        const timeDiff = moment(startDateStr).diff(moment(), "milliseconds");
        if (timeDiff > 0) {
          setTimeLeft(timeDiff);
        } else {
          setTimeLeft(0);
        }
      } else {
        console.error(
          "[DEBUG fetchEventDetails] ❌ Erro na API! Status:",
          response.status,
          "Body:",
          JSON.stringify(response.body),
        );
      }
      setLoading(false);
    }

    fetchEventDetails();
  }, [pathname]);

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

  // Fetch Breves Comunicações when tab Breves or Sessão em texto is active (mesmo dado para as duas abas)
  useEffect(() => {
    async function fetchBrevesComunicacoes() {
      const eventId = pathname.split("/").pop();
      const tabNeedsBreves =
        activeTab === "brief_comm" || activeTab === "sessao_texto";
      if (!eventId || !tabNeedsBreves || brevesComunicacoes) return;

      setLoadingBreves(true);
      try {
        const response = await GetAPI(
          `/event/${eventId}/breves-comunicacoes`,
          true,
        );
        if (response.status === 200) {
          setBrevesComunicacoes(response.body);
        }
      } catch {
        // Error fetching breves comunicações
      }
      setLoadingBreves(false);
    }

    fetchBrevesComunicacoes();
  }, [pathname, activeTab]);

  // Transcrição completa (original Escriba) quando aba Sessão em texto está ativa
  useEffect(() => {
    async function fetchTranscricaoCompleta() {
      const eventId = pathname.split("/").pop();
      if (!eventId || activeTab !== "sessao_texto") return;

      setLoadingTranscricao(true);
      setTranscricaoCompleta(null);
      try {
        const response = await GetAPI(
          `/event/${eventId}/transcricao-completa`,
          true,
        );
        if (response.status === 200 && response.body) {
          setTranscricaoCompleta({
            exists: response.body.exists === true,
            fullText: response.body.fullText ?? null,
          });
        } else {
          setTranscricaoCompleta({ exists: false, fullText: null });
        }
      } catch {
        setTranscricaoCompleta({ exists: false, fullText: null });
      }
      setLoadingTranscricao(false);
    }

    fetchTranscricaoCompleta();
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
    return <LegislativeSyncLoader />;
  }

  const quorumCount = eventDetails?.politicians?.length || 0;
  const propCount = eventDetails?.EventProposition?.length || 0;

  const contextoInstitucional = eventDetails
    ? [
        eventDetails.department?.name,
        eventDetails.local,
        eventDetails.eventType?.description,
      ]
        .filter((s): s is string => Boolean(s && String(s).trim()))
        .join(" · ")
    : "";

  const situacaoLower = (eventDetails?.situation || "").toLowerCase();
  const ordemDiaResumo =
    situacaoLower.includes("encerr") || situacaoLower.includes("finaliz")
      ? "Encerrada"
      : propCount === 0
        ? "Sem itens na pauta"
        : `${propCount} ${propCount === 1 ? "item" : "itens"} na pauta`;

  const findIfRelactorIsPresent = (id: string) =>
    eventDetails?.politicians?.find(
      (politician) => politician.politicianId === id,
    );
  const findRelactorName = (id: string) =>
    eventDetails?.politicians?.find(
      (politician) => politician.politicianId === id,
    )?.politician.fullName;

  const handleExportPDF = async () => {
    if (!eventDetails) return;

    let brevesData = brevesComunicacoes;

    // Se os dados de Breves Comunicações não estiverem carregados, buscar antes de gerar o PDF
    if (!brevesData) {
      const eventId = pathname.split("/").pop();
      if (eventId) {
        try {
          // Usar GetAPI diretamente para buscar os dados
          const response = await GetAPI(
            `/event/${eventId}/breves-comunicacoes`,
            true,
          );
          if (response.status === 200) {
            brevesData = response.body;
          }
        } catch (error) {
          console.error(
            "Erro ao buscar dados de Breves Comunicações para PDF:",
            error,
          );
        }
      }
    }

    generateSessionReport({
      title: eventDetails.description || eventDetails.eventType?.name || "",
      date: eventDetails.startDate,
      time: moment(eventDetails.startDate).utc().format("HH:mm"),
      endTime: eventDetails.endDate
        ? moment(eventDetails.endDate).utc().format("HH:mm")
        : undefined,
      local: eventDetails.local || "Local não informado",
      status: eventDetails.situation,
      description: eventDetails.eventType?.description || "",
      presences: eventDetails.politicians?.length || 0,
      propositionsCount: eventDetails.EventProposition?.length || 0,
      votingCount: eventDetails.voting?.length || 0,
      votingApprovalRate: eventDetails.voting?.length
        ? `${Math.round((eventDetails.voting.filter((v) => v.result).length / eventDetails.voting.length) * 100)}%`
        : undefined,
      votings:
        eventDetails.voting?.map((v) => ({
          description: v.description || "Votação",
          result: v.result,
          approvedCount: v.positiveVotes,
          rejectedCount: v.negativeVotes,
        })) || [],
      orderOfDay:
        eventDetails.EventProposition?.map((p) => ({
          title: p.title,
          topic: p.topic,
          status: p.situation || "Não informado",
        })) || [],
      presenceList:
        eventDetails.politicians?.map((p) => ({
          name: p.politician.name,
          party: p.politician.siglaPartido || p.politician.politicalParty || "",
          state: p.politician.state || "",
        })) || [],
      brevesComunicacoes: brevesData
        ? {
            speakers: brevesData.speakers.map((s) => ({
              name: s.name,
              time: s.time,
              party: s.party,
              speechSummary: s.speechSummary,
            })),
          }
        : undefined,
    });
  };

  return (
    <>
      <div className="min-h-screen bg-[#f4f4f4] p-6 font-sans text-[#1a1d1f]">
        <div className="mx-auto space-y-8">
          <BackButton />
          {/* --- 1. CABEÇALHO DA SESSÃO (DADOS REAIS DA API) --- */}
          <header className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="relative p-6 text-[#1a1d1f]">
              {/* Background decorativo sutil */}
              <div className="pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-[#749c5b] opacity-5 blur-3xl"></div>

              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="border-l-4 border-[#749c5b] pl-4">
                    <h1
                      className="line-clamp-3 text-2xl leading-tight font-bold tracking-tight text-[#1a1d1f] md:text-3xl lg:text-2xl"
                      title={
                        eventDetails?.description ||
                        eventDetails?.eventType?.name
                      }
                    >
                      {eventDetails?.description ||
                        eventDetails?.eventType?.name}
                    </h1>
                  </div>

                  {contextoInstitucional ? (
                    <p className="text-sm leading-relaxed text-gray-500 md:text-base">
                      {contextoInstitucional}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600 md:text-[15px]">
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#1a1d1f]">
                      <Calendar
                        size={16}
                        className="shrink-0 text-[#749c5b]"
                        aria-hidden
                      />
                      {formatDataLinhaSessao(eventDetails?.startDate)}
                    </span>
                    <span className="text-gray-300" aria-hidden>
                      ·
                    </span>
                    {timeLeft > 0 && eventDetails ? (
                      <span className="font-semibold text-[#749c5b]">
                        abertura em {formatCountdown(timeLeft)}
                      </span>
                    ) : (
                      <>
                        <span>
                          início {formatHoraBr(eventDetails?.startDate)}
                        </span>
                        {eventDetails?.endDate ? (
                          <>
                            <span className="text-gray-300">·</span>
                            <span>
                              encerramento {formatHoraBr(eventDetails.endDate)}
                            </span>
                            <span className="text-gray-300">·</span>
                            <span className="font-medium text-[#1a1d1f]">
                              duração{" "}
                              {formatDuracaoSessao(
                                eventDetails.startDate,
                                eventDetails.endDate,
                              )}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="text-gray-400 italic">
                              encerramento não registrado
                            </span>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[#1a1d1f]">
                      {eventDetails?.department?.acronym ||
                        eventDetails?.department?.name ||
                        "Sessão"}
                    </span>
                    <StatusBadge status={eventDetails?.situation || "—"} />
                  </div>

                  <p className="text-sm leading-relaxed text-gray-600">
                    <span className="text-gray-400">Modalidade:</span>{" "}
                    Presencial
                    <span className="mx-2 text-gray-300">·</span>
                    <span className="text-gray-400">Ordem do Dia:</span>{" "}
                    {ordemDiaResumo}
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <div className="flex min-w-[200px] flex-1 items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-br from-[#749c5b]/[0.07] to-white px-4 py-3 shadow-sm">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#749c5b]/15 text-[#749c5b]">
                        <Users size={20} strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                          Quórum
                        </p>
                        <p className="text-lg font-bold text-[#1a1d1f] tabular-nums">
                          {quorumCount}{" "}
                          <span className="text-sm font-semibold text-gray-600">
                            Parlamentares
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex min-w-[200px] flex-1 items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white px-4 py-3 shadow-sm">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200/80 text-slate-700">
                        <FileText size={20} strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                          Proposição
                        </p>
                        <p className="text-lg font-bold text-[#1a1d1f] tabular-nums">
                          {propCount}{" "}
                          <span className="text-sm font-semibold text-gray-600">
                            {propCount === 1 ? "Item" : "Itens"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row sm:items-stretch lg:w-auto lg:min-w-[280px] lg:flex-col">
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                    title="Exportar Relatório em PDF"
                  >
                    <Download size={18} />
                    Exportar PDF
                  </button>
                  <div className="flex flex-1 flex-col rounded-xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/90 p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${eventDetails?.videoUrl ? "animate-pulse bg-red-500" : "bg-gray-400"}`}
                      />
                      <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                        Transmissão
                      </span>
                    </div>
                    {eventDetails?.videoUrl ? (
                      <a
                        href={eventDetails.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-full flex-1 items-center justify-center gap-2 rounded-lg bg-[#749c5b] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#658a4e]"
                      >
                        <Video size={18} />
                        Acessar transmissão
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex w-full flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-3 text-sm font-semibold text-gray-500"
                      >
                        <Video size={18} />
                        Sem transmissão
                      </button>
                    )}
                  </div>
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
                {
                  id: "sessao_texto",
                  label: "Sessão em texto",
                  icon: FileText,
                },
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
              <OverviewTabContent
                eventDetails={eventDetails}
                brevesComunicacoes={brevesComunicacoes}
                setActiveTab={setActiveTab}
                fullTextForSession={
                  transcricaoCompleta?.fullText ??
                  (brevesComunicacoes?.speakers
                    ?.map((s) => s.transcription?.trim() || s.speechSummary?.trim() || "")
                    .filter(Boolean)
                    .join("\n\n") ||
                    null)
                }
              />
            </Tabs.Content>

            {/* --- CONTEÚDO: BREVES COMUNICAÇÕES --- */}
            <Tabs.Content
              value="brief_comm"
              className="animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              <BriefCommTabContent
                loadingBreves={loadingBreves}
                brevesComunicacoes={brevesComunicacoes}
                expandedSpeakers={expandedSpeakers}
                toggleSpeaker={toggleSpeaker}
                setSelectedSpeakerForModal={setSelectedSpeakerForModal}
              />
            </Tabs.Content>

            {/* --- CONTEÚDO: ORDEM DO DIA --- */}
            <Tabs.Content
              value="order_day"
              className="animate-in fade-in slide-in-from-bottom-2 space-y-8 duration-500"
            >
              <OrderDayTabContent
                orderPropositions={orderPropositions}
                selectedProposition={selectedProposition}
                setSelectedProposition={setSelectedProposition}
                indexViewMode={indexViewMode}
                setIndexViewMode={setIndexViewMode}
                getCategoriaPorCodigo={getCategoriaPorCodigo}
                findIfRelactorIsPresent={findIfRelactorIsPresent}
                findRelactorName={findRelactorName}
              />
            </Tabs.Content>

            {/* --- CONTEÚDO: VOTAÇÃO --- */}
            <Tabs.Content
              value="voting"
              className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500"
            >
              <VotingTabContent
                loadingVotes={loadingVotes}
                votesList={votesList}
                selectedVote={selectedVote}
                setSelectedVote={setSelectedVote}
                votingTypeFilter={votingTypeFilter}
                setVotingTypeFilter={setVotingTypeFilter}
                sortedAndFilteredVotes={sortedAndFilteredVotes}
                positiveVotesList={positiveVotesList}
                negativeVotesList={negativeVotesList}
                loadingPositiveVotes={loadingPositiveVotes}
                loadingNegativeVotes={loadingNegativeVotes}
                positiveVotesPage={positiveVotesPage}
                setPositiveVotesPage={setPositiveVotesPage}
                negativeVotesPage={negativeVotesPage}
                setNegativeVotesPage={setNegativeVotesPage}
                positiveVotesPages={positiveVotesPages}
                negativeVotesPages={negativeVotesPages}
                positiveVotesSearch={positiveVotesSearch}
                setPositiveVotesSearch={setPositiveVotesSearch}
                negativeVotesSearch={negativeVotesSearch}
                setNegativeVotesSearch={setNegativeVotesSearch}
                positivePartyFilter={positivePartyFilter}
                setPositivePartyFilter={setPositivePartyFilter}
                positiveStateFilter={positiveStateFilter}
                setPositiveStateFilter={setPositiveStateFilter}
                positiveSortOrder={positiveSortOrder}
                setPositiveSortOrder={setPositiveSortOrder}
                negativePartyFilter={negativePartyFilter}
                setNegativePartyFilter={setNegativePartyFilter}
                negativeStateFilter={negativeStateFilter}
                setNegativeStateFilter={setNegativeStateFilter}
                negativeSortOrder={negativeSortOrder}
                setNegativeSortOrder={setNegativeSortOrder}
              />
            </Tabs.Content>

            {/* --- CONTEÚDO: PRESENÇAS --- */}
            <Tabs.Content
              value="presence"
              className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500"
            >
              <PresenceTabContent
                presenceList={presenceList}
                loadingPresence={loadingPresence}
                presencePage={presencePage}
                setPresencePage={setPresencePage}
                presencePages={presencePages}
                presenceSearch={presenceSearch}
                setPresenceSearch={setPresenceSearch}
                presenceTotal={presenceTotal}
                presencePartyFilter={presencePartyFilter}
                setPresencePartyFilter={setPresencePartyFilter}
                presenceStateFilter={presenceStateFilter}
                setPresenceStateFilter={setPresenceStateFilter}
                presenceSortOrder={presenceSortOrder}
                setPresenceSortOrder={setPresenceSortOrder}
              />
            </Tabs.Content>

            {/* --- CONTEÚDO: SESSÃO EM TEXTO --- */}
            <Tabs.Content
              value="sessao_texto"
              className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500"
            >
              <SessaoTextoTabContent
                loadingTranscricao={loadingTranscricao}
                loadingBreves={loadingBreves}
                transcricaoCompleta={transcricaoCompleta}
                brevesComunicacoes={brevesComunicacoes}
                sessaoTextoSubView={sessaoTextoSubView}
                setSessaoTextoSubView={setSessaoTextoSubView}
                sessionSummary={sessionSummary}
                setSessionSummary={setSessionSummary}
                loadingSessionSummary={loadingSessionSummary}
                setLoadingSessionSummary={setLoadingSessionSummary}
                sessaoTextoPage={sessaoTextoPage}
                setSessaoTextoPage={setSessaoTextoPage}
                sessaoTextoSearch={sessaoTextoSearch}
                setSessaoTextoSearch={setSessaoTextoSearch}
                sessaoTextoModoLeitura={sessaoTextoModoLeitura}
                setSessaoTextoModoLeitura={setSessaoTextoModoLeitura}
                eventDetails={eventDetails}
              />
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
      {selectedSpeakerForModal && (
        <SpeechModal
          isOpen={!!selectedSpeakerForModal}
          onClose={() => setSelectedSpeakerForModal(null)}
          speakerName={selectedSpeakerForModal.name || ""}
          party={selectedSpeakerForModal.party || ""}
          time={selectedSpeakerForModal.time || ""}
          duration={selectedSpeakerForModal.duration || ""}
          transcription={selectedSpeakerForModal.transcription || ""}
        />
      )}
    </>
  );
}
