export interface PoliticianProps {
  address: string;
  birthDate: string;
  email: string;
  facebook: string | null;
  id: string;
  imageUrl: string;
  instagram: string | null;
  name: string;
  phone: string;
  placeOfBirth: string;
  politicalParty: string;
  politicalPartyAcronym: string;
  state: string;
  tiktok: string | null;
  url: string;
  youtube: string | null;
}

export interface PoliticianDetailsProps extends PoliticianProps {
  finance: {
    contractedPeople: string;
    contractedPeopleUrl: string;
    diplomaticPassport: string;
    functionalPropertyUsage: string;
    grossSalary: string;
    housingAssistant: string;
    id: string;
    monthlyCosts: {
      cabinetQuota: number | null;
      id: string;
      month: number;
      parliamentaryQuota: number | null;
      politicianFinanceId: string;
      politicianId: string;
      year: number;
    }[];
    politicianId: string;
    trips: string;
    unusedCabinetQuota: number;
    unusedParliamentaryQuota: number;
    usedCabinetQuota: number;
    usedParliamentaryQuota: number;
    year: number;
  };
  profile: {
    commissions: string;
    committeesJustifiedAbsences: string;
    committeesPresence: string;
    committeesUnjustifiedAbsences: string;
    createdProposals: string;
    createdProposalsUrl: string | null;
    id: string;
    plenaryJustifiedAbsences: string;
    plenaryPresence: string;
    plenaryUnjustifiedAbsences: string;
    politicianId: string;
    relatedProposals: string;
    relatedProposalsUrl: string | null;
    rollCallVotes: string;
    rollCallVotesUrl: string | null;
    speeches: string;
    speechesAudiosUrl: string;
    speechesVideosUrl: string;
    year: number;
  };
  positions: {
    id: string;
    name: string;
    politicianId: string;
    position: string;
    startDate: string;
    year: number;
  }[];
}

export interface PoliticianNewsProps {
  createdAt: string;
  id: string;
  politicians: PoliticianProps[];
  summary: string;
  title: string;
  type: string;
  url: string;
}
