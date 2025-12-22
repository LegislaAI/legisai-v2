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
  politicianNews: PoliticianNewsProps[];
  setPoliticianNews: React.Dispatch<
    React.SetStateAction<PoliticianNewsProps[]>
  >;
  politicianNewsPages: number;
  setPoliticianNewsPages: React.Dispatch<React.SetStateAction<number>>;
  isLoadingPoliticianNews: boolean;
  setIsLoadingPoliticianNews: React.Dispatch<React.SetStateAction<boolean>>;
  GetPoliticianNews: () => Promise<void>;
  GetPoliticians: ({ page, query }: GetPoliticiansProps) => Promise<void>;
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

  async function GetPoliticians({ page, query }: GetPoliticiansProps) {
    let params = "";
    if (page) {
      params += `?page=${page}`;
    }
    if (query) {
      params += `&query=${query}`;
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
    if (!id) return;
    let params = "";
    params += id;
    params += `?year=${selectedYear}`;
    console.log("params", params);
    const details = await GetAPI(`/politician/details/${params}`, true);
    console.log("details", details.body);
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

  useEffect(() => {
    GetPoliticians({ page: "1" });
  }, []);

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
