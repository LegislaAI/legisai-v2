"use client";
import { BackButton } from "@/components/v2/components/ui/BackButton";
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

interface EventProposition {
  id: string;
  sequence: number;
  title: string;
  topic?: string;
  proposition?: PropositionDetailsProps;
  // Note: The API might return nested proposition details if configured or just basic info
  // Based on our implementation, we link existing propositions.
}

interface EventPolitician {
  id: string;
  politician: {
    id: string;
    name: string;
    politicalPartyAcronym: string;
    state: string;
    url: string;
  };
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
  EventProposition: EventProposition[];
  politicians: EventPolitician[];
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
  organ: "Plenário",
  date: "",
  scheduledTime: "",
  realTime: "",
  endTime: "",
  title: "",
  subtitle: "",
  authors: [],
  status: "agendada",
  mediaLink: "",
  updatedBy: "Secretaria Geral da Mesa",
};

// MOCK Section 1.4 (Dados inexistentes na API) - Mantido conforme solicitação
const mockSpeeches: SpeechSegment[] = [
  // ... Deixar vazio ou exemplificar se necessário, mas o usuário disse para não implementar discursos agora.
  // Vou manter vazio para não mostrar placeholders falsos de discurso.
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

  // Real Data State
  const [propositions, setPropositions] = useState<EventProposition[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);

  // Fetch event details from API
  useEffect(() => {
    async function fetchEventDetails() {
      const eventId = pathname.split("/").pop();
      if (!eventId) return;

      setLoading(true);
      const response = await GetAPI(`/event/details/${eventId}`, true);
      if (response.status === 200) {
        const apiEvent: EventDetailsAPI = response.body;
        // Note: Check if backend returns { event: ... } or just ...
        // Based on our implementation, the controller returns the object directly.
        // So `response.body` is the event object.

        setEventDetails(apiEvent);

        // Map API data to SessionData format
        const startDate = new Date(apiEvent.startDate);
        const endDate = apiEvent.endDate ? new Date(apiEvent.endDate) : null;

        setSessionData({
          organ:
            apiEvent.local ||
            apiEvent.department?.name ||
            "Câmara dos Deputados",
          date: apiEvent.startDate,
          scheduledTime: moment(startDate).utc().format("HH:mm"),
          realTime: moment(startDate).utc().format("HH:mm"), // Na API da camara, schedule e real costumam ser o mesmo campo no inicio
          endTime: endDate ? moment(endDate).utc().format("HH:mm") : undefined,
          title: apiEvent.eventType?.name,
          subtitle: apiEvent.description,
          authors: [], // Info difícil de extrair diretamente do evento sem parsear description
          status:
            apiEvent.situation?.toLowerCase().includes("realizada") ||
            apiEvent.situation?.toLowerCase().includes("encerrada")
              ? "realizada"
              : "agendada",
          mediaLink: apiEvent.videoUrl || undefined,
          updatedBy: apiEvent.department?.name || "Secretaria Geral da Mesa",
        });

        // Set Propositions
        setPropositions(apiEvent.EventProposition || []);

        // Set Speakers
        // Map from politicians array to Speaker interface
        if (apiEvent.politicians) {
          const mappedSpeakers: Speaker[] = apiEvent.politicians.map(
            (ep: EventPolitician, index: number) => ({
              id: ep.politician.id,
              position: index + 1,
              name: ep.politician.name,
              party: ep.politician.politicalPartyAcronym,
              state: ep.politician.state,
              status: "falou", // Assume everyone linked here spoke or was present
            }),
          );
          // setSpeakers(mappedSpeakers);
        }
      }
      setLoading(false);
    }

    fetchEventDetails();
  }, [pathname, GetAPI]);

  // Filtragem do Mock da seção 1.4 (Mantendo vazio/mock por enquanto)
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
        <BackButton />
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
                  {/* Autoria é complexa de extrair, mantendo placeholder se vazio */}
                  {sessionData.authors.length > 0
                    ? sessionData.authors.join(", ")
                    : "Ver requerimentos"}
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
          {/* REMOVED PLACEHOLDER BANNER */}

          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#1a1d1f]">
            <FileText className="text-[#749c5b]" />
            Requerimentos de Origem
          </h2>

          <div className="grid gap-4">
            {propositions.length > 0 ? (
              propositions.map((prop) => (
                <div
                  key={prop.id}
                  className="rounded-r-md border-l-4 border-[#749c5b] bg-gray-50 py-2 pl-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#1a1d1f]">
                        {prop.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#6f767e]">
                        {prop.topic}
                      </p>
                    </div>
                    {prop.proposition && (
                      <a
                        href={prop.proposition.fullPropositionUrl || "#"}
                        className="flex items-center gap-1 text-sm font-medium text-[#749c5b] hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Inteiro Teor <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                Nenhum requerimento vinculado a esta sessão.
              </p>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* --- 1.3 ORADORES INSCRITOS --- */}
          <section className="relative h-fit overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-1">
            <div className="absolute top-0 left-0 flex h-full w-full items-center justify-center gap-2 bg-white/50 backdrop-blur-xs">
              <Info size={16} className="text-orange-600" />
              <span className="text-xs font-bold text-orange-800 uppercase">
                Em Breve - API Não Disponível
              </span>
            </div>
            {/* REMOVED PLACEHOLDER BANNER */}

            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#1a1d1f]">
                <Users className="text-[#749c5b]" />
                Oradores ({speakers.length})
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
                  {speakers.length > 0 ? (
                    speakers.map((speaker, idx) => (
                      <tr key={speaker.id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium text-[#6f767e]">
                          {idx + 1}º
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-500">
                        Não foi possível carregar os oradores.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-[#6f767e]">
              <Info size={12} />
              Atualizado por: {sessionData.updatedBy}
            </div>
          </section>

          {/* --- 1.4 TRECHOS POR ORADOR (MOCK COM RADIX) --- */}
          <section className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="absolute top-0 left-0 flex h-full w-full items-center justify-center gap-2 bg-white/50 backdrop-blur-xs">
              <Info size={16} className="text-orange-600" />
              <span className="text-xs font-bold text-orange-800 uppercase">
                Em Breve - API Não Disponível
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

                      {speakers.map((speaker) => (
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
