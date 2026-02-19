"use client";

import { BackButton } from "@/components/v2/components/ui/BackButton";
import { Card } from "@/components/v2/components/ui/Card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/v2/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/v2/components/ui/select";
import { fetchCamara, getTotalPagesFromLinks } from "@/lib/camara-api";
import { Users, ArrowRight, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CARD_3D =
  "relative overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-[#749c5b]/20 hover:shadow-[0_8px_32px_-8px_rgba(116,156,91,0.2)] hover:-translate-y-0.5";

interface Frente {
  id: number;
  titulo: string;
  idLegislatura?: number;
  uri?: string;
}

interface Legislatura {
  id: number;
  dataInicio?: string;
  dataFim?: string;
}

export default function FrentesPage() {
  const router = useRouter();
  const [frentes, setFrentes] = useState<Frente[]>([]);
  const [legislaturas, setLegislaturas] = useState<Legislatura[]>([]);
  const [idLegislatura, setIdLegislatura] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function loadLegislaturas() {
      const { ok, dados } = await fetchCamara<Legislatura[]>("legislaturas");
      if (ok && Array.isArray(dados)) {
        setLegislaturas(dados);
        if (dados.length > 0 && !idLegislatura) {
          const current = dados.find((l) => l.dataFim && new Date(l.dataFim) > new Date()) ?? dados[dados.length - 1];
          setIdLegislatura(String(current.id));
        }
      }
    }
    loadLegislaturas();
  }, []);

  useEffect(() => {
    async function loadFrentes() {
      setLoading(true);
      const params: Record<string, string | number> = { itens: 50, pagina: currentPage };
      if (idLegislatura) params.idLegislatura = idLegislatura;
      const { ok, body, dados } = await fetchCamara<Frente[]>("frentes", params);
      if (ok) {
        setFrentes(Array.isArray(dados) ? dados : []);
        setTotalPages(getTotalPagesFromLinks(body.links) || 1);
      } else {
        setFrentes([]);
      }
      setLoading(false);
    }
    if (idLegislatura || legislaturas.length === 0) loadFrentes();
  }, [currentPage, idLegislatura, legislaturas.length]);

  const handleFrenteClick = (id: number) => {
    router.push(`/frentes/${id}`);
  };

  const legislaturaLabel = (l: Legislatura) => {
    const ini = l.dataInicio ? new Date(l.dataInicio).getFullYear() : "";
    const fim = l.dataFim ? new Date(l.dataFim).getFullYear() : "";
    return fim ? `${l.id} (${ini}-${fim})` : `${l.id} (${ini})`;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
      <BackButton />

      <TooltipProvider delayDuration={250}>
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#749c5b]/10 via-[#4E9F3D]/5 to-transparent px-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm"
                  style={{ background: "linear-gradient(135deg, #749c5b22, #749c5b0a)" }}
                >
                  <Users className="h-6 w-6 text-[#749c5b]" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                    Frentes parlamentares
                  </h1>
                  <p className="mt-1 max-w-xl text-sm text-gray-600">
                    Frentes temáticas que reúnem deputados em torno de causas. Clique para ver membros.
                  </p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-gray-400 hover:text-gray-600">
                      <Info className="h-5 w-5" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[260px] border-gray-200 bg-white text-xs shadow-lg">
                    Frentes são grupos suprapartidários. Dados da API Dados Abertos.
                  </TooltipContent>
                </Tooltip>
              </div>
              {legislaturas.length > 0 && (
                <Select value={idLegislatura} onValueChange={(v) => { setIdLegislatura(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[220px] border-gray-200 bg-white">
                    <SelectValue placeholder="Legislatura" />
                  </SelectTrigger>
                  <SelectContent>
                    {legislaturas.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {legislaturaLabel(l)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : frentes.length > 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {frentes.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => handleFrenteClick(f.id)}
                    className={`${CARD_3D} group cursor-pointer p-5`}
                  >
                    <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-[#749c5b] opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="flex flex-col gap-3">
                      {f.idLegislatura && (
                        <span className="text-xs font-medium text-gray-500">
                          Legislatura {f.idLegislatura}
                        </span>
                      )}
                      <h3 className="font-bold leading-tight text-gray-900 line-clamp-3">
                        {f.titulo || "Sem título"}
                      </h3>
                      <div className="mt-auto flex items-center justify-end gap-2 text-[#749c5b]">
                        <span className="text-sm font-medium">Ver membros</span>
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
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-bold text-gray-800">Nenhuma frente encontrada</h3>
              <p className="mt-2 text-sm text-gray-500">
                Tente outra legislatura ou verifique o proxy <code className="rounded bg-gray-100 px-1">/camara/frentes</code>.
              </p>
            </Card>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}
