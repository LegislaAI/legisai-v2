"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { cn } from "@/lib/utils";
import { Calendar, ExternalLink, FileText } from "lucide-react";
import { SkeletonLoader } from "./SkeletonLoader";
import type { DeputadoPageData } from "./useDeputadoPage";
import type { ProposicaoDeputado } from "./types";

function typeColor(t: string) {
  switch (t) {
    case "PEC":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "PLP":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "PL":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "PDL":
      return "bg-teal-100 text-teal-800 border-teal-200";
    case "MPV":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "RIC":
    case "INC":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function statusColor(s: string) {
  const lower = s.toLowerCase();
  if (
    lower.includes("aprovad") ||
    lower.includes("promulgad") ||
    lower.includes("sanção")
  )
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (lower.includes("plenário") || lower.includes("pauta"))
    return "bg-blue-50 text-blue-700 border-blue-200";
  if (lower.includes("comissão") || lower.includes("ccj"))
    return "bg-violet-50 text-violet-700 border-violet-200";
  if (lower.includes("apresentaç"))
    return "bg-gray-50 text-gray-700 border-gray-200";
  return "bg-gray-50 text-gray-600 border-gray-200";
}

function PropositionRow({ p }: { p: ProposicaoDeputado }) {
  return (
    <div className="grid grid-cols-12 items-center gap-4 border-b border-gray-100 px-4 py-3 text-sm transition-colors last:border-b-0 hover:bg-gray-50">
      <div className="col-span-1">
        <span
          className={cn(
            "inline-flex rounded-md border px-1.5 py-0.5 text-xs font-bold",
            typeColor(p.sigla_tipo),
          )}
        >
          {p.sigla_tipo}
        </span>
      </div>
      <div className="col-span-1 font-medium tabular-nums text-gray-900">
        {p.numero}/{String(p.ano).slice(-2)}
      </div>
      <div className="col-span-5">
        <p className="line-clamp-2 text-gray-700">{p.ementa}</p>
      </div>
      <div className="col-span-3">
        <span
          className={cn(
            "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
            statusColor(p.situacao_descricao),
          )}
        >
          {p.situacao_descricao}
        </span>
      </div>
      <div className="col-span-2 flex items-center justify-end gap-2 text-xs text-gray-500 tabular-nums">
        <Calendar className="h-3 w-3" />
        {new Date(p.dt_apresentacao).toLocaleDateString("pt-BR")}
        {p.uri_proposicao && (
          <a
            href={p.uri_proposicao}
            target="_blank"
            rel="noreferrer"
            className="text-[#749c5b] hover:underline"
            title="Ver na Câmara"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

export function TabProposicoes({ data }: { data: DeputadoPageData }) {
  const {
    proposicoes,
    proposicoesPage,
    setProposicoesPage,
    proposicoesPages,
    loadingProposicoes,
    proposicoesResumo,
    selectedYear,
  } = data;

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#749c5b]/10">
            <FileText className="h-5 w-5 text-[#749c5b]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Proposições do deputado
            </p>
            <p className="text-xs text-gray-500">
              {proposicoesResumo
                ? `${proposicoesResumo.total} proposições no período (${selectedYear})`
                : "Lista de proposições associadas"}
            </p>
          </div>
        </div>
        {proposicoesResumo?.link && (
          <a
            href={proposicoesResumo.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#749c5b] hover:underline"
          >
            Ver na Câmara
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-xs font-semibold tracking-wide text-gray-500 uppercase">
          <div className="col-span-1">Tipo</div>
          <div className="col-span-1">Nº</div>
          <div className="col-span-5">Ementa</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-2 text-right">Apresentada</div>
        </div>
        {loadingProposicoes && proposicoes.length === 0 ? (
          <div className="space-y-2 p-4">
            <SkeletonLoader className="h-12 w-full rounded-lg" />
            <SkeletonLoader className="h-12 w-full rounded-lg" />
            <SkeletonLoader className="h-12 w-full rounded-lg" />
          </div>
        ) : proposicoes.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-gray-500">
            Nenhuma proposição encontrada.
          </div>
        ) : (
          proposicoes.map((p) => <PropositionRow key={p.id} p={p} />)
        )}
      </Card>

      {proposicoesPages > 1 && (
        <div className="flex justify-center">
          <CustomPagination
            currentPage={proposicoesPage}
            pages={proposicoesPages}
            setCurrentPage={setProposicoesPage}
          />
        </div>
      )}
    </div>
  );
}
