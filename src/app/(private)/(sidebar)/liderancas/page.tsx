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
import { fetchCamara } from "@/lib/camara-api";
import { Award, Info, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const CARD_3D =
  "relative overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-[#749c5b]/20 hover:shadow-[0_8px_32px_-8px_rgba(116,156,91,0.2)]";
const GLASS_HEADER =
  "bg-gradient-to-r from-[#749c5b]/[0.04] via-white to-white/95 backdrop-blur-sm";

interface Legislatura {
  id: number;
  dataInicio?: string;
  dataFim?: string;
}

/** Estrutura retornada pela API: legislaturas/{id}/lideres */
interface Lider {
  parlamentar?: {
    id: number;
    nome: string;
    siglaPartido?: string;
    siglaUf?: string;
    urlFoto?: string;
    uri?: string;
  };
  titulo?: string;
  bancada?: {
    tipo?: string;
    nome?: string;
    uri?: string;
  };
  dataInicio?: string;
  dataFim?: string | null;
}

export default function LiderancasPage() {
  const [legislaturas, setLegislaturas] = useState<Legislatura[]>([]);
  const [legislaturaSelecionada, setLegislaturaSelecionada] = useState<string>("");
  const [lideres, setLideres] = useState<Lider[]>([]);
  const [loadingLeg, setLoadingLeg] = useState(true);
  const [loadingLideres, setLoadingLideres] = useState(false);

  useEffect(() => {
    async function loadLegislaturas() {
      setLoadingLeg(true);
      const { ok, dados } = await fetchCamara<Legislatura[]>("legislaturas");
      if (ok && Array.isArray(dados)) {
        setLegislaturas(dados);
        if (dados.length > 0 && !legislaturaSelecionada) {
          const current = dados.find((l) => l.dataFim && new Date(l.dataFim) > new Date()) ?? dados[dados.length - 1];
          setLegislaturaSelecionada(String(current.id));
        }
      }
      setLoadingLeg(false);
    }
    loadLegislaturas();
  }, []);

  useEffect(() => {
    if (!legislaturaSelecionada) {
      setLideres([]);
      return;
    }
    async function loadLideres() {
      setLoadingLideres(true);
      const { ok, dados } = await fetchCamara<Lider[]>(`legislaturas/${legislaturaSelecionada}/lideres`);
      if (ok) {
        setLideres(Array.isArray(dados) ? dados : []);
      } else {
        setLideres([]);
      }
      setLoadingLideres(false);
    }
    loadLideres();
  }, [legislaturaSelecionada]);

  const legislaturaLabel = (l: Legislatura) => {
    const ini = l.dataInicio ? new Date(l.dataInicio).getFullYear() : "";
    const fim = l.dataFim ? new Date(l.dataFim).getFullYear() : "";
    return fim ? `${l.id} (${ini}-${fim})` : `${l.id} (${ini})`;
  };

  const formatDate = (s?: string) => {
    if (!s) return "—";
    try {
      return new Date(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return s;
    }
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
                  <Award className="h-6 w-6 text-[#749c5b]" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                    Lideranças por legislatura
                  </h1>
                  <p className="mt-1 max-w-xl text-sm text-gray-600">
                    Líderes e representantes de partidos e blocos. Selecione a legislatura para filtrar.
                  </p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-gray-400 hover:text-gray-600">
                      <Info className="h-5 w-5" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[260px] border-gray-200 bg-white text-xs shadow-lg">
                    Dados de lideranças da API Dados Abertos. Em algumas legislaturas a lista pode estar vazia.
                  </TooltipContent>
                </Tooltip>
              </div>
              {legislaturas.length > 0 && (
                <Select
                  value={legislaturaSelecionada}
                  onValueChange={setLegislaturaSelecionada}
                >
                  <SelectTrigger className="w-[240px] border-gray-200 bg-white">
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

          <div className={CARD_3D}>
            <div className="border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-[#749c5b]" />
                <h2 className="text-lg font-bold text-gray-900">Líderes</h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              {loadingLeg || loadingLideres ? (
                <div className="space-y-3 p-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
                  ))}
                </div>
              ) : lideres.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80">
                      <th className="px-6 py-3 font-semibold text-gray-700">Partido / Bloco</th>
                      <th className="px-6 py-3 font-semibold text-gray-700">Líder</th>
                      <th className="px-6 py-3 font-semibold text-gray-700">Cargo</th>
                      <th className="px-6 py-3 font-semibold text-gray-700">Início / Fim</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lideres.map((l, idx) => {
                      const partidoBloco = l.bancada?.nome ?? l.parlamentar?.siglaPartido ?? "—";
                      const nome = l.parlamentar?.nome ?? "—";
                      const idDep = l.parlamentar?.id;
                      const cargo = l.titulo ?? "—";
                      return (
                        <tr
                          key={idDep ? `${idDep}-${idx}` : idx}
                          className="border-b border-gray-50 transition-colors hover:bg-gray-50/50"
                        >
                          <td className="px-6 py-3">
                            <span className="font-medium text-gray-900">{partidoBloco}</span>
                          </td>
                          <td className="px-6 py-3">
                            {idDep ? (
                              <Link
                                href={`/deputados/${idDep}`}
                                className="font-medium text-[#749c5b] hover:underline"
                              >
                                {nome}
                              </Link>
                            ) : (
                              <span className="text-gray-900">{nome}</span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-gray-600">{cargo}</td>
                          <td className="px-6 py-3 text-gray-500">
                            {formatDate(l.dataInicio)} — {formatDate(l.dataFim ?? undefined)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center">
                  <Award className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <h3 className="text-lg font-bold text-gray-800">Nenhum líder encontrado</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {legislaturaSelecionada
                      ? "A API pode não retornar lideranças para esta legislatura. Tente outra."
                      : "Selecione uma legislatura acima."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
