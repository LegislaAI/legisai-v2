"use client";

import { BackButton } from "@/components/v2/components/ui/BackButton";
import { Card } from "@/components/v2/components/ui/Card";
import { useApiContext } from "@/context/ApiContext";
import { Calendar, ExternalLink, FileText, MapPin } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface EventDetails {
  id: string;
  startDate: string;
  endDate?: string;
  situation: string;
  description: string;
  local?: string;
  uri?: string;
  eventType?: { id: string; name: string; acronym: string };
  department?: { id: string; name: string; acronym: string };
}

interface PropositionOnPauta {
  id: string;
  number: number;
  year: number;
  type?: { id: string; name: string; acronym: string };
  description?: string;
  situation?: { id: string; name: string; acronym: string };
  presentationDate?: string;
  url?: string;
  topic?: string;
  title?: string;
  regime?: string;
}

export default function EventoPautaPage() {
  const params = useParams();
  const eventId = params?.id as string;
  const { GetAPI } = useApiContext();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [propositions, setPropositions] = useState<PropositionOnPauta[]>([]);
  const [propositionsPages, setPropositionsPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    const res = await GetAPI(`/event/details/${eventId}`, true);
    if (res.status === 200 && res.body) setEvent(res.body);
    else setEvent(null);
  }, [eventId, GetAPI]);

  const fetchPropositions = useCallback(async () => {
    if (!eventId) return;
    const res = await GetAPI(
      `/event/${eventId}/propositions?page=${page}`,
      true,
    );
    if (res.status === 200 && res.body) {
      setPropositions(res.body.propositions ?? []);
      setPropositionsPages(res.body.pages ?? 0);
    } else {
      setPropositions([]);
    }
  }, [eventId, page, GetAPI]);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    Promise.all([fetchEvent(), fetchPropositions()]).finally(() =>
      setLoading(false),
    );
  }, [eventId, fetchEvent, fetchPropositions]);

  if (!eventId) {
    return (
      <div className="space-y-6 pb-20">
        <BackButton />
        <Card className="p-8 text-center text-gray-500">
          ID do evento não informado.
        </Card>
      </div>
    );
  }

  if (loading && !event) {
    return (
      <div className="space-y-6 pb-20">
        <BackButton />
        <Card className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-6 pb-20">
        <BackButton />
        <Card className="p-8 text-center text-gray-500">
          Evento não encontrado.
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <BackButton />
      <Card className="border-gray-100 p-6 shadow-sm">
        <h1 className="text-dark mb-4 text-xl font-bold">Pauta do evento</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(event.startDate).toLocaleString("pt-BR", {
              dateStyle: "long",
              timeStyle: "short",
            })}
            {event.endDate &&
              ` – ${new Date(event.endDate).toLocaleString("pt-BR", { timeStyle: "short" })}`}
          </span>
          {event.eventType && (
            <span>{event.eventType.name || event.eventType.acronym}</span>
          )}
          {event.department && (
            <span>
              Órgão: {event.department.acronym || event.department.name}
            </span>
          )}
          {event.local && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.local}
            </span>
          )}
          {event.uri && (
            <a
              href={event.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-secondary/80 inline-flex items-center gap-1 font-medium"
            >
              Ver na Câmara <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        {event.description && (
          <p className="mt-3 text-sm text-gray-600">{event.description}</p>
        )}
      </Card>

      <Card className="overflow-hidden border-gray-100 shadow-sm">
        <div className="border-b border-gray-100/50 p-4">
          <h2 className="text-dark flex items-center gap-2 font-bold">
            <FileText className="text-secondary h-5 w-5" />
            Proposições na pauta
          </h2>
        </div>
        <div className="overflow-x-auto">
          {propositions.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-xs text-gray-500 uppercase">
                  <th className="p-3">Tipo / Número / Ano</th>
                  <th className="p-3">Ementa / Título</th>
                  <th className="p-3">Situação</th>
                  <th className="p-3">Regime</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {propositions.map((prop) => (
                  <tr key={prop.id} className="border-b border-gray-50">
                    <td className="p-3 font-medium">
                      {prop.type?.acronym || "—"} {prop.number}/{prop.year}
                    </td>
                    <td
                      className="max-w-md truncate p-3"
                      title={prop.description || prop.title}
                    >
                      {prop.title || prop.description || "—"}
                    </td>
                    <td className="p-3">
                      {prop.situation?.name || prop.situation?.acronym || "—"}
                    </td>
                    <td className="p-3">{prop.regime || "—"}</td>
                    <td className="p-3">
                      <Link
                        href={`/propositions/${prop.id}`}
                        className="text-secondary hover:text-secondary/80 text-xs font-medium"
                      >
                        Ver proposição
                      </Link>
                      {prop.url && (
                        <a
                          href={prop.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary hover:text-secondary/80 ml-2 text-xs font-medium"
                        >
                          Câmara
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-8 text-center text-sm text-gray-500">
              Nenhuma proposição na pauta deste evento.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
