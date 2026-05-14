"use client";

import { Card } from "@/components/v2/components/ui/Card";
import SingleDonutChart from "@/components/SingleItemDonnutChart";
import { cn } from "@/lib/utils";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useMemo } from "react";
import { SkeletonLoader } from "./SkeletonLoader";
import type { DeputadoPageData } from "./useDeputadoPage";

function KpiCard({
  label,
  value,
  Icon,
  color,
}: {
  label: string;
  value: number;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          color,
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </Card>
  );
}

interface CommitteeRowData {
  departmentId: string;
  sigla: string;
  nome: string;
  percentage: number | null;
  present: number;
  absent: number;
  total: number;
}

function CommitteeRow({ committee }: { committee: CommitteeRowData }) {
  const pct = committee.percentage ?? 0;
  const pctColor =
    pct >= 90
      ? "bg-emerald-500"
      : pct >= 75
        ? "bg-lime-500"
        : pct >= 60
          ? "bg-amber-500"
          : "bg-red-500";

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div className="grid w-full grid-cols-12 items-center gap-4 px-4 py-3 text-left">
        <div className="col-span-4">
          <p className="text-sm font-semibold text-gray-900">
            {committee.sigla}
          </p>
          <p className="line-clamp-1 text-xs text-gray-500">{committee.nome}</p>
        </div>
        <div className="col-span-4 flex items-center gap-2">
          <div className="h-2 w-32 rounded-full bg-gray-100">
            <div
              className={cn("h-full rounded-full", pctColor)}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <span className="text-sm font-medium tabular-nums text-gray-700">
            {committee.percentage !== null
              ? `${committee.percentage.toFixed(1)}%`
              : "—"}
          </span>
        </div>
        <div className="col-span-1 text-center">
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
            {committee.present}
          </span>
        </div>
        <div className="col-span-1 text-center">
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
            {committee.absent}
          </span>
        </div>
        <div className="col-span-2 text-right text-xs text-gray-500">
          {committee.total} reuniões
        </div>
      </div>
    </div>
  );
}

export function TabPresencas({ data }: { data: DeputadoPageData }) {
  const { presencaDetalhada, loadingPresencaDetalhada, selectedYear } = data;

  const ordered = useMemo(
    () =>
      [...(presencaDetalhada?.perCommittee ?? [])].sort(
        (a, b) => (b.percentage ?? 0) - (a.percentage ?? 0),
      ),
    [presencaDetalhada],
  );

  if (loadingPresencaDetalhada && !presencaDetalhada) {
    return (
      <div className="space-y-4">
        <SkeletonLoader className="h-48 w-full rounded-xl" />
        <SkeletonLoader className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const overall = presencaDetalhada?.overall;
  const totalPresent = overall?.totalPresent ?? 0;
  const totalAbsent = overall?.totalAbsent ?? 0;
  const denominator = totalPresent + totalAbsent;
  const hasData = denominator > 0 || ordered.length > 0;

  if (!hasData) {
    return (
      <Card className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle2 className="mb-3 h-10 w-10 text-gray-200" />
        <p className="text-sm font-medium text-gray-500">
          Sem dados de presença para {selectedYear}.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="flex flex-col items-center justify-center lg:col-span-4">
          <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
            Presença geral em {selectedYear}
          </p>
          <SingleDonutChart current={totalPresent} total={denominator} />
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-semibold text-[#749c5b]">{totalPresent}</span>{" "}
            de {denominator} reuniões
          </p>
        </Card>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-8">
          <KpiCard
            label="Presentes"
            value={totalPresent}
            Icon={CheckCircle2}
            color="bg-emerald-50 text-emerald-600"
          />
          <KpiCard
            label="Ausentes"
            value={totalAbsent}
            Icon={XCircle}
            color="bg-red-50 text-red-600"
          />

          <Card className="sm:col-span-2 bg-amber-50/50 border-amber-200/60">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-900">
                  Como calculamos
                </p>
                <p className="mt-1 text-xs leading-relaxed text-amber-800">
                  Presença é apurada a partir das reuniões de comissões e
                  sessões plenárias do período selecionado. Os números aqui
                  batem com a Visão Geral e a aba Atuação Parlamentar (mesma
                  fonte). Período: {selectedYear}.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {ordered.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-base font-semibold text-gray-900">
              Detalhe por comissão
            </h3>
            <p className="text-xs text-gray-500">
              Presença em cada comissão em que o deputado é (ou foi) membro
            </p>
          </div>

          <div className="grid grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            <div className="col-span-4">Comissão</div>
            <div className="col-span-4">% presença</div>
            <div className="col-span-1 text-center">P</div>
            <div className="col-span-1 text-center">A</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <div>
            {ordered.map((c) => (
              <CommitteeRow key={c.departmentId} committee={c} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
