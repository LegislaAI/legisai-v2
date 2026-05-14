"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { QualityBadge } from "@/components/v2/components/ui/QualityBadge";
import { useApiContext } from "@/context/ApiContext";
import {
  AlertTriangle,
  Crosshair,
  Gavel,
  Loader2,
  RefreshCw,
  Scale,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useState } from "react";

type FichamentoSections = Partial<{
  objetoCentral: string;
  finalidade: string;
  publicoAfetado: string;
  impactoProvavel: string;
  riscoJuridico: string;
  sensibilidadePolitica: string;
  pontoAtencaoRegimental: string;
}>;

type FichamentoResponse = {
  cached: boolean;
  model?: string;
  answer: string;
  sources?: Array<{ block: string; note?: string }>;
};

/**
 * Bloco 6 — Fichamento analítico. Lazy: só dispara quando o usuário clica.
 */
export function PropositionAnalyticalCard({
  propositionId,
}: {
  propositionId: string;
}) {
  const { PostAPI } = useApiContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FichamentoResponse | null>(null);

  const generate = useCallback(
    async (bypassCache = false) => {
      setLoading(true);
      setError(null);
      try {
        const res = await PostAPI(
          `/proposition/${propositionId}/ai`,
          { action: "fichamento", bypassCache },
          true
        );
        if (res.status === 200 && res.body) {
          setData(res.body as FichamentoResponse);
        } else {
          setError(
            typeof res.body === "string"
              ? res.body
              : "Não foi possível gerar o fichamento."
          );
        }
      } catch {
        setError("Falha de rede ao gerar o fichamento.");
      } finally {
        setLoading(false);
      }
    },
    [PostAPI, propositionId]
  );

  const sections = parseSections(data?.answer);

  return (
    <Card className="border-gray-100 p-6 shadow-sm">
      <div className="flex items-start gap-2">
        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <Sparkles className="h-5 w-5 text-secondary" /> Fichamento analítico
        </h3>
        <span className="ml-auto flex items-center gap-2">
          <QualityBadge flag="derived" />
          {data && !loading && (
            <button
              type="button"
              onClick={() => generate(true)}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
              title="Regenerar com nova chamada"
            >
              <RefreshCw className="h-3 w-3" /> Regerar
            </button>
          )}
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Análise estruturada produzida pela IA com base nos blocos integrados desta matéria.
      </p>

      {!data && !loading && !error && (
        <button
          type="button"
          onClick={() => generate(false)}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-indigo-600 hover:to-purple-700"
        >
          <Sparkles className="h-4 w-4" /> Gerar fichamento analítico
        </button>
      )}

      {loading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin text-secondary" />
          Analisando matéria…
        </div>
      )}

      {error && !loading && (
        <div className="mt-4 rounded-lg border border-red-100 bg-red-50/50 p-3 text-xs text-red-700">
          {error}
          <button
            type="button"
            onClick={() => generate(false)}
            className="ml-2 underline hover:text-red-900"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {data && !loading && !error && (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Section
              icon={Target}
              label="Objeto central"
              value={sections.objetoCentral}
            />
            <Section icon={Crosshair} label="Finalidade" value={sections.finalidade} />
            <Section icon={Users} label="Público afetado" value={sections.publicoAfetado} />
            <Section
              icon={TrendingUp}
              label="Impacto provável"
              value={sections.impactoProvavel}
            />
            <Section icon={Scale} label="Risco jurídico" value={sections.riscoJuridico} />
            <Section
              icon={AlertTriangle}
              label="Sensibilidade política"
              value={sections.sensibilidadePolitica}
            />
            <Section
              icon={Gavel}
              label="Ponto de atenção regimental"
              value={sections.pontoAtencaoRegimental}
              full
            />
          </div>

          {(!sections.objetoCentral && !sections.finalidade) && (
            <div className="mt-4 whitespace-pre-wrap rounded-lg border border-gray-100 bg-gray-50/40 p-3 text-sm text-gray-700">
              {data.answer}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-500">
            <span>
              {data.cached ? "Resposta em cache" : "Resposta nova"}
              {data.model && <span className="ml-2 text-gray-400">{data.model}</span>}
            </span>
            {data.sources && data.sources.length > 0 && (
              <span className="text-gray-400">
                Fontes: {data.sources.map((s) => s.block).join(", ")}
              </span>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

function Section({
  icon: Icon,
  label,
  value,
  full,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
  full?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-gray-100 bg-white p-3 ${full ? "sm:col-span-2" : ""}`}
    >
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p
        className={`mt-1 text-xs leading-relaxed ${
          value ? "text-gray-700" : "italic text-gray-400"
        }`}
      >
        {value || "Não inferido."}
      </p>
    </div>
  );
}

/**
 * O backend pode retornar o fichamento em duas formas:
 *  - answer já é um JSON-em-string com as seções
 *  - answer é texto livre — tentamos parse heurístico por linhas "campo: valor"
 */
function parseSections(answer?: string): FichamentoSections {
  if (!answer) return {};
  // Tentativa 1: JSON puro
  try {
    const parsed = JSON.parse(answer) as FichamentoSections;
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    /* segue */
  }
  // Tentativa 2: parse heurístico por linhas
  const map: Record<keyof FichamentoSections, RegExp> = {
    objetoCentral: /objeto\s+central[:\-]\s*(.+)/i,
    finalidade: /finalidade[:\-]\s*(.+)/i,
    publicoAfetado: /p[uú]blico\s+afetado[:\-]\s*(.+)/i,
    impactoProvavel: /impacto\s+prov[aá]vel[:\-]\s*(.+)/i,
    riscoJuridico: /risco\s+jur[ií]dico[:\-]\s*(.+)/i,
    sensibilidadePolitica: /sensibilidade\s+pol[ií]tica[:\-]\s*(.+)/i,
    pontoAtencaoRegimental: /ponto\s+de\s+aten[cç][aã]o\s+regimental[:\-]\s*(.+)/i,
  };
  const out: FichamentoSections = {};
  for (const [key, regex] of Object.entries(map) as Array<[
    keyof FichamentoSections,
    RegExp
  ]>) {
    const match = answer.match(regex);
    if (match) out[key] = match[1].trim();
  }
  return out;
}
