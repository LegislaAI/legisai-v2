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
import {
  Building2,
  Calendar,
  ExternalLink,
  Info,
  MapPin,
  Globe,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CARD_3D =
  "relative overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-[#749c5b]/20 hover:shadow-[0_8px_32px_-8px_rgba(116,156,91,0.2)]";
const GLASS_HEADER =
  "bg-gradient-to-r from-[#749c5b]/[0.04] via-white to-white/95 backdrop-blur-sm";

interface OrgaoDetail {
  id: number;
  sigla: string;
  nome: string;
  apelido?: string;
  tipoOrgao?: string;
  codTipoOrgao?: number;
  sala?: string;
  dataInicio?: string;
  dataInstalacao?: string;
  dataFim?: string;
  urlWebsite?: string;
  situacao?: string;
  uri?: string;
}

interface Evento {
  id: number;
  dataHoraInicio?: string;
  dataHoraFim?: string;
  descricao?: string;
  situacao?: string;
  tipoEvento?: { sigla?: string; nome?: string };
  uri?: string;
}

export default function OrgaoDetalhePage() {
  const params = useParams();
  const id = params?.id as string;
  const [orgao, setOrgao] = useState<OrgaoDetail | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadOrgao() {
      setLoading(true);
      setFetchError(null);
      const { ok, dados } = await fetchCamara<OrgaoDetail>(`orgaos/${id}`);
      if (ok && dados) {
        setOrgao(Array.isArray(dados) ? null : (dados as OrgaoDetail));
      } else {
        setOrgao(null);
        setFetchError("Erro ao carregar órgão.");
      }
      setLoading(false);
    }
    loadOrgao();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    async function loadEventos() {
      setLoadingEvents(true);
      const dataInicio = new Date();
      dataInicio.setMonth(dataInicio.getMonth() - 3);
      const dataFim = new Date();
      const { ok, dados } = await fetchCamara<Evento[]>(`orgaos/${id}/eventos`, {
        dataInicio: dataInicio.toISOString().split("T")[0],
        dataFim: dataFim.toISOString().split("T")[0],
        itens: 20,
      });
      if (ok) {
        setEventos(Array.isArray(dados) ? dados : []);
      } else {
        setEventos([]);
      }
      setLoadingEvents(false);
    }
    loadEventos();
  }, [id]);

  if (!id) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
        <BackButton />
        <Card className="border-gray-100 p-8 text-center text-gray-500">
          ID do órgão não informado.
        </Card>
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

  if (!orgao) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
        <BackButton />
        <Card className="border-gray-100 p-8 text-center text-gray-500">
          <p className="font-medium text-gray-700">Órgão não encontrado</p>
          {fetchError && <p className="mt-2 text-sm">{fetchError}</p>}
        </Card>
      </div>
    );
  }

  const formatDate = (s?: string) => {
    if (!s) return "—";
    try {
      return format(new Date(s), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return s;
    }
  };

  const formatDateTime = (s?: string) => {
    if (!s) return "—";
    try {
      return format(new Date(s), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return s;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
      <BackButton />

      <TooltipProvider delayDuration={250}>
        {/* Cabeçalho */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#749c5b]/10 via-[#4E9F3D]/5 to-transparent px-6 py-8">
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-sm"
              style={{ background: "linear-gradient(135deg, #749c5b22, #749c5b0a)" }}
            >
              <Building2 className="h-7 w-7 text-[#749c5b]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-sm font-bold text-gray-700">
                  {orgao.sigla || "—"}
                </span>
                {orgao.tipoOrgao && (
                  <span className="rounded bg-[#749c5b]/10 px-2 py-0.5 text-xs font-medium text-[#749c5b]">
                    {orgao.tipoOrgao}
                  </span>
                )}
              </div>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">
                {orgao.nome || orgao.apelido || "Sem nome"}
              </h1>
              {orgao.apelido && orgao.apelido !== orgao.nome && (
                <p className="mt-1 text-sm text-gray-500">{orgao.apelido}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Informações */}
          <div className="lg:col-span-2">
            <div className={CARD_3D}>
              <div className={cn(GLASS_HEADER, "px-6 py-4")}>
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-[#749c5b]" />
                  <h2 className="text-lg font-bold text-gray-900">Informações</h2>
                </div>
              </div>
              <div className="space-y-4 px-6 pb-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {orgao.situacao && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Situação</p>
                      <p className="font-medium text-gray-900">{orgao.situacao}</p>
                    </div>
                  )}
                  {orgao.sala && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Sala</p>
                        <p className="font-medium text-gray-900">{orgao.sala}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Data de início</p>
                    <p className="font-medium text-gray-900">{formatDate(orgao.dataInicio ?? orgao.dataInstalacao)}</p>
                  </div>
                  {orgao.dataFim && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Data de fim</p>
                      <p className="font-medium text-gray-900">{formatDate(orgao.dataFim)}</p>
                    </div>
                  )}
                </div>
                {orgao.urlWebsite && (
                  <a
                    href={orgao.urlWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#749c5b] hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Site do órgão
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Eventos */}
          <div className={CARD_3D}>
            <div className={cn(GLASS_HEADER, "px-6 py-4")}>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#749c5b]" />
                <h2 className="text-lg font-bold text-gray-900">Eventos recentes</h2>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-gray-400 hover:text-gray-600">
                      <Info className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[220px] border-gray-200 bg-white text-xs shadow-lg">
                    Últimos eventos do órgão (últimos 3 meses).
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto px-6 pb-6">
              {loadingEvents ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
                  ))}
                </div>
              ) : eventos.length > 0 ? (
                <ul className="space-y-3">
                  {eventos.map((ev) => (
                    <li
                      key={ev.id}
                      className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">
                            {ev.descricao || ev.tipoEvento?.nome || "Evento"}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {formatDateTime(ev.dataHoraInicio)}
                            {ev.tipoEvento?.sigla && ` · ${ev.tipoEvento.sigla}`}
                          </p>
                        </div>
                        {ev.uri && (
                          <a
                            href={ev.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-[#749c5b] hover:underline"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-sm text-gray-500">
                  Nenhum evento encontrado no período.
                </p>
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
