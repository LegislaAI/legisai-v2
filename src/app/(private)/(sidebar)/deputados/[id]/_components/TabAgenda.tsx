"use client";

import { CustomPagination } from "@/components/ui/CustomPagination";
import { cn } from "@/lib/utils";
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isToday as isDateToday,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowUpRight,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Columns3,
  LayoutGrid,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SkeletonLoader } from "./SkeletonLoader";
import type { EventoAgenda } from "./types";
import type { DeputadoPageData } from "./useDeputadoPage";

const CARD_3D =
  "relative overflow-hidden rounded-2xl border-0 bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_40px_-8px_rgba(116,156,91,0.18),0_2px_8px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-[2px]";

const GLASS_HEADER =
  "bg-gradient-to-r from-[#749c5b]/[0.04] via-white/80 to-white backdrop-blur-sm";

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

type ViewMode = "month" | "week";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function groupEventsByDateKey(
  events: EventoAgenda[],
): Record<string, EventoAgenda[]> {
  const map: Record<string, EventoAgenda[]> = {};
  for (const ev of events) {
    const key = ev.dt_inicio.slice(0, 10);
    (map[key] ??= []).push(ev);
  }
  for (const key of Object.keys(map)) {
    map[key].sort((a, b) => a.dt_inicio.localeCompare(b.dt_inicio));
  }
  return map;
}

function fmtTime(dt: string) {
  return new Date(dt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Define link para detalhe do evento: plenário (solene/deliberativa) ou comissões. */
function getEventDetailHref(ev: EventoAgenda): string {
  const tipo = (ev.descricao_tipo_evento || ev.cod_tipo_evento || "").toLowerCase();
  if (tipo.includes("solene")) return `/plenario/solene/${ev.id}`;
  if (tipo.includes("reunião") || tipo.includes("comissão")) return `/comissoes/${ev.id}`;
  if (tipo.includes("sessão") || tipo.includes("plenária") || tipo.includes("plenário")) return `/plenario/deliberativa/${ev.id}`;
  return `/plenario/deliberativa/${ev.id}`;
}

function getEventColor(tipo: string) {
  const t = (tipo || "").toLowerCase();
  if (t.includes("sessão") || t.includes("plenária"))
    return {
      bg: "bg-[#749c5b]/10",
      text: "text-[#749c5b]",
      dot: "bg-[#749c5b]",
    };
  if (t.includes("reunião") || t.includes("comissão"))
    return {
      bg: "bg-[#4E9F3D]/10",
      text: "text-[#4E9F3D]",
      dot: "bg-[#4E9F3D]",
    };
  if (t.includes("audiência"))
    return {
      bg: "bg-[#2d5a3d]/10",
      text: "text-[#2d5a3d]",
      dot: "bg-[#2d5a3d]",
    };
  if (t.includes("seminário") || t.includes("evento"))
    return { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" };
  return { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" };
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  badge,
  accentColor = "#749c5b",
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  subtitle?: string;
  badge?: string;
  accentColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
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
      {badge && (
        <span
          className="rounded-full px-3 py-1.5 text-[11px] font-bold"
          style={{ background: `${accentColor}15`, color: accentColor }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function MiniEventCard({ ev }: { ev: EventoAgenda }) {
  const tipo = ev.descricao_tipo_evento || ev.cod_tipo_evento || "Evento";
  const orgao = ev.sigla_orgao || ev.nome_orgao || "—";
  const color = getEventColor(tipo);
  const local = ev.local_evento?.trim() || null;

  return (
    <Link
      href={getEventDetailHref(ev)}
      className={cn(
        "group flex flex-col gap-2.5 rounded-xl border border-gray-100 bg-white p-4 transition-all duration-200",
        "hover:border-[#749c5b]/30 hover:bg-[#749c5b]/5 hover:shadow-sm",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold",
            color.bg,
            color.text,
          )}
        >
          <Clock className="h-3 w-3" />
          {fmtTime(ev.dt_inicio)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
          <Building2 className="h-3 w-3" />
          {orgao}
        </span>
      </div>
      <p className="text-sm font-semibold leading-snug text-gray-900">
        {tipo}
      </p>
      {local && (
        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="max-w-[250px] truncate">{local}</span>
        </span>
      )}
      <span className="inline-flex items-center gap-1 self-end text-xs font-medium text-[#749c5b] opacity-0 transition-opacity group-hover:opacity-100">
        Ver detalhes
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

function formatEventDate(dt: string) {
  const d = new Date(dt);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  const dateStr = d.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const timeStr = d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { dateStr: isToday ? "Hoje" : dateStr, timeStr, isToday };
}

function EventListCard({ ev }: { ev: EventoAgenda }) {
  const { dateStr, timeStr, isToday } = formatEventDate(ev.dt_inicio);
  const tipo = ev.descricao_tipo_evento || ev.cod_tipo_evento || "—";
  const orgao = ev.sigla_orgao || ev.nome_orgao || "—";
  const local = ev.local_evento?.trim() || null;

  return (
    <Link
      href={getEventDetailHref(ev)}
      className={cn(
        "group flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 transition-all duration-200",
        "hover:border-[#749c5b]/30 hover:bg-[#749c5b]/5 hover:shadow-sm",
        "sm:flex-row sm:items-center sm:justify-between",
      )}
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold",
              isToday
                ? "bg-[#749c5b]/15 text-[#749c5b]"
                : "bg-gray-100 text-gray-700",
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            {dateStr}
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            <Clock className="h-3 w-3" />
            {timeStr}
          </span>
        </div>
        <p className="font-medium text-gray-900">{tipo}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            {orgao}
          </span>
          {local && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="max-w-[200px] truncate" title={local}>
                {local}
              </span>
            </span>
          )}
        </div>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[#749c5b] group-hover:underline">
        Ver pauta
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  );
}

export function TabAgenda({ data }: { data: DeputadoPageData }) {
  const {
    agendaResumo,
    loadingAgenda,
    calendarDate,
    setCalendarDate,
    calendarEvents,
    loadingCalendarEvents,
    pastEvents,
    pastEventsPage,
    setPastEventsPage,
    pastEventsPages,
    pastEventsTotal,
    loadingPastEvents,
    upcomingEvents,
    upcomingEventsPage,
    setUpcomingEventsPage,
    upcomingEventsPages,
    upcomingEventsTotal,
    loadingUpcomingEvents,
  } = data;

  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedDayEventsPage, setSelectedDayEventsPage] = useState(1);

  const EVENTS_PER_DAY_PAGE = 3;

  const eventsByDate = useMemo(
    () => groupEventsByDateKey(calendarEvents),
    [calendarEvents],
  );

  const monthDays = useMemo(() => {
    const mStart = startOfMonth(calendarDate);
    const mEnd = endOfMonth(calendarDate);
    const calStart = startOfWeek(mStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(mEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [calendarDate]);

  const weekDays = useMemo(() => {
    const ref = selectedDate || calendarDate;
    const wStart = startOfWeek(ref, { weekStartsOn: 1 });
    const wEnd = endOfWeek(ref, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: wStart, end: wEnd });
  }, [selectedDate, calendarDate]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return eventsByDate[key] ?? [];
  }, [selectedDate, eventsByDate]);

  const selectedDayEventsPages = Math.ceil(selectedDayEvents.length / EVENTS_PER_DAY_PAGE) || 1;
  const selectedDayEventsPaginated = useMemo(() => {
    const start = (selectedDayEventsPage - 1) * EVENTS_PER_DAY_PAGE;
    return selectedDayEvents.slice(start, start + EVENTS_PER_DAY_PAGE);
  }, [selectedDayEvents, selectedDayEventsPage]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setSelectedDayEventsPage(1);
    if (!isSameMonth(day, calendarDate)) setCalendarDate(day);
  };

  useEffect(() => {
    setSelectedDayEventsPage(1);
  }, [selectedDate]);

  const goToPrevMonth = () => setCalendarDate(subMonths(calendarDate, 1));
  const goToNextMonth = () => setCalendarDate(addMonths(calendarDate, 1));

  const goToPrevWeek = () => {
    const newDate = subWeeks(selectedDate || calendarDate, 1);
    setSelectedDate(newDate);
    if (!isSameMonth(newDate, calendarDate)) setCalendarDate(newDate);
  };
  const goToNextWeek = () => {
    const newDate = addWeeks(selectedDate || calendarDate, 1);
    setSelectedDate(newDate);
    if (!isSameMonth(newDate, calendarDate)) setCalendarDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCalendarDate(today);
    setSelectedDate(today);
    setSelectedDayEventsPage(1);
  };

  const totalMonthEvents = calendarEvents.length;

  return (
    <div className="space-y-6">
      {/* ═══════ KPI Cards ═══════ */}
      {loadingAgenda ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <SkeletonLoader className="h-24 rounded-2xl" />
          <SkeletonLoader className="h-24 rounded-2xl" />
          <SkeletonLoader className="h-24 rounded-2xl" />
        </div>
      ) : agendaResumo ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <div className={cn(CARD_3D, "p-0")}>
            <div className="relative p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#749c5b]/10 shadow-sm">
                  <CalendarCheck className="h-5 w-5 text-[#749c5b]" />
                </div>
              </div>
              <p className="text-3xl font-extrabold tracking-tight text-[#749c5b]">
                {agendaResumo.countHoje}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Eventos hoje
              </p>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[#749c5b] to-[#4E9F3D]" />
            </div>
          </div>

          <div className={cn(CARD_3D, "p-0")}>
            <div className="relative p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4E9F3D]/10 shadow-sm">
                  <CalendarDays className="h-5 w-5 text-[#4E9F3D]" />
                </div>
              </div>
              <p className="text-3xl font-extrabold tracking-tight text-[#4E9F3D]">
                {agendaResumo.countProximos7Dias}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Próximos 7 dias
              </p>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[#4E9F3D] to-[#2d5a3d]" />
            </div>
          </div>

          <div className={cn(CARD_3D, "col-span-2 p-0 lg:col-span-1")}>
            <div className="relative p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2d5a3d]/10 shadow-sm">
                  <Calendar className="h-5 w-5 text-[#2d5a3d]" />
                </div>
              </div>
              <p className="text-3xl font-extrabold tracking-tight text-[#2d5a3d]">
                {totalMonthEvents}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Este mês
              </p>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[#2d5a3d] to-[#1B3B2B]" />
            </div>
          </div>
        </div>
      ) : null}

      {/* ═══════ Calendar + Selected Day Events — Side by Side ═══════ */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calendar Card */}
        <div className={CARD_3D}>
          <div className={cn(GLASS_HEADER, "px-6 pt-5 pb-4")}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SectionTitle
                icon={CalendarDays}
                title="Calendário de Eventos"
                subtitle="Histórico e agenda de participações"
              />
              <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
                {(
                  [
                    { mode: "month" as const, icon: LayoutGrid, label: "Mensal" },
                    { mode: "week" as const, icon: Columns3, label: "Semanal" },
                  ] as const
                ).map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all",
                      viewMode === mode
                        ? "bg-white text-[#749c5b] shadow-sm"
                        : "text-gray-500 hover:text-gray-700",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3">
            <div className="flex items-center gap-2">
              <button
                onClick={viewMode === "month" ? goToPrevMonth : goToPrevWeek}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-all hover:border-[#749c5b]/30 hover:bg-[#749c5b]/5 hover:text-[#749c5b]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={viewMode === "month" ? goToNextMonth : goToNextWeek}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-all hover:border-[#749c5b]/30 hover:bg-[#749c5b]/5 hover:text-[#749c5b]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <h4 className="text-sm font-bold capitalize text-gray-900">
              {viewMode === "month"
                ? format(calendarDate, "MMMM 'de' yyyy", { locale: ptBR })
                : `${format(weekDays[0], "dd MMM", { locale: ptBR })} — ${format(weekDays[6], "dd MMM yyyy", { locale: ptBR })}`}
            </h4>
            <button
              onClick={goToToday}
              className="rounded-lg border border-[#749c5b]/20 bg-[#749c5b]/5 px-3 py-1.5 text-xs font-bold text-[#749c5b] transition-all hover:bg-[#749c5b]/10"
            >
              Hoje
            </button>
          </div>

          {/* Calendar Body */}
          <div className="p-4">
            {loadingCalendarEvents ? (
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, i) => (
                  <SkeletonLoader key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : viewMode === "month" ? (
              <div>
                <div className="mb-1 grid grid-cols-7 gap-1">
                  {WEEKDAY_LABELS.map((d) => (
                    <div
                      key={d}
                      className="py-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {monthDays.map((day) => {
                    const key = format(day, "yyyy-MM-dd");
                    const dayEvents = eventsByDate[key] ?? [];
                    const isCurrentMonth = isSameMonth(day, calendarDate);
                    const today = isDateToday(day);
                    const isSelected = selectedDate
                      ? isSameDay(day, selectedDate)
                      : false;
                    const hasEvents = dayEvents.length > 0;

                    return (
                      <button
                        key={key}
                        onClick={() => handleDayClick(day)}
                        className={cn(
                          "group relative flex min-h-[52px] flex-col items-center rounded-lg p-1.5 transition-all duration-150",
                          isCurrentMonth
                            ? "hover:bg-gray-50"
                            : "opacity-40 hover:opacity-60",
                          isSelected &&
                            "bg-[#749c5b]/10 ring-2 ring-[#749c5b]/40 hover:bg-[#749c5b]/15",
                          today && !isSelected && "bg-[#749c5b]/5",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                            today && "bg-[#749c5b] font-bold text-white",
                            isSelected && !today && "font-bold text-[#749c5b]",
                            !today && !isSelected && isCurrentMonth && "text-gray-700",
                          )}
                        >
                          {format(day, "d")}
                        </span>
                        {hasEvents && (
                          <div className="mt-0.5 flex items-center gap-0.5">
                            {dayEvents.slice(0, 3).map((ev, i) => {
                              const c = getEventColor(ev.descricao_tipo_evento || "");
                              return (
                                <div
                                  key={i}
                                  className={cn("h-1.5 w-1.5 rounded-full", c.dot)}
                                />
                              );
                            })}
                            {dayEvents.length > 3 && (
                              <span className="text-[8px] font-bold text-gray-400">
                                +{dayEvents.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="-mx-4 overflow-x-auto px-4">
                <div className="grid min-w-[500px] grid-cols-7 gap-1">
                  {weekDays.map((day) => {
                    const key = format(day, "yyyy-MM-dd");
                    const dayEvents = eventsByDate[key] ?? [];
                    const today = isDateToday(day);
                    const isSelected = selectedDate
                      ? isSameDay(day, selectedDate)
                      : false;

                    return (
                      <div
                        key={key}
                        className={cn(
                          "flex min-h-[200px] flex-col rounded-lg border transition-all",
                          today
                            ? "border-[#749c5b]/30 bg-[#749c5b]/[0.03]"
                            : "border-gray-100 bg-gray-50/30",
                          isSelected && "ring-2 ring-[#749c5b]/40",
                        )}
                      >
                        <button
                          onClick={() => handleDayClick(day)}
                          className="flex flex-col items-center border-b border-gray-100 px-1 py-2 transition-colors hover:bg-gray-50"
                        >
                          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                            {capitalize(format(day, "EEE", { locale: ptBR }))}
                          </span>
                          <span
                            className={cn(
                              "mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                              today ? "bg-[#749c5b] text-white" : "text-gray-700",
                            )}
                          >
                            {format(day, "d")}
                          </span>
                        </button>
                        <div className="flex-1 space-y-1 overflow-y-auto p-1.5">
                          {dayEvents.length > 0 ? (
                            dayEvents.map((ev) => {
                              const tipo =
                                ev.descricao_tipo_evento || ev.cod_tipo_evento || "Evento";
                              const c = getEventColor(tipo);
                              return (
                                <Link
                                  key={ev.id}
                                  href={getEventDetailHref(ev)}
                                  className={cn(
                                    "block rounded-md p-1.5 transition-all hover:shadow-sm",
                                    c.bg,
                                  )}
                                >
                                  <p className={cn("text-[9px] font-bold", c.text)}>
                                    {fmtTime(ev.dt_inicio)}
                                  </p>
                                  <p className="mt-0.5 line-clamp-2 text-[10px] font-semibold leading-tight text-gray-800">
                                    {tipo}
                                  </p>
                                </Link>
                              );
                            })
                          ) : (
                            <p className="py-4 text-center text-[10px] text-gray-300">—</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Day Events (right side) */}
        <div className={CARD_3D}>
          <div className={cn(GLASS_HEADER, "px-6 pt-5 pb-4")}>
            <SectionTitle
              icon={Calendar}
              title={
                selectedDate
                  ? `Eventos de ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`
                  : "Selecione um dia"
              }
              subtitle={
                selectedDate
                  ? capitalize(
                      isDateToday(selectedDate)
                        ? "Hoje"
                        : format(selectedDate, "EEEE", { locale: ptBR }),
                    )
                  : undefined
              }
              badge={
                selectedDayEvents.length > 0
                  ? `${selectedDayEvents.length} evento(s)`
                  : undefined
              }
            />
          </div>
          <div className="p-6">
            {!selectedDate ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/30 py-10 text-center">
                <CalendarDays className="h-8 w-8 text-gray-300" />
                <p className="mt-3 text-sm font-medium text-gray-400">
                  Clique em um dia no calendário
                </p>
              </div>
            ) : selectedDayEvents.length > 0 ? (
              <>
                <div className="space-y-3">
                  {selectedDayEventsPaginated.map((ev) => (
                    <MiniEventCard key={ev.id} ev={ev} />
                  ))}
                </div>
                {selectedDayEventsPages > 1 && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <CustomPagination
                      pages={selectedDayEventsPages}
                      currentPage={selectedDayEventsPage}
                      setCurrentPage={setSelectedDayEventsPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/30 py-10 text-center">
                <Calendar className="h-8 w-8 text-gray-300" />
                <p className="mt-3 text-sm font-medium text-gray-400">
                  Nenhum evento nesta data
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════ Past Events + Upcoming Events — Side by Side ═══════ */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Últimos Eventos — altura fixa + paginação */}
        <div className={CARD_3D}>
          <div className={cn(GLASS_HEADER, "px-6 pt-5 pb-4")}>
            <SectionTitle
              icon={Clock}
              title="Últimos Eventos"
              subtitle="Eventos mais recentes"
              badge={pastEventsTotal > 0 ? `${pastEventsTotal} total` : undefined}
              accentColor="#6b7280"
            />
          </div>
          <div className="flex min-h-[320px] flex-col p-6">
            {loadingPastEvents ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <SkeletonLoader key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : pastEvents.length > 0 ? (
              <>
                <div className="min-h-[280px] space-y-3">
                  {pastEvents.map((ev) => (
                    <EventListCard key={ev.id} ev={ev} />
                  ))}
                </div>
                {pastEventsPages > 1 && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <CustomPagination
                      pages={pastEventsPages}
                      currentPage={pastEventsPage}
                      setCurrentPage={setPastEventsPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/30 py-10 text-center">
                <Clock className="h-8 w-8 text-gray-300" />
                <p className="mt-3 text-sm font-medium text-gray-500">
                  Nenhum evento passado
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Não há registros de eventos anteriores para este deputado.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Próximos Eventos — altura fixa + paginação */}
        <div className={CARD_3D}>
          <div className={cn(GLASS_HEADER, "px-6 pt-5 pb-4")}>
            <SectionTitle
              icon={CalendarCheck}
              title="Próximos Eventos"
              subtitle="Agenda futura"
              badge={
                upcomingEventsTotal > 0 ? `${upcomingEventsTotal} total` : undefined
              }
              accentColor="#4E9F3D"
            />
          </div>
          <div className="flex min-h-[320px] flex-col p-6">
            {loadingUpcomingEvents ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <SkeletonLoader key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <>
                <div className="min-h-[280px] space-y-3">
                  {upcomingEvents.map((ev) => (
                    <EventListCard key={ev.id} ev={ev} />
                  ))}
                </div>
                {upcomingEventsPages > 1 && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <CustomPagination
                      pages={upcomingEventsPages}
                      currentPage={upcomingEventsPage}
                      setCurrentPage={setUpcomingEventsPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/30 py-10 text-center">
                <CalendarCheck className="h-8 w-8 text-gray-300" />
                <p className="mt-3 text-sm font-medium text-gray-500">
                  Nenhum evento agendado
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Não há próximos eventos registrados para este deputado.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════ External Link ═══════ */}
      {agendaResumo?.link && (
        <div className="flex justify-center">
          <a
            href={agendaResumo.link}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#749c5b]/30 hover:bg-[#749c5b]/5 hover:text-[#749c5b] hover:shadow-md"
          >
            Ver agenda
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
}
