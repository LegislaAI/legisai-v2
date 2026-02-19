"use client";

import { BackButton } from "@/components/v2/components/ui/BackButton";
import { Card } from "@/components/v2/components/ui/Card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/v2/components/ui/tooltip";
import { fetchCamara, getTotalPagesFromLinks } from "@/lib/camara-api";
import { Globe, ArrowRight, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CARD_3D =
  "relative overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-[#749c5b]/20 hover:shadow-[0_8px_32px_-8px_rgba(116,156,91,0.2)] hover:-translate-y-0.5";

interface Grupo {
  id: number;
  nome: string;
  anoCriacao?: number;
  uri?: string;
}

export default function GruposPage() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function loadGrupos() {
      setLoading(true);
      const { ok, body, dados } = await fetchCamara<Grupo[]>("grupos", {
        itens: 50,
        pagina: currentPage,
      });
      if (ok) {
        setGrupos(Array.isArray(dados) ? dados : []);
        setTotalPages(getTotalPagesFromLinks(body.links) || 1);
      } else {
        setGrupos([]);
      }
      setLoading(false);
    }
    loadGrupos();
  }, [currentPage]);

  const handleGrupoClick = (id: number) => {
    router.push(`/grupos/${id}`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
      <BackButton />
      <TooltipProvider delayDuration={250}>
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#749c5b]/10 via-[#4E9F3D]/5 to-transparent px-6 py-8">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm"
                style={{ background: "linear-gradient(135deg, #749c5b22, #749c5b0a)" }}
              >
                <Globe className="h-6 w-6 text-[#749c5b]" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                  Grupos interparlamentares
                </h1>
                <p className="mt-1 max-w-xl text-sm text-gray-600">
                  Grupos de amizade e temas internacionais. Clique para ver detalhes e membros.
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help text-gray-400 hover:text-gray-600">
                    <Info className="h-5 w-5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[260px] border-gray-200 bg-white text-xs shadow-lg">
                  Grupos interparlamentares promovem o relacionamento com outros parlamentos.
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : grupos.length > 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grupos.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => handleGrupoClick(g.id)}
                    className={`${CARD_3D} group cursor-pointer p-5`}
                  >
                    <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-[#749c5b] opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="flex flex-col gap-3">
                      {g.anoCriacao && (
                        <span className="text-xs font-medium text-gray-500">{g.anoCriacao}</span>
                      )}
                      <h3 className="font-bold leading-tight text-gray-900 line-clamp-2">
                        {g.nome || "Sem nome"}
                      </h3>
                      <div className="mt-auto flex items-center justify-end gap-2 text-[#749c5b]">
                        <span className="text-sm font-medium">Ver detalhes</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <Card className="flex flex-wrap items-center justify-between gap-4 border-gray-100 p-4">
                  <span className="text-sm text-gray-600">
                    Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="border-gray-100 p-12 text-center">
              <Globe className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-bold text-gray-800">Nenhum grupo encontrado</h3>
              <p className="mt-2 text-sm text-gray-500">
                Verifique o proxy /camara/grupos.
              </p>
            </Card>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}
