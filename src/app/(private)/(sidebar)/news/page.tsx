"use client";

import { CustomPagination } from "@/components/ui/CustomPagination";
import { NewsCard, NewsItem } from "@/components/v2/components/news/NewsCard";
import { useApiContext } from "@/context/ApiContext";
import { useDebounce } from "@/hooks/useDebounce";
import { Newspaper, Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function NewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const { GetAPI } = useApiContext();

  async function fetchNews() {
    setIsLoading(true);
    try {
      const searchFilter = debouncedSearch ? `&query=${debouncedSearch}` : "";
      const endpoint = `/news?page=${currentPage}${searchFilter}`;

      const response = await GetAPI(endpoint, false);

      if (response.status === 200 && response.body) {
        const data =
          response.body.news ||
          response.body.data ||
          response.body.items ||
          (Array.isArray(response.body) ? response.body : []);
        const meta =
          response.body.pages ||
          response.body.meta?.totalPages ||
          response.body.totalPages ||
          1;

        if (Array.isArray(data)) {
          setNews(data);
        }

        setTotalPages(meta);
      } else {
        setNews([]);
      }
    } catch (error) {
      console.error("Failed to fetch news", error);
      setNews([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchNews();
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  return (
    <div className="min-h-screen w-full bg-[#f4f4f4] font-sans text-[#1a1d1f]">
      <div className="w-full space-y-8">
        {/* HEADER */}
        <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-[#1a1d1f]">
              <div className="rounded-xl bg-[#749c5b] p-2 text-white shadow-lg shadow-[#749c5b]/20">
                <Newspaper size={24} />
              </div>
              Notícias
            </h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              Fique por dentro das últimas notícias da Câmara dos Deputados.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full min-w-[300px] md:w-auto">
            <Search
              className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar notícias..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm shadow-sm transition-all focus:border-[#749c5b] focus:ring-2 focus:ring-[#749c5b]/20 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-20 text-center text-gray-400">
              <p>Carregando notícias...</p>
            </div>
          ) : news.length > 0 ? (
            news.map((newsItem) => (
              <NewsCard key={newsItem.id} news={newsItem} />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-gray-100 bg-white py-20 text-center text-gray-400">
              <Newspaper size={48} className="mx-auto mb-4 opacity-20" />
              <p>Nenhuma notícia encontrada para os filtros selecionados.</p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <CustomPagination
              pages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
