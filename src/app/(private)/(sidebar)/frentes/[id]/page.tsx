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
import { getIconForFrente } from "@/lib/frentes-icons";
import type { FrenteDetail, MembroFrente } from "@/types/frentes";
import { cn } from "@/lib/utils";
import {
  Users,
  User,
  Info,
  Mail,
  Phone,
  Globe,
  FileText,
  ChevronRight,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const GLASS_HEADER =
  "bg-gradient-to-r from-[#749c5b]/[0.06] via-white to-white/95 backdrop-blur-sm";

function formatSituacaoLines(text: string): string[] {
  if (!text?.trim()) return [];
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function FrenteDetalhePage() {
  const params = useParams();
  const id = params?.id as string;
  const [frente, setFrente] = useState<FrenteDetail | null>(null);
  const [membros, setMembros] = useState<MembroFrente[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembros, setLoadingMembros] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadFrente() {
      setLoading(true);
      setFetchError(null);
      const { ok, dados } = await fetchCamara<FrenteDetail>(`frentes/${id}`);
      if (ok && dados && !Array.isArray(dados)) {
        setFrente(dados as FrenteDetail);
      } else {
        setFrente(null);
        setFetchError("Erro ao carregar frente.");
      }
      setLoading(false);
    }
    loadFrente();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    async function loadMembros() {
      setLoadingMembros(true);
      const { ok, dados } = await fetchCamara<MembroFrente[]>(`frentes/${id}/membros`);
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
          <div className="h-56 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-56 animate-pulse rounded-2xl bg-gray-100" />
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (!frente) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
        <BackButton />
        <Card className="border-gray-100 p-8 text-center text-gray-500">
          <p className="font-medium text-gray-700">Frente não encontrada</p>
          {fetchError && <p className="mt-2 text-sm">{fetchError}</p>}
        </Card>
      </div>
    );
  }

  const coordenador = frente.coordenador;
  const situacaoLines = frente.situacao ? formatSituacaoLines(frente.situacao) : [];
  const hasContato = frente.telefone || frente.email || frente.urlWebsite || frente.urlDocumento;
  const HeroIcon = getIconForFrente(frente.titulo || "");

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
      <BackButton />

      <TooltipProvider delayDuration={250}>
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-[#749c5b]/10 via-[#749c5b]/5 to-transparent px-6 py-10 shadow-sm">
          <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#749c5b]/20 bg-[#749c5b]/10">
                <HeroIcon className="h-8 w-8 text-[#749c5b]" />
              </div>
              <div>
                {frente.idLegislatura && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700">
                    <Calendar className="h-4 w-4 text-[#749c5b]" />
                    Legislatura {frente.idLegislatura}
                  </span>
                )}
                <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                  {frente.titulo}
                </h1>
                {situacaoLines.length > 0 && (
                  <p className="mt-2 max-w-xl text-sm font-medium text-gray-600">
                    Frente parlamentar ativa. Dados da API Dados Abertos.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Coordenador + Contato + Situação */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Coordenador */}
          <Card className="overflow-hidden border-gray-100/80 shadow-sm">
            <div className={cn(GLASS_HEADER, "flex items-center gap-2 border-b border-gray-100 px-6 py-4")}>
              <User className="h-5 w-5 text-[#749c5b]" />
              <h2 className="text-lg font-bold text-gray-900">Coordenador da frente</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help text-gray-400 hover:text-gray-600">
                    <Info className="h-4 w-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[220px] border-gray-200 bg-white text-xs shadow-lg">
                  Deputado coordenador indicado pela API Câmara.
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="px-6 pb-6 pt-4">
              {coordenador?.nome ? (
                <Link
                  href={`/deputados2/${coordenador.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 transition hover:border-[#749c5b]/20 hover:bg-[#749c5b]/5 hover:shadow-md"
                >
                  {coordenador.urlFoto ? (
                    <img
                      src={coordenador.urlFoto}
                      alt=""
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-white shadow"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#749c5b]/15">
                      <User className="h-7 w-7 text-[#749c5b]" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900">{coordenador.nome}</p>
                    <p className="text-sm text-gray-600">
                      {[coordenador.siglaPartido, coordenador.siglaUf].filter(Boolean).join(" · ")}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#749c5b] hover:underline">
                      Ver perfil do deputado
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ) : (
                <p className="py-6 text-center text-sm text-gray-500">
                  Coordenador não informado na API.
                </p>
              )}
            </div>
          </Card>

          {/* Contato */}
          <Card className="overflow-hidden border-gray-100/80 shadow-sm">
            <div className={cn(GLASS_HEADER, "flex items-center gap-2 border-b border-gray-100 px-6 py-4")}>
              <Mail className="h-5 w-5 text-[#749c5b]" />
              <h2 className="text-lg font-bold text-gray-900">Contato e documentos</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help text-gray-400 hover:text-gray-600">
                    <Info className="h-4 w-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[220px] border-gray-200 bg-white text-xs shadow-lg">
                  Dados de contato e links oficiais quando disponíveis.
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="px-6 py-5">
              {hasContato ? (
                <ul className="space-y-3">
                  {frente.telefone && (
                    <li className="flex items-center gap-3">
                      <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                      <a href={`tel:${frente.telefone}`} className="text-sm font-medium text-gray-800 hover:text-[#749c5b]">
                        {frente.telefone}
                      </a>
                    </li>
                  )}
                  {frente.email && (
                    <li className="flex items-center gap-3">
                      <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                      <a href={`mailto:${frente.email}`} className="text-sm font-medium text-gray-800 hover:text-[#749c5b] break-all">
                        {frente.email}
                      </a>
                    </li>
                  )}
                  {frente.urlWebsite && (
                    <li className="flex items-center gap-3">
                      <Globe className="h-4 w-4 shrink-0 text-gray-400" />
                      <a href={frente.urlWebsite} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#749c5b] hover:underline break-all">
                        Site da frente
                      </a>
                    </li>
                  )}
                  {frente.urlDocumento && (
                    <li className="flex items-center gap-3">
                      <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                      <a href={frente.urlDocumento} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#749c5b] hover:underline break-all">
                        Estatuto / Ata (PDF)
                      </a>
                    </li>
                  )}
                </ul>
              ) : (
                <p className="py-4 text-center text-sm text-gray-500">
                  Contato e documentos não informados na API.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Situação / Histórico */}
        {situacaoLines.length > 0 && (
          <Card className="overflow-hidden border-gray-100/80 shadow-sm">
            <div className={cn(GLASS_HEADER, "flex items-center gap-2 border-b border-gray-100 px-6 py-4")}>
              <FileText className="h-5 w-5 text-[#749c5b]" />
              <h2 className="text-lg font-bold text-gray-900">Situação e histórico</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help text-gray-400 hover:text-gray-600">
                    <Info className="h-4 w-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[260px] border-gray-200 bg-white text-xs shadow-lg">
                  Andamentos e registro da frente (publicação, assinaturas, etc.).
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="px-6 py-5">
              <ul className="space-y-2">
                {situacaoLines.map((line, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#749c5b]/60" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        )}

        {/* Membros */}
        <Card className="overflow-hidden border-gray-100/80 shadow-sm">
          <div className={cn(GLASS_HEADER, "flex items-center gap-2 border-b border-gray-100 px-6 py-4")}>
            <Users className="h-5 w-5 text-[#749c5b]" />
            <h2 className="text-lg font-bold text-gray-900">Membros</h2>
            {membros.length > 0 && (
              <span className="rounded-full bg-[#749c5b]/15 px-2.5 py-0.5 text-sm font-medium text-[#749c5b]">
                {membros.length} deputado{membros.length !== 1 ? "s" : ""}
              </span>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help text-gray-400 hover:text-gray-600">
                  <Info className="h-4 w-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[220px] border-gray-200 bg-white text-xs shadow-lg">
                Deputados que integram esta frente. Clique para abrir o perfil.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="max-h-[520px] overflow-y-auto px-6 pb-6 pt-4">
            {loadingMembros ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
                ))}
              </div>
            ) : membros.length > 0 ? (
              <ul className="space-y-2">
                {membros.map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`/deputados2/${m.id}`}
                      className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:border-[#749c5b]/25 hover:bg-[#749c5b]/5"
                    >
                      {m.urlFoto ? (
                        <img
                          src={m.urlFoto}
                          alt=""
                          className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#749c5b]/10">
                          <User className="h-5 w-5 text-[#749c5b]" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{m.nome}</p>
                        <p className="text-xs text-gray-500">
                          {[m.siglaPartido, m.siglaUf].filter(Boolean).join(" · ")}
                          {m.cargo ? ` · ${m.cargo}` : ""}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-medium text-[#749c5b]">Ver perfil</span>
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
      </TooltipProvider>
    </div>
  );
}
