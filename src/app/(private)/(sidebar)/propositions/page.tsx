"use client";

import { PageHeader } from "@/components/v2/components/ui/PageHeader";
import { useApiContext } from "@/context/ApiContext";
import { FileText } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/v2/components/ui/select";
import { Card } from "@/components/v2/components/ui/Card";

type Ref = { id: string; name: string; acronym?: string };
type Proposition = {
  id: string;
  description: string;
  typeAcronym: string;
  number: number;
  year: number;
  presentationDate: string;
  fullPropositionUrl?: string;
  type: Ref;
  situation: Ref | null;
};

export default function PropositionsListPage() {
  const { GetAPI } = useApiContext();
  const [types, setTypes] = useState<Ref[]>([]);
  const [themes, setThemes] = useState<Ref[]>([]);
  const [situations, setSituations] = useState<Ref[]>([]);
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [page, setPage] = useState(1);
  const [typeId, setTypeId] = useState<string>("");
  const [themeId, setThemeId] = useState<string>("");
  const [situationId, setSituationId] = useState<string>("");

  const fetchReferences = useCallback(async () => {
    setLoadingRefs(true);
    try {
      const res = await GetAPI("/proposition/references", true);
      if (res.status === 200 && res.body) {
        setTypes(res.body.types ?? []);
        setThemes(res.body.themes ?? []);
        setSituations(res.body.situations ?? []);
      }
    } catch {
      setTypes([]);
      setThemes([]);
      setSituations([]);
    } finally {
      setLoadingRefs(false);
    }
  }, [GetAPI]);

  const fetchPropositions = useCallback(async () => {
    setLoading(true);
    try {
      let q = `?page=${page}`;
      if (typeId) q += `&typeId=${typeId}`;
      if (themeId) q += `&themeId=${themeId}`;
      if (situationId) q += `&situationId=${situationId}`;
      const res = await GetAPI(`/proposition${q}`, true);
      if (res.status === 200 && res.body) {
        setPropositions(res.body.propositions ?? []);
        setPages(res.body.pages ?? 0);
      }
    } catch {
      setPropositions([]);
      setPages(0);
    } finally {
      setLoading(false);
    }
  }, [GetAPI, page, typeId, themeId, situationId]);

  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  useEffect(() => {
    fetchPropositions();
  }, [fetchPropositions]);

  useEffect(() => {
    setPage(1);
  }, [typeId, themeId, situationId]);

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Proposições"
        subtitle="Listagem com filtros por tipo, tema e situação"
      />

      <Card className="border-gray-100 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Tipo</span>
            <Select value={typeId || "all"} onValueChange={(v) => setTypeId(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[180px] border-gray-200 bg-gray-50">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {types.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.acronym || t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Tema</span>
            <Select value={themeId || "all"} onValueChange={(v) => setThemeId(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[200px] border-gray-200 bg-gray-50">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {themes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Situação</span>
            <Select value={situationId || "all"} onValueChange={(v) => setSituationId(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[200px] border-gray-200 bg-gray-50">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {situations.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {loadingRefs ? (
        <div className="rounded-xl border border-gray-100 bg-white p-8 text-center text-gray-500">
          Carregando catálogos…
        </div>
      ) : loading ? (
        <div className="rounded-xl border border-gray-100 bg-white p-8 text-center text-gray-500">
          Carregando proposições…
        </div>
      ) : propositions.length === 0 ? (
        <Card className="border-gray-100 p-8 text-center text-gray-500">
          Nenhuma proposição encontrada com os filtros selecionados.
        </Card>
      ) : (
        <div className="space-y-3">
          {propositions.map((prop) => (
            <Card
              key={prop.id}
              className="border-gray-100 p-4 shadow-sm transition hover:border-secondary/30"
            >
              <Link href={`/propositions/${prop.id}`} className="block" prefetch={false}>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                    <FileText className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <span className="font-medium text-secondary">
                        {prop.typeAcronym} {prop.number}/{prop.year}
                      </span>
                      {prop.situation?.name && (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                          {prop.situation.name}
                        </span>
                      )}
                      <span>
                        {new Date(prop.presentationDate).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-800">
                      {prop.description || "—"}
                    </p>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
          {pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border border-gray-200 bg-white px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="flex items-center px-3 text-sm text-gray-600">
                Página {page} de {pages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="rounded border border-gray-200 bg-white px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
