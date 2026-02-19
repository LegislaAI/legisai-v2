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
import { Flag, Info, User, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const CARD_3D =
  "relative overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-[#749c5b]/20 hover:shadow-[0_8px_32px_-8px_rgba(116,156,91,0.2)]";
const GLASS_HEADER =
  "bg-gradient-to-r from-[#749c5b]/[0.04] via-white to-white/95 backdrop-blur-sm";

interface Lider {
  id?: number;
  nome?: string;
  siglaPartido?: string;
  uri?: string;
}

interface PartidoDetail {
  id: number;
  sigla: string;
  nome: string;
  status?: Array<{ lider?: Lider }>;
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
        <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
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

  const lider = partido.status?.[0]?.lider;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
      <BackButton />

      <TooltipProvider delayDuration={250}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#749c5b]/10 via-[#4E9F3D]/5 to-transparent px-6 py-8">
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-sm"
              style={{ background: "linear-gradient(135deg, #749c5b22, #749c5b0a)" }}
            >
              <Flag className="h-7 w-7 text-[#749c5b]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-sm font-bold text-gray-700">
                {partido.sigla}
              </span>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">
                {partido.nome}
              </h1>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Liderança */}
          <div className={CARD_3D}>
            <div className={cn(GLASS_HEADER, "px-6 py-4")}>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-[#749c5b]" />
                <h2 className="text-lg font-bold text-gray-900">Liderança</h2>
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
            </div>
            <div className="px-6 pb-6">
              {lider?.nome ? (
                <div className="flex items-center gap-3 rounded-xl bg-gray-50/80 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#749c5b]/10">
                    <User className="h-6 w-6 text-[#749c5b]" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{lider.nome}</p>
                    {lider.siglaPartido && (
                      <p className="text-sm text-gray-500">{lider.siglaPartido}</p>
                    )}
                    {lider.id && (
                      <Link
                        href={`/deputados2/${lider.id}`}
                        className="mt-1 inline-block text-sm font-medium text-[#749c5b] hover:underline"
                      >
                        Ver perfil do deputado →
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <p className="py-4 text-sm text-gray-500">
                  Informação de liderança não disponível para este partido.
                </p>
              )}
            </div>
          </div>

          {/* Membros */}
          <div className={CARD_3D}>
            <div className={cn(GLASS_HEADER, "px-6 py-4")}>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#749c5b]" />
                <h2 className="text-lg font-bold text-gray-900">Membros</h2>
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
            </div>
            <div className="max-h-[360px] overflow-y-auto px-6 pb-6">
              {loadingMembros ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />
                  ))}
                </div>
              ) : membros.length > 0 ? (
                <ul className="space-y-2">
                  {membros.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/deputados2/${m.id}`}
                        className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:border-[#749c5b]/20 hover:bg-[#749c5b]/5"
                      >
                        {m.urlFoto ? (
                          <img
                            src={m.urlFoto}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#749c5b]/10">
                            <User className="h-5 w-5 text-[#749c5b]" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">{m.nome}</p>
                          {m.siglaUf && (
                            <p className="text-xs text-gray-500">{m.siglaUf}</p>
                          )}
                        </div>
                        <span className="text-sm font-medium text-[#749c5b]">Ver perfil</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-sm text-gray-500">
                  Nenhum membro listado ou API não retornou dados.
                </p>
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
