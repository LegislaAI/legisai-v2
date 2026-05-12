"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { EmptyState } from "@/components/v2/components/ui/EmptyState";
import { QualityBadge } from "@/components/v2/components/ui/QualityBadge";
import { useApiContext } from "@/context/ApiContext";
import {
  ChevronRight,
  FileText,
  Folder,
  GitBranch,
  Info,
  Link2,
  Network,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Mini = {
  id: string;
  typeAcronym: string;
  number: number;
  year: number;
  description?: string | null;
  situationDescription?: string | null;
  regime?: string | null;
  presentationDate?: string | null;
};

type Branch = {
  id: string;
  relationType: string | null;
  relationDescription: string | null;
  siglaRelated: string | null;
  ementaRelated: string | null;
  proposition: Mini | null;
  integrated: boolean;
  precedence?: "mais-antiga" | "mais-recente" | null;
};

type Tree = {
  base: Mini | null;
  branches: Record<string, Branch[]>;
  partial: boolean;
};

const BRANCH_INFO: Record<
  string,
  { label: string; icon: typeof Folder; tone: string; description: string }
> = {
  Apensada: {
    label: "Apensadas",
    icon: GitBranch,
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
    description: "Matérias em tramitação conjunta com esta.",
  },
  Substitutivo: {
    label: "Substitutivos",
    icon: FileText,
    tone: "bg-violet-50 text-violet-700 border-violet-100",
    description: "Substitutivos apresentados a esta matéria.",
  },
  Emenda: {
    label: "Emendas",
    icon: FileText,
    tone: "bg-sky-50 text-sky-700 border-sky-100",
    description: "Emendas vinculadas.",
  },
  Parecer: {
    label: "Pareceres",
    icon: FileText,
    tone: "bg-amber-50 text-amber-700 border-amber-100",
    description: "Pareceres exarados em comissão.",
  },
  "Voto em Separado": {
    label: "Votos em separado",
    icon: FileText,
    tone: "bg-amber-50 text-amber-700 border-amber-100",
    description: "Votos divergentes apresentados em comissão.",
  },
  Requerimento: {
    label: "Requerimentos",
    icon: FileText,
    tone: "bg-rose-50 text-rose-700 border-rose-100",
    description: "Requerimentos vinculados ao curso da matéria.",
  },
  Recurso: {
    label: "Recursos",
    icon: FileText,
    tone: "bg-rose-50 text-rose-700 border-rose-100",
    description: "Recursos contra deliberações.",
  },
  Outros: {
    label: "Outros vínculos",
    icon: Link2,
    tone: "bg-gray-100 text-gray-700 border-gray-200",
    description: "Outras proposições relacionadas.",
  },
};

export function PropositionAttachedTab({ propositionId }: { propositionId: string }) {
  const { GetAPI } = useApiContext();
  const [tree, setTree] = useState<Tree | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GetAPI(`/proposition-related/${propositionId}/tree`, true);
      if (res.status === 200 && res.body) {
        setTree(res.body as Tree);
      } else {
        setTree(null);
      }
    } catch {
      setTree(null);
    } finally {
      setLoading(false);
    }
  }, [GetAPI, propositionId]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  if (loading) {
    return (
      <Card className="animate-pulse border-gray-100 p-6">
        <div className="h-5 w-40 rounded bg-gray-200" />
        <div className="mt-4 h-4 w-full rounded bg-gray-100" />
        <div className="mt-2 h-4 w-2/3 rounded bg-gray-100" />
      </Card>
    );
  }

  if (!tree || !tree.base) {
    return (
      <EmptyState
        variant="no-source"
        title="Sem dados de vínculos"
        message="Não foi possível recuperar a árvore de matérias vinculadas."
      />
    );
  }

  const branchKeys = Object.keys(tree.branches);
  const totalBranches = branchKeys.reduce((acc, k) => acc + tree.branches[k].length, 0);
  const treeQuality = tree.partial ? "partial" : totalBranches === 0 ? "no-data" : "stable";

  return (
    <div className="space-y-6">
      {/* Bloco 1 — Árvore da matéria */}
      <Card className="border-gray-100 p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
          <Network className="h-5 w-5 text-secondary" /> Árvore da matéria
          <span className="ml-auto">
            <QualityBadge flag={treeQuality} />
          </span>
        </h3>

        {totalBranches === 0 ? (
          <EmptyState
            variant="no-occurrence"
            compact
            title="Sem vínculos integrados"
            message="Esta matéria não tem proposições relacionadas integradas no momento."
          />
        ) : (
          <div className="space-y-2">
            <RootNode mini={tree.base} />
            <div className="ml-5 space-y-3 border-l border-dashed border-gray-200 pl-5">
              {branchKeys.map((key) => {
                const info = BRANCH_INFO[key] ?? BRANCH_INFO["Outros"];
                const items = tree.branches[key];
                return (
                  <details key={key} open className="group">
                    <summary className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase ${info.tone}`}
                      >
                        <info.icon className="h-3 w-3" /> {info.label}
                      </span>
                      <span className="text-xs text-gray-500">{items.length}</span>
                    </summary>
                    <div className="mt-2 ml-5 grid gap-2 sm:grid-cols-2">
                      {items.map((b) => (
                        <BranchCard key={b.id} branch={b} />
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Bloco 2 — Dados por vínculo (tabela compacta) */}
      {totalBranches > 0 && (
        <Card className="border-gray-100 p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <FileText className="h-5 w-5 text-secondary" /> Dados por vínculo
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  <th className="py-2 pr-2">Número</th>
                  <th className="py-2 pr-2">Tipo</th>
                  <th className="py-2 pr-2">Relação</th>
                  <th className="py-2 pr-2">Situação</th>
                  <th className="py-2 pr-2">Regime</th>
                  <th className="py-2 pr-2 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {branchKeys.flatMap((key) =>
                  tree.branches[key].map((b) => (
                    <tr key={b.id} className="border-b border-gray-50 last:border-b-0">
                      <td className="py-2 pr-2 font-medium text-gray-800">
                        {b.proposition
                          ? `${b.proposition.typeAcronym} ${b.proposition.number}/${b.proposition.year}`
                          : b.siglaRelated || "—"}
                        {b.precedence === "mais-antiga" && (
                          <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                            Precedente
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-2 text-gray-600">{b.relationType || "Outros"}</td>
                      <td className="py-2 pr-2 text-gray-600">
                        {b.relationDescription || "—"}
                      </td>
                      <td className="py-2 pr-2 text-gray-600">
                        {b.proposition?.situationDescription || (
                          <span className="italic text-gray-400">não integrada</span>
                        )}
                      </td>
                      <td className="py-2 pr-2 text-gray-600">
                        {b.proposition?.regime || "—"}
                      </td>
                      <td className="py-2 pr-2 text-right">
                        {b.integrated && b.proposition ? (
                          <Link
                            href={`/proposicoes/${b.proposition.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline"
                          >
                            Abrir <ChevronRight className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-[10px] italic text-gray-400">parcial</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Bloco 3 — Regras aplicáveis */}
      <Card className="border-gray-100 p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
          <Info className="h-5 w-5 text-secondary" /> Regras aplicáveis
        </h3>
        <p className="mb-3 text-xs text-gray-500">
          Resumo regimental aplicável a matérias vinculadas. Conteúdo orientativo.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <RuleItem
            title="Tramitação conjunta"
            body="Matérias com identidade ou conexão de matéria tramitam em conjunto, sob um único processo decisório."
          />
          <RuleItem
            title="Precedência"
            body="A proposição apresentada primeiro (mais antiga) tem precedência sobre as demais apensadas."
          />
          <RuleItem
            title="Regime herdado"
            body="O regime especial (urgência/prioridade) da proposição principal se estende às apensadas."
          />
          <RuleItem
            title="Parecer conjunto"
            body="Considera-se um só parecer para o conjunto, com manifestação sobre a principal e as apensadas."
          />
        </div>
      </Card>
    </div>
  );
}

function RootNode({ mini }: { mini: Mini }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-secondary/20 bg-secondary/5 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
        <Network className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">
          Matéria principal
        </p>
        <p className="text-sm font-semibold text-gray-900">
          {mini.typeAcronym} {mini.number}/{mini.year}
        </p>
        {mini.description && (
          <p className="line-clamp-1 text-xs text-gray-500" title={mini.description}>
            {mini.description}
          </p>
        )}
      </div>
    </div>
  );
}

function BranchCard({ branch }: { branch: Branch }) {
  const p = branch.proposition;
  if (!branch.integrated || !p) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/40 p-3">
        <p className="text-xs font-semibold text-gray-700">{branch.siglaRelated || "Vínculo"}</p>
        {branch.relationDescription && (
          <p className="mt-0.5 text-[11px] text-gray-500">{branch.relationDescription}</p>
        )}
        <p className="mt-1 text-[10px] italic text-amber-600">
          Vínculo registrado, mas matéria não integrada nesta fase.
        </p>
      </div>
    );
  }
  return (
    <Link
      href={`/proposicoes/${p.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-secondary/40 hover:bg-secondary/5"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900">
          {p.typeAcronym} {p.number}/{p.year}
        </p>
        <ChevronRight className="h-3.5 w-3.5 text-secondary" />
      </div>
      {branch.relationDescription && (
        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-gray-400">
          {branch.relationDescription}
        </p>
      )}
      {p.description && (
        <p className="mt-1 line-clamp-2 text-xs text-gray-600" title={p.description}>
          {p.description}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-1">
        {p.situationDescription && (
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-700">
            {p.situationDescription}
          </span>
        )}
        {p.regime && (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-700">
            {p.regime}
          </span>
        )}
      </div>
    </Link>
  );
}

function RuleItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/40 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-700">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-gray-600">{body}</p>
    </div>
  );
}
