"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { EmptyState } from "@/components/v2/components/ui/EmptyState";
import { QualityBadge } from "@/components/v2/components/ui/QualityBadge";
import { useApiContext } from "@/context/ApiContext";
import { formatBrazilDate } from "@/lib/utils";
import { ExternalLink, FileText, Folder, Gavel, GitBranch } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Process = {
  id: string;
  agencyAcronym: string;
  date: string;
  dispatch?: string;
  url?: string;
  processingDescription?: string;
};

type Related = {
  id: string;
  relationType: string | null;
  siglaRelated: string | null;
  ementaRelated: string | null;
};

type Proposition = {
  id: string;
  typeAcronym: string;
  number: number;
  year: number;
  fullPropositionUrl?: string;
  url?: string;
  processes?: Process[];
};

type DerivedDoc = {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  date?: string;
  agency?: string;
  url?: string;
};

const CATEGORY_META: Record<
  string,
  { icon: typeof Folder; tone: string }
> = {
  "Inteiro teor": { icon: FileText, tone: "bg-secondary/10 text-secondary" },
  Despachos: { icon: Gavel, tone: "bg-slate-100 text-slate-700" },
  Emendas: { icon: FileText, tone: "bg-sky-50 text-sky-700" },
  Substitutivos: { icon: FileText, tone: "bg-violet-50 text-violet-700" },
  Pareceres: { icon: FileText, tone: "bg-amber-50 text-amber-700" },
  "Votos em separado": { icon: FileText, tone: "bg-amber-50 text-amber-700" },
  Requerimentos: { icon: FileText, tone: "bg-rose-50 text-rose-700" },
  Recursos: { icon: FileText, tone: "bg-rose-50 text-rose-700" },
  Apensadas: { icon: GitBranch, tone: "bg-emerald-50 text-emerald-700" },
  Outros: { icon: Folder, tone: "bg-gray-100 text-gray-700" },
};

/**
 * Aba derivada — não existe modelo PropositionDocument ainda.
 * Constrói uma biblioteca da matéria a partir de URLs já conhecidas:
 *  - Inteiro teor (Proposition.fullPropositionUrl)
 *  - Despachos com link (PropositionProcess.url)
 *  - Vínculos categorizados (PropositionRelated.relationType) com link para a matéria interna
 */
export function PropositionDocumentsTab({
  propositionId,
  proposition,
}: {
  propositionId: string;
  proposition: Proposition;
}) {
  const { GetAPI } = useApiContext();
  const [related, setRelated] = useState<Related[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRelated = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GetAPI(`/proposition-related/${propositionId}`, true);
      if (res.status === 200 && res.body) {
        setRelated(res.body.related ?? []);
      } else {
        setRelated([]);
      }
    } catch {
      setRelated([]);
    } finally {
      setLoading(false);
    }
  }, [GetAPI, propositionId]);

  useEffect(() => {
    fetchRelated();
  }, [fetchRelated]);

  const documents = useMemo<DerivedDoc[]>(() => {
    const docs: DerivedDoc[] = [];

    if (proposition.fullPropositionUrl) {
      docs.push({
        id: `inteiroteor-${proposition.id}`,
        category: "Inteiro teor",
        title: `${proposition.typeAcronym} ${proposition.number}/${proposition.year} — Texto integral`,
        url: proposition.fullPropositionUrl,
      });
    }

    for (const p of proposition.processes ?? []) {
      if (p.url) {
        docs.push({
          id: `process-${p.id}`,
          category: "Despachos",
          title: p.dispatch || p.processingDescription || "Despacho",
          subtitle: p.processingDescription,
          agency: p.agencyAcronym,
          date: p.date,
          url: p.url,
        });
      }
    }

    for (const r of related) {
      const cat = mapRelationToCategory(r.relationType);
      docs.push({
        id: `rel-${r.id}`,
        category: cat,
        title: r.siglaRelated || r.relationType || "Vínculo",
        subtitle: r.ementaRelated || undefined,
      });
    }

    return docs;
  }, [proposition, related]);

  const grouped = useMemo(() => {
    const out: Record<string, DerivedDoc[]> = {};
    for (const d of documents) {
      out[d.category] = out[d.category] ?? [];
      out[d.category].push(d);
    }
    return out;
  }, [documents]);

  const categoriesAll = Object.keys(CATEGORY_META);
  const allCounts = categoriesAll.map((c) => ({
    name: c,
    count: grouped[c]?.length ?? 0,
  }));

  if (loading) {
    return (
      <Card className="animate-pulse border-gray-100 p-6">
        <div className="h-5 w-40 rounded bg-gray-200" />
        <div className="mt-4 h-4 w-full rounded bg-gray-100" />
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="border-gray-100 p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
          <Folder className="h-5 w-5 text-secondary" /> Biblioteca da matéria
          <span className="ml-auto">
            <QualityBadge flag="no-data" />
          </span>
        </h3>
        <EmptyState
          variant="partial"
          title="Sem documentos integrados"
          message="Esta matéria ainda não possui documentos vinculados de forma integrada nesta fase."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo contagem por categoria */}
      <Card className="border-gray-100 p-6 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
          <Folder className="h-5 w-5 text-secondary" /> Biblioteca da matéria
          <span className="ml-auto">
            <QualityBadge flag="partial" />
          </span>
        </h3>
        <p className="mb-4 text-xs text-gray-500">
          Documentos derivados de URLs já vinculadas à matéria. Categorias com modelo dedicado
          virão em fase posterior.
        </p>
        <div className="flex flex-wrap gap-2">
          {allCounts.map((c) => {
            const meta = CATEGORY_META[c.name];
            const Icon = meta.icon;
            return (
              <span
                key={c.name}
                className={`inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1 text-xs font-medium ${meta.tone} ${
                  c.count === 0 ? "opacity-50" : ""
                }`}
              >
                <Icon className="h-3 w-3" />
                {c.name}
                <span className="rounded-full bg-white/60 px-1.5 text-[10px] font-bold">
                  {c.count}
                </span>
              </span>
            );
          })}
        </div>
      </Card>

      {/* Lista por categoria */}
      {Object.entries(grouped).map(([cat, items]) => {
        const meta = CATEGORY_META[cat] ?? CATEGORY_META["Outros"];
        const Icon = meta.icon;
        return (
          <Card key={cat} className="border-gray-100 p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <Icon className="h-5 w-5 text-secondary" /> {cat}
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {items.length}
              </span>
            </h3>
            <div className="space-y-2">
              {items.map((d) => (
                <DocRow key={d.id} doc={d} />
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function DocRow({ doc }: { doc: DerivedDoc }) {
  const content = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
        <FileText className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800">{doc.title}</p>
        {doc.subtitle && (
          <p
            className="line-clamp-1 text-xs text-gray-500"
            title={doc.subtitle}
          >
            {doc.subtitle}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-400">
          {doc.agency && <span>{doc.agency}</span>}
          {doc.date && (
            <span>{formatBrazilDate(doc.date)}</span>
          )}
        </div>
      </div>
      {doc.url ? (
        <ExternalLink className="h-4 w-4 shrink-0 text-secondary" />
      ) : (
        <span className="text-[10px] italic text-gray-400">sem link</span>
      )}
    </>
  );

  return doc.url ? (
    <a
      href={doc.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 transition-colors hover:border-secondary/30 hover:bg-secondary/5"
    >
      {content}
    </a>
  ) : (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/40 p-3">
      {content}
    </div>
  );
}

function mapRelationToCategory(relationType: string | null): string {
  const t = (relationType ?? "Outros").toLowerCase();
  if (t.includes("apens")) return "Apensadas";
  if (t.includes("subst")) return "Substitutivos";
  if (t.includes("emenda")) return "Emendas";
  if (t.includes("parecer")) return "Pareceres";
  if (t.includes("voto em sep")) return "Votos em separado";
  if (t.includes("requerimento")) return "Requerimentos";
  if (t.includes("recurso")) return "Recursos";
  return "Outros";
}


void GitBranch;
