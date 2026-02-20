"use client";

import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  FileText,
  Info,
  Mic2,
  Receipt,
  Scale,
  Sparkles,
  User,
  Vote,
  Wallet,
} from "lucide-react";
import type { DeputadoPageData } from "./useDeputadoPage";
import { SkeletonLoader } from "./SkeletonLoader";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/v2/components/ui/tooltip";

const CARD_3D =
  "relative overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-[#749c5b]/20 hover:shadow-[0_8px_32px_-8px_rgba(116,156,91,0.2)] hover:-translate-y-0.5";

const GLASS_HEADER =
  "bg-gradient-to-r from-[#749c5b]/[0.04] via-white to-white/95 backdrop-blur-sm";

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  accentColor = "#749c5b",
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  subtitle?: string;
  accentColor?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}0a)`,
        }}
      >
        <Icon className="h-5 w-5" style={{ color: accentColor }} />
      </div>
      <div>
        <h3 className="text-[15px] font-bold tracking-tight text-gray-900">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[11px] text-gray-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function NavigateButton({
  label,
  onClick,
  accentColor = "#749c5b",
  tooltip,
}: {
  label: string;
  onClick: () => void;
  accentColor?: string;
  tooltip?: string;
}) {
  const btn = (
    <button
      onClick={onClick}
      className="group mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{
        borderColor: `${accentColor}30`,
        background: `${accentColor}08`,
        color: accentColor,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = accentColor;
        e.currentTarget.style.color = "#fff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `${accentColor}08`;
        e.currentTarget.style.color = accentColor;
      }}
    >
      {label}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </button>
  );
  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent side="top" className="border-gray-200 bg-white text-xs shadow-lg">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }
  return btn;
}

function MiniKPI({
  value,
  label,
  icon: Icon,
  color,
  tooltip,
}: {
  value: string | number;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  tooltip?: string;
}) {
  const content = (
    <div className="flex items-center gap-3 rounded-xl bg-gray-50/60 p-3 transition-all hover:bg-gray-100/50">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${color}12` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-extrabold leading-tight" style={{ color }}>
          {value}
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          {label}
        </p>
      </div>
      {tooltip && (
        <Info className="h-3.5 w-3.5 shrink-0 text-gray-300" />
      )}
    </div>
  );
  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">{content}</div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px] border-gray-200 bg-white text-xs shadow-lg">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }
  return content;
}

function formatBRL(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function TabOverview({
  data,
  onNavigateTab,
}: {
  data: DeputadoPageData;
  onNavigateTab: (tabId: string) => void;
}) {
  const {
    politician,
    contadores,
    loadingContadores,
    agendaResumo,
    loadingAgenda,
    proposicoesResumo,
    loadingVotacoes,
    temas,
    loadingTemas,
    presenca,
    loadingPresenca,
    discursosResumo,
    loadingDiscursos,
    finance,
    ceapResumo,
    loadingCeapResumo,
    profile,
    profissoes,
    loadingBio,
    socialLinks,
    selectedYear,
  } = data;

  if (!politician) return null;

  const presencaRate =
    presenca && presenca.presencas + presenca.ausencias > 0
      ? (presenca.presencas / (presenca.presencas + presenca.ausencias)) * 100
      : null;

  const temasTop = temas?.temas?.slice(0, 4) ?? [];
  const totalContadores = contadores
    ? contadores.eventos + contadores.proposicoes + contadores.discursos + contadores.votacoes
    : 0;
  const activityBreakdown = contadores
    ? [
        { label: "Eventos", value: contadores.eventos, color: "#749c5b" },
        { label: "Proposições", value: contadores.proposicoes, color: "#4E9F3D" },
        { label: "Discursos", value: contadores.discursos, color: "#2d5a3d" },
        { label: "Votações", value: contadores.votacoes, color: "#8ab86e" },
      ]
    : [];

  const usedParlamentary = finance?.usedParliamentaryQuota ?? 0;
  const unusedParlamentary = finance?.unusedParliamentaryQuota ?? 0;
  const cotaPct =
    usedParlamentary + unusedParlamentary > 0
      ? (usedParlamentary / (usedParlamentary + unusedParlamentary)) * 100
      : 0;

  const kpiItems = contadores
    ? [
        {
          value: contadores.eventos,
          label: "Eventos",
          icon: Calendar,
          gradient: "linear-gradient(135deg, #749c5b, #4E9F3D)",
          iconBg: "#749c5b18",
          textColor: "#749c5b",
          tooltip: "Participações em sessões plenárias, reuniões de comissões e outros eventos oficiais.",
        },
        {
          value: contadores.proposicoes,
          label: "Proposições",
          icon: FileText,
          gradient: "linear-gradient(135deg, #4E9F3D, #2d5a3d)",
          iconBg: "#4E9F3D18",
          textColor: "#4E9F3D",
          tooltip: "Projetos de lei, PECs e outras proposições de autoria ou coautoria do deputado.",
        },
        {
          value: contadores.discursos,
          label: "Discursos",
          icon: Mic2,
          gradient: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
          iconBg: "#7c3aed18",
          textColor: "#7c3aed",
          tooltip: "Pronunciamentos e falas registradas em plenário e comissões.",
        },
        {
          value: contadores.votacoes,
          label: "Votações",
          icon: Vote,
          gradient: "linear-gradient(135deg, #d97706, #f59e0b)",
          iconBg: "#d9770618",
          textColor: "#d97706",
          tooltip: "Votos nominais em votações de proposições e matérias.",
        },
      ]
    : [];

  return (
    <TooltipProvider delayDuration={250}>
      <div className="space-y-8">
        {/* ═══════ Hero ═══════ */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#749c5b]/10 via-[#4E9F3D]/5 to-transparent px-6 py-8 text-left">
          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2 text-[#749c5b]">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Visão geral</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Atuação em números
            </h2>
            <p className="mt-2 max-w-xl text-sm text-gray-600">
              Resumo da atividade parlamentar. Passe o mouse nos indicadores para mais detalhes e use os atalhos para aprofundar em cada área.
            </p>
            {totalContadores > 0 && (
              <div className="mt-6 inline-flex items-baseline gap-2 rounded-xl bg-white/80 px-4 py-2 shadow-sm ring-1 ring-gray-100">
                <span className="text-3xl font-extrabold text-[#749c5b]">
                  {totalContadores.toLocaleString("pt-BR")}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  registros no período
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ═══════ Números em destaque ═══════ */}
        {loadingContadores ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonLoader key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : kpiItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {kpiItems.map((kpi) => (
              <Tooltip key={kpi.label}>
                <TooltipTrigger asChild>
                  <div className={cn(CARD_3D, "cursor-help p-0")}>
                    <div className="relative p-5">
                      <div className="mb-3 flex items-start justify-between">
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-xl"
                          style={{ background: kpi.iconBg }}
                        >
                          <kpi.icon className="h-5 w-5" style={{ color: kpi.textColor }} />
                        </div>
                        <Info className="h-4 w-4 text-gray-300" />
                      </div>
                      <p className="text-3xl font-extrabold tracking-tight" style={{ color: kpi.textColor }}>
                        {kpi.value.toLocaleString?.() ?? kpi.value}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                        {kpi.label}
                      </p>
                      <div
                        className="absolute bottom-0 left-0 h-1 w-full rounded-b-2xl"
                        style={{ background: kpi.gradient }}
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[260px] border-gray-200 bg-white text-xs shadow-lg">
                  {kpi.tooltip}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        ) : null}

        {/* ═══════ Distribuição da atuação ═══════ */}
        {contadores && totalContadores > 0 && (
          <div className={CARD_3D}>
            <div className={cn(GLASS_HEADER, "px-6 pt-5 pb-3")}>
              <div className="flex items-center gap-2">
                <SectionTitle
                  icon={BarChart3}
                  title="Distribuição da atuação"
                  subtitle={`${totalContadores.toLocaleString("pt-BR")} registros no total`}
                  accentColor="#749c5b"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-gray-300 hover:text-gray-500">
                      <Info className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[240px] border-gray-200 bg-white text-xs shadow-lg">
                    Proporção de cada tipo de atividade em relação ao total. Mostra onde o deputado mais atua.
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="space-y-4 px-6 pb-6">
              {activityBreakdown.map((item) => {
                const pct = totalContadores > 0 ? (item.value / totalContadores) * 100 : 0;
                return (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      <div className="cursor-help space-y-1.5 rounded-lg p-2 transition-colors hover:bg-gray-50/50">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-gray-700">{item.label}</span>
                          <span className="font-bold text-gray-900">
                            {item.value.toLocaleString("pt-BR")}{" "}
                            <span className="font-normal text-gray-400">({pct.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(pct, 0.5)}%`,
                              background: item.color,
                            }}
                          />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px] border-gray-200 bg-white text-xs shadow-lg">
                      <strong>{item.label}:</strong> {item.value.toLocaleString("pt-BR")} de {totalContadores.toLocaleString("pt-BR")} ({pct.toFixed(1)}% do total).
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        )}

      {/* ═══════ Resumo por área — 2x2 ═══════ */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ────── AGENDA ────── */}
        <div className={cn(CARD_3D, "flex flex-col")}>
          <div className={cn(GLASS_HEADER, "px-6 pt-5 pb-4")}>
            <SectionTitle
              icon={CalendarDays}
              title="Agenda"
              subtitle="Eventos e compromissos parlamentares"
            />
          </div>
          <div className="flex flex-1 flex-col px-6 pb-5">
            {loadingAgenda ? (
              <div className="space-y-3">
                <SkeletonLoader className="h-12 w-full rounded-xl" />
                <SkeletonLoader className="h-12 w-full rounded-xl" />
              </div>
            ) : agendaResumo ? (
              <div className="flex flex-1 flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <MiniKPI
                    value={agendaResumo.countHoje}
                    label="Eventos hoje"
                    icon={CalendarCheck}
                    color="#749c5b"
                    tooltip="Quantidade de eventos (sessões, comissões) agendados para hoje."
                  />
                  <MiniKPI
                    value={agendaResumo.countProximos7Dias}
                    label="Próx. 7 dias"
                    icon={CalendarDays}
                    color="#4E9F3D"
                    tooltip="Eventos nos próximos 7 dias. Veja a aba Agenda para o calendário completo."
                  />
                </div>
                <NavigateButton
                  label="Ver agenda completa"
                  onClick={() => onNavigateTab("agenda")}
                  tooltip="Abre a aba Agenda com calendário e lista de eventos."
                />
              </div>
            ) : (
              <div className="flex flex-1 flex-col">
                <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
                  <Calendar className="mb-2 h-8 w-8 text-gray-200" />
                  <p className="text-sm text-gray-400">
                    Sem dados de agenda disponíveis.
                  </p>
                </div>
                <NavigateButton
                  label="Ver agenda"
                  onClick={() => onNavigateTab("agenda")}
                />
              </div>
            )}
          </div>
        </div>

        {/* ────── POSICIONAMENTO ────── */}
        <div className={cn(CARD_3D, "flex flex-col")}>
          <div className={cn(GLASS_HEADER, "px-6 pt-5 pb-4")}>
            <SectionTitle
              icon={Scale}
              title="Posicionamento"
              subtitle="Proposições, votações e temas de atuação"
              accentColor="#2563eb"
            />
          </div>
          <div className="flex flex-1 flex-col px-6 pb-5">
            {loadingVotacoes || loadingTemas ? (
              <div className="space-y-3">
                <SkeletonLoader className="h-12 w-full rounded-xl" />
                <SkeletonLoader className="h-12 w-full rounded-xl" />
              </div>
            ) : (
              <div className="flex flex-1 flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <MiniKPI
                    value={proposicoesResumo?.total ?? "—"}
                    label="Proposições"
                    icon={FileText}
                    color="#749c5b"
                    tooltip="Total de proposições (autoria e coautoria) no período. Gráficos e lista na aba Posicionamento."
                  />
                </div>

                {temasTop.length > 0 && (
                  <div className="rounded-xl bg-gray-50/60 p-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Principais temas
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {temasTop.map((t, i) => (
                        <span
                          key={t.cod_tema}
                          className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                          style={{
                            background: `${["#749c5b", "#4E9F3D", "#2d5a3d", "#8ab86e"][i % 4]}15`,
                            color: ["#749c5b", "#4E9F3D", "#2d5a3d", "#8ab86e"][i % 4],
                          }}
                        >
                          {t.tema_nome.length > 25
                            ? t.tema_nome.slice(0, 23) + "…"
                            : t.tema_nome}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <NavigateButton
                  label="Ver posicionamento completo"
                  onClick={() => onNavigateTab("posicionamento")}
                  accentColor="#2563eb"
                  tooltip="Abre a aba Posicionamento com gráficos e lista de proposições."
                />
              </div>
            )}
          </div>
        </div>

        {/* ────── DESPESAS E FINANCEIRO ────── */}
        <div className={cn(CARD_3D, "flex flex-col")}>
          <div className={cn(GLASS_HEADER, "px-6 pt-5 pb-4")}>
            <SectionTitle
              icon={Receipt}
              title="Despesas e Financeiro"
              subtitle={`Gastos e cotas parlamentares (${selectedYear})`}
              accentColor="#d97706"
            />
          </div>
          <div className="flex flex-1 flex-col px-6 pb-5">
            {loadingCeapResumo ? (
              <div className="space-y-3">
                <SkeletonLoader className="h-12 w-full rounded-xl" />
                <SkeletonLoader className="h-12 w-full rounded-xl" />
              </div>
            ) : (
              <div className="flex flex-1 flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <MiniKPI
                    value={formatBRL(usedParlamentary)}
                    label="Cota Parl."
                    icon={Wallet}
                    color="#749c5b"
                    tooltip="Valor utilizado da cota para exercício da atividade parlamentar (indemnização)."
                  />
                  <MiniKPI
                    value={ceapResumo ? formatBRL(ceapResumo.total) : "—"}
                    label="Total CEAP"
                    icon={Receipt}
                    color="#d97706"
                    tooltip="Total de despesas com a Cota para Exercício da Atividade Parlamentar no ano selecionado."
                  />
                </div>

                {usedParlamentary + unusedParlamentary > 0 && (
                  <div className="rounded-xl bg-gray-50/60 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Utilização da cota
                      </p>
                      <span className="text-xs font-extrabold text-[#749c5b]">
                        {Math.round(
                          (usedParlamentary /
                            (usedParlamentary + unusedParlamentary)) *
                            100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#749c5b] to-[#4E9F3D] transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.round(cotaPct))}%` }}
                      />
                    </div>
                  </div>
                )}

                <NavigateButton
                  label="Ver despesas detalhadas"
                  onClick={() => onNavigateTab("despesas-financeiro")}
                  accentColor="#d97706"
                  tooltip="Abre a aba Despesas e Financeiro com detalhamento e lista de despesas."
                />
              </div>
            )}
          </div>
        </div>

        {/* ────── ATUAÇÃO PARLAMENTAR ────── */}
        <div className={cn(CARD_3D, "flex flex-col")}>
          <div className={cn(GLASS_HEADER, "px-6 pt-5 pb-4")}>
            <SectionTitle
              icon={User}
              title="Atuação Parlamentar"
              subtitle="Presença, discursos e participações"
              accentColor="#059669"
            />
          </div>
          <div className="flex flex-1 flex-col px-6 pb-5">
            {loadingPresenca || loadingDiscursos ? (
              <div className="space-y-3">
                <SkeletonLoader className="h-12 w-full rounded-xl" />
                <SkeletonLoader className="h-12 w-full rounded-xl" />
              </div>
            ) : (
              <div className="flex flex-1 flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <MiniKPI
                    value={
                      presencaRate != null
                        ? `${presencaRate.toFixed(0)}%`
                        : "—"
                    }
                    label="Presença"
                    icon={CheckCircle2}
                    color="#059669"
                    tooltip="Taxa de presença em sessões deliberativas e reuniões de comissões no período."
                  />
                  <MiniKPI
                    value={discursosResumo?.total ?? profile?.speeches ?? "—"}
                    label="Discursos"
                    icon={Mic2}
                    color="#7c3aed"
                    tooltip="Total de pronunciamentos e discursos registrados em plenário e comissões."
                  />
                </div>

                {presenca &&
                  presenca.presencas + presenca.ausencias > 0 && (
                    <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-50/30 p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-emerald-700">
                          {presenca.presencas} presenças
                        </span>
                        <span className="font-semibold text-red-500">
                          {presenca.ausencias} ausências
                        </span>
                      </div>
                      <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-red-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                          style={{
                            width: `${presencaRate ?? 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                <NavigateButton
                  label="Ver atuação completa"
                  onClick={() => onNavigateTab("atuacao")}
                  accentColor="#059669"
                  tooltip="Abre a aba Atuação com presença, discursos e votações."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════ Resumo do perfil ═══════ */}
      <div className={cn(CARD_3D, "flex flex-col")}>
        <div className={cn(GLASS_HEADER, "px-6 pt-5 pb-4")}>
          <SectionTitle
            icon={Briefcase}
            title="Perfil em resumo"
            subtitle="Dados pessoais, profissões e redes — detalhes na aba Perfil"
            accentColor="#2d5a3d"
          />
        </div>
        <div className="flex flex-1 flex-col px-6 pb-5">
          {loadingBio ? (
            <div className="space-y-3">
              <SkeletonLoader className="h-10 w-full rounded-xl" />
              <SkeletonLoader className="h-10 w-3/4 rounded-xl" />
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {politician.fullName &&
                  politician.fullName.trim() !== politician.name?.trim() && (
                    <div className="rounded-xl bg-gray-50/80 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Nome civil
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-gray-800">
                        {politician.fullName}
                      </p>
                    </div>
                  )}
                {politician.birthDate && (
                  <div className="rounded-xl bg-gray-50/80 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Nascimento
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-gray-800">
                      {new Date(politician.birthDate).toLocaleDateString(
                        "pt-BR",
                        { dateStyle: "long" },
                      )}
                    </p>
                  </div>
                )}
                {politician.placeOfBirth && (
                  <div className="rounded-xl bg-gray-50/80 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Naturalidade
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-gray-800">
                      {politician.placeOfBirth}
                    </p>
                  </div>
                )}
              </div>

              {profissoes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profissoes.slice(0, 4).map((p, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#2d5a3d]/10 to-[#2d5a3d]/5 px-3 py-1.5 text-xs font-bold text-[#2d5a3d]"
                    >
                      {p.titulo}
                    </span>
                  ))}
                  {profissoes.length > 4 && (
                    <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-500">
                      +{profissoes.length - 4}
                    </span>
                  )}
                </div>
              )}

              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((s) => (
                    <a
                      key={s.label}
                      href={s.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 shadow-sm transition-all hover:border-[#2d5a3d]/30 hover:bg-[#2d5a3d]/5 hover:text-[#2d5a3d]"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              )}

              <NavigateButton
                label="Ver perfil completo"
                onClick={() => onNavigateTab("perfil")}
                accentColor="#2d5a3d"
                tooltip="Abre a aba Perfil com biografia, contato e histórico."
              />
            </div>
          )}
        </div>
      </div>
      </div>
    </TooltipProvider>
  );
}
