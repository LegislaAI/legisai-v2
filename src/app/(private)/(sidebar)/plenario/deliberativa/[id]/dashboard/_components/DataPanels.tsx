"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Hash,
  MessageSquare,
  Quote,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { SessionDashboardData } from "../_lib/mockSessionDashboard";

function sentimentLabel(s: number): { text: string; cls: string } {
  if (s > 0.2) return { text: "Positivo", cls: "text-emerald-700 bg-emerald-50" };
  if (s > -0.1) return { text: "Neutro", cls: "text-gray-700 bg-gray-100" };
  if (s > -0.3) return { text: "Tenso", cls: "text-amber-700 bg-amber-50" };
  return { text: "Negativo", cls: "text-red-700 bg-red-50" };
}

export function KPIBar({ kpis }: { kpis: SessionDashboardData["kpis"] }) {
  const items = [
    {
      label: "Intervenções",
      value: kpis.totalIntervencoes,
      Icon: MessageSquare,
      color: "from-[#749c5b] to-[#4E9F3D]",
    },
    {
      label: "Deputados únicos",
      value: kpis.deputadosUnicos,
      Icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Sentimento médio",
      value: kpis.sentimentoMedio.toFixed(2),
      Icon: TrendingUp,
      color:
        kpis.sentimentoMedio >= 0
          ? "from-emerald-500 to-emerald-600"
          : "from-amber-500 to-red-500",
    },
    {
      label: "Tópicos distintos",
      value: kpis.topicosDistintos,
      Icon: Hash,
      color: "from-violet-500 to-violet-600",
    },
    {
      label: "Duração",
      value: `${Math.floor(kpis.minutosTotais / 60)}h ${kpis.minutosTotais % 60}m`,
      Icon: Clock,
      color: "from-rose-500 to-rose-600",
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
            <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900">
              {it.value}
            </p>
          </Card>
        );
      })}
    </div>
  );
}

export function InterventionsTable({
  data,
}: {
  data: SessionDashboardData["intervencoes"];
}) {
  const [filter, setFilter] = useState<"all" | "discurso" | "questao_ordem" | "aparte" | "encaminhamento">("all");

  const filtered = useMemo(
    () => (filter === "all" ? data : data.filter((i) => i.tipo === filter)),
    [data, filter],
  );

  const tipoLabel = {
    discurso: "Discurso",
    questao_ordem: "Q. Ordem",
    aparte: "Aparte",
    encaminhamento: "Encaminham.",
  };

  return (
    <Card className="p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Intervenções por deputado
          </h3>
          <p className="text-xs text-gray-500">
            {filtered.length} item{filtered.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
          {(["all", "discurso", "questao_ordem", "aparte", "encaminhamento"] as const).map(
            (t) => (
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
                {t === "all" ? "Todos" : tipoLabel[t]}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {filtered.map((i, idx) => (
          <div
            key={idx}
            className="grid grid-cols-12 items-center gap-3 border-b border-gray-100 px-5 py-3 text-sm last:border-b-0 hover:bg-gray-50"
          >
            <div className="col-span-1 text-center text-xs text-gray-400 tabular-nums">
              {Math.floor(i.minuto / 60)}:
              {String(i.minuto % 60).padStart(2, "0")}
            </div>
            <div className="col-span-3">
              <p className="font-medium text-gray-900">{i.deputado}</p>
              <p className="text-xs text-gray-500">
                {i.partido}-{i.uf}
              </p>
            </div>
            <div className="col-span-2">
              <span
                className={cn(
                  "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                  i.tipo === "discurso" && "bg-blue-50 text-blue-700",
                  i.tipo === "questao_ordem" && "bg-amber-50 text-amber-700",
                  i.tipo === "aparte" && "bg-violet-50 text-violet-700",
                  i.tipo === "encaminhamento" && "bg-emerald-50 text-emerald-700",
                )}
              >
                {tipoLabel[i.tipo]}
              </span>
            </div>
            <div className="col-span-6 text-gray-700">{i.resumo}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function QuoteCard({
  data,
}: {
  data: SessionDashboardData["citacoesDestaque"];
}) {
  return (
    <Card className="p-0">
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <Quote className="h-4 w-4 text-[#749c5b]" />
          Citações em destaque
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
        {data.map((c, idx) => (
          <figure
            key={idx}
            className="relative overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5"
          >
            <Quote className="absolute -top-2 -right-2 h-16 w-16 text-[#749c5b]/10" />
            <blockquote className="text-sm italic leading-relaxed text-gray-800">
              &ldquo;{c.frase}&rdquo;
            </blockquote>
            <figcaption className="mt-3 flex items-center justify-between gap-2 text-xs">
              <div>
                <p className="font-semibold text-gray-900">{c.autor}</p>
                <p className="text-gray-500">{c.partido}</p>
              </div>
              <div className="text-right text-gray-400">
                <p>{c.contexto}</p>
                <p className="tabular-nums">
                  {Math.floor(c.minuto / 60)}h{String(c.minuto % 60).padStart(2, "0")}
                </p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </Card>
  );
}

export function BlocksAccordion({
  data,
  topicos,
}: {
  data: SessionDashboardData["blocos"];
  topicos: SessionDashboardData["topicos"];
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <Card className="p-0">
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="text-base font-semibold text-gray-900">
          Blocos da sessão
        </h3>
        <p className="text-xs text-gray-500">
          Drill-down em cada bloco — clique para expandir
        </p>
      </div>
      <ul>
        {data.map((b, idx) => {
          const open = openIdx === idx;
          const duracao = b.fimMin - b.inicioMin;
          return (
            <li key={idx} className="border-b border-gray-100 last:border-b-0">
              <button
                onClick={() => setOpenIdx(open ? null : idx)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50"
              >
                <div className="text-gray-400">
                  {open ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{b.titulo}</p>
                  <p className="text-xs text-gray-500">
                    {b.inicioMin}–{b.fimMin}min · {duracao}min de duração
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {b.deputadosEnvolvidos.length} deputados
                </div>
              </button>
              {open && (
                <div className="space-y-3 bg-gray-50/50 px-5 py-4">
                  <p className="text-sm leading-relaxed text-gray-700">
                    {b.resumoExecutivo}
                  </p>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Deputados envolvidos
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {b.deputadosEnvolvidos.map((d) => (
                        <span
                          key={d}
                          className="rounded-md bg-white px-2 py-0.5 text-xs text-gray-700 shadow-sm"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Tópicos relacionados
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {topicos.slice(0, 4).map((t) => {
                        const lbl = sentimentLabel(t.sentimentoAssoc);
                        return (
                          <span
                            key={t.nome}
                            className={cn(
                              "rounded-md px-2 py-0.5 text-xs",
                              lbl.cls,
                            )}
                          >
                            {t.nome}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export function PredictionsPanel({
  data,
}: {
  data: SessionDashboardData["previsoes"];
}) {
  return (
    <Card className="p-0">
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <Target className="h-4 w-4 text-[#749c5b]" />
          Cenários e previsões
        </h3>
        <p className="text-xs text-gray-500">
          Hipóteses geradas pela IA com probabilidade estimada
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 p-5 lg:grid-cols-3">
        {data.map((p, idx) => {
          const pct = Math.round(p.probabilidade * 100);
          const color =
            pct >= 60
              ? "bg-emerald-500"
              : pct >= 40
                ? "bg-amber-500"
                : "bg-red-500";
          return (
            <div
              key={idx}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Cenário {idx + 1}
                </span>
                <span className="text-2xl font-bold tabular-nums text-gray-900">
                  {pct}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className={cn("h-full rounded-full transition-all", color)}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-sm font-medium leading-snug text-gray-900">
                {p.cenario}
              </p>
              <p className="text-xs leading-relaxed text-gray-500">
                {p.racional}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
