"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { EmptyState } from "@/components/v2/components/ui/EmptyState";
import { QualityBadge } from "@/components/v2/components/ui/QualityBadge";
import { useApiContext } from "@/context/ApiContext";
import {
  AlertTriangle,
  ArrowDown,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Cloud,
  CloudDownload,
  FileText,
  Loader2,
  MessageSquareWarning,
  Pause,
  RefreshCw,
  Send,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Mini = {
  id: string;
  typeAcronym: string;
  number: number;
  year: number;
  description?: string | null;
  presentationDate?: string | null;
  situationDescription?: string | null;
  regime?: string | null;
  url?: string | null;
  authors?: Array<{ id: string; name: string; politicianId?: string | null }>;
};

type Item = {
  id: string;
  relationType: string | null;
  relationDescription: string | null;
  siglaRelated: string | null;
  ementaRelated: string | null;
  integrated: boolean;
  proposition: Mini | null;
};

type IncidentHit = { kind: string; date: string; agency: string; excerpt: string };

type RequirementsResponse = {
  requirements: Item[];
  recursos: Item[];
  votes: Item[];
  incidents: Record<string, IncidentHit[]>;
  stats: {
    enrichedNow: number;
    alreadyIntegrated: number;
    failed: number;
    totalRelated: number;
  };
};

const INCIDENT_META: Record<string, { icon: LucideIcon; tone: string }> = {
  "Pedido de vista": { icon: Pause, tone: "bg-amber-50 text-amber-700 border-amber-100" },
  Diligência: { icon: Send, tone: "bg-sky-50 text-sky-700 border-sky-100" },
  Prejudicialidade: {
    icon: MessageSquareWarning,
    tone: "bg-rose-50 text-rose-700 border-rose-100",
  },
  Arquivamento: { icon: ArrowDown, tone: "bg-gray-100 text-gray-700 border-gray-200" },
  "Devolução ao autor": { icon: ArrowDown, tone: "bg-gray-100 text-gray-700 border-gray-200" },
  "Questão de ordem": {
    icon: AlertTriangle,
    tone: "bg-violet-50 text-violet-700 border-violet-100",
  },
};

export function PropositionRequirementsTab({ propositionId }: { propositionId: string }) {
  const { GetAPI } = useApiContext();
  const [data, setData] = useState<RequirementsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const res = await GetAPI(`/proposition/${propositionId}/requirements`, true);
        if (res.status === 200 && res.body) {
          setData(res.body as RequirementsResponse);
        } else {
          setError(
            typeof res.body === "string"
              ? res.body
              : "Não foi possível carregar os requerimentos."
          );
        }
      } catch {
        setError("Falha de rede ao consultar requerimentos.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [GetAPI, propositionId]
  );

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  if (loading) {
    return (
      <Card className="border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin text-secondary" />
          <span>Carregando — buscando dados que faltam da Câmara…</span>
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        variant="no-source"
        title="Não foi possível carregar"
        message={error ?? "Erro desconhecido."}
        action={
          <button
            type="button"
            onClick={() => fetchData(false)}
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-3 w-3" /> Tentar novamente
          </button>
        }
      />
    );
  }

  const totalIncidents = Object.values(data.incidents).reduce(
    (acc, arr) => acc + arr.length,
    0
  );
  const isEmpty =
    data.requirements.length === 0 &&
    data.recursos.length === 0 &&
    data.votes.length === 0 &&
    totalIncidents === 0;

  return (
    <div className="space-y-6">
      {/* Banner de status do enrichment */}
      {data.stats.totalRelated > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/40 px-4 py-3 text-xs text-gray-600">
          <Sparkles className="h-3.5 w-3.5 text-secondary" />
          {data.stats.enrichedNow > 0 ? (
            <span>
              <span className="font-semibold text-secondary">
                {data.stats.enrichedNow}
              </span>{" "}
              vínculo(s) acabaram de ser buscados da Câmara e persistidos no banco.
            </span>
          ) : (
            <span>
              Todos os{" "}
              <span className="font-semibold text-gray-800">
                {data.stats.alreadyIntegrated}
              </span>{" "}
              vínculo(s) já estavam integrados — leitura instantânea do banco.
            </span>
          )}
          {data.stats.failed > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
              <Cloud className="h-3 w-3" />
              {data.stats.failed} falha(s) na consulta à Câmara
            </span>
          )}
          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="ml-auto inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {refreshing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CloudDownload className="h-3 w-3" />
            )}
            Atualizar
          </button>
        </div>
      )}

      {isEmpty ? (
        <EmptyState
          variant="no-occurrence"
          title="Sem requerimentos, recursos ou incidentes"
          message="Não há registros desse tipo integrados para esta matéria até o momento."
        />
      ) : (
        <>
          <Section
            title="Requerimentos"
            items={data.requirements}
            icon={FileText}
            emptyMessage="Sem requerimentos integrados."
          />
          <Section
            title="Recursos"
            items={data.recursos}
            icon={AlertTriangle}
            emptyMessage="Sem recursos integrados."
          />
          <Section
            title="Votos em separado"
            items={data.votes}
            icon={FileText}
            emptyMessage="Sem votos em separado integrados."
          />

          {/* Incidentes derivados do texto de tramitação */}
          <Card className="border-gray-100 p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <MessageSquareWarning className="h-5 w-5 text-secondary" /> Incidentes
              procedimentais
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {totalIncidents}
              </span>
              <span className="ml-auto">
                <QualityBadge flag={totalIncidents > 0 ? "derived" : "no-data"} />
              </span>
            </h3>
            {totalIncidents === 0 ? (
              <EmptyState
                variant="no-occurrence"
                compact
                title="Sem incidentes procedimentais"
                message="Não há incidentes procedimentais integrados (pedido de vista, diligência, prejudicialidade etc.)."
              />
            ) : (
              <div className="space-y-3">
                {Object.entries(data.incidents).map(([kind, hits]) => {
                  const meta = INCIDENT_META[kind] ?? {
                    icon: AlertTriangle,
                    tone: "bg-gray-100 text-gray-700 border-gray-200",
                  };
                  const Icon = meta.icon;
                  return (
                    <div key={kind}>
                      <p
                        className={`mb-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase ${meta.tone}`}
                      >
                        <Icon className="h-3 w-3" />
                        {kind}
                        <span className="ml-1 text-[10px] font-bold">{hits.length}</span>
                      </p>
                      <div className="space-y-2">
                        {hits.map((h, i) => (
                          <div
                            key={`${kind}-${i}`}
                            className="rounded-lg border border-gray-100 bg-gray-50/40 p-3 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-gray-800">{h.agency}</span>
                              <span className="text-gray-400">
                                <Calendar className="mr-0.5 inline h-3 w-3" />
                                {new Date(h.date).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                            <p className="mt-1 italic text-gray-600">"{h.excerpt}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="mt-4 text-[11px] italic text-gray-400">
              Incidentes detectados por análise textual dos despachos da tramitação. Marcado como
              "Derivado".
            </p>
          </Card>
        </>
      )}
    </div>
  );
}

function Section({
  title,
  items,
  icon: Icon,
  emptyMessage,
}: {
  title: string;
  items: Item[];
  icon: LucideIcon;
  emptyMessage: string;
}) {
  return (
    <Card className="border-gray-100 p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
        <Icon className="h-5 w-5 text-secondary" /> {title}
        <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {items.length}
        </span>
        <span className="ml-auto">
          <QualityBadge flag={items.length > 0 ? "stable" : "no-data"} />
        </span>
      </h3>
      {items.length === 0 ? (
        <p className="text-xs italic text-gray-400">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <ItemRow key={it.id} item={it} />
          ))}
        </div>
      )}
    </Card>
  );
}

function ItemRow({ item }: { item: Item }) {
  const p = item.proposition;
  if (!item.integrated || !p) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/40 p-3">
        <p className="text-sm font-medium text-gray-800">
          {item.siglaRelated || item.relationType || "Vínculo"}
        </p>
        {item.relationDescription && (
          <p className="text-[11px] text-gray-500">{item.relationDescription}</p>
        )}
        {item.ementaRelated && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-600">{item.ementaRelated}</p>
        )}
        <p className="mt-1 text-[10px] italic text-amber-600">
          Câmara não retornou detalhes nesta sessão.
        </p>
      </div>
    );
  }
  return (
    <Link
      href={`/proposicoes/${p.id}`}
      className="block rounded-lg border border-gray-100 bg-white p-3 transition-colors hover:border-secondary/40 hover:bg-secondary/5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {p.typeAcronym} {p.number}/{p.year}
          </p>
          {p.description && (
            <p className="line-clamp-2 text-xs text-gray-600" title={p.description}>
              {p.description}
            </p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500">
            {p.authors?.[0] && (
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {p.authors[0].name}
              </span>
            )}
            {p.presentationDate && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(p.presentationDate).toLocaleDateString("pt-BR")}
              </span>
            )}
            {p.situationDescription && (
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                {p.situationDescription}
              </span>
            )}
            {p.regime && (
              <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">
                {p.regime}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-secondary" />
      </div>
    </Link>
  );
}
