"use client";

import { BackButton } from "@/components/v2/components/ui/BackButton";
import { Card } from "@/components/v2/components/ui/Card";
import { EmptyState } from "@/components/v2/components/ui/EmptyState";
import { PropositionAiTab } from "@/components/v2/components/ui/PropositionAiTab";
import { PropositionAnalyticalCard } from "@/components/v2/components/ui/PropositionAnalyticalCard";
import { PropositionAttachedTab } from "@/components/v2/components/ui/PropositionAttachedTab";
import { PropositionCommissionsTab } from "@/components/v2/components/ui/PropositionCommissionsTab";
import { PropositionDocumentsTab } from "@/components/v2/components/ui/PropositionDocumentsTab";
import { PropositionOpinionsTab } from "@/components/v2/components/ui/PropositionOpinionsTab";
import { PropositionRequirementsTab } from "@/components/v2/components/ui/PropositionRequirementsTab";
import {
  DeadlinesBlock,
  NextStepBlock,
  ProceduralStatusBlock,
  type Rite,
} from "@/components/v2/components/ui/PropositionRiteBlocks";
import { QualityBadge, type QualityFlag } from "@/components/v2/components/ui/QualityBadge";
import { useApiContext } from "@/context/ApiContext";
import { useSignatureContext } from "@/context/SignatureContext";
import { canAccessTramitacoes } from "@/lib/plan-access";
import type { PlanLevel } from "@/@types/signature";
import { cn, formatBrazilDate, formatBrazilTime } from "@/lib/utils";
import * as Tabs from "@radix-ui/react-tabs";
import {
  ArrowUpRight,
  Bell,
  BellRing,
  Building2,
  Calendar,
  Clock,
  Download,
  FileText,
  FileSearch,
  Folder,
  Gavel,
  Hash,
  Layers,
  Link2,
  List,
  MessageSquare,
  MessageSquareWarning,
  Network,
  Play,
  Share2,
  Sparkles,
  Tag,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type Author = { id: string; name: string; politicianId?: string; proponente?: boolean };
type Theme = { id: string; name: string };

type Process = {
  id: string;
  agencyAcronym: string;
  sequency: number;
  regime: string;
  processingDescription: string;
  situationDescription?: string;
  dispatch: string;
  url?: string;
  scope: string;
  appreciation: string;
  date: string;
};

type EventItem = {
  id: string;
  sequence: number;
  regime: string;
  topic: string;
  title: string;
  situation: string;
  reporterId?: string;
  reporterName?: string;
  reporterUri?: string;
  report?: string;
  event: {
    id: string;
    startDate: string;
    description: string;
    local?: string;
    videoUrl?: string;
  };
};

type PropositionDetail = {
  id: string;
  description: string;
  typeAcronym: string;
  number: number;
  year: number;
  presentationDate: string;
  lastMovementDate: string;
  situationDescription?: string;
  movementDescription?: string;
  fullPropositionUrl?: string;
  url?: string;
  keywords?: string;
  appreciation?: string;
  dispatch?: string;
  regime?: string;
  type: { id: string; name: string; acronym: string };
  situation: { id: string; name: string } | null;
  mainProposition?: {
    id: string;
    typeAcronym: string;
    number: number;
    year: number;
  } | null;
  authors?: Author[];
  themes?: Theme[] | { theme: Theme }[];
  processes?: Process[];
  events?: EventItem[];
  rite?: Rite;
  quality?: Partial<{
    identification: QualityFlag;
    authorship: QualityFlag;
    basicData: QualityFlag;
    situationAndRite: QualityFlag;
    rawData: QualityFlag;
    tramitacao: QualityFlag;
    relatoria: QualityFlag;
    nextStep: QualityFlag;
  }>;
};

function regimeTone(regime?: string) {
  if (!regime) return "bg-gray-100 text-gray-600";
  const r = regime.toLowerCase();
  if (r.includes("urg")) return "bg-red-50 text-red-700 border-red-100";
  if (r.includes("prior")) return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

const FOLLOW_KEY = "legisai:proposicoes:followed";

export default function PropositionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { GetAPI } = useApiContext();
  const { activeSignature } = useSignatureContext();
  const planLevel: PlanLevel = activeSignature?.signaturePlan?.level ?? 4;
  const [proposition, setProposition] = useState<PropositionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [copied, setCopied] = useState(false);
  const [following, setFollowing] = useState(false);

  // Carrega estado de Acompanhar do localStorage
  useEffect(() => {
    if (!id) return;
    try {
      const raw = window.localStorage.getItem(FOLLOW_KEY);
      const list = raw ? (JSON.parse(raw) as string[]) : [];
      setFollowing(Array.isArray(list) && list.includes(id));
    } catch {
      /* ignora */
    }
  }, [id]);

  const toggleFollow = () => {
    try {
      const raw = window.localStorage.getItem(FOLLOW_KEY);
      const list = raw ? (JSON.parse(raw) as string[]) : [];
      const next = following ? list.filter((x) => x !== id) : [...list, id];
      window.localStorage.setItem(FOLLOW_KEY, JSON.stringify(next));
      setFollowing(!following);
    } catch {
      /* ignora */
    }
  };

  const handlePrintDossier = () => {
    setActiveTab("overview");
    // Pequeno delay para garantir que a aba muda antes do print abrir
    window.setTimeout(() => window.print(), 100);
  };

  const handleKeywordClick = (kw: string) => {
    router.push(`/proposicoes?q=${encodeURIComponent(kw)}`);
  };

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await GetAPI(`/proposition/${id}`, true);
      if (res.status === 200 && res.body) {
        const data = (res.body as { proposition?: PropositionDetail }).proposition ?? res.body;
        setProposition(data as PropositionDetail);
      } else {
        setProposition(null);
      }
    } catch {
      setProposition(null);
    } finally {
      setLoading(false);
    }
  }, [id, GetAPI]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const themesNormalized = useMemo<Theme[]>(() => {
    if (!proposition?.themes) return [];
    return (proposition.themes as Array<Theme | { theme: Theme }>).map((t) =>
      "theme" in t ? t.theme : t
    );
  }, [proposition?.themes]);

  // Órgão atual = primeiro processo (ordenado desc por sequency)
  const currentAgency = proposition?.processes?.[0]?.agencyAcronym;
  // Última ação = processo mais recente
  const lastProcess = proposition?.processes?.[0];
  // Relator atual = último evento com reporter
  const currentReporter = useMemo(() => {
    if (!proposition?.events) return undefined;
    const withReporter = proposition.events.filter((e) => e.reporterName);
    return withReporter[withReporter.length - 1];
  }, [proposition?.events]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  const triggerIA = () => {
    if (!proposition) return;
    const propositionName = `${proposition.typeAcronym} ${proposition.number}/${proposition.year}`;
    const promptText = `Faça um relatório legislativo completo, detalhista e expansivo sobre a proposição: ${propositionName}.

Detalhe o resumo do texto, matérias correlatas, todo o histórico de tramitação (status, comissões, horários) e mapeie os atores políticos envolvidos (autores, relatores e partidos).`;
    window.location.href = `/tramitacoes?initialPrompt=${encodeURIComponent(promptText)}`;
  };

  if (!id) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
        <BackButton />
        <Card className="border-gray-100 p-8 text-center text-gray-500">
          ID da proposição não informado.
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
        <BackButton />
        <Card className="animate-pulse border-gray-100 p-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 rounded-2xl bg-gray-200" />
            <div className="space-y-2">
              <div className="h-6 w-48 rounded bg-gray-200" />
              <div className="h-4 w-32 rounded bg-gray-100" />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="h-4 w-full rounded bg-gray-100" />
            <div className="h-4 w-5/6 rounded bg-gray-100" />
          </div>
        </Card>
      </div>
    );
  }

  if (!proposition) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
        <BackButton />
        <EmptyState
          variant="no-source"
          title="Proposição não encontrada"
          message="Não foi possível recuperar essa matéria. Ela pode ter sido removida ou ainda não foi ingerida."
        />
      </div>
    );
  }

  const TABS = [
    { id: "overview", label: "Visão Geral", icon: FileText },
    { id: "tramitacao", label: "Tramitação", icon: List },
    { id: "comissoes", label: "Comissões & Plenário", icon: Building2 },
    { id: "pareceres", label: "Pareceres & Relatorias", icon: MessageSquare },
    { id: "apensados", label: "Apensados & Vínculos", icon: Network },
    { id: "requerimentos", label: "Requerimentos & Incidentes", icon: MessageSquareWarning },
    { id: "documentos", label: "Documentos", icon: Folder },
    { id: "eventos", label: "Eventos", icon: Calendar },
    { id: "ai", label: "Análise com IA", icon: Sparkles },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-20 duration-500">
      <BackButton />

      {/* ── HEADER ── */}
      <header>
        <div className="relative overflow-hidden rounded-2xl shadow-lg">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                "linear-gradient(135deg, #1B3B2B 0%, #2d5a3d 38%, #749c5b 65%, #5a8c4a 100%)",
            }}
          />
          <div className="relative z-20 rounded-2xl bg-white/92 p-6 backdrop-blur-sm md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5a8a42] to-[#749c5b] shadow-md sm:h-24 sm:w-24">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {proposition.typeAcronym} {proposition.number}/{proposition.year}
                  </h1>
                  <p className="mt-1 text-base text-gray-800">{proposition.type.name}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {proposition.situationDescription && (
                      <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-tight text-secondary">
                        {proposition.situationDescription}
                      </span>
                    )}
                    {proposition.mainProposition && (
                      <Link
                        href={`/proposicoes/${proposition.mainProposition.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-tight text-secondary transition-colors hover:bg-secondary/10"
                        title="Ir para a proposição principal"
                      >
                        <Link2 className="h-3 w-3" />
                        {proposition.mainProposition.typeAcronym}{" "}
                        {proposition.mainProposition.number}/{proposition.mainProposition.year}
                      </Link>
                    )}
                    {proposition.regime && (
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-tight",
                          regimeTone(proposition.regime)
                        )}
                      >
                        {proposition.regime}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Faixa de botões */}
              <div className="flex flex-wrap items-center gap-2">
                {proposition.url && (
                  <a
                    href={proposition.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                  >
                    Câmara <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
                {proposition.fullPropositionUrl && (
                  <a
                    href={proposition.fullPropositionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                  >
                    Inteiro teor <Link2 className="h-4 w-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                >
                  <Share2 className="h-4 w-4" /> {copied ? "Copiado!" : "Compartilhar"}
                </button>
                <button
                  type="button"
                  onClick={toggleFollow}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium shadow-sm transition-colors ${
                    following
                      ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  title={
                    following
                      ? "Você está acompanhando esta matéria neste dispositivo"
                      : "Salvar localmente para reabrir rápido"
                  }
                >
                  {following ? (
                    <>
                      <BellRing className="h-4 w-4" /> Acompanhando
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4" /> Acompanhar
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handlePrintDossier}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 print:hidden"
                  title="Abre o diálogo de impressão para gerar PDF do dossiê"
                >
                  <Download className="h-4 w-4" /> Exportar dossiê
                </button>
                {canAccessTramitacoes(planLevel) && (
                  <button
                    onClick={triggerIA}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:scale-105 hover:from-indigo-600 hover:to-purple-700"
                  >
                    <Sparkles className="h-4 w-4" />
                    Usar IA Agora
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── PAINEL-RESUMO + RAIL ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6 min-w-0">
          {/* Painel-resumo (6 cards) */}
          <section>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <SummaryCard
                icon={Tag}
                label="Situação atual"
                value={proposition.situationDescription || proposition.situation?.name}
                emptyVariant="partial"
              />
              <SummaryCard
                icon={Clock}
                label="Última ação"
                value={
                  proposition.lastMovementDate
                    ? formatBrazilDate(proposition.lastMovementDate)
                    : undefined
                }
                hint={proposition.movementDescription}
                emptyVariant="no-occurrence"
              />
              <SummaryCard
                icon={Building2}
                label="Órgão atual"
                value={currentAgency}
                emptyVariant="partial"
              />
              <SummaryCard
                icon={Gavel}
                label="Regime"
                value={proposition.regime}
                emptyVariant="partial"
              />
              <SummaryCard
                icon={Layers}
                label="Forma de apreciação"
                value={proposition.appreciation}
                emptyVariant="partial"
              />
              <SummaryCard
                icon={UserCheck}
                label="Relatoria"
                value={currentReporter?.reporterName}
                hint={currentReporter ? "Identificado em evento" : undefined}
                emptyVariant="partial"
                emptyMessage="Relatoria ainda não identificada com fonte suficiente."
                quality={proposition.quality?.relatoria}
              />
            </div>
          </section>

          {/* ── TABS ── */}
          <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full">
            <Tabs.List className="scrollbar-hide mb-6 flex flex-nowrap gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-gray-50/50 p-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Tabs.Trigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                      activeTab === tab.id
                        ? "bg-[#749c5b] text-white shadow-sm"
                        : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {tab.label}
                  </Tabs.Trigger>
                );
              })}
            </Tabs.List>

            {/* ── ABA VISÃO GERAL ── */}
            <Tabs.Content
              value="overview"
              className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300"
            >
              {/* Bloco 1 — Identificação */}
              <Card className="border-gray-100 p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Hash className="h-5 w-5 text-secondary" /> Identificação
                  <span className="ml-auto"><QualityBadge flag={proposition.quality?.identification} /></span>
                </h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                  <KV label="Número" value={`${proposition.number}/${proposition.year}`} />
                  <KV label="Sigla" value={proposition.typeAcronym} />
                  <KV label="Ano" value={String(proposition.year)} />
                  <KV label="Tipo" value={proposition.type?.name} />
                  <KV label="Situação atual" value={proposition.situationDescription || proposition.situation?.name} />
                  <KV
                    label="Apresentação"
                    value={formatBrazilDate(proposition.presentationDate)}
                  />
                </div>
              </Card>

              {/* Bloco 2 — Autoria */}
              <Card className="border-gray-100 p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Users className="h-5 w-5 text-secondary" /> Autoria
                  <span className="ml-auto"><QualityBadge flag={proposition.quality?.authorship} /></span>
                </h3>
                {proposition.authors && proposition.authors.length > 0 ? (
                  <>
                    <p className="mb-3 text-xs text-gray-500">
                      {proposition.authors.length} autor(es) identificado(s)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {proposition.authors.map((a) =>
                        a.politicianId ? (
                          <Link
                            key={a.id}
                            href={`/deputados/${a.politicianId}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:border-secondary hover:text-secondary"
                          >
                            <User className="h-4 w-4 text-gray-400" />
                            {a.name}
                            {a.proponente && (
                              <span className="ml-1 rounded bg-secondary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-secondary">
                                Proponente
                              </span>
                            )}
                          </Link>
                        ) : (
                          <span
                            key={a.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-sm text-gray-600"
                          >
                            <User className="h-4 w-4 text-gray-400" />
                            {a.name}
                          </span>
                        )
                      )}
                    </div>
                  </>
                ) : (
                  <EmptyState
                    variant="partial"
                    compact
                    title="Autoria não individualizada"
                    message="Autoria não individualizada nesta versão do bloco."
                  />
                )}
              </Card>

              {/* Bloco 3 — Dados básicos */}
              <Card className="border-gray-100 p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <FileText className="h-5 w-5 text-secondary" /> Dados básicos
                  <span className="ml-auto"><QualityBadge flag={proposition.quality?.basicData} /></span>
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Ementa
                    </p>
                    <p className="mt-1 leading-relaxed text-gray-700">
                      {proposition.description || "Sem ementa integrada."}
                    </p>
                  </div>

                  <div>
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      <Tag className="h-3 w-3" /> Palavras-chave
                      {proposition.keywords && (
                        <span className="ml-1 text-[10px] font-normal italic text-gray-400">
                          (clique para filtrar)
                        </span>
                      )}
                    </p>
                    {proposition.keywords ? (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {proposition.keywords
                          .split(/[,;]\s*|\s+\|\s+/)
                          .map((k) => k.trim())
                          .filter(Boolean)
                          .map((kw, i) => (
                            <button
                              key={`${kw}-${i}`}
                              type="button"
                              onClick={() => handleKeywordClick(kw)}
                              className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700 transition-colors hover:bg-secondary/10 hover:text-secondary"
                              title={`Filtrar proposições por "${kw}"`}
                            >
                              {kw}
                            </button>
                          ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs italic text-gray-400">
                        Não há indexação integrada para esta matéria.
                      </p>
                    )}
                  </div>

                  {themesNormalized.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Temas
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {themesNormalized.map((t) => (
                          <span
                            key={t.id}
                            className="rounded-md bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {proposition.fullPropositionUrl && (
                    <a
                      href={proposition.fullPropositionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline"
                    >
                      <Link2 className="h-3.5 w-3.5" /> Abrir inteiro teor
                    </a>
                  )}
                </div>
              </Card>

              {/* Bloco 4 — Situação e rito */}
              <Card className="border-gray-100 p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Gavel className="h-5 w-5 text-secondary" /> Situação e rito
                  <span className="ml-auto"><QualityBadge flag={proposition.quality?.situationAndRite} /></span>
                </h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                  <KV label="Situação atual" value={proposition.situationDescription || proposition.situation?.name} />
                  <KV label="Forma de apreciação" value={proposition.appreciation} />
                  <KV label="Regime de tramitação" value={proposition.regime} />
                  <KV label="Despacho atual" value={proposition.dispatch} />
                  <KV
                    label="Última ação legislativa"
                    value={
                      proposition.lastMovementDate
                        ? `${formatBrazilDate(proposition.lastMovementDate)}${proposition.movementDescription ? ` — ${proposition.movementDescription}` : ""}`
                        : undefined
                    }
                  />
                  <div>
                    <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Próximo passo provável
                      <QualityBadge flag="derived" />
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 text-sm",
                        proposition.rite ? "font-medium text-gray-800" : "italic text-gray-400"
                      )}
                    >
                      {proposition.rite
                        ? humanizeNextStep(proposition.rite.nextStep)
                        : "Em cálculo — disponível em fase posterior."}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Bloco 5 — Fichamento cru */}
              <Card className="border-gray-100 p-6 shadow-sm">
                <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <FileSearch className="h-5 w-5 text-secondary" /> Fichamento cru
                  <span className="ml-auto"><QualityBadge flag={proposition.quality?.rawData} /></span>
                </h3>
                <p className="mb-4 text-xs text-gray-500">
                  Dado bruto da matéria, antes de qualquer interpretação.
                </p>
                <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                  <KV label="Identificador" value={proposition.id} />
                  <KV label="Sigla do tipo" value={proposition.typeAcronym} />
                  <KV label="Número" value={String(proposition.number)} />
                  <KV label="Ano" value={String(proposition.year)} />
                  <KV label="Situação (texto cru)" value={proposition.situationDescription} />
                  <KV label="Movimento (texto cru)" value={proposition.movementDescription} />
                  <KV label="Despacho (texto cru)" value={proposition.dispatch} />
                  <KV label="Regime (texto cru)" value={proposition.regime} />
                  <KV label="Apreciação (texto cru)" value={proposition.appreciation} />
                  <KV
                    label="Última movimentação (data cru)"
                    value={proposition.lastMovementDate}
                  />
                </div>
                {proposition.keywords && (
                  <div className="mt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Termos indexados (texto cru)
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words rounded-lg border border-gray-100 bg-gray-50/60 p-3 font-mono text-[11px] leading-relaxed text-gray-700">
                      {proposition.keywords}
                    </p>
                  </div>
                )}
              </Card>

              {/* Bloco 6 — Fichamento analítico (IA, lazy) */}
              <PropositionAnalyticalCard propositionId={id} />
            </Tabs.Content>

            {/* ── ABA TRAMITAÇÃO ── */}
            <Tabs.Content
              value="tramitacao"
              className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300"
            >
              {/* Bloco 1 — Última ação legislativa */}
              <Card className="border-gray-100 p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Clock className="h-5 w-5 text-secondary" /> Último andamento integrado
                </h3>
                {lastProcess ? (
                  <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                    <KV label="Data" value={formatBrazilDate(lastProcess.date)} />
                    <KV label="Hora" value={formatBrazilTime(lastProcess.date)} />
                    <KV label="Órgão" value={lastProcess.agencyAcronym} />
                    <KV label="Fase" value={lastProcess.processingDescription} />
                    <div className="sm:col-span-2">
                      <KV label="Despacho" value={lastProcess.dispatch} />
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    variant="no-occurrence"
                    compact
                    title="Sem última ação integrada"
                    message="Até o momento, não há andamento integrado para esta matéria."
                  />
                )}
              </Card>

              {/* Bloco 2 — Linha do tempo */}
              <Card className="border-gray-100 p-6 shadow-sm">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <List className="h-5 w-5 text-secondary" /> Linha do tempo
                  <span className="ml-auto"><QualityBadge flag={proposition.quality?.tramitacao} /></span>
                </h3>
                {!proposition.processes || proposition.processes.length === 0 ? (
                  <EmptyState
                    variant="no-occurrence"
                    title="Sem tramitação integrada"
                    message="Até o momento, não há tramitação integrada para esta matéria."
                  />
                ) : (
                  <div className="space-y-6">
                    {proposition.processes.map((proc, idx) => (
                      <div key={proc.id} className="relative flex gap-4">
                        {idx !== proposition.processes!.length - 1 && (
                          <div className="absolute left-[19px] top-8 bottom-[-24px] w-0.5 bg-gray-100" />
                        )}
                        <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white bg-secondary/10 text-secondary">
                          <List className="h-4 w-4" />
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatBrazilDate(proc.date)}
                              <span className="ml-2 text-xs font-normal text-gray-400">
                                {formatBrazilTime(proc.date)}
                              </span>
                            </span>
                            <span className="inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                              {proc.agencyAcronym}
                            </span>
                          </div>
                          {proc.dispatch && (
                            <p className="mt-2 text-sm text-gray-700">{proc.dispatch}</p>
                          )}
                          {proc.processingDescription && (
                            <p className="mt-1 text-xs text-gray-500">
                              <span className="font-semibold text-gray-600">Fase:</span>{" "}
                              {proc.processingDescription}
                            </p>
                          )}
                          {proc.url && (
                            <a
                              href={proc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-secondary hover:underline"
                            >
                              <Link2 className="h-3 w-3" /> Documento associado
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Blocos 3, 4 e 5 — derivados do motor de rito */}
              {proposition.rite && (
                <>
                  <ProceduralStatusBlock rite={proposition.rite} />
                  <DeadlinesBlock rite={proposition.rite} />
                  <NextStepBlock rite={proposition.rite} />
                </>
              )}
            </Tabs.Content>

            {/* ── ABA COMISSÕES & PLENÁRIO ── */}
            <Tabs.Content
              value="comissoes"
              className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300"
            >
              <PropositionCommissionsTab
                processes={proposition.processes}
                events={proposition.events}
                appreciation={proposition.appreciation}
              />
            </Tabs.Content>

            {/* ── ABA PARECERES & RELATORIAS ── */}
            <Tabs.Content
              value="pareceres"
              className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300"
            >
              <PropositionOpinionsTab events={proposition.events} />
            </Tabs.Content>

            {/* ── ABA APENSADOS & VÍNCULOS ── */}
            <Tabs.Content
              value="apensados"
              className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300"
            >
              <PropositionAttachedTab propositionId={id} />
            </Tabs.Content>

            {/* ── ABA REQUERIMENTOS & INCIDENTES (lazy hydration) ── */}
            <Tabs.Content
              value="requerimentos"
              className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300"
            >
              <PropositionRequirementsTab propositionId={id} />
            </Tabs.Content>

            {/* ── ABA DOCUMENTOS ── */}
            <Tabs.Content
              value="documentos"
              className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300"
            >
              <PropositionDocumentsTab
                propositionId={id}
                proposition={{
                  id: proposition.id,
                  typeAcronym: proposition.typeAcronym,
                  number: proposition.number,
                  year: proposition.year,
                  fullPropositionUrl: proposition.fullPropositionUrl,
                  url: proposition.url,
                  processes: proposition.processes,
                }}
              />
            </Tabs.Content>

            {/* ── ABA EVENTOS ── */}
            <Tabs.Content
              value="eventos"
              className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300"
            >
              <Card className="border-gray-100 p-6 shadow-sm">
                <h3 className="mb-6 text-lg font-bold text-gray-900">Eventos e Audiências</h3>
                {!proposition.events || proposition.events.length === 0 ? (
                  <EmptyState
                    variant="no-occurrence"
                    title="Sem eventos registrados"
                    message="Não há eventos ou audiências integrados para esta matéria."
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {proposition.events.map((evt) => (
                      <Card
                        key={evt.id}
                        className="flex flex-col border border-gray-100 p-5 shadow-sm transition-colors hover:border-secondary/30"
                      >
                        <div className="mb-4 flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <div>
                            <h4
                              className="line-clamp-2 font-semibold text-gray-900"
                              title={evt.title || evt.event.description}
                            >
                              {evt.title || evt.event.description}
                            </h4>
                            <p className="mt-1 text-xs font-medium text-secondary">
                              {formatBrazilDate(evt.event.startDate)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-auto flex flex-col gap-2 border-t border-gray-50 pt-4">
                          {evt.event.local && (
                            <span className="flex items-center gap-2 text-xs text-gray-500">
                              <Building2 className="h-3.5 w-3.5" />
                              {evt.event.local}
                            </span>
                          )}
                          {evt.reporterName && (
                            <span className="flex items-center gap-2 text-xs text-gray-500">
                              <UserCheck className="h-3.5 w-3.5" /> Relator: {evt.reporterName}
                            </span>
                          )}
                          {evt.event.videoUrl && (
                            <a
                              href={evt.event.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs font-semibold text-secondary hover:underline"
                            >
                              <Play className="h-3.5 w-3.5" /> Assistir vídeo
                            </a>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </Tabs.Content>

            {/* ── ABA ANÁLISE COM IA ── */}
            <Tabs.Content
              value="ai"
              className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300"
            >
              <PropositionAiTab propositionId={id} />
            </Tabs.Content>
          </Tabs.Root>
        </div>

        {/* ── RAIL LATERAL FIXO ── */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card className="border-gray-100 p-5 shadow-sm">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
              Resumo da matéria
            </h4>
            <div className="space-y-3 text-xs">
              <RailItem
                icon={Tag}
                label="Situação"
                value={proposition.situationDescription || proposition.situation?.name}
              />
              <RailItem icon={Building2} label="Órgão atual" value={currentAgency} />
              <RailItem
                icon={Clock}
                label="Última ação"
                value={
                  proposition.lastMovementDate
                    ? formatBrazilDate(proposition.lastMovementDate)
                    : undefined
                }
              />
              <RailItem icon={UserCheck} label="Relatoria" value={currentReporter?.reporterName} />
              <RailItem icon={Gavel} label="Regime" value={proposition.regime} />
            </div>

            <div className="my-4 h-px bg-gray-100" />

            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
              Ações rápidas
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {proposition.url && (
                <a
                  href={proposition.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                >
                  <ArrowUpRight size={12} /> Câmara
                </a>
              )}
              {proposition.fullPropositionUrl && (
                <a
                  href={proposition.fullPropositionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Link2 size={12} /> Inteiro teor
                </a>
              )}
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
              >
                <Share2 size={12} /> {copied ? "Copiado!" : "Compartilhar"}
              </button>
              {canAccessTramitacoes(planLevel) && (
                <button
                  type="button"
                  onClick={triggerIA}
                  className="col-span-2 inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-2 py-2 text-[11px] font-medium text-white hover:from-indigo-600 hover:to-purple-700"
                >
                  <Sparkles size={12} /> Usar IA
                </button>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

/* ────────── Helpers ────────── */

function humanizeNextStep(step: Rite["nextStep"]): string {
  const map: Record<Rite["nextStep"], string> = {
    "aguardando-despacho": "Aguardando despacho",
    "aguardando-designacao-relator": "Aguardando designação de relator",
    "aguardando-parecer": "Aguardando parecer",
    "aguardando-pauta": "Aguardando inclusão em pauta",
    "aguardando-votacao": "Aguardando votação",
    "aguardando-redacao-final": "Aguardando redação final",
    "aguardando-remessa": "Aguardando remessa",
    concluida: "Tramitação concluída",
    indefinido: "Próximo passo indefinido",
  };
  return map[step];
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
  emptyVariant = "partial",
  emptyMessage,
  quality,
}: {
  icon: typeof Tag;
  label: string;
  value?: string | null;
  hint?: string;
  emptyVariant?: "partial" | "no-occurrence";
  emptyMessage?: string;
  quality?: QualityFlag;
}) {
  return (
    <Card className="border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
        {quality && <span className="ml-auto"><QualityBadge flag={quality} hideLabel /></span>}
      </div>
      {value ? (
        <>
          <p className="mt-2 line-clamp-2 text-sm font-semibold text-gray-900" title={value}>
            {value}
          </p>
          {hint && <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-500">{hint}</p>}
        </>
      ) : (
        <p className="mt-2 text-xs italic text-gray-400">
          {emptyMessage ??
            (emptyVariant === "no-occurrence"
              ? "Sem registro integrado"
              : "Cobertura parcial deste bloco")}
        </p>
      )}
    </Card>
  );
}

function KV({
  label,
  value,
  fallback = "—",
}: {
  label: string;
  value?: string | null;
  fallback?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-sm",
          value ? "font-medium text-gray-800" : "italic text-gray-400"
        )}
      >
        {value || fallback}
      </p>
    </div>
  );
}

function RailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Tag;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <p
          className={cn(
            "mt-0.5 truncate text-xs",
            value ? "font-medium text-gray-800" : "italic text-gray-400"
          )}
          title={value || undefined}
        >
          {value || "Não identificado"}
        </p>
      </div>
    </div>
  );
}
