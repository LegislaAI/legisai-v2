"use client";

import { useApiContext } from "@/context/ApiContext";
import {
  AlertCircle,
  CalendarClock,
  FileWarning,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Insight {
  type:
    | "urgencia_recente"
    | "comissao_geral"
    | "pauta_plenario"
    | "quorum_medio"
    | "votacoes_semana";
  text: string;
  value: number | null;
  referenceDate: string | null;
  propositionId: string | null;
  eventId: string | null;
}

interface InsightsResponse {
  generatedAt: string;
  insights: Insight[];
}

const ICONS: Record<Insight["type"], typeof AlertCircle> = {
  urgencia_recente: AlertCircle,
  comissao_geral: CalendarClock,
  pauta_plenario: FileWarning,
  quorum_medio: Users,
  votacoes_semana: TrendingUp,
};

const COLORS: Record<Insight["type"], string> = {
  urgencia_recente: "bg-rose-50 text-rose-600 border-rose-100",
  comissao_geral: "bg-indigo-50 text-indigo-600 border-indigo-100",
  pauta_plenario: "bg-amber-50 text-amber-600 border-amber-100",
  quorum_medio: "bg-emerald-50 text-emerald-600 border-emerald-100",
  votacoes_semana: "bg-blue-50 text-blue-600 border-blue-100",
};

export function WeeklyInsightsStrip() {
  const { GetAPI } = useApiContext();
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let active = true;
    GetAPI("/event/weekly-insights", true)
      .then((res) => {
        if (!active) return;
        if (res.status === 200 && res.body?.insights) {
          setData(res.body as InsightsResponse);
        }
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [GetAPI]);

  if (hidden) return null;

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-[#6f767e]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#749c5b] border-t-transparent" />
          Calculando insights da semana…
        </div>
      </div>
    );
  }

  if (!data || data.insights.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1a1d1f]">
          <Sparkles size={15} className="text-[#749c5b]" />
          Insights da semana
        </h3>
        <button
          onClick={() => setHidden(true)}
          className="text-xs text-[#6f767e] hover:text-[#1a1d1f]"
          aria-label="Ocultar insights"
        >
          ×
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data.insights.map((insight, i) => {
          const Icon = ICONS[insight.type] ?? AlertCircle;
          const colorClass = COLORS[insight.type] ?? COLORS.urgencia_recente;
          const linkHref = insight.eventId
            ? `/plenario/deliberativa/${insight.eventId}`
            : insight.propositionId
              ? `/proposicoes/${insight.propositionId}`
              : null;
          const inner = (
            <div
              className={`flex h-full items-start gap-3 rounded-lg border p-3 transition ${colorClass} ${
                linkHref ? "cursor-pointer hover:shadow-sm" : ""
              }`}
            >
              <div className="rounded-md bg-white/60 p-1.5">
                <Icon size={16} />
              </div>
              <p className="text-xs leading-relaxed text-[#1a1d1f]">{insight.text}</p>
            </div>
          );
          return linkHref ? (
            <Link key={i} href={linkHref}>
              {inner}
            </Link>
          ) : (
            <div key={i}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
