"use client";

import { PoliticianProps } from "@/@types/politician";
import { Badge } from "@/components/v2/components/ui/badge";
import { Button } from "@/components/v2/components/ui/Button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/v2/components/ui/dialog";
import { ScrollArea } from "@/components/v2/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Calendar, ChevronRight, FileText } from "lucide-react";

export interface NewsItem {
  createdAt: string;
  id: string;
  politicians: PoliticianProps[];
  summary: string;
  title: string;
  url: string;
  type: "PARLIAMENT" | "GENERAL";
}
export interface NewsTypeProps {
 
}

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  return (
    <Dialog>
      <div className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-[#749c5b]/30 hover:shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          
          {/* Icon Area */}
          <div className="flex-shrink-0">
             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-400 group-hover:bg-[#749c5b]/10 group-hover:text-[#749c5b] transition-colors">
                 <Bell size={24} />
             </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <Badge variant="outline" className="bg-gray-50 uppercase tracking-wide text-[10px] text-gray-500 border-gray-200">
                      {news.type === "PARLIAMENT" ? "Câmara Legislativa" : "Geral"}
                  </Badge>
                  <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {format(new Date(news.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </span>
              </div>
              
              <h3 className="text-lg font-bold text-[#1a1d1f] leading-tight group-hover:text-[#749c5b] transition-colors">
                  {news.title}
              </h3>
              
              <p className="text-sm text-gray-600 line-clamp-2 md:line-clamp-3 leading-relaxed">
                  {news.summary}
              </p>

              <div className="pt-2">
                  <DialogTrigger asChild>
                      <button className="flex items-center gap-1 text-sm font-bold text-[#749c5b] hover:underline">
                          Ler notícia completa <ChevronRight size={16} />
                      </button>
                  </DialogTrigger>
              </div>
          </div>
        </div>
      </div>

      {/* Modal Content */}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
            <div className="flex items-center gap-2 mb-2 text-sm text-[#749c5b] font-bold uppercase tracking-wider">
                <FileText size={16} />
                Notícia Detalhada
            </div>
            <DialogTitle className="text-2xl font-bold text-[#1a1d1f]">{news.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">{format(new Date(news.createdAt), "PPP 'às' HH:mm", { locale: ptBR })}</span>
                {news.url && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">Fonte: {news.url}</span>}
            </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] mt-4 pr-4">
            <div className="space-y-4 text-gray-700 leading-relaxed text-sm md:text-base">
                <p className="font-medium text-lg text-gray-900">{news.summary}</p>
                {news.summary ? (
                     <div dangerouslySetInnerHTML={{ __html: news.summary.replace(/\n/g, '<br/>') }} />
                ) : (
                    <p className="italic text-gray-500">
                        Esta notificação não possui conteúdo adicional detalhado disponível no momento.
                    </p>
                )}
            </div>
        </ScrollArea>

        <DialogFooter className="sm:justify-start pt-4 border-t border-gray-100 mt-4">
            <DialogTrigger asChild>
                <Button  className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                    Fechar
                </Button>
            </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
