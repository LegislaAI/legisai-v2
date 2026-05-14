"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { EmptyState } from "@/components/v2/components/ui/EmptyState";
import { QualityBadge } from "@/components/v2/components/ui/QualityBadge";
import { Building2, Calendar, Gavel, UserCheck } from "lucide-react";

type Process = {
  id: string;
  agencyAcronym: string;
  sequency: number;
  processingDescription?: string | null;
  dispatch?: string | null;
  date: string;
  url?: string | null;
};

type EventItem = {
  id: string;
  reporterName?: string | null;
  event: { local?: string | null; startDate?: string | null };
};

const PLENARY_AGENCIES = new Set(["PLEN", "MESA", "CCP"]);

/**
 * Aba derivada — agrega PropositionProcess por órgão.
 * Painel 1 (Em Comissão) lista comissões e mini-blocos com último despacho/relator.
 * Painel 2 (Em Plenário) só aparece se houver processo PLEN/MESA OU apreciação Plenário.
 */
export function PropositionCommissionsTab({
  processes,
  events,
  appreciation,
}: {
  processes?: Process[];
  events?: EventItem[];
  appreciation?: string | null;
}) {
  const all = processes ?? [];
  const byAgency = new Map<string, Process[]>();
  for (const p of all) {
    const key = p.agencyAcronym?.toUpperCase() ?? "—";
    const arr = byAgency.get(key) ?? [];
    arr.push(p);
    byAgency.set(key, arr);
  }

  const commissions: Array<{ acronym: string; entries: Process[] }> = [];
  const plenary: Process[] = [];
  for (const [acronym, entries] of byAgency.entries()) {
    entries.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (PLENARY_AGENCIES.has(acronym)) plenary.push(...entries);
    else commissions.push({ acronym, entries });
  }
  commissions.sort((a, b) => {
    const da = new Date(a.entries[0].date).getTime();
    const db = new Date(b.entries[0].date).getTime();
    return db - da;
  });

  const reporterByAgency = new Map<string, string>();
  for (const e of events ?? []) {
    const ag = e.event.local?.toUpperCase();
    if (ag && e.reporterName && !reporterByAgency.has(ag)) {
      reporterByAgency.set(ag, e.reporterName);
    }
  }

  const showPlenary = plenary.length > 0 || /plen/i.test(appreciation ?? "");

  return (
    <div className="space-y-6">
      {/* Painel 1 — Em Comissão */}
      <Card className="border-gray-100 p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
          <Building2 className="h-5 w-5 text-secondary" /> Em Comissão
          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {commissions.length}
          </span>
          <span className="ml-auto">
            <QualityBadge flag={commissions.length > 0 ? "derived" : "no-data"} />
          </span>
        </h3>
        {commissions.length === 0 ? (
          <EmptyState
            variant="no-occurrence"
            compact
            title="Sem comissões integradas"
            message="Não há registros de tramitação por comissão para esta matéria."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {commissions.map((c) => {
              const latest = c.entries[0];
              const reporter = reporterByAgency.get(c.acronym);
              return (
                <div
                  key={c.acronym}
                  className="rounded-xl border border-gray-100 bg-gray-50/40 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-gray-900">{c.acronym}</p>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600">
                      {c.entries.length} mov.
                    </span>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-gray-500">
                    <Calendar className="h-3 w-3" />
                    Última: {new Date(latest.date).toLocaleDateString("pt-BR")}
                  </p>
                  {latest.processingDescription && (
                    <p className="mt-1 text-xs text-gray-700">{latest.processingDescription}</p>
                  )}
                  {latest.dispatch && (
                    <p
                      className="mt-1 line-clamp-2 text-xs italic text-gray-500"
                      title={latest.dispatch}
                    >
                      “{latest.dispatch}”
                    </p>
                  )}
                  {reporter && (
                    <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-secondary">
                      <UserCheck className="h-3 w-3" />
                      Relator nesta comissão: {reporter}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Painel 2 — Em Plenário (só quando há sinal) */}
      <Card className="border-gray-100 p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
          <Gavel className="h-5 w-5 text-secondary" /> Em Plenário
          <span className="ml-auto">
            <QualityBadge flag={showPlenary ? "derived" : "no-data"} />
          </span>
        </h3>
        {!showPlenary ? (
          <EmptyState
            variant="partial"
            compact
            title="Sem avanço plenário"
            message="Esta matéria ainda não tem sinais de avanço para o Plenário."
          />
        ) : (
          <div className="space-y-3">
            {plenary.length === 0 && (
              <p className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3 text-xs text-indigo-700">
                Sujeita à apreciação do Plenário ({appreciation}). Movimentos plenários ainda não
                integrados.
              </p>
            )}
            {plenary.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-gray-100 bg-white p-3 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-gray-800">{p.agencyAcronym}</span>
                  <span className="text-gray-400">
                    {new Date(p.date).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                {p.processingDescription && (
                  <p className="mt-1 text-gray-700">{p.processingDescription}</p>
                )}
                {p.dispatch && (
                  <p className="mt-1 italic text-gray-500" title={p.dispatch}>
                    “{p.dispatch}”
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
