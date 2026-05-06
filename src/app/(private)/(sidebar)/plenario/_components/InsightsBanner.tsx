"use client";

import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Calendar,
  Lightbulb,
  TrendingUp,
  Users,
} from "lucide-react";

// MOCK — substituir por GetAPI(`/plenario/insights`) quando o backend entregar
// (ver BACKEND_TODO.md, Tarefa 4)
const MOCK_INSIGHTS = [
  {
    id: "i-1",
    type: "urgente",
    text: "5 matérias vencem prazo regimental nos próximos 7 dias úteis",
    Icon: AlertTriangle,
  },
  {
    id: "i-2",
    type: "agenda",
    text: "Comissão Geral sobre Crise climática agendada para 08/05 com a Ministra do Meio Ambiente",
    Icon: Calendar,
  },
  {
    id: "i-3",
    type: "movimento",
    text: "PLP 108/2024 (reforma tributária) entra em pauta de Plenário esta semana",
    Icon: TrendingUp,
  },
  {
    id: "i-4",
    type: "presenca",
    text: "Quórum médio das comissões deliberativas em abril: 78% (queda de 4pp vs março)",
    Icon: Users,
  },
];

const STYLE = {
  urgente: "bg-red-50 text-red-700 border-red-200",
  agenda: "bg-blue-50 text-blue-700 border-blue-200",
  movimento: "bg-violet-50 text-violet-700 border-violet-200",
  presenca: "bg-amber-50 text-amber-700 border-amber-200",
} as const;

export function InsightsBanner() {
  return (
    <div className="rounded-xl border border-[#749c5b]/30 bg-gradient-to-br from-[#749c5b]/5 to-[#4E9F3D]/5 p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#749c5b] text-white">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#1a1d1f]">
            Insights da semana
          </h3>
          <p className="text-xs text-[#6f767e]">
            Cruzamentos automáticos entre matérias, prazos, comissões e
            presenças
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {MOCK_INSIGHTS.map((i) => {
          const Icon = i.Icon;
          return (
            <div
              key={i.id}
              className={cn(
                "flex items-start gap-2 rounded-lg border bg-white px-3 py-2 text-sm",
                STYLE[i.type as keyof typeof STYLE],
              )}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{i.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
