"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { Progress } from "@/components/v2/components/ui/progress";
import {
  Briefcase,
  Calendar,
  ExternalLink,
  FileText,
  Mic2,
  User,
  Vote,
} from "lucide-react";
import Link from "next/link";
import type { DeputadoPageData } from "./useDeputadoPage";
import { SkeletonLoader } from "./SkeletonLoader";

export function TabAtuacao({ data }: { data: DeputadoPageData }) {
  const {
    politician,
    presenca,
    loadingPresenca,
    discursosResumo,
    loadingDiscursos,
    profile,
  } = data;

  if (!politician) return null;

  return (
    <div className="space-y-6">
      <Card className="hover:border-secondary/10 border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="border-b border-gray-100/50 p-6 pb-2">
          <h3 className="text-dark flex items-center gap-2 text-lg font-bold">
            <Calendar className="text-secondary h-5 w-5" />
            Presença
          </h3>
          <p className="text-sm text-gray-500">
            Presenças e ausências em plenário (período)
          </p>
        </div>
        <div className="space-y-4 p-6">
          {loadingPresenca ? (
            <div className="flex gap-4">
              <SkeletonLoader className="h-14 w-28" />
              <SkeletonLoader className="h-14 w-28" />
            </div>
          ) : presenca ? (
            <>
              <div className="flex flex-wrap gap-4">
                <div className="hover:bg-secondary/5 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 transition-colors">
                  <p className="text-xs tracking-wider text-gray-500 uppercase">
                    Presenças
                  </p>
                  <p className="text-dark text-xl font-bold">
                    {presenca.presencas}
                  </p>
                </div>
                <div className="hover:bg-secondary/5 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 transition-colors">
                  <p className="text-xs tracking-wider text-gray-500 uppercase">
                    Ausências (plenário)
                  </p>
                  <p className="text-dark text-xl font-bold">
                    {presenca.ausencias}
                  </p>
                </div>
              </div>
              {presenca.presencas + presenca.ausencias > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-gray-500">
                    Taxa de presença
                  </p>
                  <Progress
                    value={
                      (presenca.presencas /
                        (presenca.presencas + presenca.ausencias)) *
                      100
                    }
                    className="h-3 bg-gray-200"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {(
                      (presenca.presencas /
                        (presenca.presencas + presenca.ausencias)) *
                      100
                    ).toFixed(0)}
                    % das sessões
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Período:{" "}
                {new Date(presenca.dataInicio).toLocaleDateString("pt-BR")} a{" "}
                {new Date(presenca.dataFim).toLocaleDateString("pt-BR")}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">
              Sem dados de presença para o período.
            </p>
          )}
        </div>
      </Card>

      <Card className="hover:border-secondary/10 border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="border-b border-gray-100/50 p-6 pb-2">
          <h3 className="text-dark flex items-center gap-2 text-lg font-bold">
            <Mic2 className="text-secondary h-5 w-5" />
            Discursos
          </h3>
          <p className="text-sm text-gray-500">
            Discursos no período (fonte: API Câmara)
          </p>
        </div>
        <div className="p-6">
          {loadingDiscursos ? (
            <div className="flex gap-4">
              <SkeletonLoader className="h-14 w-28" />
            </div>
          ) : discursosResumo ? (
            <div className="flex flex-wrap gap-4">
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                <p className="text-xs tracking-wider text-gray-500 uppercase">
                  Total no período
                </p>
                <p className="text-dark text-xl font-bold">
                  {discursosResumo.total}
                </p>
              </div>
              {discursosResumo.ultimaData && (
                <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                  <p className="text-xs tracking-wider text-gray-500 uppercase">
                    Último
                  </p>
                  <p className="text-dark text-sm font-bold">
                    {new Date(
                      discursosResumo.ultimaData,
                    ).toLocaleDateString("pt-BR", { dateStyle: "short" })}
                  </p>
                </div>
              )}
              <a
                href={discursosResumo.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-secondary/80 self-center text-sm font-medium"
              >
                Ver na Câmara →
              </a>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Sem dados de discursos para o período.
            </p>
          )}
        </div>
      </Card>

      {profile ? (
        <Card className="hover:border-secondary/10 border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="border-b border-gray-100/50 p-6 pb-2">
            <h3 className="text-dark flex items-center gap-2 text-lg font-bold">
              <User className="text-secondary h-5 w-5" />
              Atuação Parlamentar
              <span className="bg-secondary/10 text-secondary rounded-full px-2 py-0.5 text-xs font-semibold">
                {profile.year}
              </span>
            </h3>
            <p className="text-sm text-gray-500">
              Presenças, proposições, discursos e votações
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
              <p className="mb-1 flex items-center gap-2 text-xs tracking-wider text-gray-400 uppercase">
                <Vote className="h-3.5 w-3.5" /> Plenário
              </p>
              <p className="text-dark text-sm font-medium">
                {profile.plenaryPresence ?? "—"}
              </p>
              {(profile.plenaryJustifiedAbsences ||
                profile.plenaryUnjustifiedAbsences) && (
                <p className="mt-1 text-xs text-gray-500">
                  Faltas justificadas:{" "}
                  {profile.plenaryJustifiedAbsences ?? "—"} • Injustificadas:{" "}
                  {profile.plenaryUnjustifiedAbsences ?? "—"}
                </p>
              )}
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
              <p className="mb-1 flex items-center gap-2 text-xs tracking-wider text-gray-400 uppercase">
                <Briefcase className="h-3.5 w-3.5" /> Comissões
              </p>
              <p className="text-dark text-sm font-medium">
                {profile.committeesPresence ?? "—"}
              </p>
              {(profile.committeesJustifiedAbsences ||
                profile.committeesUnjustifiedAbsences) && (
                <p className="mt-1 text-xs text-gray-500">
                  Faltas justificadas:{" "}
                  {profile.committeesJustifiedAbsences ?? "—"} • Injustificadas:{" "}
                  {profile.committeesUnjustifiedAbsences ?? "—"}
                </p>
              )}
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
              <p className="mb-1 flex items-center gap-2 text-xs tracking-wider text-gray-400 uppercase">
                <FileText className="h-3.5 w-3.5" /> Proposições
              </p>
              <p className="text-dark text-sm font-medium">
                Criadas: {profile.createdProposals ?? "—"} • Relacionadas:{" "}
                {profile.relatedProposals ?? "—"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href={`/procedures?authorId=${politician.id}`}
                  className="text-secondary hover:text-secondary/80 inline-flex items-center gap-1 text-xs font-medium"
                >
                  Buscar proposições na LegisAI
                </Link>
                {profile.createdProposalsUrl && (
                  <a
                    href={profile.createdProposalsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:text-secondary/80 inline-flex items-center gap-1 text-xs font-medium"
                  >
                    Criadas (Câmara) <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {profile.relatedProposalsUrl && (
                  <a
                    href={profile.relatedProposalsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:text-secondary/80 inline-flex items-center gap-1 text-xs font-medium"
                  >
                    Relacionadas (Câmara) <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
              <p className="mb-1 flex items-center gap-2 text-xs tracking-wider text-gray-400 uppercase">
                <Mic2 className="h-3.5 w-3.5" /> Discursos
              </p>
              <p className="text-dark text-sm font-medium">
                {profile.speeches ?? "—"}
              </p>
              {(profile.speechesAudiosUrl || profile.speechesVideosUrl) && (
                <div className="mt-2 flex gap-2">
                  {profile.speechesAudiosUrl && (
                    <a
                      href={profile.speechesAudiosUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary hover:text-secondary/80 inline-flex items-center gap-1 text-xs font-medium"
                    >
                      Áudios <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {profile.speechesVideosUrl && (
                    <a
                      href={profile.speechesVideosUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary hover:text-secondary/80 inline-flex items-center gap-1 text-xs font-medium"
                    >
                      Vídeos <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 sm:col-span-2">
              <p className="mb-1 flex items-center gap-2 text-xs tracking-wider text-gray-400 uppercase">
                <Vote className="h-3.5 w-3.5" /> Votações nominais
              </p>
              <p className="text-dark text-sm font-medium">
                {profile.rollCallVotes ?? "—"}
              </p>
              {profile.rollCallVotesUrl && (
                <a
                  href={profile.rollCallVotesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-secondary/80 mt-2 inline-flex items-center gap-1 text-xs font-medium"
                >
                  Ver votações <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-gray-100 p-8 text-center text-gray-500 shadow-sm">
          Sem dados de atuação parlamentar para o ano selecionado.
        </Card>
      )}
    </div>
  );
}
