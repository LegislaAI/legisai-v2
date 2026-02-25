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
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart3,
  Building2,
  Calendar,
  ExternalLink,
  Globe,
  Info,
  MapPin,
  User,
  Users,
  Vote,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const CARD_3D =
  "relative overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-[#749c5b]/20 hover:shadow-[0_8px_32px_-8px_rgba(116,156,91,0.2)]";
const GLASS_HEADER =
  "bg-gradient-to-r from-[#749c5b]/[0.04] via-white to-white/95 backdrop-blur-sm";

/** Link do portal da Câmara para evento legislativo (íntegra, vídeo, votações). */
const CAMARA_EVENTO_PORTAL_URL = "https://www.camara.leg.br/evento-legislativo";

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

interface MembroOrgao {
  id: number;
  nome?: string;
  siglaPartido?: string;
  siglaUf?: string;
  urlFoto?: string;
  uri?: string;
  titulo?: string;
  cargo?: { id?: number; nome?: string };
}

interface Votacao {
  id: number;
  data?: string;
  dataHora?: string;
  descricao?: string;
  uri?: string;
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  tooltip,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  tooltip?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm"
        style={{
          background: "linear-gradient(135deg, #749c5b22, #749c5b0a)",
        }}
      >
        <Icon className="h-5 w-5 text-[#749c5b]" />
      </div>
      <div>
        <h3 className="text-[15px] font-bold tracking-tight text-gray-900">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[11px] text-gray-400">{subtitle}</p>
        )}
      </div>
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help text-gray-400 hover:text-gray-600">
              <Info className="h-4 w-4" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-[220px] border-gray-200 bg-white text-xs shadow-lg">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export default function OrgaoDetalhePage() {
  const params = useParams();
  const id = params?.id as string;
  const [orgao, setOrgao] = useState<OrgaoDetail | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [membros, setMembros] = useState<MembroOrgao[]>([]);
  const [votacoes, setVotacoes] = useState<Votacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingMembros, setLoadingMembros] = useState(false);
  const [loadingVotacoes, setLoadingVotacoes] = useState(false);
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
      const dataInicio = subMonths(new Date(), 6);
      const dataFim = new Date();
      const { ok, dados } = await fetchCamara<Evento[]>(`orgaos/${id}/eventos`, {
        dataInicio: format(dataInicio, "yyyy-MM-dd"),
        dataFim: format(dataFim, "yyyy-MM-dd"),
        itens: 50,
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

  useEffect(() => {
    if (!id) return;
    async function loadMembros() {
      setLoadingMembros(true);
      const { ok, dados } = await fetchCamara<MembroOrgao[]>(`orgaos/${id}/membros`);
      if (ok) {
        const raw = Array.isArray(dados) ? dados : [];
        setMembros(raw);
      } else {
        setMembros([]);
      }
      setLoadingMembros(false);
    }
    loadMembros();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    async function loadVotacoes() {
      setLoadingVotacoes(true);
      const { ok, dados } = await fetchCamara<Votacao[]>(`orgaos/${id}/votacoes`, {
        itens: 15,
      });
      if (ok) {
        setVotacoes(Array.isArray(dados) ? dados : []);
      } else {
        setVotacoes([]);
      }
      setLoadingVotacoes(false);
    }
    loadVotacoes();
  }, [id]);

  const eventosPorMes = useMemo(() => {
    const byMonth: Record<string, number> = {};
    eventos.forEach((ev) => {
      const d = ev.dataHoraInicio || ev.dataHoraFim;
      if (!d) return;
      try {
        const dt = new Date(d);
        const key = format(dt, "yyyy-MM");
        byMonth[key] = (byMonth[key] || 0) + 1;
      } catch {
        // ignore
      }
    });
    const sorted = Object.entries(byMonth).sort(
      (a, b) => a[0].localeCompare(b[0])
    );
    return {
      categories: sorted.map(([k]) =>
        format(new Date(k + "-01"), "MMM yyyy", { locale: ptBR })
      ),
      series: sorted.map(([, v]) => v),
    };
  }, [eventos]);

  // Hooks devem vir sempre antes de qualquer return (Rules of Hooks)
  const membrosUnicos = useMemo(() => {
    const seen = new Set<number>();
    const list = membros.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.log("[OrgaoDetalhePage] useMemo(membrosUnicos)", { membrosTotal: membros.length, membrosUnicosCount: list.length });
    }
    return list;
  }, [membros]);

  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("[OrgaoDetalhePage] render", { id, loading, hasOrgao: !!orgao, earlyReturn: !id ? "noId" : loading ? "loading" : !orgao ? "noOrgao" : null });
  }

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
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-sm"
                style={{
                  background: "linear-gradient(135deg, #749c5b22, #749c5b0a)",
                }}
              >
                <Building2 className="h-7 w-7 text-[#749c5b]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-sm font-bold text-gray-700">
                    {orgao.sigla || "—"}
                  </span>
                  {orgao.tipoOrgao && (
                    <span className="rounded-full bg-[#749c5b]/10 px-2.5 py-0.5 text-xs font-medium text-[#749c5b]">
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
        </div>

        {/* KPIs rápidos */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="rounded-xl border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#749c5b]/10">
                <Calendar className="h-5 w-5 text-[#749c5b]" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Eventos (6 meses)
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {loadingEvents ? "—" : eventos.length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="rounded-xl border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4E9F3D]/10">
                <Users className="h-5 w-5 text-[#4E9F3D]" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Membros
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {loadingMembros ? "—" : membrosUnicos.length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="rounded-xl border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2d5a3d]/10">
                <Vote className="h-5 w-5 text-[#2d5a3d]" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Votações (amostra)
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {loadingVotacoes ? "—" : votacoes.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Informações */}
          <div className="lg:col-span-2 space-y-6">
            <div className={CARD_3D}>
              <div className={cn(GLASS_HEADER, "px-6 py-4")}>
                <SectionTitle
                  icon={Info}
                  title="Informações"
                  subtitle="Dados cadastrais do órgão"
                />
              </div>
              <div className="space-y-4 px-6 pb-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {orgao.situacao && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Situação
                      </p>
                      <p className="font-medium text-gray-900">{orgao.situacao}</p>
                    </div>
                  )}
                  {orgao.sala && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Sala
                        </p>
                        <p className="font-medium text-gray-900">{orgao.sala}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Data de início
                    </p>
                    <p className="font-medium text-gray-900">
                      {formatDate(orgao.dataInicio ?? orgao.dataInstalacao)}
                    </p>
                  </div>
                  {orgao.dataFim && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Data de fim
                      </p>
                      <p className="font-medium text-gray-900">
                        {formatDate(orgao.dataFim)}
                      </p>
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

            {/* Gráfico eventos por mês */}
            {!loadingEvents && eventosPorMes.categories.length > 0 && (
              <div className={CARD_3D}>
                <div className={cn(GLASS_HEADER, "px-6 py-4")}>
                  <SectionTitle
                    icon={BarChart3}
                    title="Eventos por mês"
                    subtitle="Últimos 6 meses"
                    tooltip="Quantidade de eventos do órgão por mês."
                  />
                </div>
                <div className="px-4 pb-6">
                  <ReactApexChart
                    type="bar"
                    series={[{ name: "Eventos", data: eventosPorMes.series }]}
                    options={{
                      chart: {
                        fontFamily: "inherit",
                        toolbar: { show: false },
                      },
                      colors: ["#749c5b"],
                      plotOptions: {
                        bar: {
                          borderRadius: 6,
                          columnWidth: "60%",
                        },
                      },
                      xaxis: {
                        categories: eventosPorMes.categories,
                        axisBorder: { show: false },
                        axisTicks: { show: false },
                      },
                      yaxis: {
                        labels: { formatter: (v) => String(Math.round(Number(v))) },
                      },
                      grid: { borderColor: "#f1f1f1", strokeDashArray: 4 },
                      dataLabels: { enabled: false },
                    }}
                    height={220}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Coluna direita: Eventos + Membros + Votações */}
          <div className="space-y-6">
            {/* Eventos recentes */}
            <div className={CARD_3D}>
              <div className={cn(GLASS_HEADER, "px-6 py-4")}>
                <SectionTitle
                  icon={Calendar}
                  title="Eventos recentes"
                  subtitle="Últimos 6 meses"
                  tooltip="Eventos do órgão no período."
                />
              </div>
              <div className="max-h-[340px] overflow-y-auto px-6 pb-6">
                {loadingEvents ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-16 animate-pulse rounded-xl bg-gray-100"
                      />
                    ))}
                  </div>
                ) : eventos.length > 0 ? (
                  <ul className="space-y-3">
                    {eventos.slice(0, 10).map((ev) => {
                      const eventoPortalUrl = `${CAMARA_EVENTO_PORTAL_URL}/${ev.id}`;
                      return (
                        <li
                          key={ev.id}
                          className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-50"
                        >
                          <a
                            href={eventoPortalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start justify-between gap-2 text-left"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 line-clamp-2 text-sm">
                                {ev.descricao || ev.tipoEvento?.nome || "Evento"}
                              </p>
                              <p className="mt-0.5 text-xs text-gray-500">
                                {formatDateTime(ev.dataHoraInicio)}
                                {ev.tipoEvento?.sigla &&
                                  ` · ${ev.tipoEvento.sigla}`}
                              </p>
                            </div>
                            <span className="shrink-0 text-[#749c5b]" title="Ver no portal da Câmara">
                              <ExternalLink className="h-4 w-4" />
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="py-6 text-center text-sm text-gray-500">
                    Nenhum evento no período.
                  </p>
                )}
              </div>
            </div>

            {/* Membros */}
            <div className={CARD_3D}>
              <div className={cn(GLASS_HEADER, "px-6 py-4")}>
                <SectionTitle
                  icon={Users}
                  title="Membros"
                  subtitle={
                    membrosUnicos.length > 0
                      ? `${membrosUnicos.length} parlamentar(es)`
                      : undefined
                  }
                  tooltip="Deputados que integram o órgão e seus cargos. Clique para ver o perfil."
                />
              </div>
              <div className="max-h-[320px] overflow-y-auto px-6 pb-6">
                {loadingMembros ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-14 animate-pulse rounded-xl bg-gray-100"
                      />
                    ))}
                  </div>
                ) : membrosUnicos.length > 0 ? (
                  <ul className="space-y-2">
                    {membrosUnicos.map((m) => (
                      <li key={m.id}>
                        <Link
                          href={`/deputados/${m.id}`}
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
                            <p className="truncate font-medium text-gray-900 text-sm">
                              {m.nome || "Deputado"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {[m.cargo?.nome, m.titulo, m.siglaPartido]
                                .filter(Boolean)
                                .join(" · ") || "Membro"}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-[#749c5b]">
                            Perfil
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-6 text-center text-sm text-gray-500">
                    Nenhum membro listado para este órgão.
                  </p>
                )}
              </div>
            </div>

            {/* Votações */}
            <div className={CARD_3D}>
              <div className={cn(GLASS_HEADER, "px-6 py-4")}>
                <SectionTitle
                  icon={Vote}
                  title="Votações"
                  subtitle="Amostra recente"
                  tooltip="Votações realizadas no órgão."
                />
              </div>
              <div className="max-h-[280px] overflow-y-auto px-6 pb-6">
                {loadingVotacoes ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-12 animate-pulse rounded-xl bg-gray-100"
                      />
                    ))}
                  </div>
                ) : votacoes.length > 0 ? (
                  <ul className="space-y-2">
                    {votacoes.map((v) => (
                      <li
                        key={v.id}
                        className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-50"
                      >
                        <p className="line-clamp-2 text-sm font-medium text-gray-900">
                          {v.descricao || `Votação #${v.id}`}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {formatDate(v.data || v.dataHora)}
                        </p>
                        {v.uri && (
                          <a
                            href={v.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#749c5b] hover:underline"
                          >
                            Detalhes
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-6 text-center text-sm text-gray-500">
                    Nenhuma votação listada ou API não retornou dados.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
