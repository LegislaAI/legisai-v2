"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { CustomPagination } from "@/components/ui/CustomPagination";
import {
  ArrowUpRight,
  FileText,
  Tag,
  Vote,
  Scale,
  ExternalLink,
  Calendar,
  Hash,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import type { DeputadoPageData } from "./useDeputadoPage";
import type { ProposicaoDeputado } from "./types";
import { SkeletonLoader } from "./SkeletonLoader";
import { cn } from "@/lib/utils";

function AlinhamentoBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const { color, label } =
    pct >= 70
      ? { color: "bg-emerald-500", label: "Alto" }
      : pct >= 40
        ? { color: "bg-amber-500", label: "Médio" }
        : { color: "bg-rose-500", label: "Baixo" };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-500">Nível de alinhamento</span>
        <span className={cn(
          "font-semibold",
          pct >= 70 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-rose-600"
        )}>
          {label}
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ProposicaoCard({ prop }: { prop: ProposicaoDeputado }) {
  const dataStr = new Date(prop.dt_apresentacao).toLocaleDateString("pt-BR");
  const identificador = `${prop.sigla_tipo} ${prop.numero}/${prop.ano}`;

  return (
    <Link
      href={`/propositions/${prop.id}`}
      className={cn(
        "group flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-4 transition-all duration-200",
        "hover:border-[#749c5b]/30 hover:bg-[#749c5b]/5 hover:shadow-sm",
        "sm:flex-row sm:items-start sm:justify-between sm:gap-4"
      )}
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-800">
            <Hash className="h-3.5 w-3.5" />
            {identificador}
          </span>
          {prop.situacao_descricao && (
            <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-600">
              {prop.situacao_descricao}
            </span>
          )}
        </div>
        <p
          className="line-clamp-2 text-sm text-gray-700"
          title={prop.ementa || undefined}
        >
          {prop.ementa || "—"}
        </p>
        <p className="text-xs text-gray-500">Apresentação: {dataStr}</p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[#749c5b] group-hover:underline">
        Ver proposição
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  );
}

export function TabPosicionamento({ data }: { data: DeputadoPageData }) {
  const {
    proposicoesResumo,
    proposicoes,
    loadingProposicoes,
    proposicoesPage,
    setProposicoesPage,
    proposicoesPages,
    votacoesIndicadores,
    loadingVotacoes,
    temas,
    loadingTemas,
  } = data;

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-[#749c5b]/5 via-gray-50/80 to-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#749c5b]/10 shadow-sm">
            <Scale className="h-6 w-6 text-[#749c5b]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Posicionamento parlamentar
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Proposições de autoria ou coautoria, participação em votações
              nominais e temas em que o deputado mais atua. Use esta aba para
              entender como ele se posiciona por meio de projetos e votos.
            </p>
          </div>
        </div>
      </div>

      {/* Proposições */}
      <Card className="overflow-hidden border-gray-100 shadow-sm transition-shadow hover:shadow-md">
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#749c5b]/10">
                <FileText className="h-5 w-5 text-[#749c5b]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Proposições</h3>
                <p className="text-xs text-gray-500">
                  Autoria e coautoria de projetos de lei e outras proposições
                </p>
              </div>
            </div>
            {proposicoesResumo?.link && (
              <a
                href={proposicoesResumo.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#749c5b]/40 hover:bg-[#749c5b]/5 hover:text-[#749c5b]"
              >
                Ver detalhes
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
        <div className="p-6">
          {proposicoesResumo && (
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-br from-[#749c5b]/10 to-[#749c5b]/5 px-5 py-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#749c5b]/15">
                  <FileText className="h-5 w-5 text-[#749c5b]" />
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Total de proposições
                  </span>
                  <p className="mt-0.5 text-2xl font-bold text-gray-900">
                    {proposicoesResumo.total}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {proposicoesResumo.cnt_prop_por_tipo?.slice(0, 6).map((t) => (
                  <span
                    key={t.sigla_tipo}
                    className="rounded-full bg-[#749c5b]/10 px-3 py-1.5 text-xs font-semibold text-[#749c5b]"
                  >
                    {t.sigla_tipo}: {t.count}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">
              Lista (autor/coautor)
            </h4>
            {loadingProposicoes ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <SkeletonLoader key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : proposicoes.length > 0 ? (
              <>
                <div className="space-y-3">
                  {proposicoes.map((prop) => (
                    <ProposicaoCard key={prop.id} prop={prop} />
                  ))}
                </div>
                {proposicoesPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <CustomPagination
                      pages={proposicoesPages}
                      currentPage={proposicoesPage}
                      setCurrentPage={setProposicoesPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 py-14 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">
                  Nenhuma proposição encontrada.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Votações */}
      <Card className="overflow-hidden border-gray-100 shadow-sm transition-shadow hover:shadow-md">
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#749c5b]/10">
              <Vote className="h-5 w-5 text-[#749c5b]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Votações nominais</h3>
              <p className="text-xs text-gray-500">
                Participação e alinhamento nas votações no período
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {loadingVotacoes ? (
            <div className="flex flex-wrap gap-4">
              <SkeletonLoader className="h-28 w-40 rounded-xl" />
              <SkeletonLoader className="h-28 w-52 rounded-xl" />
            </div>
          ) : votacoesIndicadores ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 px-5 py-5 transition-colors hover:bg-gray-50">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#749c5b]/10">
                    <Vote className="h-6 w-6 text-[#749c5b]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Votações no período
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {votacoesIndicadores.baseVotosCount}
                    </p>
                  </div>
                </div>
                {votacoesIndicadores.alinhamentoPct != null && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-5 py-5 transition-colors hover:bg-gray-50">
                    <div className="mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Alinhamento
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {votacoesIndicadores.alinhamentoPct}%
                    </p>
                    <div className="mt-4">
                      <AlinhamentoBar value={votacoesIndicadores.alinhamentoPct} />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-gray-50/80 px-4 py-3 text-sm text-gray-600">
                <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                <span>
                  Período:{" "}
                  {new Date(
                    votacoesIndicadores.dataInicio
                  ).toLocaleDateString("pt-BR")}{" "}
                  a{" "}
                  {new Date(
                    votacoesIndicadores.dataFim
                  ).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 py-14 text-center">
              <Vote className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">
                Sem dados de votações para o período.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Temas */}
      <Card className="overflow-hidden border-gray-100 shadow-sm transition-shadow hover:shadow-md">
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#749c5b]/10">
              <Tag className="h-5 w-5 text-[#749c5b]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Temas</h3>
              <p className="text-xs text-gray-500">
                Temas presentes nas proposições de autoria ou coautoria
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {loadingTemas ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <SkeletonLoader key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : temas?.temas && temas.temas.length > 0 ? (
            <div className="space-y-4">
              <p className="text-xs font-medium text-gray-500">
                Ordenado por quantidade de proposições por tema
              </p>
              <ul className="space-y-3">
                {(() => {
                  const maxCount = Math.max(
                    ...temas.temas.map((x) => x.count),
                    1
                  );
                  return temas.temas.map((t, idx) => (
                    <li
                      key={t.cod_tema}
                      className={cn(
                        "group flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-all",
                        idx < 3
                          ? "border-[#749c5b]/20 bg-[#749c5b]/5 hover:bg-[#749c5b]/10"
                          : "border-gray-100 bg-gray-50/30 hover:border-[#749c5b]/20 hover:bg-[#749c5b]/5"
                      )}
                    >
                      <div className="min-w-0 flex-1 space-y-2">
                        <span className="text-sm font-medium text-gray-900">
                          {t.tema_nome}
                        </span>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-[#749c5b] transition-all duration-500"
                            style={{
                              width: `${(t.count / maxCount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#749c5b]/15 px-3.5 py-1 text-sm font-bold text-[#749c5b]">
                        {t.count}
                      </span>
                    </li>
                  ));
                })()}
              </ul>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 py-14 text-center">
              <Tag className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">
                Nenhum tema encontrado nas proposições.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
