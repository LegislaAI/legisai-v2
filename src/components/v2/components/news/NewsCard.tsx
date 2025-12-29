"use client";

import { Badge } from "@/components/v2/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ExternalLink, Newspaper } from "lucide-react";

export interface NewsItem {
  createdAt: string;
  id: string;
  summary: string;
  title: string;
  url: string;
  type: "PARLIAMENT" | "GENERAL";
}

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  return (
    <a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-[#749c5b]/30 hover:shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* Icon Area */}
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-colors group-hover:bg-[#749c5b]/10 group-hover:text-[#749c5b]">
              <Newspaper size={24} />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <Badge
                variant="outline"
                className="border-gray-200 bg-gray-50 text-[10px] tracking-wide text-gray-500 uppercase"
              >
                {news.type === "PARLIAMENT" ? "Câmara Legislativa" : "Geral"}
              </Badge>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {format(new Date(news.createdAt), "dd 'de' MMMM, yyyy", {
                  locale: ptBR,
                })}
              </span>
            </div>

            <h3 className="text-lg leading-tight font-bold text-[#1a1d1f] transition-colors group-hover:text-[#749c5b]">
              {news.title}
            </h3>

            <p className="line-clamp-2 text-sm leading-relaxed text-gray-600 md:line-clamp-3">
              {news.summary}...
            </p>

            <div className="flex items-center gap-1 pt-2 text-sm font-bold text-[#749c5b]">
              Ler notícia completa <ExternalLink size={14} />
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
