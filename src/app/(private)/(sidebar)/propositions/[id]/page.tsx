"use client";

import { BackButton } from "@/components/v2/components/ui/BackButton";
import { Card } from "@/components/v2/components/ui/Card";
import { useApiContext } from "@/context/ApiContext";
import { ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Author = { id: string; name: string; politicianId?: string };
type Theme = { id: string; name: string };
type PropositionDetail = {
  id: string;
  description: string;
  typeAcronym: string;
  number: number;
  year: number;
  presentationDate: string;
  lastMovementDate: string;
  situationDescription?: string;
  movementDescription?: string;
  fullPropositionUrl?: string;
  type: { id: string; name: string; acronym: string };
  situation: { id: string; name: string } | null;
  authors?: Author[];
  themes?: Theme[] | { theme: Theme }[];
};

export default function PropositionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { GetAPI } = useApiContext();
  const [proposition, setProposition] = useState<PropositionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await GetAPI(`/proposition/${id}`, true);
      if (res.status === 200 && res.body) {
        const data = (res.body as { proposition?: PropositionDetail }).proposition ?? res.body;
        setProposition(data as PropositionDetail);
      } else {
        setProposition(null);
      }
    } catch {
      setProposition(null);
    } finally {
      setLoading(false);
    }
  }, [id, GetAPI]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (!id) {
    return (
      <div className="space-y-6 pb-20">
        <BackButton />
        <Card className="border-gray-100 p-8 text-center text-gray-500">
          ID da proposição não informado.
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <BackButton />
        <Card className="border-gray-100 p-8 text-center text-gray-500">
          Carregando…
        </Card>
      </div>
    );
  }

  if (!proposition) {
    return (
      <div className="space-y-6 pb-20">
        <BackButton />
        <Card className="border-gray-100 p-8 text-center text-gray-500">
          Proposição não encontrada.
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <BackButton />

      <Card className="border-gray-100 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
              <FileText className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {proposition.typeAcronym} {proposition.number}/{proposition.year}
              </h1>
              <p className="text-sm text-gray-500">{proposition.type.name}</p>
            </div>
          </div>
          {proposition.fullPropositionUrl && (
            <a
              href={proposition.fullPropositionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Ver na Câmara <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        <div className="mt-6 space-y-4 border-t border-gray-100 pt-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Apresentação
            </h3>
            <p className="mt-1 text-sm text-gray-700">
              {new Date(proposition.presentationDate).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          {proposition.situationDescription && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Situação
              </h3>
              <p className="mt-1 text-sm text-gray-700">
                {proposition.situationDescription}
              </p>
            </div>
          )}
          {proposition.movementDescription && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Último andamento
              </h3>
              <p className="mt-1 text-sm text-gray-700">
                {proposition.movementDescription}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {new Date(proposition.lastMovementDate).toLocaleDateString("pt-BR")}
              </p>
            </div>
          )}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Ementa
            </h3>
            <p className="mt-1 text-sm text-gray-800">
              {proposition.description || "—"}
            </p>
          </div>
          {proposition.authors && proposition.authors.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Autores
              </h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {proposition.authors.map((a) => (
                  <li key={a.id}>
                    {a.politicianId ? (
                      <Link
                        href={`/deputados/${a.politicianId}`}
                        className="rounded bg-secondary/10 px-2 py-1 text-sm font-medium text-secondary hover:bg-secondary/20"
                      >
                        {a.name}
                      </Link>
                    ) : (
                      <span className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-700">
                        {a.name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {proposition.themes && proposition.themes.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Temas
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {(Array.isArray(proposition.themes)
                  ? proposition.themes.map((t) => ("theme" in t ? t.theme : t))
                  : []
                ).map((t) => (
                  <span
                    key={t.id}
                    className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-700"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
