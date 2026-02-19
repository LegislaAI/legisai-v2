"use client";

import {
  ArrowRight,
  Briefcase,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  FileText,
  Mic2,
  Receipt,
  Scale,
  Tag,
  TrendingUp,
  User,
  Vote,
  Wallet,
} from "lucide-react";
import type { DeputadoPageData } from "./useDeputadoPage";
import { SkeletonLoader } from "./SkeletonLoader";
import { cn } from "@/lib/utils";

const CARD_3D =
  "relative overflow-hidden rounded-2xl border-0 bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_40px_-8px_rgba(116,156,91,0.18),0_2px_8px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-[2px]";

const GLASS_HEADER =
  "bg-gradient-to-r from-[#749c5b]/[0.04] via-white/80 to-white backdrop-blur-sm";

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  accentColor = "#749c5b",
}: {
  icon: React.ComponentType<{ className?: string }>;
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
}: {
  label: string;
  onClick: () => void;
  accentColor?: string;
}) {
  return (
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
}

function MiniKPI({
  value,
  label,
  icon: Icon,
  color,
}: {
  value: string | number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-gray-50/80 p-3 transition-all hover:bg-gray-100/60">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${color}15` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-extrabold leading-tight" style={{ color }}>
          {value}
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          {label}
        </p>
      </div>
    </div>
  );
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
    votacoesIndicadores,
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

  const temasTop = temas?.temas?.slice(0, 3) ?? [];

  const usedParlamentary = finance?.usedParliamentaryQuota ?? 0;
  const unusedParlamentary = finance?.unusedParliamentaryQuota ?? 0;

  return (
    <div className="space-y-6">
      {/* ═══════ Contadores Globais ═══════ */}
      {loadingContadores ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonLoader key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : contadores ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              value: contadores.eventos,
              label: "Eventos",
              icon: Calendar,
              gradient: "linear-gradient(90deg, #749c5b, #4E9F3D)",
              iconBg: "#749c5b18",
              textColor: "#749c5b",
            },
            {
              value: contadores.proposicoes,
              label: "Proposições",
              icon: FileText,
              gradient: "linear-gradient(90deg, #4E9F3D, #2d5a3d)",
              iconBg: "#4E9F3D18",
              textColor: "#4E9F3D",
            },
            {
              value: contadores.discursos,
              label: "Discursos",
              icon: Mic2,
              gradient: "linear-gradient(90deg, #7c3aed, #8b5cf6)",
              iconBg: "#7c3aed18",
              textColor: "#7c3aed",
            },
            {
              value: contadores.votacoes,
              label: "Votações",
              icon: Vote,
              gradient: "linear-gradient(90deg, #d97706, #f59e0b)",
              iconBg: "#d9770618",
              textColor: "#d97706",
            },
          ].map((kpi) => (
            <div key={kpi.label} className={`${CARD_3D} group cursor-default p-0`}>
              <div className="relative p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
                    style={{ background: kpi.iconBg }}
                  >
                    <kpi.icon className="h-5 w-5" style={{ color: kpi.textColor }} />
                  </div>
                </div>
                <p
                  className="text-3xl font-extrabold tracking-tight"
                  style={{ color: kpi.textColor }}
                >
                  {kpi.value}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  {kpi.label}
                </p>
                <div
                  className="absolute bottom-0 left-0 h-1 w-full"
                  style={{ background: kpi.gradient }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* ═══════ Grid de Atalhos — 1 por aba ═══════ */}
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
              <div className="flex flex-1 flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <MiniKPI
                    value={agendaResumo.countHoje}
                    label="Eventos hoje"
                    icon={CalendarCheck}
                    color="#749c5b"
                  />
                  <MiniKPI
                    value={agendaResumo.countProximos7Dias}
                    label="Próx. 7 dias"
                    icon={CalendarDays}
                    color="#4E9F3D"
                  />
                </div>
                <NavigateButton
                  label="Ver agenda completa"
                  onClick={() => onNavigateTab("agenda")}
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
              <div className="flex flex-1 flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <MiniKPI
                    value={proposicoesResumo?.total ?? "—"}
                    label="Proposições"
                    icon={FileText}
                    color="#749c5b"
                  />
                  <MiniKPI
                    value={
                      votacoesIndicadores?.alinhamentoPct != null
                        ? `${votacoesIndicadores.alinhamentoPct.toFixed(0)}%`
                        : "—"
                    }
                    label="Alinhamento"
                    icon={TrendingUp}
                    color={
                      votacoesIndicadores?.alinhamentoPct != null &&
                      votacoesIndicadores.alinhamentoPct >= 70
                        ? "#059669"
                        : votacoesIndicadores?.alinhamentoPct != null &&
                            votacoesIndicadores.alinhamentoPct >= 40
                          ? "#d97706"
                          : "#ef4444"
                    }
                  />
                </div>

                {temasTop.length > 0 && (
                  <div className="rounded-xl bg-gray-50/80 p-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Principais temas
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {temasTop.map((t, i) => (
                        <span
                          key={t.cod_tema}
                          className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                          style={{
                            background: `${["#749c5b", "#4E9F3D", "#2d5a3d"][i]}15`,
                            color: ["#749c5b", "#4E9F3D", "#2d5a3d"][i],
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
              <div className="flex flex-1 flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <MiniKPI
                    value={formatBRL(usedParlamentary)}
                    label="Cota Parl."
                    icon={Wallet}
                    color="#749c5b"
                  />
                  <MiniKPI
                    value={ceapResumo ? formatBRL(ceapResumo.total) : "—"}
                    label="Total CEAP"
                    icon={Receipt}
                    color="#d97706"
                  />
                </div>

                {usedParlamentary + unusedParlamentary > 0 && (
                  <div className="rounded-xl bg-gray-50/80 p-3">
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
                        style={{
                          width: `${Math.min(100, Math.round((usedParlamentary / (usedParlamentary + unusedParlamentary)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <NavigateButton
                  label="Ver despesas detalhadas"
                  onClick={() => onNavigateTab("despesas-financeiro")}
                  accentColor="#d97706"
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
              <div className="flex flex-1 flex-col gap-3">
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
                  />
                  <MiniKPI
                    value={discursosResumo?.total ?? profile?.speeches ?? "—"}
                    label="Discursos"
                    icon={Mic2}
                    color="#7c3aed"
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
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ────── PERFIL — Full Width ────── */}
      <div className={cn(CARD_3D, "flex flex-col")}>
        <div className={cn(GLASS_HEADER, "px-6 pt-5 pb-4")}>
          <SectionTitle
            icon={Briefcase}
            title="Perfil"
            subtitle="Dados pessoais, biografia e redes sociais"
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
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
