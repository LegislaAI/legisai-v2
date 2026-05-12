"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { EmptyState } from "@/components/v2/components/ui/EmptyState";
import { useApiContext } from "@/context/ApiContext";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Clock,
  FileBarChart,
  FileText,
  Gavel,
  HelpCircle,
  Layers,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useState } from "react";

type AiSource = { block: string; note?: string };
type AiResponse = {
  cached: boolean;
  model?: string;
  createdAt?: string;
  answer: string;
  sources?: AiSource[];
  highlights?: string[];
};

type ActionId =
  | "summary"
  | "currentStage"
  | "tramitacaoSummary"
  | "ritualExplain"
  | "riskMap"
  | "briefing"
  | "fichamento"
  | "freeQuestion";

const ACTIONS: Array<{
  id: ActionId;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    id: "summary",
    label: "Resumir matéria",
    description: "Resumo executivo em 4–6 parágrafos.",
    icon: FileText,
  },
  {
    id: "currentStage",
    label: "Explicar estágio atual",
    description: "Onde está, o que falta para avançar.",
    icon: Clock,
  },
  {
    id: "tramitacaoSummary",
    label: "Resumir tramitação",
    description: "Pontos relevantes do percurso processual.",
    icon: Layers,
  },
  {
    id: "ritualExplain",
    label: "Explicar rito regimental",
    description: "Rito aplicável por tipo, regime e apreciação.",
    icon: Gavel,
  },
  {
    id: "riskMap",
    label: "Mapear riscos de avanço",
    description: "Gargalos, prejudicialidade, arquivamento.",
    icon: AlertTriangle,
  },
  {
    id: "briefing",
    label: "Gerar briefing parlamentar",
    description: "Documento pronto para leitura por assessor.",
    icon: FileBarChart,
  },
];

const SUGGESTED_QUESTIONS = [
  "O que falta para essa matéria avançar?",
  "Ela está parada onde?",
  "Há parecer pendente?",
  "Houve requerimentos que alteraram o rito?",
  "Há apensadas relevantes?",
  "O tema está sujeito a apreciação conclusiva?",
  "Existe risco de arquivamento?",
  "Qual comissão é o gargalo?",
];

export function PropositionAiTab({ propositionId }: { propositionId: string }) {
  const { PostAPI } = useApiContext();
  const [activeAction, setActiveAction] = useState<ActionId | null>(null);
  const [response, setResponse] = useState<AiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const run = useCallback(
    async (action: ActionId, q?: string, bypassCache = false) => {
      setLoading(true);
      setError(null);
      setActiveAction(action);
      setResponse(null);
      try {
        const res = await PostAPI(
          `/proposition/${propositionId}/ai`,
          { action, query: q, bypassCache },
          true
        );
        if (res.status === 200 && res.body) {
          setResponse(res.body as AiResponse);
        } else {
          setError(
            typeof res.body === "string"
              ? res.body
              : "Falha ao consultar a IA. Tente novamente em instantes."
          );
        }
      } catch {
        setError("Falha de rede ao consultar a IA.");
      } finally {
        setLoading(false);
      }
    },
    [PostAPI, propositionId]
  );

  return (
    <div className="space-y-6">
      <Card className="border-gray-100 p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Análise com IA</h3>
        </div>
        <p className="text-xs text-gray-500">
          A IA trabalha apenas com os blocos integrados desta matéria e cita o bloco-fonte em cada
          resposta.
        </p>

        {/* Ações prontas */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIONS.map((a) => {
            const Icon = a.icon;
            const isActive = activeAction === a.id;
            return (
              <button
                key={a.id}
                type="button"
                disabled={loading}
                onClick={() => run(a.id)}
                className={`group flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                  isActive
                    ? "border-secondary/40 bg-secondary/5"
                    : "border-gray-100 bg-white hover:-translate-y-0.5 hover:border-secondary/30 hover:shadow-sm"
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-gray-800">{a.label}</p>
                <p className="text-[11px] leading-relaxed text-gray-500">{a.description}</p>
              </button>
            );
          })}
        </div>

        {/* Pergunta livre */}
        <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50/40 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-600">
            <HelpCircle className="h-3.5 w-3.5" /> Pergunta livre
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) run("freeQuestion", query.trim());
            }}
            className="flex gap-2"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              placeholder="Pergunte algo sobre esta matéria…"
              className="h-9 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/20"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="inline-flex h-9 items-center gap-1 rounded-lg bg-secondary px-3 text-xs font-medium text-white hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" /> Enviar
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                disabled={loading}
                onClick={() => {
                  setQuery(q);
                  run("freeQuestion", q);
                }}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-[11px] text-gray-600 transition-colors hover:border-secondary/30 hover:text-secondary disabled:opacity-50"
              >
                <BookOpen className="h-3 w-3" />
                {q}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Painel de resposta */}
      {loading && (
        <Card className="border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin text-secondary" />
            Processando análise…
          </div>
        </Card>
      )}

      {error && !loading && (
        <EmptyState
          variant="no-source"
          title="Não foi possível obter a resposta"
          message={error}
          action={
            activeAction && (
              <button
                type="button"
                onClick={() => run(activeAction, query)}
                className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="h-3 w-3" /> Tentar novamente
              </button>
            )
          }
        />
      )}

      {response && !loading && !error && (
        <Card className="border-gray-100 p-6 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Sparkles className="h-3.5 w-3.5 text-secondary" />
              {response.cached ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 font-medium">
                  Resposta em cache
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                  Resposta nova
                </span>
              )}
              {response.model && (
                <span className="text-[10px] text-gray-400">{response.model}</span>
              )}
            </div>
            {activeAction && (
              <button
                type="button"
                onClick={() => run(activeAction, query, true)}
                className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
                title="Ignora o cache e refaz a análise"
              >
                <RefreshCw className="h-3 w-3" /> Regerar
              </button>
            )}
          </div>

          <article className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
            {response.answer}
          </article>

          {response.highlights && response.highlights.length > 0 && (
            <div className="mt-4 rounded-lg border border-secondary/20 bg-secondary/5 p-3">
              <p className="mb-2 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-secondary">
                <ArrowRight className="h-3 w-3" /> Pontos-chave
              </p>
              <ul className="space-y-1 text-xs text-gray-700">
                {response.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-secondary" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {response.sources && response.sources.length > 0 && (
            <div className="mt-4 border-t border-gray-100 pt-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                Fontes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {response.sources.map((s, i) => (
                  <span
                    key={`${s.block}-${i}`}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-700"
                    title={s.note ?? undefined}
                  >
                    <BookOpen className="h-3 w-3 text-secondary" />
                    {s.block}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
