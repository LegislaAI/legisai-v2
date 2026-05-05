"use client";

import {
  AlertTriangle,
  Award,
  Brain,
  Clock,
  Gauge,
  Lightbulb,
  Mic2,
  Sparkles,
  Swords,
  Users,
} from "lucide-react";
import { useState } from "react";
import { AiDashboardJson, EventDetailsAPI } from "./types";

interface StructuredDashboardProps {
  eventDetails: EventDetailsAPI | null;
  fullTextForSession: string | null;
  onSaved?: (dashboard: AiDashboardJson) => void;
}

const dimensionColor = (value?: string) => {
  const v = (value ?? "").toLowerCase();
  if (["alto", "alta", "fluida"].some((k) => v.includes(k))) return "bg-emerald-50 text-emerald-700";
  if (["moderado", "parcial", "interrompida"].some((k) => v.includes(k))) return "bg-amber-50 text-amber-700";
  if (["baixo", "baixa", "fragmentada", "travada", "nenhuma"].some((k) => v.includes(k))) return "bg-rose-50 text-rose-700";
  return "bg-gray-100 text-gray-700";
};

export function StructuredDashboard({
  eventDetails,
  fullTextForSession,
  onSaved,
}: StructuredDashboardProps) {
  const initial = eventDetails?.aiDashboardJson ?? null;
  const [dashboard, setDashboard] = useState<AiDashboardJson | null>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatedAt = eventDetails?.aiDashboardGeneratedAt;
  const hasText = !!fullTextForSession && fullTextForSession.length > 0;

  async function handleGenerate(regenerate = false) {
    if (!hasText) {
      setError("Sessão sem transcrição disponível.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/plenary/session-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: fullTextForSession,
          eventId: eventDetails?.id,
          format: "json",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.dashboard) {
        setError(data.error || "Falha ao gerar dashboard.");
        return;
      }
      setDashboard(data.dashboard as AiDashboardJson);
      onSaved?.(data.dashboard as AiDashboardJson);
      void regenerate;
    } catch (e) {
      setError("Erro de rede ao gerar dashboard.");
    } finally {
      setLoading(false);
    }
  }

  if (!dashboard) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#749c5b]/10 text-[#749c5b]">
          <Sparkles size={24} />
        </div>
        <h3 className="text-lg font-semibold text-[#1a1d1f]">
          Dashboard analítico da sessão
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#6f767e]">
          Gere uma análise estruturada (decisões, embates, insights) a partir da
          transcrição completa. Custo de IA aplicado uma vez por sessão.
        </p>
        {!hasText && (
          <p className="mt-3 text-xs text-rose-600">
            Sessão sem transcrição disponível — não é possível gerar.
          </p>
        )}
        {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}
        <button
          onClick={() => handleGenerate(false)}
          disabled={loading || !hasText}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#749c5b] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#749c5b]/90 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Gerando análise…
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Gerar análise estruturada
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-[#749c5b]/5 to-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#749c5b]/10 p-2 text-[#749c5b]">
            <Brain size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-[#1a1d1f]">Dashboard analítico da sessão</h3>
            {generatedAt && (
              <p className="text-xs text-[#6f767e]">
                Gerado em{" "}
                {new Date(generatedAt).toLocaleString("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => handleGenerate(true)}
          disabled={loading || !hasText}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-[#1a1d1f] hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#749c5b] border-t-transparent" />
              Regerando…
            </>
          ) : (
            <>
              <Sparkles size={13} />
              Regerar
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Resumo executivo + meta */}
      {(dashboard.resumoExecutivo || dashboard.meta) && (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          {dashboard.resumoExecutivo && (
            <p className="text-sm leading-relaxed text-[#1a1d1f]">
              {dashboard.resumoExecutivo}
            </p>
          )}
          {dashboard.meta && (
            <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-100 pt-3 text-xs text-[#6f767e]">
              {dashboard.meta.tom && (
                <span className="inline-flex items-center gap-1">
                  <Gauge size={12} /> Tom: <strong className="text-[#1a1d1f]">{dashboard.meta.tom}</strong>
                </span>
              )}
              {dashboard.meta.duracaoEstimada && (
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} /> Duração: <strong className="text-[#1a1d1f]">{dashboard.meta.duracaoEstimada}</strong>
                </span>
              )}
              {typeof dashboard.meta.oradoresUnicos === "number" && (
                <span className="inline-flex items-center gap-1">
                  <Users size={12} /> Oradores: <strong className="text-[#1a1d1f]">{dashboard.meta.oradoresUnicos}</strong>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dimensões */}
      {dashboard.dimensoes && (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1a1d1f]">
            <Gauge size={16} className="text-[#749c5b]" />
            Dimensões da sessão
          </h4>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {(["conflito", "efetividade", "fluidez"] as const).map((key) => {
              const val = dashboard.dimensoes?.[key];
              if (!val) return null;
              return (
                <div key={key} className="rounded-lg border border-gray-100 p-3">
                  <p className="text-xs uppercase tracking-wide text-[#6f767e]">
                    {key}
                  </p>
                  <span className={`mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${dimensionColor(val)}`}>
                    {val}
                  </span>
                </div>
              );
            })}
          </div>
          {dashboard.dimensoes.justificativa && (
            <p className="mt-3 text-xs italic text-[#6f767e]">
              {dashboard.dimensoes.justificativa}
            </p>
          )}
        </div>
      )}

      {/* Principais decisões */}
      {dashboard.principaisDecisoes && dashboard.principaisDecisoes.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1a1d1f]">
            <Award size={16} className="text-[#749c5b]" />
            Principais decisões
          </h4>
          <div className="space-y-3">
            {dashboard.principaisDecisoes.map((d, i) => (
              <div key={i} className="rounded-lg border border-gray-100 p-3">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h5 className="text-sm font-semibold text-[#1a1d1f]">{d.titulo}</h5>
                  <span className="rounded-md bg-[#749c5b]/10 px-2 py-0.5 text-xs font-medium text-[#749c5b]">
                    {d.tipo}
                  </span>
                  {d.tema && (
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-[#6f767e]">
                      {d.tema}
                    </span>
                  )}
                </div>
                {d.detalhe && (
                  <p className="text-xs leading-relaxed text-[#6f767e]">{d.detalhe}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Embates */}
      {dashboard.embates && dashboard.embates.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1a1d1f]">
            <Swords size={16} className="text-rose-600" />
            Embates
          </h4>
          <div className="space-y-3">
            {dashboard.embates.map((e, i) => (
              <div key={i} className="rounded-lg border-l-4 border-rose-300 bg-rose-50/40 p-3">
                <p className="text-sm font-semibold text-[#1a1d1f]">{e.tema}</p>
                {e.atores?.length > 0 && (
                  <p className="mt-1 text-xs text-[#6f767e]">
                    {e.atores.join(" × ")}
                  </p>
                )}
                {e.resumo && (
                  <p className="mt-2 text-xs leading-relaxed text-[#1a1d1f]">{e.resumo}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Destaques de discursos */}
      {dashboard.destaquesDiscursos && dashboard.destaquesDiscursos.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1a1d1f]">
            <Mic2 size={16} className="text-[#749c5b]" />
            Destaques de discursos
          </h4>
          <div className="space-y-2">
            {dashboard.destaquesDiscursos.map((d, i) => (
              <div key={i} className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs">
                  <strong className="text-[#1a1d1f]">{d.deputado}</strong>
                  {d.partido && (
                    <span className="ml-1 text-[#6f767e]">({d.partido})</span>
                  )}
                </p>
                <p className="mt-1 text-xs italic text-[#1a1d1f]">"{d.trecho}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {dashboard.insights && dashboard.insights.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1a1d1f]">
            <Lightbulb size={16} className="text-amber-500" />
            Insights analíticos
          </h4>
          <div className="space-y-3">
            {dashboard.insights.map((insight, i) => (
              <div key={i} className="rounded-lg border border-gray-100 p-3">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h5 className="text-sm font-semibold text-[#1a1d1f]">{insight.titulo}</h5>
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {insight.tipo}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[#1a1d1f]">{insight.interpretacao}</p>
                {insight.evidencia && (
                  <p className="mt-2 rounded-md bg-gray-50 px-2 py-1 text-xs italic text-[#6f767e]">
                    {insight.evidencia}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Síntese final */}
      {dashboard.sinteseFinal && (
        <div className="rounded-xl border border-[#749c5b]/30 bg-[#749c5b]/5 p-5 shadow-sm">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#1a1d1f]">
            <AlertTriangle size={16} className="text-[#749c5b]" />
            Síntese final
          </h4>
          <p className="text-sm leading-relaxed text-[#1a1d1f]">
            {dashboard.sinteseFinal}
          </p>
        </div>
      )}
    </div>
  );
}
