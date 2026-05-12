"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface SessaoCalendario {
  codReuniao: number;
  contaPrazo: 0 | 1 | null;
  dataSessao: string;
  txtDescricao: string;
}

interface CalendarioResponse {
  mes: number;
  ano: number;
  sessoes: SessaoCalendario[];
  diasValidos: string[];
}

const MESES_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function PrazosRegimentaisSection() {
  const today = useMemo(() => new Date(), []);
  const [mes, setMes] = useState(today.getMonth() + 1);
  const [ano, setAno] = useState(today.getFullYear());
  const [data, setData] = useState<CalendarioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetch(`/api/camara-plenario/calendario/${mes}/${ano}`, {
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as CalendarioResponse;
      })
      .then((body) => {
        if (active) setData(body);
      })
      .catch((err) => {
        if (active) setError(err?.message ?? "Falha ao carregar calendário");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [mes, ano]);

  const validSet = useMemo(
    () => new Set(data?.diasValidos ?? []),
    [data?.diasValidos],
  );
  const sessoesPorDia = useMemo(() => {
    const map = new Map<string, SessaoCalendario[]>();
    (data?.sessoes ?? []).forEach((s) => {
      const arr = map.get(s.dataSessao) ?? [];
      arr.push(s);
      map.set(s.dataSessao, arr);
    });
    return map;
  }, [data?.sessoes]);

  const firstWeekday = new Date(ano, mes - 1, 1).getDay();
  const daysInMonth = new Date(ano, mes, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayISO = today.toISOString().slice(0, 10);

  function step(delta: number) {
    let nm = mes + delta;
    let na = ano;
    if (nm < 1) {
      nm = 12;
      na -= 1;
    } else if (nm > 12) {
      nm = 1;
      na += 1;
    }
    setMes(nm);
    setAno(na);
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#1a1d1f]">Contagem de Prazos</h2>
      <h3 className="mt-1 text-base font-semibold text-[#1a1d1f]">
        Datas Válidas para Contar Prazos
      </h3>
      <p className="mt-2 text-sm text-[#6f767e]">
        O calendário abaixo mostra os dias em que houve sessão válida para
        contar os prazos do processo legislativo.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start">
        <div className="w-full max-w-[360px]">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => step(-1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-sm font-semibold uppercase tracking-wide text-[#1a1d1f]">
              {MESES_PT[mes - 1]} {ano}
            </div>
            <button
              type="button"
              onClick={() => step(1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3">
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-gray-400">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                <div key={i} className="py-1.5">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (day === null) return <div key={idx} className="h-9" />;
                const iso = `${ano}-${String(mes).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const valido = validSet.has(iso);
                const temSessao = sessoesPorDia.has(iso);
                const isToday = iso === todayISO;
                return (
                  <div
                    key={idx}
                    title={
                      valido
                        ? "Sessão válida para contar prazo"
                        : temSessao
                          ? "Sessão sem efeito para contagem"
                          : ""
                    }
                    className={cn(
                      "flex h-9 items-center justify-center rounded-md text-sm tabular-nums transition-colors",
                      valido
                        ? "bg-[#749c5b]/10 font-bold text-[#363636] ring-1 ring-inset ring-[#749c5b]/40"
                        : "font-normal text-[#5f5f5e]",
                      isToday && "outline outline-2 outline-amber-400",
                    )}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Legenda:
          </p>
          <div className="mt-1 space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#749c5b]/10 text-[10px] font-bold text-[#363636] ring-1 ring-inset ring-[#749c5b]/40">
                00
              </span>
              Data com sessão válida para contar prazo
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[10px] text-[#5f5f5e]">
                00
              </span>
              Data sem sessão válida para contar prazo
            </div>
          </div>

          {loading && (
            <div className="mt-3 flex items-center gap-2 text-xs text-[#6f767e]">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#749c5b] border-t-transparent" />
              Carregando dados oficiais da Câmara…
            </div>
          )}
          {error && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              Não foi possível carregar o calendário ({error}).
            </div>
          )}
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-[#1a1d1f]">
          <p>
            Cada etapa do processo legislativo tem um prazo máximo para
            acontecer. Alguns prazos são contados em dias corridos; outros,
            fixados por mês; mas dezenas deles são definidos em número de
            sessões que ocorrem no Plenário.
          </p>

          <p className="font-semibold">
            Como exemplo, a ocorrência de cinco sessões no Plenário é o prazo
            máximo para que:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-[#3a3a3a]">
            <li>
              os líderes partidários indiquem os integrantes das comissões
            </li>
            <li>
              os deputados sugiram mudanças nas propostas em análise nas
              comissões
            </li>
            <li>
              os deputados peçam a separação de propostas que tramitam juntas
            </li>
          </ul>

          <p>
            Apenas uma sessão é contada por dia, e nem todas as sessões valem
            para a contagem de prazos.
          </p>

          <p className="font-semibold">Não valem as:</p>
          <ul className="ml-5 list-disc space-y-1 text-[#3a3a3a]">
            <li>Sessões solenes</li>
            <li>Sessões extraordinárias transformadas em comissão geral</li>
            <li>Sessões preparatórias</li>
          </ul>

          <p className="pt-2 text-xs text-gray-500">
            Fonte:{" "}
            <a
              href="https://www.camara.leg.br/plenario/contagem-de-prazos"
              target="_blank"
              rel="noreferrer"
              className="text-[#749c5b] hover:underline"
            >
              camara.leg.br/plenario/contagem-de-prazos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
