"use client";

import { useApiContext } from "@/context/ApiContext";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { NewsCard } from "./components/News";

// Definição de tipo, ajuste conforme o retorno da API
interface NewsType {
  id: string;
  title: string;
  summary: string;
  category: "websites" | "others" | "legis" | string;
}

export default function News() {
  const [selected, setSelected] = useState<
    "all" | "websites" | "others" | "legis"
  >("all");
  const [newsToday, setNewsToday] = useState<NewsType[]>([]);
  const [newsAll, setNewsAll] = useState<NewsType[]>([]);
  const [loadingToday, setLoadingToday] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [errorToday, setErrorToday] = useState("");
  const [errorAll, setErrorAll] = useState("");
  const [page, setPage] = useState(1);
  const hasMore = useRef(true);

  const { GetAPI } = useApiContext();

  // Fetch today's news once
  useEffect(() => {
    async function fetchToday() {
      setLoadingToday(true);
      setErrorToday("");
      try {
        const res = await GetAPI("/news/today", true);
        if (res.status === 200 && Array.isArray(res.body)) {
          setNewsToday(res.body as NewsType[]);
        } else if (res.status === 200 && Array.isArray(res.body.news)) {
          setNewsToday(res.body.news as NewsType[]);
        } else {
          setErrorToday(
            res.body?.message || "Erro ao carregar notícias de hoje",
          );
        }
      } catch (e) {
        console.error(e);
        setErrorToday("Erro ao carregar notícias de hoje");
      } finally {
        setLoadingToday(false);
      }
    }
    fetchToday();
  }, [GetAPI]);

  // Fetch paginated news and handle infinite scroll
  const fetchAll = useCallback(
    async (p: number) => {
      if (loadingAll || !hasMore.current) return;
      setLoadingAll(true);
      setErrorAll("");
      try {
        const res = await GetAPI(`/news?page=${p}`, true);
        let items: NewsType[] = [];
        if (res.status === 200 && Array.isArray(res.body)) {
          items = res.body;
        } else if (res.status === 200 && Array.isArray(res.body.news)) {
          items = res.body.news;
        } else {
          setErrorAll(res.body?.message || "Erro ao carregar notícias");
          hasMore.current = false;
        }
        if (items.length > 0) {
          setNewsAll((prev) => [...prev, ...items]);
          if (items.length < 10) {
            hasMore.current = false;
          }
        }
      } catch (e) {
        console.error(e);
        setErrorAll("Erro ao carregar notícias");
        hasMore.current = false;
      } finally {
        setLoadingAll(false);
      }
    },
    [GetAPI, loadingAll],
  );

  // Initial load
  useEffect(() => {
    fetchAll(page);
  }, [page]);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition =
        window.innerHeight + document.documentElement.scrollTop;
      const bottomPosition = document.documentElement.offsetHeight;
      if (
        scrollPosition >= bottomPosition * 0.8 &&
        hasMore.current &&
        !loadingAll
      ) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingAll]);

  const filterNews = (list: NewsType[]) =>
    selected === "all" ? list : list.filter((n) => n.category === selected);

  const filteredToday = Array.isArray(newsToday) ? filterNews(newsToday) : [];
  const filteredAll = Array.isArray(newsAll) ? filterNews(newsAll) : [];

  return (
    <div className="flex h-full w-full flex-col items-center gap-4 rounded-xl bg-white lg:gap-12">
      {/* Filtros */}
      <div className="flex w-full gap-6 p-2 lg:px-8 lg:pt-10">
        {[
          { key: "all", label: "Todos" },
          { key: "websites", label: "Websites" },
          { key: "legis", label: "Câmara Legislativa" },
          { key: "others", label: "Outros" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelected(tab.key as typeof selected)}
            className={cn(
              "hover:border-primary/80 cursor-pointer rounded-4xl border-2 border-transparent text-sm font-medium text-gray-600 hover:px-2 focus:outline-none lg:text-base",
              selected === tab.key &&
                "border-primary text-primary px-2 py-1 font-bold",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notícias de Hoje */}
      <div className="flex w-full flex-col gap-2 px-2 lg:gap-6 lg:px-8">
        <p className="text-sm font-medium text-gray-600">Hoje</p>
        <div className="flex flex-col gap-4 overflow-hidden p-1 lg:gap-8">
          {loadingToday && <p>Carregando...</p>}
          {errorToday && <p className="text-red-500">{errorToday}</p>}
          {!loadingToday &&
            !errorToday &&
            (filteredToday.length > 0 ? (
              filteredToday.map((news) => (
                <NewsCard
                  key={news.id}
                  title={news.title}
                  summary={news.summary}
                />
              ))
            ) : (
              <p className="text-gray-500">Nenhuma notícia hoje.</p>
            ))}
        </div>
      </div>

      {/* Notícias Anteriores com Scroll Infinito */}
      <div className="flex w-full flex-col gap-2 px-2 lg:gap-6 lg:px-8">
        <p className="text-sm font-medium text-gray-600">Anterior</p>
        <div className="flex flex-col gap-4 overflow-hidden p-1 lg:gap-8">
          {newsAll.length === 0 && loadingAll && <p>Carregando...</p>}
          {errorAll && <p className="text-red-500">{errorAll}</p>}
          {!loadingAll &&
            !errorAll &&
            (filteredAll.length > 0 ? (
              filteredAll.map((news) => (
                <NewsCard
                  key={news.id}
                  title={news.title}
                  summary={news.summary}
                />
              ))
            ) : (
              <p className="text-gray-500">Nenhuma notícia anterior.</p>
            ))}
          {loadingAll && filteredAll.length > 0 && <p>Carregando mais...</p>}
          {!hasMore.current && filteredAll.length > 0 && (
            <p className="text-gray-500">Não há mais notícias.</p>
          )}
        </div>
      </div>
    </div>
  );
}
