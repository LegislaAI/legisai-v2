export interface EventDetailsProps {
  createdAt: string;
  department: {
    id: string;
    name: string;
    surname: string;
  };
  description: string;
  endDate: string;
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
  videoUrl: string;
}
