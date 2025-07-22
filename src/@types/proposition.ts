import { PoliticianProps } from "./politician";

export interface PropositionProps {
  createdAt: string;
  description: string;
  fullPropositionUrl: string;
  id: string;
  keywords: string;
  lastMovementDate: string;
  number: number;
  presentationDate: string;
  situationId: string;
  typeAcronym: string;
  typeId: string;
  updatedAt: string;
  url: string;
  year: number;
}

export interface EventPropositionProps {
  eventId: string;
  id: string;
  proposition: PropositionProps;
  regime: string;
  relatedProposal: PropositionProps | null;
  report: string | null;
  reporter: PoliticianProps | null;
  sequence: number;
  situation: string;
  title: string;
  topic: string;
  uri: string;
}

export interface PropositionProcessDetailsProps {
  agencyAcronym: string;
  agencyUri: string;
  appreciation: string;
  date: string;
  dispatch: string;
  id: string;
  lastReporterUri: string | null;
  processingDescription: string;
  processingTypeId: string;
  propositionId: string;
  regime: string;
  scope: string;
  sequency: number;
  situationDescription: string | null;
  situationId: string | null;
  url: string | null;
}

export interface PropositionDetailsProps {
  createdAt: string;
  description: string;
  fullPropositionUrl: string;
  id: string;
  keywords: string;
  lastMovementDate: string;
  lastProcess: PropositionProcessDetailsProps | null;
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

export interface VotesProps {
  createdAt: string;
  date: string;
  description: string;
  eventId: string;
  eventType: string;
  eventUrl: string;
  id: string;
  mainProposition: PropositionProps | null;
  negativeVotes: number;
  otherVotes: number;
  positiveVotes: number;
  proposition: PropositionProps;
  result: boolean;
  title: string;
  totalVotes: number;
  updatedAt: string;
  uri: string;
}

export interface VoteDetailsProps {
  date: string;
  id: string;
  politician: PoliticianProps;
  vote: string;
  votingId: string;
}
