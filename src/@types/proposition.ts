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
