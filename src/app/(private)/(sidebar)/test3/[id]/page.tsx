"use client";
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
  acronym: string;
  type: string;
  uri: string;
}

// 2. Tipo de Evento
interface EventType {
  id: string;
  name: string;
  acronym: string;
  description: string;
  code: string; // Adicionado conforme o log
}

// 3. Político dentro do evento (Quorum/Presença)
interface Politician {
  id: string;
  name: string;
  fullName: string;
  email: string;
  imageUrl: string; // O log usa 'imageUrl' em vez de 'urlFoto'
  siglaPartido?: string;
  siglaUf?: string;
}

interface EventPolitician {
  id: string;
  eventId: string;
  politicianId: string;
  politician: Politician;
}

// 4. Detalhes da Proposição (Objeto interno)
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

// 5. Item da Pauta/Evento
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
  proposition: PropositionDetails | null; // Objeto com detalhes completos
}

// 6. Votações (Nova interface baseada no log)
interface EventVoting {
  id: string;
  uri: string;
  title: string;
  description: string;
  date: string;
  result: boolean;
  propositionId: string;
}

// 7. Interface Principal (EventDetailsAPI)
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

  EventProposition: EventProposition[]; // Note o 'E' maiúsculo conforme seu log
  voting: EventVoting[]; // Adicionado campo de votações
  createdAt: string;
  updatedAt: string;
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
  const [selectedProposition, setSelectedProposition] = useState<EventProposition | null>(
    null,
  );
  // API state for Order of Day, Voting, and Presence
  const [orderPropositions, setOrderPropositions] = useState<
    EventProposition[]
  >([]);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const [votesList, setVotesList] = useState<EventVoting[]>([]);
  const [loadingVotes, setLoadingVotes] = useState(false);

  const [presenceList, setPresenceList] = useState<EventPolitician[]>([]);
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
      console.log("response 123",response);

      if (response.status === 200) {
        const event: EventDetailsAPI = response.body; // Adjusted based on backend response structure (body.event)
        setEventDetails(event);
         setOrderPropositions(event.EventProposition || []);
          setVotesList(event.voting || []);
          setPresenceList(event.politicians || []);
      }
      setLoading(false);
    }

    fetchEventDetails();
  }, [pathname]);

 function getCategoriaPorCodigo(codigo?: string): string {
  // Lista de códigos para situações iniciais ou burocráticas
  if (!codigo) return "nao_apreciado";
  const naoApreciado = [
    '901', '902', '905', '906', '907', '912', '917', '1010', '1030', 
    '1110', '1170', '1180', '1185', '1200', '1201', '1210', '1220', 
    '1221', '1223', '1290', '1291', '1312', '1381'
  ];

  // Lista de códigos para proposições em trâmite ativo ou aguardando decisão
  const emApreciacao = [
    '900', '903', '904', '910', '911', '914', '915', '918', '920', 
    '921', '922', '924', '925', '926', '927', '928', '929', '932', 
    '933', '934', '935', '936', '939', '1000', '1020', '1040', '1050', 
    '1052', '1060', '1070', '1080', '1090', '1150', '1160', '1161', 
    '1270', '1280', '1293', '1294', '1295', '1296', '1297', '1298', 
    '1299', '1300', '1301', '1302', '1303', '1304', '1305', '1310', 
    '1313', '1314', '1350', '1355', '1360', '1380'
  ];

  // Lista de códigos para proposições com trâmite finalizado ou arquivado
  const jaApreciado = [
    '923', '930', '931', '937', '940', '941', '950', '1120', 
    '1140', '1222', '1230', '1250', '1260', '1285', '1292'
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

  if (loading ) {
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
  const findIfRelactorIsPresent = (id: string) => eventDetails?.politicians?.find((politician) => politician.politicianId === id);
  const findRelactorName = (id: string) => eventDetails?.politicians?.find((politician) => politician.politicianId === id)?.politician.fullName;
  return (
    <div className="min-h-screen  bg-[#f4f4f4] p-6 font-sans text-[#1a1d1f]">
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
                  <StatusBadge status={eventDetails?.situation || ""}  />
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
                  {moment(eventDetails?.startDate).format("HH:mm")}
                  {eventDetails?.endDate &&
                    ` - ${moment(eventDetails?.endDate).format("HH:mm")}`}
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
                  {eventDetails?.local}. Consulte a aba &quot;Ordem do Dia&quot; para ver
                  os itens em pauta.
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
                <div className=" w-full flex gap-2 overflow-x-auto pb-2">
                  {orderPropositions.map((item,index) => (
                    <div
                      key={index}
                      className={cn(
                        "group relative flex h-12 w-12 flex-shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border font-bold transition-all",
                        getCategoriaPorCodigo(item.proposition?.situationId || "") === "ja_apreciado"
                          ? "border-[#3e5f48] bg-[#3e5f48] text-white" // Greenish
                          : getCategoriaPorCodigo(item.proposition?.situationId || "") === "em_apreciacao"// Highlight active
                            ? "border-[#d4a017] bg-[#d4a017] text-white" // Yellow/Gold
                            : "border-[#4a6b7c] bg-[#4a6b7c] text-white hover:bg-[#3b5563]", // Blueish/Gray
                      )}
                    >
                      <span className="text-lg">{index +1}</span>

                      { item.reporterId && findIfRelactorIsPresent(item.reporterId) && (
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
              <div className="rounded-xl border w-full border-gray-100 bg-[#fefcf8] p-6 shadow-sm">
                <h3 className="mb-4 flex items-center justify-between border-b border-gray-200 pb-2 font-serif text-lg font-bold text-[#1a1d1f]">
                  <span>2. Índice por Proposição</span>
                </h3>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {orderPropositions.map((prop, idx) => (
                    <button
                      onClick={() => setSelectedProposition(prop)}
                      key={idx}
                      className={cn(
                        "cursor-pointer rounded-md relative border px-3 py-2 text-center text-sm font-bold shadow-sm transition-colors",
                        getCategoriaPorCodigo(prop.proposition?.situationId || "") === "ja_apreciado"
                          ? "border-[#3e5f48] bg-[#3e5f48] text-white" // Greenish
                          : getCategoriaPorCodigo(prop.proposition?.situationId || "") === "em_apreciacao"// Highlight active
                            ? "s border-[#d4a017] bg-[#d4a017] text-white " // Yellow/Gold
                            : "border-[#4a6b7c] bg-[#4a6b7c] text-white hover:bg-[#3b5563]", // Blueish/Gray
                      )}
                    >
                      {prop.title}
                      {prop.reporterId && findIfRelactorIsPresent(prop.reporterId) && (
                        <div className="absolute right-1/2 -bottom-2 translate-x-1/2 rounded-full bg-white p-0.5 shadow-sm">
                          <Users size={10} className="text-[#3e5f48]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {selectedProposition && (
                   <div className="mt-6 overflow-hidden rounded-lg border border-[#3e5f48] bg-[#eef5f0]">
                  <div className="bg-[#3e5f48] px-4 py-2 text-center text-sm font-bold tracking-wider text-white uppercase">
                    Matéria Sobre a Mesa
                  </div>
                  <div className="space-y-3 p-4">
                    <h4 className="text-md font-bold text-[#1a1d1f] underline decoration-gray-300 underline-offset-4">
                      {selectedProposition.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-gray-700">
                      {selectedProposition.proposition?.description}
                    </p>
                    { selectedProposition.proposition?.situationDescription || (selectedProposition.reporterId && findIfRelactorIsPresent(selectedProposition.reporterId) ) ? (
                      
                      <div className="rounded border flex flex-col gap-4 border-gray-200 bg-white p-3 text-xs text-gray-500 shadow-sm">
                     {selectedProposition.proposition?.situationDescription && 
                     <>
                      <span className="mb-1 block font-bold text-gray-700">
                        Situação:
                      </span>
                     {selectedProposition.proposition?.situationDescription}
                     </>
                     } {selectedProposition.reporterId && findIfRelactorIsPresent(selectedProposition.reporterId) && 
                      <>
                      <span className="mb-1 block font-bold text-gray-700">
                        Relator:
                      </span>
                     {findRelactorName(selectedProposition.reporterId)}
                    </>
                    }
                    </div>
                    ) : null}
                  </div>
                </div>
                )}
                {/* Matéria Sobre a Mesa (Active Item) */}
               
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
                        <th className="px-6 py-4">Tipo</th>
                        <th className="px-6 py-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orderPropositions.map((item) => (
                        <tr
                          key={item.id}
                          className="transition-colors hover:bg-gray-50"
                        >
                          <td className="whitespace-nowrap px-6 py-4 font-bold text-[#749c5b]">
                            {item.title}
                          </td>
                          <td className="px-6 py-4 text-[#1a1d1f]">
                            {item.topic || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-[#6f767e]">
                            {item.regime || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-[#6f767e]">
                            {item.proposition?.typeAcronym}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <a
  href={item.proposition?.fullPropositionUrl || "#"}
  target="_blank"
  rel="noopener noreferrer"
  className="text-xs font-medium text-[#749c5b] hover:underline"
>
  Ver Detalhes
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
                          {p.politician.siglaPartido} - {p.politician.siglaUf}
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
