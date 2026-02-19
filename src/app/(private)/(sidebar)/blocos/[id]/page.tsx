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
import { Layers, Flag, Info } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const CARD_3D =
  "relative overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-[#749c5b]/20 hover:shadow-[0_8px_32px_-8px_rgba(116,156,91,0.2)]";
const GLASS_HEADER =
  "bg-gradient-to-r from-[#749c5b]/[0.04] via-white to-white/95 backdrop-blur-sm";

interface BlocoDetail {
  id: number;
  nome: string;
  idLegislatura?: number;
  uri?: string;
}

interface Partido {
  id: number;
  sigla: string;
  nome: string;
  uri?: string;
}

export default function BlocoDetalhePage() {
  const params = useParams();
  const id = params?.id as string;
  const [bloco, setBloco] = useState<BlocoDetail | null>(null);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPartidos, setLoadingPartidos] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadBloco() {
      setLoading(true);
      setFetchError(null);
      const { ok, dados } = await fetchCamara<BlocoDetail>(`blocos/${id}`);
      if (ok && dados && !Array.isArray(dados)) {
        setBloco(dados as BlocoDetail);
      } else {
        setBloco(null);
        setFetchError("Erro ao carregar bloco.");
      }
      setLoading(false);
    }
    loadBloco();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    async function loadPartidos() {
      setLoadingPartidos(true);
      const { ok, dados } = await fetchCamara<Partido[]>(`blocos/${id}/partidos`);
      if (ok) {
        setPartidos(Array.isArray(dados) ? dados : []);
      } else {
        setPartidos([]);
      }
      setLoadingPartidos(false);
    }
    loadPartidos();
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

  if (!bloco) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
        <BackButton />
        <Card className="border-gray-100 p-8 text-center text-gray-500">
          <p className="font-medium text-gray-700">Bloco não encontrado</p>
          {fetchError && <p className="mt-2 text-sm">{fetchError}</p>}
        </Card>
      </div>
    );
  }

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
              <Layers className="h-7 w-7 text-[#749c5b]" />
            </div>
            <div className="min-w-0 flex-1">
              {bloco.idLegislatura && (
                <span className="text-sm text-gray-500">Legislatura {bloco.idLegislatura}</span>
              )}
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">
                {bloco.nome}
              </h1>
            </div>
          </div>
        </div>

        <div className={CARD_3D}>
          <div className={cn(GLASS_HEADER, "px-6 py-4")}>
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-[#749c5b]" />
              <h2 className="text-lg font-bold text-gray-900">Partidos do bloco</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help text-gray-400 hover:text-gray-600">
                    <Info className="h-4 w-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[220px] border-gray-200 bg-white text-xs shadow-lg">
                  Partidos que compõem este bloco parlamentar. Clique para ver o partido.
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="px-6 pb-6">
            {loadingPartidos ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
                ))}
              </div>
            ) : partidos.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {partidos.map((p) => (
                  <Link
                    key={p.id}
                    href={`/partidos/${p.id}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:border-[#749c5b]/20 hover:bg-[#749c5b]/5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#749c5b]/10 font-bold text-[#749c5b]">
                      {p.sigla?.slice(0, 2) ?? "—"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900">{p.sigla}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">{p.nome}</p>
                    </div>
                    <span className="text-sm font-medium text-[#749c5b]">Ver partido</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">
                Nenhum partido listado ou API não retornou dados.
              </p>
            )}
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
