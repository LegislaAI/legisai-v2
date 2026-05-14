"use client";

import { BackButton } from "@/components/v2/components/ui/BackButton";
import { Card } from "@/components/v2/components/ui/Card";
import { useApiContext } from "@/context/ApiContext";
import {
  AlertTriangle,
  Brain,
  Download,
  Gauge,
  Sparkles,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type {
  AiDashboardJson,
  EventDetailsAPI,
} from "../components/types";
import {
  DecisoesPorTipoChart,
  DimensoesRadialChart,
  EmbatesAtoresChart,
  InsightsPorTipoChart,
} from "./_components/Charts";
import {
  DecisoesGrid,
  DimensoesPanel,
  DiscursosQuoteCard,
  EmbatesPanel,
  InsightsPanel,
  KPIBar,
  MetaInline,
} from "./_components/DataPanels";
import { exportDashboardPDF } from "./_lib/exportDashboardPDF";
import { MOCK_SESSION } from "./_lib/mockSessionDashboard";

export default function SessionDashboardPage() {
  const params = useParams();
  const id = params?.id as string;
  const search =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const useMock = search?.get("mock") === "1";

  const { GetAPI } = useApiContext();

  const [eventDetails, setEventDetails] = useState<EventDetailsAPI | null>(null);
  const [dashboard, setDashboard] = useState<AiDashboardJson | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [titulo, setTitulo] = useState<string>("Sessão Plenária");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega event details (que já traz aiDashboardJson persistido)
  useEffect(() => {
    if (useMock) {
      setDashboard(MOCK_SESSION.dashboard);
      setGeneratedAt(MOCK_SESSION.meta.geradoEm);
      setTitulo(MOCK_SESSION.meta.titulo);
      setLoading(false);
      return;
    }
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await GetAPI(`/event/details/${id}`, true);
        if (cancelled) return;
        if (res.status === 200 && res.body) {
          const ev = res.body as EventDetailsAPI;
          setEventDetails(ev);
          setDashboard(ev.aiDashboardJson ?? null);
          setGeneratedAt(ev.aiDashboardGeneratedAt ?? null);
          setTitulo(ev.description || "Sessão Plenária");
        } else {
          setError("Não foi possível carregar a sessão.");
        }
      } catch {
        if (!cancelled) setError("Erro de rede ao carregar a sessão.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, GetAPI, useMock]);

  const handleGenerate = useCallback(async () => {
    if (!id || useMock) return;
    setGenerating(true);
    setError(null);
    try {
      // 1) Busca a transcrição completa
      const tr = await GetAPI(`/event/${id}/transcricao-completa`, true);
      const fullText: string | null =
        tr.status === 200 ? (tr.body?.fullText ?? null) : null;
      if (!fullText) {
        setError("Sessão sem transcrição disponível — não é possível gerar.");
        return;
      }

      // 2) POST para gerar/persistir o dashboard estruturado
      const res = await fetch("/api/plenary/session-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fullText, eventId: id, format: "json" }),
      });
      const data = await res.json();
      if (!res.ok || !data.dashboard) {
        setError(data.error || "Falha ao gerar dashboard.");
        return;
      }
      setDashboard(data.dashboard as AiDashboardJson);
      setGeneratedAt(new Date().toISOString());
    } catch {
      setError("Erro ao gerar dashboard.");
    } finally {
      setGenerating(false);
    }
  }, [id, GetAPI, useMock]);

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <BackButton />
        <Card className="p-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#749c5b] border-t-transparent" />
          <p className="mt-4 text-sm text-gray-500">Carregando sessão…</p>
        </Card>
      </div>
    );
  }

  // Estado vazio
  if (!dashboard) {
    return (
      <div className="space-y-6 pb-20">
        <BackButton />
        <Card className="p-12 text-center">
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
          {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#749c5b] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#749c5b]/90 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {generating ? (
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
        </Card>
      </div>
    );
  }

  const eventId = eventDetails?.id ?? id;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
      <BackButton />

      {/* Hero header */}
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-[#749c5b] via-[#4E9F3D] to-[#2d5a3d] px-8 py-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                Dashboard gerado por IA
              </div>
              <h1 className="text-2xl font-bold">{titulo}</h1>
              {generatedAt && (
                <p className="mt-1 text-sm text-white/80">
                  Gerado em {new Date(generatedAt).toLocaleString("pt-BR")}
                  {dashboard.meta?.duracaoEstimada
                    ? ` · Duração ${dashboard.meta.duracaoEstimada}`
                    : ""}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                disabled={generating || useMock}
                className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-3 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 disabled:opacity-50"
                title="Regerar análise"
              >
                <Sparkles className="h-4 w-4" />
                {generating ? "Regerando…" : "Regerar"}
              </button>
              <button
                onClick={() =>
                  exportDashboardPDF({
                    titulo,
                    geradoEm: generatedAt,
                    eventId,
                    dashboard,
                  })
                }
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#749c5b] shadow-lg transition-all hover:scale-105 hover:bg-gray-50 active:scale-100"
              >
                <Download className="h-4 w-4" />
                Exportar PDF
              </button>
            </div>
          </div>
        </div>
        {dashboard.resumoExecutivo && (
          <div className="p-6">
            <p className="text-sm leading-relaxed text-gray-700">
              <strong className="text-gray-900">Síntese executiva:</strong>{" "}
              {dashboard.resumoExecutivo}
            </p>
            {dashboard.meta && <MetaInline meta={dashboard.meta} />}
          </div>
        )}
      </Card>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* KPIs */}
      <KPIBar dashboard={dashboard} />

      {/* Linha 1: Dimensões + Decisões por tipo */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {dashboard.dimensoes && (
          <Card className="lg:col-span-7">
            <h3 className="mb-1 flex items-center gap-2 text-base font-semibold text-gray-900">
              <Gauge className="h-4 w-4 text-[#749c5b]" />
              Dimensões da sessão
            </h3>
            <p className="mb-3 text-xs text-gray-500">
              Avaliação qualitativa do clima e do andamento, normalizada em
              escala 0–100.
            </p>
            <DimensoesRadialChart dimensoes={dashboard.dimensoes} />
            <DimensoesPanel dimensoes={dashboard.dimensoes} />
          </Card>
        )}

        {dashboard.principaisDecisoes && dashboard.principaisDecisoes.length > 0 && (
          <Card
            className={
              dashboard.dimensoes ? "lg:col-span-5" : "lg:col-span-12"
            }
          >
            <h3 className="mb-1 text-base font-semibold text-gray-900">
              Decisões por tipo
            </h3>
            <p className="mb-3 text-xs text-gray-500">
              Distribuição das principais decisões registradas
            </p>
            <DecisoesPorTipoChart decisoes={dashboard.principaisDecisoes} />
          </Card>
        )}
      </div>

      {/* Decisões — grid filtrável */}
      {dashboard.principaisDecisoes && dashboard.principaisDecisoes.length > 0 && (
        <DecisoesGrid decisoes={dashboard.principaisDecisoes} />
      )}

      {/* Linha 2: Embates (chart + painel) */}
      {dashboard.embates && dashboard.embates.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-5">
            <h3 className="mb-1 text-base font-semibold text-gray-900">
              Atores por embate
            </h3>
            <p className="mb-3 text-xs text-gray-500">
              Quantidade de atores envolvidos em cada disputa
            </p>
            <EmbatesAtoresChart embates={dashboard.embates} />
          </Card>
          <div className="lg:col-span-7">
            <EmbatesPanel embates={dashboard.embates} />
          </div>
        </div>
      )}

      {/* Insights — chart + painel */}
      {dashboard.insights && dashboard.insights.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <Card className="lg:col-span-5">
              <h3 className="mb-1 text-base font-semibold text-gray-900">
                Insights por tipo
              </h3>
              <p className="mb-3 text-xs text-gray-500">
                Categorização dos insights extraídos da sessão
              </p>
              <InsightsPorTipoChart insights={dashboard.insights} />
            </Card>
            <Card className="flex items-center justify-center lg:col-span-7">
              <div className="flex items-center gap-3 p-6 text-sm text-gray-600">
                <Brain className="h-5 w-5 text-[#749c5b]" />
                <p>
                  <strong className="text-gray-900">{dashboard.insights.length}</strong>{" "}
                  insight{dashboard.insights.length === 1 ? "" : "s"} analítico
                  {dashboard.insights.length === 1 ? "" : "s"} gerado
                  {dashboard.insights.length === 1 ? "" : "s"} pela IA, com
                  evidência ancorada na transcrição.
                </p>
              </div>
            </Card>
          </div>
          <InsightsPanel insights={dashboard.insights} />
        </>
      )}

      {/* Destaques de discursos */}
      {dashboard.destaquesDiscursos && dashboard.destaquesDiscursos.length > 0 && (
        <DiscursosQuoteCard destaques={dashboard.destaquesDiscursos} />
      )}

      {/* Síntese final */}
      {dashboard.sinteseFinal && (
        <Card className="border-[#749c5b]/30 bg-[#749c5b]/5">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <AlertTriangle className="h-4 w-4 text-[#749c5b]" />
            Síntese final
          </h4>
          <p className="text-sm leading-relaxed text-gray-900">
            {dashboard.sinteseFinal}
          </p>
        </Card>
      )}

      {useMock && (
        <p className="text-center text-xs text-gray-400">
          Dados de demonstração (mock). Remova{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5 text-[10px]">?mock=1</code>{" "}
          da URL para consumir o JSON real persistido em{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5 text-[10px]">
            eventDetails.aiDashboardJson
          </code>
          .
        </p>
      )}
    </div>
  );
}
