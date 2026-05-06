"use client";

import { BackButton } from "@/components/v2/components/ui/BackButton";
import { Card } from "@/components/v2/components/ui/Card";
import { Download, Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import {
  SentimentTimelineChart,
  SpeakingTimeBarChart,
  TopicsBubbleChart,
} from "./_components/Charts";
import {
  BlocksAccordion,
  InterventionsTable,
  KPIBar,
  PredictionsPanel,
  QuoteCard,
} from "./_components/DataPanels";
import { exportDashboardPDF } from "./_lib/exportDashboardPDF";
import { MOCK_DASHBOARD } from "./_lib/mockSessionDashboard";

export default function SessionDashboardPage() {
  const params = useParams();
  const id = params?.id as string;

  // TODO[backend]: trocar mock por
  //   const { GetAPI } = useApiContext();
  //   useEffect(() => { GetAPI(`/api/plenary/session-summary?eventId=${id}&format=json`).then(setData) });
  const data = { ...MOCK_DASHBOARD, meta: { ...MOCK_DASHBOARD.meta, eventId: id } };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
      <BackButton />

      {/* Hero header */}
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-[#749c5b] via-[#4E9F3D] to-[#2d5a3d] px-8 py-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                Dashboard gerado por IA
              </div>
              <h1 className="text-2xl font-bold">{data.meta.titulo}</h1>
              <p className="mt-1 text-sm text-white/80">
                Gerado em{" "}
                {new Date(data.meta.geradoEm).toLocaleString("pt-BR")} ·
                Duração {Math.floor(data.meta.duracaoMinutos / 60)}h
                {data.meta.duracaoMinutos % 60}m
              </p>
            </div>
            <button
              onClick={() => exportDashboardPDF(data)}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#749c5b] shadow-lg transition-all hover:scale-105 hover:bg-gray-50 active:scale-100"
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm leading-relaxed text-gray-700">
            <strong className="text-gray-900">Síntese executiva:</strong>{" "}
            {data.sintese}
          </p>
        </div>
      </Card>

      {/* KPIs */}
      <KPIBar kpis={data.kpis} />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <h3 className="mb-1 text-base font-semibold text-gray-900">
            Sentimento ao longo da sessão
          </h3>
          <p className="mb-3 text-xs text-gray-500">
            Variação do sentimento expresso pelos parlamentares (–1 negativo · +1
            positivo)
          </p>
          <SentimentTimelineChart data={data.sentimento} />
        </Card>

        <Card className="lg:col-span-5">
          <h3 className="mb-1 text-base font-semibold text-gray-900">
            Tópicos mais citados
          </h3>
          <p className="mb-3 text-xs text-gray-500">
            Tamanho da bolha = intensidade do sentimento; cor = polaridade
          </p>
          <TopicsBubbleChart data={data.topicos} />
        </Card>

        <Card className="lg:col-span-12">
          <h3 className="mb-1 text-base font-semibold text-gray-900">
            Tempo de fala — top 10 deputados
          </h3>
          <p className="mb-3 text-xs text-gray-500">
            Soma de minutos no microfone por parlamentar
          </p>
          <SpeakingTimeBarChart data={data.temposFala} />
        </Card>
      </div>

      {/* Tabela + Citações */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <InterventionsTable data={data.intervencoes} />
        <QuoteCard data={data.citacoesDestaque} />
      </div>

      {/* Blocos */}
      <BlocksAccordion data={data.blocos} topicos={data.topicos} />

      {/* Previsões */}
      <PredictionsPanel data={data.previsoes} />

      <p className="text-center text-xs text-gray-400">
        Dados de demonstração — schema JSON estruturado pendente do route
        handler v2 (ver{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-[10px]">
          BACKEND_TODO.md
        </code>
        , Tarefa 3).
      </p>
    </div>
  );
}
