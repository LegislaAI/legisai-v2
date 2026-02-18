"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { CustomPagination } from "@/components/ui/CustomPagination";
import {
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  ExternalLink,
  ArrowUpRight,
  Building2,
  CalendarCheck,
} from "lucide-react";
import Link from "next/link";
import type { DeputadoPageData } from "./useDeputadoPage";
import type { EventoAgenda } from "./types";
import { SkeletonLoader } from "./SkeletonLoader";
import { cn } from "@/lib/utils";

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

function EventCard({ ev }: { ev: EventoAgenda }) {
  const { dateStr, timeStr, isToday } = formatEventDate(ev.dt_inicio);
  const tipo = ev.descricao_tipo_evento || ev.cod_tipo_evento || "—";
  const orgao = ev.sigla_orgao || ev.nome_orgao || "—";
  const local = ev.local_evento?.trim() || null;

  return (
    <Link
      href={`/eventos/${ev.id}`}
      className={cn(
        "group flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 transition-all duration-200",
        "hover:border-[#749c5b]/30 hover:bg-[#749c5b]/5 hover:shadow-sm",
        "sm:flex-row sm:items-center sm:justify-between"
      )}
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold",
              isToday
                ? "bg-[#749c5b]/15 text-[#749c5b]"
                : "bg-gray-100 text-gray-700"
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
              <span className="truncate max-w-[200px]" title={local}>
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
    eventos,
    loadingAgenda,
    loadingEventos,
    eventosPage,
    setEventosPage,
    eventosPages,
  } = data;

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50/80 to-white p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#749c5b]/10">
            <CalendarDays className="h-5 w-5 text-[#749c5b]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Agenda</h2>
            <p className="mt-1 text-sm text-gray-600">
              Eventos em que o deputado participa — reuniões, sessões e
              audiências. Confira o que está marcado para hoje, nos próximos
              dias e a lista completa de eventos.
            </p>
          </div>
        </div>
      </div>

      {/* Resumo + Lista em um Card */}
      <Card className="overflow-hidden border-gray-100 shadow-sm transition-shadow hover:shadow-md">
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#749c5b]/10">
                <Calendar className="h-4 w-4 text-[#749c5b]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Eventos</h3>
                <p className="text-xs text-gray-500">
                  Resumo e lista de eventos da agenda
                </p>
              </div>
            </div>
            {agendaResumo?.link && (
              <a
                href={agendaResumo.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#749c5b]/40 hover:bg-[#749c5b]/5 hover:text-[#749c5b]"
              >
                Ver detalhes
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* KPIs */}
          {loadingAgenda ? (
            <div className="mb-6 flex flex-wrap gap-4">
              <SkeletonLoader className="h-20 w-36 rounded-xl" />
              <SkeletonLoader className="h-20 w-40 rounded-xl" />
            </div>
          ) : agendaResumo ? (
            <div className="mb-6 flex flex-wrap gap-4">
              <div className="flex min-w-0 items-center gap-4 rounded-xl border border-gray-100 bg-gradient-to-br from-[#749c5b]/5 to-[#749c5b]/10 px-5 py-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#749c5b]/15">
                  <CalendarCheck className="h-6 w-6 text-[#749c5b]" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Agenda hoje
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {agendaResumo.countHoje}
                  </p>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/80 px-5 py-4 transition-colors hover:bg-gray-50">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-200/80">
                  <CalendarDays className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Próximos 7 dias
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {agendaResumo.countProximos7Dias}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Lista de eventos */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">
              Lista de eventos
            </h4>
            {loadingEventos ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <SkeletonLoader
                    key={i}
                    className="h-24 w-full rounded-xl"
                  />
                ))}
              </div>
            ) : eventos.length > 0 ? (
              <>
                <div className="space-y-3">
                  {eventos.map((ev) => (
                    <EventCard key={ev.id} ev={ev} />
                  ))}
                </div>
                {eventosPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <CustomPagination
                      pages={eventosPages}
                      currentPage={eventosPage}
                      setCurrentPage={setEventosPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center">
                <Calendar className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">
                  Nenhum evento encontrado.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
