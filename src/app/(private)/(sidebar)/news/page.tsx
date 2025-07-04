"use client";

import { PoliticianProps } from "@/@types/politician";
import { CustomPagination } from "@/components/CustomPagination";
import { useApiContext } from "@/context/ApiContext";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { NewsCard } from "./components/News";

export interface NewsTypeProps {
  createdAt: string;
  id: string;
  politicians: PoliticianProps[];
  summary: string;
  title: string;
  type: string;
  url: string;
}

export default function News() {
  const [selected, setSelected] = useState<
    "all" | "websites" | "others" | "legis"
  >("all");
  const [loadingNews, setLoadingNews] = useState(true);
  const [news, setNews] = useState<NewsTypeProps[]>([]);
  const [newsPages, setNewsPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { GetAPI } = useApiContext();

  async function GetNews() {
    const news = await GetAPI(
      `/news?page=${currentPage}&type=PARLIAMENT`,
      true,
    );
    if (news.status === 200) {
      setNews(news.body.news);
      setNewsPages(news.body.pages);
      setLoadingNews(false);
    }
  }

  useEffect(() => {
    GetNews();
  }, [currentPage]);

  return (
    <div className="flex h-full w-full flex-col items-center gap-4 rounded-xl bg-white lg:gap-12">
      {/* Filtros */}
      <div className="flex w-full gap-6 p-2 lg:px-8 lg:pt-10">
        {[
          { key: "all", label: "Todos" },
          { key: "legis", label: "Câmara Legislativa" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelected(tab.key as typeof selected)}
            className={cn(
              "hover:border-secondary/80 cursor-pointer rounded-4xl border-2 border-transparent text-sm font-medium text-gray-600 hover:px-2 focus:outline-none lg:text-base",
              selected === tab.key &&
                "border-secondary text-secondary px-2 py-1 font-bold",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex w-full flex-col gap-2 px-2 lg:gap-6 lg:px-8">
        <div className="flex flex-col gap-4 overflow-hidden p-1 lg:gap-8">
          {news.length === 0 && loadingNews && <p>Carregando...</p>}
          {!loadingNews &&
            (news.length > 0 ? (
              news.map((news) => (
                <NewsCard
                  key={news.id}
                  title={news.title}
                  summary={news.summary}
                  createdAt={news.createdAt}
                />
              ))
            ) : (
              <p className="text-gray-500">Nenhuma notícia anterior.</p>
            ))}
        </div>
      </div>
      <div className="w-full">
        <CustomPagination
          pages={newsPages}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}
