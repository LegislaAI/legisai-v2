"use client";

import { useApiContext } from "@/context/ApiContext";
import { ExternalLink, FileText, Video } from "lucide-react";
import { useEffect, useState } from "react";

interface Document {
  id: string;
  title: string;
  url: string;
  type: string;
}

interface DocumentsTabProps {
  eventId: string;
}

export function DocumentsTab({ eventId }: DocumentsTabProps) {
  const { GetAPI } = useApiContext();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocuments() {
      setLoading(true);
      const response = await GetAPI(`/event/${eventId}/documents`, true);
      if (response.status === 200) {
        setDocuments(response.body.documents || []);
      }
      setLoading(false);
    }

    if (eventId) {
      fetchDocuments();
    }
  }, [eventId, GetAPI]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#749c5b] border-t-transparent" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h3 className="text-lg font-bold text-[#1a1d1f]">
          Nenhum documento encontrado
        </h3>
        <p className="mx-auto mt-2 max-w-xs text-sm text-[#6f767e]">
          Nenhum documento disponível para este evento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <div
          key={document.id}
          className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-[#749c5b]/30 hover:shadow-md"
        >
          <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#749c5b] opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="flex flex-col justify-between gap-4 pl-2 sm:flex-row">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#749c5b]/10 text-[#749c5b]">
                {document.type === "video" ? (
                  <Video size={24} />
                ) : (
                  <FileText size={24} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl leading-tight font-bold text-[#1a1d1f]">
                  {document.title}
                </h3>
                <p className="text-sm text-[#6f767e]">
                  Tipo: {document.type === "video" ? "Vídeo" : "Link"}
                </p>
              </div>
            </div>

            <div className="flex items-center sm:self-center">
              <a
                href={document.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-[#749c5b] hover:text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={16} />
                Acessar
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


