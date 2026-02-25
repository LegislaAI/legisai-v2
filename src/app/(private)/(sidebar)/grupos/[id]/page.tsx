"use client";

import { BackButton } from "@/components/v2/components/ui/BackButton";
import { Card } from "@/components/v2/components/ui/Card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/v2/components/ui/tooltip";
import { fetchCamara } from "@/lib/camara-api";
import { cn } from "@/lib/utils";
import {
  getPaisTemaFromNome,
  getPresidenteNome,
  getPresidenteUri,
  getSituacaoLabel,
} from "@/types/grupos";
import type { Grupo, GrupoMembro } from "@/types/grupos";
import { Globe, User, Users, Info, MapPin, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const CARD_CLASS =
  "relative overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-[#749c5b]/20 hover:shadow-[0_8px_32px_-8px_rgba(116,156,91,0.2)]";
const GLASS_HEADER =
  "bg-gradient-to-r from-[#749c5b]/[0.04] via-white to-white/95 backdrop-blur-sm";

export default function GrupoDetalhePage() {
  const params = useParams();
  const id = params?.id as string;
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [membros, setMembros] = useState<GrupoMembro[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembros, setLoadingMembros] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadGrupo() {
      setLoading(true);
      setFetchError(null);
      const { ok, dados } = await fetchCamara<Grupo>(`grupos/${id}`);
      if (ok && dados && !Array.isArray(dados)) {
        setGrupo(dados as Grupo);
      } else {
        setGrupo(null);
        setFetchError("Erro ao carregar grupo.");
      }
      setLoading(false);
    }
    loadGrupo();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    async function loadMembros() {
      setLoadingMembros(true);
      const { ok, dados } = await fetchCamara<GrupoMembro[]>(`grupos/${id}/membros`);
      if (ok) {
        setMembros(Array.isArray(dados) ? dados : []);
      } else {
        setMembros([]);
      }
      setLoadingMembros(false);
    }
    loadMembros();
  }, [id]);

  if (!id) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
        <BackButton />
        <Card className="border-gray-100 p-8 text-center text-gray-500">ID não informado.</Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
        <BackButton />
        <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (!grupo) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
        <BackButton />
        <Card className="border-gray-100 p-8 text-center text-gray-500">
          <p className="font-medium text-gray-700">Grupo não encontrado</p>
          {fetchError && <p className="mt-2 text-sm">{fetchError}</p>}
        </Card>
      </div>
    );
  }

  const presidenteNome = getPresidenteNome(grupo);
  const presidenteUri = getPresidenteUri(grupo);
  const paisTema = getPaisTemaFromNome(grupo.nome || "");
  const situacao = getSituacaoLabel(grupo.ativo);
  const temPartidoOuFuncao = membros.some((m) => m.siglaPartido || m.titulo || m.funcao);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
      <BackButton />

      <TooltipProvider delayDuration={250}>
        {/* Hero do grupo */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#749c5b]/10 via-[#4E9F3D]/5 to-transparent px-6 py-8">
          <div className="flex flex-wrap items-start gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-sm"
              style={{ background: "linear-gradient(135deg, #749c5b22, #749c5b0a)" }}
            >
              <Globe className="h-7 w-7 text-[#749c5b]" />
            </div>
            <div className="min-w-0 flex-1">
              {grupo.anoCriacao && (
                <span className="text-sm text-gray-500">{String(grupo.anoCriacao)}</span>
              )}
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">
                {grupo.nome}
              </h1>
              {grupo.observacoes && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{grupo.observacoes}</p>
              )}
            </div>
          </div>
        </div>

        {/* Aba: Dados básicos (Ficha) — ETL: id, Nome, País, Situação */}
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <FileText className="h-5 w-5 text-[#749c5b]" />
            Dados básicos
          </h2>
          <Card className="overflow-hidden border-gray-100">
            <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border-b border-gray-100 p-4 sm:border-b-0 sm:border-r">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">ID</p>
                <p className="mt-1 font-mono text-sm font-semibold text-gray-900">{grupo.id}</p>
              </div>
              <div className="border-b border-gray-100 p-4 sm:border-b-0 sm:border-r">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Nome</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{grupo.nome || "—"}</p>
              </div>
              <div className="border-b border-gray-100 p-4 sm:border-b-0 sm:border-r">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">País / tema</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                  {paisTema !== "—" ? (
                    <>
                      <MapPin className="h-4 w-4 text-[#749c5b]" />
                      {paisTema}
                    </>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
              <div className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Situação</p>
                <p className="mt-1">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                      situacao === "Ativo" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {situacao}
                  </span>
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Resolução / Projeto (quando a API retorna) */}
        {(grupo.resolucaoTitulo || grupo.projetoTitulo) && (
          <Card className="border-gray-100 p-4">
            <div className="flex flex-wrap gap-4 text-sm">
              {grupo.resolucaoTitulo && (
                <div>
                  <span className="text-gray-500">Resolução:</span>{" "}
                  <span className="font-medium text-gray-900">{grupo.resolucaoTitulo}</span>
                  {grupo.resolucaoUri && (
                    <a
                      href={grupo.resolucaoUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1.5 inline-flex text-[#749c5b] hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              )}
              {grupo.projetoTitulo && (
                <div>
                  <span className="text-gray-500">Projeto:</span>{" "}
                  <span className="font-medium text-gray-900">{grupo.projetoTitulo}</span>
                </div>
              )}
            </div>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Presidente (quando houver) */}
          {(presidenteNome || presidenteUri) && (
            <div className={CARD_CLASS}>
              <div className={cn(GLASS_HEADER, "px-6 py-4")}>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[#749c5b]" />
                  <h2 className="text-lg font-bold text-gray-900">Presidente</h2>
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50/80 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#749c5b]/10">
                    <User className="h-6 w-6 text-[#749c5b]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {presidenteUri ? (
                      (() => {
                        const match = presidenteUri.match(/\/deputados\/(\d+)/);
                        const depId = match?.[1];
                        return depId ? (
                          <Link
                            href={`/deputados2/${depId}`}
                            className="font-bold text-gray-900 hover:text-[#749c5b]"
                          >
                            {presidenteNome || "—"}
                          </Link>
                        ) : (
                          <p className="font-bold text-gray-900">{presidenteNome || "—"}</p>
                        );
                      })()
                    ) : (
                      <p className="font-bold text-gray-900">{presidenteNome || "—"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Parlamentares — ETL: Deputado, Partido, UF, Função */}
          <div className={cn(CARD_CLASS, "lg:col-span-2")}>
            <div className={cn(GLASS_HEADER, "px-6 py-4")}>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#749c5b]" />
                <h2 className="text-lg font-bold text-gray-900">Parlamentares</h2>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-gray-400 hover:text-gray-600">
                      <Info className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[220px] border-gray-200 bg-white text-xs shadow-lg">
                    Deputados que integram o grupo. Fonte: GET /grupos/{id}/membros.
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="max-h-[420px] overflow-auto px-6 pb-6">
              {loadingMembros ? (
                <div className="space-y-2 py-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
                  ))}
                </div>
              ) : membros.length > 0 ? (
                <div className="space-y-2 py-2">
                  {/* Cabeçalho da tabela em telas maiores */}
                  <div className="mb-2 hidden grid-cols-12 gap-2 border-b border-gray-100 pb-2 text-xs font-medium uppercase tracking-wider text-gray-500 md:grid">
                    <div className="col-span-5">Deputado</div>
                    {temPartidoOuFuncao && <div className="col-span-2">Partido</div>}
                    <div className="col-span-2">UF</div>
                    <div className="col-span-3">Função</div>
                  </div>
                  {membros.map((m) => {
                    const siglaPartido = m.siglaPartido;
                    const funcao = m.titulo ?? m.funcao;
                    return (
                      <Link
                        key={m.id}
                        href={`/deputados2/${m.id}`}
                        className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:border-[#749c5b]/25 hover:bg-[#749c5b]/5 md:grid md:grid-cols-12 md:gap-2"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3 md:col-span-5">
                          {m.urlFoto ? (
                            <img
                              src={m.urlFoto}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#749c5b]/10">
                              <User className="h-5 w-5 text-[#749c5b]" />
                            </div>
                          )}
                          <p className="truncate font-medium text-gray-900">{m.nome}</p>
                        </div>
                        {temPartidoOuFuncao && (
                          <div className="w-full text-xs text-gray-600 md:col-span-2 md:w-auto">
                            {siglaPartido || "—"}
                          </div>
                        )}
                        <div className="w-full text-xs text-gray-600 md:col-span-2 md:w-auto">
                          {m.siglaUf || "—"}
                        </div>
                        <div className="w-full text-xs text-gray-500 md:col-span-3 md:w-auto">
                          {funcao || "—"}
                        </div>
                        <span className="ml-auto text-sm font-medium text-[#749c5b] md:col-span-12 md:ml-0">
                          Ver perfil →
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-gray-500">
                  Nenhum parlamentar listado ou a API não retornou membros para este grupo.
                </p>
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
