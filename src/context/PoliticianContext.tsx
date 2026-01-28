"use client";

import {
  PoliticianDetailsProps,
  PoliticianNewsProps,
  PoliticianProps,
} from "@/@types/v2/politician";
import { useCookies } from "next-client-cookies";
import { createContext, useContext, useEffect, useState } from "react";
import { useApiContext } from "./ApiContext";

interface GetPoliticiansProps {
  page: string;
  query?: string;
  legislature?: number;
}

interface PoliticianContextProps {
  politicians: PoliticianProps[];
  politicianPages: number;
  selectedPolitician: PoliticianDetailsProps | null;
  setSelectedPolitician: React.Dispatch<
    React.SetStateAction<PoliticianDetailsProps | null>
  >;
  selectedPoliticianId: string;
  setSelectedPoliticianId: React.Dispatch<React.SetStateAction<string>>;
  selectedYear: string;
  loading: boolean;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedYear: React.Dispatch<React.SetStateAction<string>>;
  // Legislature
  selectedLegislature: number | null;
  setSelectedLegislature: React.Dispatch<React.SetStateAction<number | null>>;
  availableLegislatures: number[];
  currentLegislature: number | null;
  // News
  politicianNews: PoliticianNewsProps[];
  setPoliticianNews: React.Dispatch<
    React.SetStateAction<PoliticianNewsProps[]>
  >;
  politicianNewsPages: number;
  setPoliticianNewsPages: React.Dispatch<React.SetStateAction<number>>;
  isLoadingPoliticianNews: boolean;
  setIsLoadingPoliticianNews: React.Dispatch<React.SetStateAction<boolean>>;
  GetPoliticianNews: () => Promise<void>;
  GetPoliticians: ({
    page,
    query,
    legislature,
  }: GetPoliticiansProps) => Promise<void>;
  GetSelectedPoliticianDetails: () => Promise<void>;
}

const PoliticianContext = createContext<PoliticianContextProps | undefined>(
  undefined,
);

interface ProviderProps {
  children: React.ReactNode;
}

export const PoliticianContextProvider = ({ children }: ProviderProps) => {
  const cookies = useCookies();
  const { GetAPI } = useApiContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [politicians, setPoliticians] = useState<PoliticianProps[]>([]);
  const [selectedPoliticianId, setSelectedPoliticianId] = useState<string>("");
  const [selectedPolitician, setSelectedPolitician] =
    useState<PoliticianDetailsProps | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString(),
  );
  const [politicianPages, setPoliticianPages] = useState<number>(0);
  const [politicianNews, setPoliticianNews] = useState<PoliticianNewsProps[]>(
    [],
  );
  const [politicianNewsPages, setPoliticianNewsPages] = useState<number>(0);
  const [isLoadingPoliticianNews, setIsLoadingPoliticianNews] =
    useState<boolean>(false);

  // Legislature state
  const [selectedLegislature, setSelectedLegislature] = useState<number | null>(
    null,
  );
  const [availableLegislatures, setAvailableLegislatures] = useState<number[]>(
    [],
  );
  const [currentLegislature, setCurrentLegislature] = useState<number | null>(
    null,
  );

  // Fetch available legislatures on mount
  async function GetLegislatures() {
    const response = await GetAPI("/politician/legislatures", true);
    if (response.status === 200) {
      setAvailableLegislatures(response.body.available);
      setCurrentLegislature(response.body.current);

      // Set selected legislature from cookie or default to current
      const savedLegislature = cookies.get("selectedLegislature");
      if (
        savedLegislature &&
        response.body.available.includes(Number(savedLegislature))
      ) {
        setSelectedLegislature(Number(savedLegislature));
      } else {
        setSelectedLegislature(response.body.current);
        cookies.set("selectedLegislature", String(response.body.current));
      }
    }
  }

  async function GetPoliticians({
    page,
    query,
    legislature,
  }: GetPoliticiansProps) {
    let params = "";
    if (page) {
      params += `?page=${page}`;
    }
    if (query) {
      params += `&query=${query}`;
    }
    if (legislature) {
      params += `&legislature=${legislature}`;
    }
    const politicians = await GetAPI(`/politician${params}`, true);
    if (politicians.status === 200) {
      setPoliticians(politicians.body.politicians);
      setPoliticianPages(politicians.body.pages);
    }
  }

  async function GetSelectedPoliticianDetails() {
    setLoading(true);
    let id = "";
    if (cookies.get("selectedPoliticianId")) {
      id = cookies.get("selectedPoliticianId") as string;
      setSelectedPoliticianId(id);
    } else {
      id = selectedPoliticianId;
    }
    if (!id) {
      setLoading(false);
      return;
    }
    let params = "";
    params += id;
    params += `?year=${selectedYear}`;
    const details = await GetAPI(`/politician/details/${params}`, true);
    if (details.status === 200) {
      setLoading(false);
      return setSelectedPolitician(details.body);
    } else {
      setLoading(false);
      return setSelectedPolitician(null);
    }
  }

  async function GetPoliticianNews() {
    setIsLoadingPoliticianNews(true);
    const news = await GetAPI(`/news/${selectedPoliticianId}?page=1`, true);
    if (news.status === 200) {
      setPoliticianNewsPages(news.body.pages);
      setPoliticianNews(news.body.news);
      return setIsLoadingPoliticianNews(false);
    }
  }

  // Fetch legislatures on mount
  useEffect(() => {
    GetLegislatures();
  }, []);

  // Fetch politicians when legislature changes
  useEffect(() => {
    if (selectedLegislature) {
      GetPoliticians({ page: "1", legislature: selectedLegislature });
      // Save to cookie
      cookies.set("selectedLegislature", String(selectedLegislature));
    }
  }, [selectedLegislature]);

  useEffect(() => {
    if (selectedPoliticianId || cookies.get("selectedPoliticianId")) {
      GetSelectedPoliticianDetails();
      GetPoliticianNews();
    }
  }, [
    selectedYear,
    selectedPoliticianId,
    cookies.get("selectedPoliticianId")
      ? cookies.get("selectedPoliticianId")
      : null,
  ]);

  return (
    <PoliticianContext.Provider
      value={{
        loading,
        politicians,
        politicianPages,
        selectedPolitician,
        setSelectedPolitician,
        selectedPoliticianId,
        setSelectedPoliticianId,
        selectedYear,
        setSelectedYear,
        // Legislature
        selectedLegislature,
        setSelectedLegislature,
        availableLegislatures,
        currentLegislature,
        // News
        politicianNews,
        setPoliticianNews,
        politicianNewsPages,
        setPoliticianNewsPages,
        isLoadingPoliticianNews,
        setIsLoadingPoliticianNews,
        GetPoliticianNews,
        GetPoliticians,
        GetSelectedPoliticianDetails,
      }}
    >
      {children}
    </PoliticianContext.Provider>
  );
};

export function usePoliticianContext() {
  const context = useContext(PoliticianContext);
  if (!context) {
    throw new Error(
      "usePoliticianContext deve ser usado dentro de um PoliticianContextProvider",
    );
  }
  return context;
}
