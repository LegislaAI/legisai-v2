"use client";
import { useApiContext } from "@/context/ApiContext";
import * as Select from "@radix-ui/react-select";
import {
  Calendar,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  FileText,
  Info,
  MapPin,
  Mic2,
  PlayCircle,
  User,
  Users,
} from "lucide-react";
import moment from "moment";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// --- CORES DEFINIDAS (Mapeamento para referência) ---
// Secondary: #749c5b
// Dark: #1a1d1f
// Light Dark: #6f767e
// Surface: #f4f4f4

// --- INTERFACES ---

// 1. Interface fornecida pelo usuário
export interface PropositionDetailsProps {
  createdAt: string;
  description: string;
  fullPropositionUrl: string;
  id: string;
  keywords: string;
  lastMovementDate: string;
  lastProcess: unknown | null; // Simplificado pois não foi fornecido PropositionProcessDetailsProps
  number: number;
  presentationDate: string;
  situationId: {
    acronym: string;
    description: string;
    id: string;
    name: string;
  };
  typeAcronym: string;
  typeId: {
    acronym: string;
    description: string;
    id: string;
    name: string;
  };
  updatedAt: string;
  url: string;
  year: number;
}

// 2. Interfaces auxiliares para a Sessão (Section 1.1 e 1.3)
interface SessionData {
  organ: string;
  date: string;
  scheduledTime: string;
  realTime?: string;
  endTime?: string;
  title: string;
  subtitle: string;
  authors: string[];
  status: "agendada" | "em_andamento" | "realizada" | "cancelada";
  mediaLink?: string;
  updatedBy: string; // Responsável pela lista de oradores
}

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

interface Speaker {
  id: string;
  position: number;
  name: string;
  party: string;
  state: string; // UF
  status: "falou" | "inscrito" | "desistiu";
}

// 3. Interface para o MOCK (Section 1.4)
interface SpeechSegment {
  id: string;
  speakerId: string;
  speakerName: string;
  timeStart: string;
  timeEnd: string;
  videoUrl: string; // Link direto para o trecho
  transcription: string;
  summary: string;
}

// --- MOCK DATA GENERATOR ---

const mockSession: SessionData = {
  organ: "Plenário Ulysses Guimarães",
  date: "2023-10-25",
  scheduledTime: "10:00",
  realTime: "10:15",
  endTime: "12:30",
  title: "Sessão Solene em Homenagem ao Empreendedorismo",
  subtitle: "Destinada a comemorar o Dia Nacional da Micro e Pequena Empresa.",
  authors: ["Dep. João Silva", "Dep. Maria Souza"],
  status: "realizada",
  mediaLink: "https://camara.leg.br/sessao/video",
  updatedBy: "Secretaria Geral da Mesa",
};

// Mock dos Requerimentos (baseado na interface PropositionDetailsProps)
const mockPropositions: PropositionDetailsProps[] = [
  {
    id: "req-001",
    number: 452,
    year: 2023,
    description:
      "Requer a realização de Sessão Solene para homenagear os 20 anos da Lei Geral da Micro e Pequena Empresa.",
    keywords: "Homenagem, Empreendedorismo",
    createdAt: "2023-09-01",
    presentationDate: "2023-09-02",
    lastMovementDate: "2023-09-10",
    lastProcess: null,
    fullPropositionUrl: "#",
    url: "#",
    updatedAt: "2023-09-10",
    typeAcronym: "REQ",
    typeId: {
      acronym: "REQ",
      description: "Requerimento",
      id: "1",
      name: "Requerimento",
    },
    situationId: {
      acronym: "APR",
      description: "Aprovada",
      id: "2",
      name: "Aprovada",
    },
  },
];

const mockSpeakers: Speaker[] = [
  {
    id: "spk-1",
    position: 1,
    name: "Dep. João Silva",
    party: "PL",
    state: "SP",
    status: "falou",
  },
  {
    id: "spk-2",
    position: 2,
    name: "Dep. Maria Souza",
    party: "PT",
    state: "BA",
    status: "falou",
  },
  {
    id: "spk-3",
    position: 3,
    name: "Dep. Carlos Lima",
    party: "MDB",
    state: "RJ",
    status: "desistiu",
  },
  {
    id: "spk-4",
    position: 4,
    name: "Dep. Ana Pereira",
    party: "PP",
    state: "MG",
    status: "inscrito",
  },
];

// MOCK Section 1.4 (Dados inexistentes na API)
const mockSpeeches: SpeechSegment[] = [
  {
    id: "seg-1",
    speakerId: "spk-1",
    speakerName: "Dep. João Silva",
    timeStart: "00:15:30",
    timeEnd: "00:25:45",
    videoUrl: "#link-trecho-1",
    transcription:
      "Senhor Presidente, nobres colegas. É com grande honra que subo a esta tribuna para celebrar a força motriz da nossa economia: o pequeno empreendedor...",
    summary:
      "O deputado destaca a importância econômica das PMEs e agradece a presença das autoridades.",
  },
  {
    id: "seg-2",
    speakerId: "spk-2",
    speakerName: "Dep. Maria Souza",
    timeStart: "00:28:10",
    timeEnd: "00:40:00",
    videoUrl: "#link-trecho-2",
    transcription:
      "Agradeço a oportunidade. Precisamos olhar para o crédito facilitado. O PRONAMPE foi um avanço, mas precisamos de mais...",
    summary:
      "A deputada foca na necessidade de políticas de crédito mais acessíveis para microempresários.",
  },
];

// --- COMPONENTES ---

const StatusBadge = ({ status }: { status: SessionData["status"] }) => {
  const styles = {
    agendada: "bg-blue-100 text-blue-800",
    em_andamento: "bg-[#749c5b]/20 text-[#749c5b] animate-pulse",
    realizada: "bg-gray-200 text-[#6f767e]",
    cancelada: "bg-red-100 text-red-800",
  };

  const labels = {
    agendada: "Agendada",
    em_andamento: "Em Andamento",
    realizada: "Realizada",
    cancelada: "Cancelada",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};

export default function SessionDetailScreen() {
  const pathname = usePathname();
  const { GetAPI } = useApiContext();
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [eventDetails, setEventDetails] = useState<EventDetailsAPI | null>(
    null,
  );
  const [sessionData, setSessionData] = useState<SessionData>(mockSession);

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

        // Map API data to SessionData format
        const startDate = new Date(event.startDate);
        const endDate = event.endDate ? new Date(event.endDate) : null;

        setSessionData({
          organ: event.local,
          date: event.startDate,
          scheduledTime: moment(startDate).format("HH:mm"),
          realTime: moment(startDate).format("HH:mm"),
          endTime: endDate ? moment(endDate).format("HH:mm") : undefined,
          title: event.eventType.name,
          subtitle: event.description,
          authors: [], // Not available in API - keep empty for now
          status: event.situation.toLowerCase().includes("realizada")
            ? "realizada"
            : "agendada",
          mediaLink: event.videoUrl || undefined,
          updatedBy: event.department.name || "Secretaria Geral da Mesa",
        });
      }
      setLoading(false);
    }

    fetchEventDetails();
  }, [pathname]);

  // Filtragem do Mock da seção 1.4
  const filteredSpeeches =
    selectedSpeakerId === "all"
      ? mockSpeeches
      : mockSpeeches.filter((s) => s.speakerId === selectedSpeakerId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] p-6 font-sans text-[#1a1d1f]">
        <div className="mx-auto space-y-8">
          <div className="h-64 w-full animate-pulse rounded-xl bg-gray-200" />
          <div className="h-48 w-full animate-pulse rounded-xl bg-gray-200" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="h-96 w-full animate-pulse rounded-xl bg-gray-200 lg:col-span-1" />
            <div className="h-96 w-full animate-pulse rounded-xl bg-gray-200 lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-6 font-sans text-[#1a1d1f]">
      <div className="mx-auto space-y-8">
        {/* --- 1.1 CABEÇALHO DA SESSÃO --- */}
        <header className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="p-6 text-[#1a1d1f]">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center space-x-2 text-[#749c5b]">
                <MapPin size={18} />
                <span className="text-sm font-semibold tracking-wide uppercase">
                  {sessionData.organ}
                </span>
              </div>
              <StatusBadge status={sessionData.status} />
            </div>

            <h1 className="mb-2 text-3xl font-bold">{sessionData.title}</h1>
            <p className="mb-6 text-lg text-gray-700 italic">
              {"'"}
              {sessionData.subtitle}
              {"'"}
            </p>

            <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col">
                <span className="mb-1 flex items-center gap-2 text-gray-400">
                  <Calendar size={14} /> Data
                </span>
                <span className="font-medium">
                  {new Date(sessionData.date).toLocaleDateString("pt-BR")}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="mb-1 flex items-center gap-2 text-gray-400">
                  <Clock size={14} /> Horário (Prev/Real)
                </span>
                <span className="font-medium">
                  {sessionData.scheduledTime}h{" "}
                  <span className="text-gray-500">/</span>{" "}
                  {sessionData.realTime || "--"}h
                </span>
              </div>

              {sessionData.endTime && (
                <div className="flex flex-col">
                  <span className="mb-1 flex items-center gap-2 text-gray-400">
                    <Clock size={14} /> Encerramento
                  </span>
                  <span className="font-medium">{sessionData.endTime}h</span>
                </div>
              )}

              <div className="flex flex-col">
                <span className="mb-1 flex items-center gap-2 text-gray-400">
                  <User size={14} /> Autoria
                </span>
                <span className="truncate font-medium">
                  {sessionData.authors.length > 0
                    ? sessionData.authors.join(", ")
                    : "Informação indisponível"}
                </span>
              </div>
            </div>
          </div>

          {sessionData.mediaLink && (
            <div className="flex cursor-pointer items-center justify-center gap-2 bg-[#749c5b] p-3 text-center font-medium text-white transition-colors hover:bg-[#658a4e]">
              <PlayCircle size={20} />
              <a href={sessionData.mediaLink} target="_blank" rel="noreferrer">
                Assitir Íntegra da Sessão
              </a>
            </div>
          )}
        </header>

        {/* --- 1.2 BLOCO DE REQUERIMENTOS --- */}
        <section className="relative rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          {/* PLACEHOLDER BANNER */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-lg border-2 border-orange-300 bg-orange-50 px-3 py-1.5">
            <Info size={16} className="text-orange-600" />
            <span className="text-xs font-bold text-orange-800 uppercase">
              PLACEHOLDER - API Não Disponível
            </span>
          </div>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#1a1d1f]">
            <FileText className="text-[#749c5b]" />
            Requerimentos de Origem
          </h2>

          <div className="grid gap-4">
            {mockPropositions.map((prop) => (
              <div
                key={prop.id}
                className="rounded-r-md border-l-4 border-[#749c5b] bg-gray-50 py-2 pl-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#1a1d1f]">
                      {prop.typeAcronym} {prop.number}/{prop.year}
                    </h3>
                    <p className="mt-1 text-sm text-[#6f767e]">
                      {prop.description}
                    </p>
                  </div>
                  <a
                    href={prop.fullPropositionUrl}
                    className="flex items-center gap-1 text-sm font-medium text-[#749c5b] hover:underline"
                  >
                    Inteiro Teor <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* --- 1.3 ORADORES INSCRITOS --- */}
          <section className="relative h-fit rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-1">
            {/* PLACEHOLDER BANNER */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-lg border-2 border-orange-300 bg-orange-50 px-3 py-1.5">
              <Info size={16} className="text-orange-600" />
              <span className="text-xs font-bold text-orange-800 uppercase">
                PLACEHOLDER - API Não Disponível
              </span>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#1a1d1f]">
                <Users className="text-[#749c5b]" />
                Oradores ({mockSpeakers.length})
              </h2>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-xs font-semibold text-[#6f767e] uppercase">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Nome</th>
                    <th className="p-3 text-right">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockSpeakers.map((speaker) => (
                    <tr key={speaker.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-[#6f767e]">
                        {speaker.position}º
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-[#1a1d1f]">
                          {speaker.name}
                        </div>
                        <div className="text-xs text-[#6f767e]">
                          {speaker.party}/{speaker.state}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-bold ${speaker.status === "falou" ? "bg-green-100 text-green-700" : ""} ${speaker.status === "inscrito" ? "bg-blue-100 text-blue-700" : ""} ${speaker.status === "desistiu" ? "bg-gray-100 text-gray-500 line-through" : ""} `}
                        >
                          {speaker.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-[#6f767e]">
              <Info size={12} />
              Atualizado por: {sessionData.updatedBy}
            </div>
          </section>

          {/* --- 1.4 TRECHOS POR ORADOR (MOCK COM RADIX) --- */}
          <section className="relative rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
            {/* PLACEHOLDER BANNER */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-lg border-2 border-orange-300 bg-orange-50 px-3 py-1.5">
              <Info size={16} className="text-orange-600" />
              <span className="text-xs font-bold text-orange-800 uppercase">
                PLACEHOLDER - API Não Disponível
              </span>
            </div>
            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#1a1d1f]">
                <Mic2 className="text-[#749c5b]" />
                Discursos e Transcrições
              </h2>

              {/* RADIX SELECT COMPONENT */}
              <Select.Root
                value={selectedSpeakerId}
                onValueChange={setSelectedSpeakerId}
              >
                <Select.Trigger
                  className="inline-flex h-[35px] min-w-[200px] items-center justify-between gap-[5px] rounded border border-[#749c5b] bg-white px-[15px] text-[13px] leading-none text-[#749c5b] outline-none hover:bg-gray-50 focus:shadow-[0_0_0_2px] focus:shadow-[#749c5b]/20 data-[placeholder]:text-[#749c5b]"
                  aria-label="Filtrar orador"
                >
                  <Select.Value placeholder="Filtrar por orador..." />
                  <Select.Icon className="text-[#749c5b]">
                    <ChevronDown size={14} />
                  </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                  <Select.Content className="z-50 overflow-hidden rounded-md border border-gray-200 bg-white shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
                    <Select.Viewport className="p-[5px]">
                      <Select.Item
                        value="all"
                        className="relative flex h-[25px] cursor-pointer items-center rounded-[3px] pr-[35px] pl-[25px] text-[13px] leading-none text-[#1a1d1f] outline-none select-none data-[highlighted]:bg-[#749c5b] data-[highlighted]:text-white"
                      >
                        <Select.ItemText>Todos os Oradores</Select.ItemText>
                        <Select.ItemIndicator className="absolute left-0 inline-flex w-[25px] items-center justify-center">
                          <Check size={14} />
                        </Select.ItemIndicator>
                      </Select.Item>

                      <Select.Separator className="m-[5px] h-[1px] bg-gray-100" />

                      {mockSpeakers
                        .filter((s) => s.status === "falou")
                        .map((speaker) => (
                          <Select.Item
                            key={speaker.id}
                            value={speaker.id}
                            className="relative flex h-[25px] cursor-pointer items-center rounded-[3px] pr-[35px] pl-[25px] text-[13px] leading-none text-[#1a1d1f] outline-none select-none data-[highlighted]:bg-[#749c5b] data-[highlighted]:text-white"
                          >
                            <Select.ItemText>{speaker.name}</Select.ItemText>
                            <Select.ItemIndicator className="absolute left-0 inline-flex w-[25px] items-center justify-center">
                              <Check size={14} />
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            <div className="space-y-6">
              {filteredSpeeches.length > 0 ? (
                filteredSpeeches.map((speech) => (
                  <div
                    key={speech.id}
                    className="flex flex-col gap-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0 md:flex-row"
                  >
                    {/* Coluna Vídeo/Info */}
                    <div className="flex w-full flex-col gap-3 rounded-lg bg-gray-50 p-4 md:w-1/3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#749c5b]">
                        <User size={16} />
                        {speech.speakerName}
                      </div>
                      <div className="flex w-fit items-center gap-2 rounded bg-gray-200 px-2 py-1 font-mono text-xs text-[#6f767e]">
                        <Clock size={12} />
                        {speech.timeStart} - {speech.timeEnd}
                      </div>
                      <a
                        href={speech.videoUrl}
                        className="mt-auto flex w-full items-center justify-center gap-2 rounded bg-[#1a1d1f] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-black"
                      >
                        <PlayCircle size={14} />
                        Ver Trecho
                      </a>
                    </div>

                    {/* Coluna Transcrição */}
                    <div className="w-full md:w-2/3">
                      <div className="mb-3">
                        <span className="text-xs font-bold tracking-wider text-[#749c5b] uppercase">
                          Resumo IA
                        </span>
                        <p className="mt-1 rounded bg-[#f4f4f4] p-2 text-sm text-[#6f767e] italic">
                          {"'"}
                          {speech.summary}
                          {"'"}
                        </p>
                      </div>

                      <div>
                        <span className="text-xs font-bold tracking-wider text-[#1a1d1f] uppercase">
                          Transcrição
                        </span>
                        <p className="mt-2 text-sm leading-relaxed text-[#1a1d1f]">
                          {speech.transcription}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-[#6f767e]">
                  Nenhum discurso encontrado para este filtro.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
