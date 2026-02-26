"use client";

import { useApiContext } from "@/context/ApiContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Newspaper,
} from "lucide-react";
import { useEffect, useState } from "react";

interface News {
  id: string;
  title: string;
  summary: string;
  url: string;
  type: string;
  createdAt: string;
}

interface NewsTabProps {
  eventId: string;
}

export function NewsTab({ eventId }: NewsTabProps) {
  const { GetAPI } = useApiContext();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      const response = await GetAPI(
        `/event/${eventId}/news?page=${currentPage}`,
        true
      );
      if (response.status === 200) {
        setNews(response.body.news || []);
        setTotalPages(response.body.pages || 0);
      }
      setLoading(false);
    }

    if (eventId) {
      fetchNews();
    }
  }, [eventId, currentPage, GetAPI]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#749c5b] border-t-transparent" />
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <Newspaper className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h3 className="text-lg font-bold text-[#1a1d1f]">
          Nenhuma notícia encontrada
        </h3>
        <p className="mx-auto mt-2 max-w-xs text-sm text-[#6f767e]">
          Nenhuma notícia encontrada relacionada a este evento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {news.map((item) => (
        <div
          key={item.id}
          className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-[#749c5b]/30 hover:shadow-md"
        >
          <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#749c5b] opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="flex flex-col gap-4 pl-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-medium text-[#6f767e]">
                    {format(new Date(item.createdAt), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <h3 className="mb-2 text-xl leading-tight font-bold text-[#1a1d1f]">
                  {item.title}
                </h3>
                {item.summary && (
                  <p className="line-clamp-3 text-sm leading-relaxed text-[#6f767e]">
                    {item.summary}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-[#749c5b] hover:text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={16} />
                Ler Notícia Completa
              </a>
            </div>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          <span className="text-sm text-[#6f767e]">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Próxima
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}


