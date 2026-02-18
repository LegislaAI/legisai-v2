"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { Calendar, FileText, Mic2, Vote } from "lucide-react";
import dynamic from "next/dynamic";
import type { DeputadoPageData } from "./useDeputadoPage";
import { SkeletonLoader } from "./SkeletonLoader";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function TabOverview({ data }: { data: DeputadoPageData }) {
  const {
    politician,
    contadores,
    loadingContadores,
    agendaResumo,
    profissoes,
    ocupacoes,
    loadingBio,
    socialLinks,
  } = data;

  if (!politician) return null;

  return (
    <Card className="hover:border-secondary/20 border-gray-100 p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <h3 className="text-dark mb-1 text-lg font-bold">Resumo da atuação</h3>
      <p className="mb-5 text-sm text-gray-500">
        Dados consolidados para uma visão rápida do deputado.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {loadingContadores ? (
          <>
            <SkeletonLoader className="h-24 w-full rounded-xl" />
            <SkeletonLoader className="h-24 w-full rounded-xl" />
            <SkeletonLoader className="h-24 w-full rounded-xl" />
            <SkeletonLoader className="h-24 w-full rounded-xl" />
          </>
        ) : contadores ? (
          <>
            <div className="group hover:border-secondary/30 hover:bg-secondary/5 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all duration-200 hover:shadow-sm">
              <div className="mb-1 flex items-center gap-2">
                <Calendar className="text-secondary h-4 w-4 opacity-80 transition group-hover:scale-110" />
                <span className="text-xs font-medium text-gray-500">Eventos</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {contadores.eventos}
              </p>
            </div>
            <div className="group hover:border-secondary/30 hover:bg-secondary/5 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all duration-200 hover:shadow-sm">
              <div className="mb-1 flex items-center gap-2">
                <FileText className="text-secondary h-4 w-4 opacity-80 transition group-hover:scale-110" />
                <span className="text-xs font-medium text-gray-500">
                  Proposições
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {contadores.proposicoes}
              </p>
            </div>
            <div className="group hover:border-secondary/30 hover:bg-secondary/5 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all duration-200 hover:shadow-sm">
              <div className="mb-1 flex items-center gap-2">
                <Mic2 className="text-secondary h-4 w-4 opacity-80 transition group-hover:scale-110" />
                <span className="text-xs font-medium text-gray-500">
                  Discursos
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {contadores.discursos}
              </p>
            </div>
            <div className="group hover:border-secondary/30 hover:bg-secondary/5 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all duration-200 hover:shadow-sm">
              <div className="mb-1 flex items-center gap-2">
                <Vote className="text-secondary h-4 w-4 opacity-80 transition group-hover:scale-110" />
                <span className="text-xs font-medium text-gray-500">
                  Votações
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {contadores.votacoes}
              </p>
            </div>
          </>
        ) : null}
      </div>
      {contadores &&
        contadores.eventos +
          contadores.proposicoes +
          contadores.discursos +
          contadores.votacoes >
          0 && (
          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-[200px]">
              <ReactApexChart
                options={{
                  chart: { type: "donut", fontFamily: "inherit" },
                  colors: ["#749c5b", "#5a8c4a", "#4E9F3D", "#1B3B2B"],
                  labels: [
                    "Eventos",
                    "Proposições",
                    "Discursos",
                    "Votações",
                  ],
                  legend: { position: "bottom", fontSize: "12px" },
                  dataLabels: {
                    enabled: true,
                    formatter: (val: number) => `${Math.round(val)}%`,
                  },
                  plotOptions: { pie: { donut: { size: "65%" } } },
                }}
                series={[
                  contadores.eventos,
                  contadores.proposicoes,
                  contadores.discursos,
                  contadores.votacoes,
                ]}
                type="donut"
                height={220}
                width="100%"
              />
            </div>
          </div>
        )}
      {agendaResumo && (
        <div className="mt-5 flex flex-wrap gap-4">
          <div className="group hover:border-secondary/30 hover:bg-secondary/5 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 transition-all duration-200">
            <span className="text-xs font-medium text-gray-500">
              Agenda hoje
            </span>
            <p className="text-xl font-bold text-gray-800">
              {agendaResumo.countHoje}
            </p>
          </div>
          <div className="group hover:border-secondary/30 hover:bg-secondary/5 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 transition-all duration-200">
            <span className="text-xs font-medium text-gray-500">
              Próximos 7 dias
            </span>
            <p className="text-xl font-bold text-gray-800">
              {agendaResumo.countProximos7Dias}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-gray-100 pt-6">
        <h4 className="text-dark mb-3 text-sm font-bold">Biografia</h4>
        {politician.fullName &&
          politician.fullName.trim() !== politician.name?.trim() && (
            <p className="mb-2 text-sm text-gray-600">
              <strong>Nome civil:</strong> {politician.fullName}
            </p>
            )}
        {loadingBio ? (
          <div className="space-y-2">
            <SkeletonLoader className="h-8 w-full" />
            <SkeletonLoader className="h-8 w-3/4" />
          </div>
        ) : (
          <>
            {profissoes.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 text-xs font-medium text-gray-500">
                  Profissões declaradas
                </p>
                <ul className="flex flex-wrap gap-2">
                  {profissoes.map((p, i) => (
                    <li
                      key={i}
                      className="bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
                    >
                      {p.titulo}
                      {p.data ? ` (${p.data})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {ocupacoes.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 text-xs font-medium text-gray-500">
                  Ocupações declaradas
                </p>
                <ul className="space-y-1 text-sm text-gray-700">
                  {ocupacoes.map((o, i) => (
                    <li
                      key={i}
                      className="rounded px-1 py-0.5 transition-colors hover:bg-gray-100"
                    >
                      {o.titulo}
                      {(o.entidade || o.periodo) &&
                        ` — ${[o.entidade, o.periodo].filter(Boolean).join(" • ")}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {profissoes.length === 0 &&
              ocupacoes.length === 0 &&
              !loadingBio && (
                <p className="text-sm text-gray-500">
                  Nenhuma informação de biografia disponível.
                </p>
              )}
          </>
        )}
        {socialLinks.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.url!}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:border-secondary/40 hover:bg-secondary/5 hover:text-secondary rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all"
              >
                {s.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
