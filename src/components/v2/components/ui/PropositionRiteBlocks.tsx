"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { EmptyState } from "@/components/v2/components/ui/EmptyState";
import { QualityBadge } from "@/components/v2/components/ui/QualityBadge";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Gavel,
  Hourglass,
  TimerReset,
  type LucideIcon,
} from "lucide-react";

export type Rite = {
  regime: "urgencia" | "prioridade" | "ordinario" | "desconhecido";
  regimeRaw?: string | null;
  status:
    | "em-comissao"
    | "em-plenario"
    | "conclusiva"
    | "arquivada"
    | "transformada-em-norma"
    | "desconhecida";
  appreciation?: string | null;
  prazos: {
    comissaoDiasUteis: number | null;
    relatorDiasUteis: number | null;
    consumidoDiasCorridos: number | null;
    remanescenteDiasCorridos: number | null;
    situacao: "em-dia" | "no-limite" | "vencido" | null;
    baseLegal?: string;
  };
  nextStep:
    | "aguardando-despacho"
    | "aguardando-designacao-relator"
    | "aguardando-parecer"
    | "aguardando-pauta"
    | "aguardando-votacao"
    | "aguardando-redacao-final"
    | "aguardando-remessa"
    | "concluida"
    | "indefinido";
};

const STATUS_LABEL: Record<Rite["status"], { label: string; tone: string }> = {
  "em-comissao": { label: "Em comissão", tone: "bg-amber-50 text-amber-700 border-amber-100" },
  "em-plenario": { label: "Em plenário", tone: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  conclusiva: { label: "Apreciação conclusiva", tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  arquivada: { label: "Arquivada", tone: "bg-gray-100 text-gray-700 border-gray-200" },
  "transformada-em-norma": {
    label: "Transformada em norma jurídica",
    tone: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  desconhecida: { label: "Estágio não identificado", tone: "bg-gray-100 text-gray-500 border-gray-200" },
};

const NEXT_STEP_LABEL: Record<Rite["nextStep"], { label: string; icon: LucideIcon }> = {
  "aguardando-despacho": { label: "Aguardando despacho", icon: Clock },
  "aguardando-designacao-relator": { label: "Aguardando designação de relator", icon: Clock },
  "aguardando-parecer": { label: "Aguardando parecer", icon: Hourglass },
  "aguardando-pauta": { label: "Aguardando pauta", icon: Hourglass },
  "aguardando-votacao": { label: "Aguardando votação", icon: Gavel },
  "aguardando-redacao-final": { label: "Aguardando redação final", icon: Hourglass },
  "aguardando-remessa": { label: "Aguardando remessa", icon: ArrowRight },
  concluida: { label: "Tramitação concluída", icon: CheckCircle2 },
  indefinido: { label: "Próximo passo indefinido", icon: AlertCircle },
};

export function ProceduralStatusBlock({ rite }: { rite: Rite }) {
  const status = STATUS_LABEL[rite.status];
  return (
    <Card className="border-gray-100 p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
        <TimerReset className="h-5 w-5 text-secondary" /> Situação procedimental
        <span className="ml-auto">
          <QualityBadge flag="derived" />
        </span>
      </h3>
      <div className="flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-tight ${status.tone}`}
        >
          {status.label}
        </span>
        {rite.regime !== "desconhecido" && (
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-tight text-slate-700">
            Regime: {rite.regimeRaw || rite.regime}
          </span>
        )}
        {rite.appreciation && (
          <span className="inline-flex items-center rounded-full border border-gray-100 bg-gray-50 px-3 py-1 text-[11px] font-medium text-gray-600">
            {rite.appreciation}
          </span>
        )}
      </div>
      <p className="mt-3 text-[11px] italic text-gray-400">
        Estágio inferido a partir de regime, apreciação e órgão atual.
      </p>
    </Card>
  );
}

export function DeadlinesBlock({ rite }: { rite: Rite }) {
  const p = rite.prazos;
  const noDeadlineBase = p.comissaoDiasUteis == null;
  const hasConsumed = p.consumidoDiasCorridos != null;
  return (
    <Card className="border-gray-100 p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
        <Hourglass className="h-5 w-5 text-secondary" /> Prazos
        <span className="ml-auto">
          <QualityBadge flag="derived" />
        </span>
      </h3>

      {noDeadlineBase && !hasConsumed ? (
        <EmptyState
          variant="computing"
          compact
          title="Sem elementos suficientes"
          message="Sem elementos suficientes para cálculo confiável de prazo."
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <Stat
              label="Prazo da comissão"
              value={p.comissaoDiasUteis != null ? `${p.comissaoDiasUteis} d.u.` : "—"}
            />
            <Stat
              label="Prazo do relator"
              value={p.relatorDiasUteis != null ? `${p.relatorDiasUteis} d.u.` : "—"}
            />
            <Stat
              label="Consumido"
              value={
                p.consumidoDiasCorridos != null
                  ? `${p.consumidoDiasCorridos} d.c.`
                  : "—"
              }
              hint="desde última mov."
            />
            <Stat
              label="Remanescente"
              value={
                p.remanescenteDiasCorridos != null
                  ? `${p.remanescenteDiasCorridos} d.c.`
                  : "—"
              }
              tone={
                p.situacao === "vencido"
                  ? "text-red-700"
                  : p.situacao === "no-limite"
                    ? "text-amber-700"
                    : "text-gray-800"
              }
            />
          </div>

          {p.situacao && (
            <div
              className={`mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${
                p.situacao === "vencido"
                  ? "bg-red-50 text-red-700"
                  : p.situacao === "no-limite"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {p.situacao === "vencido"
                ? "Prazo possivelmente vencido"
                : p.situacao === "no-limite"
                  ? "Prazo no limite"
                  : "Em dia"}
            </div>
          )}

          <p className="mt-3 text-[11px] italic text-gray-400">
            {p.baseLegal ?? "Prazos indicativos."} · d.u. = dias úteis · d.c. = dias corridos.
          </p>
        </>
      )}
    </Card>
  );
}

export function NextStepBlock({ rite }: { rite: Rite }) {
  const ns = NEXT_STEP_LABEL[rite.nextStep];
  const Icon = ns.icon;
  return (
    <Card className="border-gray-100 p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
        <ArrowRight className="h-5 w-5 text-secondary" /> Próximo passo provável
        <span className="ml-auto">
          <QualityBadge flag="derived" />
        </span>
      </h3>
      <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-indigo-900">{ns.label}</p>
          <p className="text-[11px] text-indigo-700/70">
            Inferência a partir do estágio atual, regime e dados de tramitação.
          </p>
        </div>
      </div>
    </Card>
  );
}

function Stat({
  label,
  value,
  hint,
  tone = "text-gray-800",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/40 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-lg font-bold ${tone}`}>{value}</p>
      {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
    </div>
  );
}
