import { VoteDetailsProps } from "@/@types/proposition";

export interface Department {
  id: string;
  name: string;
  surname: string;
  acronym: string;
  type: string;
  uri: string;
}

export interface EventType {
  id: string;
  name: string;
  acronym: string;
  description: string;
  code: string;
}

export interface Politician {
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

export interface EventPolitician {
  id: string;
  eventId: string;
  politicianId: string;
  politician: Politician;
}

export interface PropositionDetails {
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

export interface EventProposition {
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

export interface EventVoting {
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

export interface EventDetailsAPI {
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
  aiOverviewSummary: string | null;
  aiOverviewGeneratedAt: string | null;
  aiDashboardJson: AiDashboardJson | null;
  aiDashboardGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiDashboardJson {
  meta?: {
    tom?: string;
    duracaoEstimada?: string | null;
    oradoresUnicos?: number;
  };
  resumoExecutivo?: string;
  principaisDecisoes?: Array<{
    titulo: string;
    tipo: string;
    tema: string;
    detalhe: string;
  }>;
  embates?: Array<{
    tema: string;
    atores: string[];
    resumo: string;
  }>;
  destaquesDiscursos?: Array<{
    deputado: string;
    partido: string | null;
    trecho: string;
  }>;
  dimensoes?: {
    conflito?: string;
    efetividade?: string;
    fluidez?: string;
    justificativa?: string;
  };
  insights?: Array<{
    titulo: string;
    tipo: string;
    interpretacao: string;
    evidencia: string;
  }>;
  sinteseFinal?: string;
}

export interface BrevesComunicacoesResponse {
  exists: boolean;
  speakers: Array<{
    name: string;
    time: string;
    party?: string;
    speechSummary?: string;
    transcription?: string;
    duration?: string;
  }>;
  summary: string | null;
  error: string | null;
  processing?: boolean;
}

export type { VoteDetailsProps };
