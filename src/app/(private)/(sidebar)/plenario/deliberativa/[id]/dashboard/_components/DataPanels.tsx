"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  Award,
  Clock,
  Gauge,
  Lightbulb,
  Mic2,
  Quote,
  Swords,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { AiDashboardJson } from "../../components/types";

function dimensionColor(value?: string) {
  const v = (value ?? "").toLowerCase();
  if (["alto", "alta", "fluida"].some((k) => v.includes(k)))
    return "bg-emerald-50 text-emerald-700";
  if (["moderado", "parcial", "interrompida"].some((k) => v.includes(k)))
    return "bg-amber-50 text-amber-700";
  if (
    ["baixo", "baixa", "fragmentada", "travada", "nenhuma"].some((k) =>
      v.includes(k),
    )
  )
    return "bg-rose-50 text-rose-700";
  return "bg-gray-100 text-gray-700";
}

export function KPIBar({ dashboard }: { dashboard: AiDashboardJson }) {
  const items = [
    {
      label: "Decisões",
      value: dashboard.principaisDecisoes?.length ?? 0,
      Icon: Award,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Embates",
      value: dashboard.embates?.length ?? 0,
      Icon: Swords,
      color: "from-rose-500 to-rose-600",
    },
    {
      label: "Insights",
      value: dashboard.insights?.length ?? 0,
      Icon: Lightbulb,
      color: "from-amber-500 to-amber-600",
    },
    {
      label: "Oradores",
      value: dashboard.meta?.oradoresUnicos ?? "—",
      Icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Tom",
      value: dashboard.meta?.tom ?? "—",
      Icon: TrendingUp,
      color: "from-violet-500 to-violet-600",
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {items.map((it) => {
        const Icon = it.Icon;
        return (
          <Card key={it.label} className="p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {it.label}
              </p>
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white",
                  it.color,
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p
              className={cn(
                "mt-2 font-bold text-gray-900",
                it.isText ? "truncate text-sm" : "text-2xl tabular-nums",
              )}
              title={String(it.value)}
            >
              {it.value}
            </p>
          </Card>
        );
      })}
    </div>
  );
}

export function DimensoesPanel({
  dimensoes,
}: {
  dimensoes: NonNullable<AiDashboardJson["dimensoes"]>;
}) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
        {(["conflito", "efetividade", "fluidez"] as const).map((key) => (
          <div key={key} className="rounded-md bg-gray-50 px-2 py-1.5">
            <span className="block text-[#6f767e] capitalize">{key}</span>
            <span
              className={cn(
                "mt-1 inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold",
                dimensionColor(dimensoes[key]),
              )}
            >
              {dimensoes[key] || "—"}
            </span>
          </div>
        ))}
      </div>
      {dimensoes.justificativa && (
        <p className="mt-3 text-xs italic text-[#6f767e]">
          {dimensoes.justificativa}
        </p>
      )}
    </div>
  );
}

export function DecisoesGrid({
  decisoes,
}: {
  decisoes: NonNullable<AiDashboardJson["principaisDecisoes"]>;
}) {
  const tipos = useMemo(
    () => ["all", ...Array.from(new Set(decisoes.map((d) => d.tipo)))],
    [decisoes],
  );
  const [filter, setFilter] = useState<string>("all");
  const filtered = filter === "all" ? decisoes : decisoes.filter((d) => d.tipo === filter);

  return (
    <Card className="p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <Award className="h-4 w-4 text-[#749c5b]" />
            Principais decisões
          </h3>
          <p className="text-xs text-gray-500">
            {filtered.length} item{filtered.length === 1 ? "" : "s"}
          </p>
        </div>
        {tipos.length > 2 && (
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
            {tipos.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-medium transition-all",
                  filter === t
                    ? "bg-white text-[#749c5b] shadow-sm"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                {t === "all" ? "Todos" : t}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
        {filtered.map((d, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-100 bg-gradient-to-br from-emerald-50/40 to-white p-4"
          >
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h5 className="text-sm font-semibold text-gray-900">{d.titulo}</h5>
              <span className="rounded-md bg-[#749c5b]/10 px-2 py-0.5 text-xs font-medium text-[#749c5b]">
                {d.tipo}
              </span>
              {d.tema && (
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {d.tema}
                </span>
              )}
            </div>
            {d.detalhe && (
              <p className="text-xs leading-relaxed text-gray-600">
                {d.detalhe}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function EmbatesPanel({
  embates,
}: {
  embates: NonNullable<AiDashboardJson["embates"]>;
}) {
  return (
    <Card className="p-0">
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <Swords className="h-4 w-4 text-rose-600" />
          Embates ({embates.length})
        </h3>
        <p className="text-xs text-gray-500">
          Disputas de posição registradas durante a sessão
        </p>
      </div>
      <div className="space-y-3 p-5">
        {embates.map((e, i) => (
          <div
            key={i}
            className="rounded-lg border-l-4 border-rose-300 bg-rose-50/40 p-4"
          >
            <p className="text-sm font-semibold text-gray-900">{e.tema}</p>
            {e.atores?.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">{e.atores.join(" × ")}</p>
            )}
            {e.resumo && (
              <p className="mt-2 text-xs leading-relaxed text-gray-700">
                {e.resumo}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DiscursosQuoteCard({
  destaques,
}: {
  destaques: NonNullable<AiDashboardJson["destaquesDiscursos"]>;
}) {
  return (
    <Card className="p-0">
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <Mic2 className="h-4 w-4 text-[#749c5b]" />
          Destaques de discursos
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
        {destaques.map((c, idx) => (
          <figure
            key={idx}
            className="relative overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5"
          >
            <Quote className="absolute -top-2 -right-2 h-16 w-16 text-[#749c5b]/10" />
            <blockquote className="text-sm italic leading-relaxed text-gray-800">
              &ldquo;{c.trecho}&rdquo;
            </blockquote>
            <figcaption className="mt-3 flex items-center justify-between gap-2 text-xs">
              <div>
                <p className="font-semibold text-gray-900">{c.deputado}</p>
                {c.partido && <p className="text-gray-500">{c.partido}</p>}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </Card>
  );
}

export function InsightsPanel({
  insights,
}: {
  insights: NonNullable<AiDashboardJson["insights"]>;
}) {
  return (
    <Card className="p-0">
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Insights analíticos ({insights.length})
        </h3>
        <p className="text-xs text-gray-500">
          Interpretações geradas pela IA com evidência ancorada na transcrição
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 p-5 lg:grid-cols-3">
        {insights.map((it, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Insight {idx + 1}
              </span>
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                {it.tipo}
              </span>
            </div>
            <p className="text-sm font-semibold leading-snug text-gray-900">
              {it.titulo}
            </p>
            <p className="text-xs leading-relaxed text-gray-700">
              {it.interpretacao}
            </p>
            {it.evidencia && (
              <p className="mt-1 rounded-md bg-gray-50 px-2 py-1 text-[11px] italic text-gray-500">
                {it.evidencia}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function MetaInline({
  meta,
}: {
  meta: NonNullable<AiDashboardJson["meta"]>;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-3 border-t border-gray-100 pt-3 text-xs text-gray-500">
      {meta.tom && (
        <span className="inline-flex items-center gap-1">
          <Gauge className="h-3 w-3" /> Tom:{" "}
          <strong className="text-gray-900">{meta.tom}</strong>
        </span>
      )}
      {meta.duracaoEstimada && (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" /> Duração:{" "}
          <strong className="text-gray-900">{meta.duracaoEstimada}</strong>
        </span>
      )}
      {typeof meta.oradoresUnicos === "number" && (
        <span className="inline-flex items-center gap-1">
          <Users className="h-3 w-3" /> Oradores:{" "}
          <strong className="text-gray-900">{meta.oradoresUnicos}</strong>
        </span>
      )}
    </div>
  );
}
