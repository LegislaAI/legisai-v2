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
  Flag,
  Info,
  User,
  Users,
  ExternalLink,
  BarChart3,
  Landmark,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Lider {
  id?: number;
  nome?: string;
  siglaPartido?: string;
  uri?: string;
}

interface StatusItem {
  idLegislatura?: number;
  situacao?: string;
  totalMembros?: number;
  totalPosse?: number;
  uriMembros?: string;
  lider?: Lider;
}

interface PartidoDetail {
  id: number;
  sigla: string;
  nome: string;
  status?: StatusItem[];
  uri?: string;
}

interface Membro {
  id: number;
  nome: string;
  siglaUf?: string;
  urlFoto?: string;
  uri?: string;
}

export default function PartidoDetalhePage() {
  const params = useParams();
  const id = params?.id as string;
  const [partido, setPartido] = useState<PartidoDetail | null>(null);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembros, setLoadingMembros] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadPartido() {
      setLoading(true);
      setFetchError(null);
      const { ok, dados } = await fetchCamara<PartidoDetail>(`partidos/${id}`);
      if (ok && dados && !Array.isArray(dados)) {
        setPartido(dados as PartidoDetail);
      } else {
        setPartido(null);
        setFetchError("Erro ao carregar partido.");
      }
      setLoading(false);
    }
    loadPartido();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    async function loadMembros() {
      setLoadingMembros(true);
      const { ok, dados } = await fetchCamara<Membro[]>(`partidos/${id}/membros`);
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
        <div className="h-48 animate-pulse rounded-3xl bg-gray-100" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!partido) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
        <BackButton />
        <Card className="border-gray-100 p-8 text-center text-gray-500">
          <p className="font-medium text-gray-700">Partido não encontrado</p>
          {fetchError && <p className="mt-2 text-sm">{fetchError}</p>}
        </Card>
      </div>
    );
  }

  const statusAtual = partido.status?.[0];
  const lider = statusAtual?.lider;
  const totalMembros = statusAtual?.totalMembros ?? statusAtual?.totalPosse ?? membros.length;
  const situacao = statusAtual?.situacao;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
      <BackButton />

      <TooltipProvider delayDuration={250}>
        <div className="space-y-8">
          {/* Hero — cores da marca (gradiente como /deputados) */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#5a8a42] via-secondary to-[#8bb574] p-8 text-white shadow-xl md:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
            <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm">
                  <Flag className="h-10 w-10 text-white" />
                </div>
                <div>
                  <span className="inline-block rounded-xl border border-white/30 bg-white/15 px-4 py-2 text-lg font-bold uppercase backdrop-blur-sm">
                    {partido.sigla}
                  </span>
                  <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                    {partido.nome}
                  </h1>
                  {situacao && (
                    <p className="mt-2 text-sm font-medium text-white/80">
                      Situação: <span className="font-semibold text-white">{situacao}</span>
                    </p>
                  )}
                </div>
              </div>
              <Link
                href={`/deputados?party=${encodeURIComponent(partido.sigla)}`}
                className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-4 py-2.5 text-sm font-semibold shadow-sm backdrop-blur-sm transition hover:bg-white/25"
              >
                <Landmark className="h-4 w-4" />
                Ver deputados na base
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Cards: Status + Liderança */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Status na legislatura (ETL: Ficha) */}
            <Card className="overflow-hidden border-gray-100/80 shadow-sm">
              <div className="flex items-center gap-2 border-b border-gray-100 bg-secondary/5 px-6 py-4">
                <BarChart3 className="h-5 w-5 text-secondary" />
                <h2 className="text-lg font-bold text-[#1a1d1f]">Status na legislatura</h2>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-gray-400 hover:text-gray-600">
                      <Info className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[220px] border-gray-200 bg-white text-xs shadow-lg">
                    Dados da API Câmara (status atual).
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="px-6 py-5">
                <dl className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total de membros</dt>
                    <dd className="mt-1 text-2xl font-bold text-[#1a1d1f]">{totalMembros}</dd>
                  </div>
                  {situacao && (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">Situação</dt>
                      <dd className="mt-1 font-medium text-[#1a1d1f]">{situacao}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </Card>

            {/* Liderança */}
            <Card className="overflow-hidden border-gray-100/80 shadow-sm">
              <div className="flex items-center gap-2 border-b border-gray-100 bg-secondary/5 px-6 py-4">
                <User className="h-5 w-5 text-secondary" />
                <h2 className="text-lg font-bold text-[#1a1d1f]">Liderança</h2>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-gray-400 hover:text-gray-600">
                      <Info className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[220px] border-gray-200 bg-white text-xs shadow-lg">
                    Líder da bancada na legislatura atual (quando disponível na API).
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="px-6 pb-6 pt-4">
                {lider?.nome ? (
                  <Link
                    href={lider.id ? `/deputados2/${lider.id}` : "#"}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition hover:border-secondary/20 hover:shadow-md",
                      lider.id ? "cursor-pointer" : "cursor-default"
                    )}
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary/10">
                      <User className="h-7 w-7 text-secondary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#1a1d1f]">{lider.nome}</p>
                      {lider.siglaPartido && (
                        <p className="text-sm text-gray-500">{lider.siglaPartido}</p>
                      )}
                      {lider.id && (
                        <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline">
                          Ver perfil do deputado
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  </Link>
                ) : (
                  <p className="py-6 text-center text-sm text-gray-500">
                    Informação de liderança não disponível para este partido.
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Membros */}
          <Card className="overflow-hidden border-gray-100/80 shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 bg-secondary/5 px-6 py-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-secondary" />
                <h2 className="text-lg font-bold text-[#1a1d1f]">Membros</h2>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-gray-400 hover:text-gray-600">
                      <Info className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[220px] border-gray-200 bg-white text-xs shadow-lg">
                    Deputados filiados ao partido. Clique para abrir o perfil.
                  </TooltipContent>
                </Tooltip>
              </div>
              {membros.length > 0 && (
                <span className="rounded-full bg-secondary/10 px-3 py-1 text-sm font-semibold text-secondary">
                  {membros.length} deputado(s)
                </span>
              )}
            </div>
            <div className="max-h-[420px] overflow-y-auto px-6 pb-6">
              {loadingMembros ? (
                <div className="space-y-3 py-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
                  ))}
                </div>
              ) : membros.length > 0 ? (
                <ul className="space-y-2 py-4">
                  {membros.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/deputados2/${m.id}`}
                        className="flex items-center gap-4 rounded-2xl border border-gray-100 p-3 transition hover:border-secondary/20 hover:bg-secondary/5 hover:shadow-sm"
                      >
                        {m.urlFoto ? (
                          <img
                            src={m.urlFoto}
                            alt=""
                            className="h-12 w-12 rounded-xl object-cover shadow-sm"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
                            <User className="h-6 w-6 text-secondary" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#1a1d1f] truncate">{m.nome}</p>
                          {m.siglaUf && (
                            <p className="text-xs text-gray-500">{m.siglaUf}</p>
                          )}
                        </div>
                        <span className="flex items-center gap-1 text-sm font-medium text-secondary">
                          Ver perfil
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-10 text-center text-sm text-gray-500">
                  Nenhum membro listado ou API não retornou dados.
                </p>
              )}
            </div>
          </Card>
        </div>
      </TooltipProvider>
    </div>
  );
}
