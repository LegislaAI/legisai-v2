"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Clock,
  ExternalLink,
  Filter,
  Hourglass,
  Search,
  TimerReset,
} from "lucide-react";
import { useMemo, useState } from "react";

type StatusPrazo = "em_curso" | "vencido" | "cumprido";
type TipoPrazo = "comissao" | "plenario" | "emendas" | "outro";

interface PrazoRegimental {
  id: string;
  identificador: string;
  tipoPrazo: TipoPrazo;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  diasUteisRestantes: number;
  status: StatusPrazo;
  fonteUrl: string;
}

// MOCK — substituir por GetAPI(`/plenario/prazos?...`) quando o backend entregar
// (ver BACKEND_TODO.md, Tarefa 4)
const MOCK_PRAZOS: PrazoRegimental[] = [
  {
    id: "pr-1",
    identificador: "PEC 32/2024",
    tipoPrazo: "comissao",
    descricao: "Prazo da CCJC para apreciação da admissibilidade",
    dataInicio: "2026-04-15",
    dataFim: "2026-05-05",
    diasUteisRestantes: 2,
    status: "em_curso",
    fonteUrl: "https://www.camara.leg.br/plenario/contagem-de-prazos",
  },
  {
    id: "pr-2",
    identificador: "PLP 108/2024",
    tipoPrazo: "plenario",
    descricao: "Prazo regimental de pauta no Plenário",
    dataInicio: "2026-04-22",
    dataFim: "2026-05-12",
    diasUteisRestantes: 7,
    status: "em_curso",
    fonteUrl: "https://www.camara.leg.br/plenario/contagem-de-prazos",
  },
  {
    id: "pr-3",
    identificador: "PL 4567/2025",
    tipoPrazo: "emendas",
    descricao: "Prazo para apresentação de emendas em comissão",
    dataInicio: "2026-04-28",
    dataFim: "2026-05-06",
    diasUteisRestantes: 3,
    status: "em_curso",
    fonteUrl: "https://www.camara.leg.br/plenario/contagem-de-prazos",
  },
  {
    id: "pr-4",
    identificador: "MPV 1.245/2026",
    tipoPrazo: "plenario",
    descricao: "Prazo de vigência da MP – urgência constitucional",
    dataInicio: "2026-03-08",
    dataFim: "2026-05-07",
    diasUteisRestantes: 4,
    status: "em_curso",
    fonteUrl: "https://www.camara.leg.br/plenario/contagem-de-prazos",
  },
  {
    id: "pr-5",
    identificador: "PDL 789/2024",
    tipoPrazo: "comissao",
    descricao: "Prazo da CCJC – constitucionalidade",
    dataInicio: "2026-04-01",
    dataFim: "2026-04-30",
    diasUteisRestantes: -2,
    status: "vencido",
    fonteUrl: "https://www.camara.leg.br/plenario/contagem-de-prazos",
  },
  {
    id: "pr-6",
    identificador: "PL 1234/2025",
    tipoPrazo: "comissao",
    descricao: "Prazo da CFT para parecer",
    dataInicio: "2026-04-10",
    dataFim: "2026-05-20",
    diasUteisRestantes: 12,
    status: "em_curso",
    fonteUrl: "https://www.camara.leg.br/plenario/contagem-de-prazos",
  },
  {
    id: "pr-7",
    identificador: "PEC 18/2025",
    tipoPrazo: "comissao",
    descricao: "Prazo da Comissão Especial – mérito",
    dataInicio: "2026-04-05",
    dataFim: "2026-05-15",
    diasUteisRestantes: 9,
    status: "em_curso",
    fonteUrl: "https://www.camara.leg.br/plenario/contagem-de-prazos",
  },
];

function urgenciaColor(d: number, status: StatusPrazo): {
  bg: string;
  text: string;
  border: string;
  Icon: React.ComponentType<{ className?: string }>;
} {
  if (status === "vencido")
    return {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      Icon: AlertTriangle,
    };
  if (status === "cumprido")
    return {
      bg: "bg-gray-50",
      text: "text-gray-600",
      border: "border-gray-200",
      Icon: Clock,
    };
  if (d <= 3)
    return {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      Icon: AlertTriangle,
    };
  if (d <= 7)
    return {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      Icon: Hourglass,
    };
  return {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    Icon: TimerReset,
  };
}

function tipoLabel(t: TipoPrazo) {
  return {
    comissao: "Comissão",
    plenario: "Plenário",
    emendas: "Emendas",
    outro: "Outro",
  }[t];
}

export function PrazosRegimentaisSection() {
  const [filter, setFilter] = useState<"all" | StatusPrazo>("all");
  const [tipoFilter, setTipoFilter] = useState<"all" | TipoPrazo>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      MOCK_PRAZOS.filter((p) => {
        if (filter !== "all" && p.status !== filter) return false;
        if (tipoFilter !== "all" && p.tipoPrazo !== tipoFilter) return false;
        if (
          search.trim() &&
          !p.identificador
            .toLowerCase()
            .includes(search.toLowerCase().trim()) &&
          !p.descricao.toLowerCase().includes(search.toLowerCase().trim())
        )
          return false;
        return true;
      }).sort((a, b) => a.diasUteisRestantes - b.diasUteisRestantes),
    [filter, tipoFilter, search],
  );

  const proximos = filtered.filter(
    (p) => p.status === "em_curso" && p.diasUteisRestantes <= 7,
  ).length;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-xl font-bold text-[#1a1d1f]">
          Prazos Regimentais
        </h2>
        <p className="mb-5 text-sm text-[#6f767e]">
          Contagem de prazos de tramitação em dias úteis (excluindo recesso
          parlamentar e feriados nacionais). Fonte:{" "}
          <a
            href="https://www.camara.leg.br/plenario/contagem-de-prazos"
            target="_blank"
            rel="noreferrer"
            className="text-[#749c5b] hover:underline"
          >
            camara.leg.br/plenario/contagem-de-prazos
          </a>
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por matéria…"
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm placeholder-gray-400 focus:border-[#749c5b] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
            <Filter className="ml-2 h-4 w-4 text-gray-400" />
            {(["all", "em_curso", "vencido", "cumprido"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  filter === s
                    ? "bg-white text-[#749c5b] shadow-sm"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                {s === "all"
                  ? "Todos"
                  : s === "em_curso"
                    ? "Em curso"
                    : s === "vencido"
                      ? "Vencidos"
                      : "Cumpridos"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
            {(["all", "comissao", "plenario", "emendas"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTipoFilter(t)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  tipoFilter === t
                    ? "bg-white text-[#749c5b] shadow-sm"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                {t === "all" ? "Todos os tipos" : tipoLabel(t as TipoPrazo)}
              </button>
            ))}
          </div>
        </div>

        {proximos > 0 && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              <strong>{proximos}</strong> matéria{proximos === 1 ? "" : "s"}{" "}
              com prazo regimental vencendo em até 7 dias úteis
            </span>
          </div>
        )}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <div className="col-span-2">Matéria</div>
          <div className="col-span-1">Tipo</div>
          <div className="col-span-4">Descrição do prazo</div>
          <div className="col-span-2 text-center">Início → Fim</div>
          <div className="col-span-2 text-center">Dias úteis</div>
          <div className="col-span-1 text-right" />
        </div>

        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-gray-500">
            Nenhum prazo encontrado para o filtro atual.
          </div>
        ) : (
          filtered.map((p) => {
            const u = urgenciaColor(p.diasUteisRestantes, p.status);
            return (
              <div
                key={p.id}
                className="grid grid-cols-12 items-center gap-4 border-b border-gray-100 px-4 py-3 text-sm transition-colors last:border-b-0 hover:bg-gray-50"
              >
                <div className="col-span-2">
                  <p className="font-semibold text-gray-900">
                    {p.identificador}
                  </p>
                </div>
                <div className="col-span-1">
                  <span className="rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-xs text-gray-600">
                    {tipoLabel(p.tipoPrazo)}
                  </span>
                </div>
                <div className="col-span-4 text-sm text-gray-700">
                  {p.descricao}
                </div>
                <div className="col-span-2 text-center text-xs text-gray-500 tabular-nums">
                  {new Date(p.dataInicio).toLocaleDateString("pt-BR")} →{" "}
                  {new Date(p.dataFim).toLocaleDateString("pt-BR")}
                </div>
                <div className="col-span-2 text-center">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                      u.bg,
                      u.text,
                      u.border,
                    )}
                  >
                    <u.Icon className="h-3.5 w-3.5" />
                    {p.status === "vencido"
                      ? `Vencido há ${Math.abs(p.diasUteisRestantes)}d`
                      : p.status === "cumprido"
                        ? "Cumprido"
                        : `${p.diasUteisRestantes}d restantes`}
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  <a
                    href={p.fonteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-[#749c5b] hover:opacity-70"
                    aria-label="Ver na Câmara"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </Card>

      <p className="text-center text-xs text-gray-400">
        Dados de demonstração — engine de prazos e scraper pendentes (ver{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-[10px]">
          BACKEND_TODO.md
        </code>
        , Tarefa 4 — recesso parlamentar 22/12–02/02 e 18/07–31/07).
      </p>
    </div>
  );
}
