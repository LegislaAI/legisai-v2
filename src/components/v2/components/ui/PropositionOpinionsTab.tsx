"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { EmptyState } from "@/components/v2/components/ui/EmptyState";
import { QualityBadge } from "@/components/v2/components/ui/QualityBadge";
import { Building2, Calendar, FileText, History, UserCheck } from "lucide-react";
import Link from "next/link";

type EventItem = {
  id: string;
  topic?: string;
  title?: string;
  situation?: string;
  reporterId?: string;
  reporterName?: string;
  reporterUri?: string;
  report?: string;
  event: {
    id: string;
    startDate: string;
    description?: string;
    local?: string;
  };
};

/**
 * Aba derivada — não existe modelo PropositionOpinion ainda.
 * Os pareceres ficam embutidos como texto em EventProposition.report, e
 * a relatoria atual/histórico são reconstruídos a partir dos eventos com reporter.
 */
export function PropositionOpinionsTab({ events }: { events?: EventItem[] }) {
  const all = events ?? [];

  // Relatoria: agrupa por reporter para extrair histórico + atual
  const withReporter = all
    .filter((e) => e.reporterName && e.event?.startDate)
    .sort((a, b) => new Date(a.event.startDate).getTime() - new Date(b.event.startDate).getTime());

  const reporterHistory = (() => {
    const out: Array<{
      reporterId?: string;
      reporterName: string;
      agency?: string;
      from: string;
      to?: string;
      count: number;
    }> = [];
    for (const e of withReporter) {
      const name = e.reporterName!;
      const agency = e.event.local;
      const date = e.event.startDate;
      const last = out[out.length - 1];
      if (last && last.reporterName === name) {
        last.to = date;
        last.count += 1;
      } else {
        out.push({
          reporterId: e.reporterId,
          reporterName: name,
          agency,
          from: date,
          count: 1,
        });
      }
    }
    return out;
  })();

  const current = reporterHistory[reporterHistory.length - 1];
  const opinions = all.filter((e) => e.report && e.report.trim().length > 0);

  return (
    <div className="space-y-6">
      {/* Bloco 1 — Relatoria atual */}
      <Card className="border-gray-100 p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
          <UserCheck className="h-5 w-5 text-secondary" /> Relatoria atual
          <span className="ml-auto">
            <QualityBadge flag={current ? "partial" : "no-data"} />
          </span>
        </h3>
        {current ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Relator" value={current.reporterName} />
            <Field label="Comissão" value={current.agency} />
            <Field
              label="Designação (primeiro evento)"
              value={new Date(current.from).toLocaleDateString("pt-BR")}
            />
            <Field
              label="Situação da relatoria"
              value={current.to && current.to !== current.from ? "Atuação contínua" : "Designado"}
            />
          </div>
        ) : (
          <EmptyState
            variant="partial"
            compact
            title="Relatoria não identificada"
            message="Não há eventos com relator integrado para esta matéria."
          />
        )}
        <p className="mt-4 text-[11px] italic text-gray-400">
          Bloco derivado de eventos de comissão — a Fase com modelo dedicado de relatoria virá em
          etapa posterior.
        </p>
      </Card>

      {/* Bloco 2 — Histórico de relatorias */}
      <Card className="border-gray-100 p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
          <History className="h-5 w-5 text-secondary" /> Histórico de relatorias
          <span className="ml-auto">
            <QualityBadge flag={reporterHistory.length > 0 ? "derived" : "no-data"} />
          </span>
        </h3>
        {reporterHistory.length === 0 ? (
          <EmptyState
            variant="no-occurrence"
            compact
            title="Sem histórico de relatorias"
            message="Não há registros de relatores anteriores para esta matéria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  <th className="py-2 pr-2">Relator</th>
                  <th className="py-2 pr-2">Órgão</th>
                  <th className="py-2 pr-2">Período</th>
                  <th className="py-2 pr-2 text-right">Eventos</th>
                </tr>
              </thead>
              <tbody>
                {[...reporterHistory].reverse().map((r, i) => (
                  <tr key={`${r.reporterName}-${i}`} className="border-b border-gray-50 last:border-b-0">
                    <td className="py-2 pr-2 font-medium text-gray-800">
                      {r.reporterId ? (
                        <Link
                          href={`/deputados/${r.reporterId}`}
                          className="hover:text-secondary hover:underline"
                        >
                          {r.reporterName}
                        </Link>
                      ) : (
                        r.reporterName
                      )}
                    </td>
                    <td className="py-2 pr-2 text-gray-600">{r.agency || "—"}</td>
                    <td className="py-2 pr-2 text-gray-600">
                      {new Date(r.from).toLocaleDateString("pt-BR")}
                      {r.to && r.to !== r.from && (
                        <> → {new Date(r.to).toLocaleDateString("pt-BR")}</>
                      )}
                    </td>
                    <td className="py-2 pr-2 text-right text-gray-600">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Bloco 3 — Pareceres */}
      <Card className="border-gray-100 p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
          <FileText className="h-5 w-5 text-secondary" /> Pareceres
          <span className="ml-auto">
            <QualityBadge flag={opinions.length > 0 ? "partial" : "no-data"} />
          </span>
        </h3>
        {opinions.length === 0 ? (
          <EmptyState
            variant="no-occurrence"
            title="Sem pareceres integrados"
            message="Não há pareceres formais integrados para esta matéria nesta fase."
          />
        ) : (
          <div className="space-y-3">
            {opinions.map((e) => (
              <div
                key={e.id}
                className="rounded-xl border border-gray-100 bg-gray-50/40 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Building2 className="h-3.5 w-3.5" />
                    {e.event.local || "Comissão não identificada"}
                    {e.reporterName && (
                      <>
                        <span>·</span>
                        <UserCheck className="h-3.5 w-3.5" />
                        {e.reporterName}
                      </>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(e.event.startDate).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                {e.title && (
                  <p className="mt-2 text-sm font-semibold text-gray-800">{e.title}</p>
                )}
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                  {e.report}
                </p>
                {e.situation && (
                  <span className="mt-2 inline-flex rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                    {e.situation}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-[11px] italic text-gray-400">
          Pareceres apresentados como texto bruto registrado em eventos de comissão. A separação em
          parecer pendente / apresentado / aprovado depende de modelo dedicado, ainda não
          modelado.
        </p>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p
        className={`mt-0.5 text-sm ${
          value ? "font-medium text-gray-800" : "italic text-gray-400"
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}
