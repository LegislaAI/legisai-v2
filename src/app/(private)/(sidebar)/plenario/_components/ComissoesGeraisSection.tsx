"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ExternalLink,
  Filter,
  Search,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

type StatusComissao = "agendada" | "realizada" | "cancelada";

interface ComissaoGeral {
  id: string;
  data: string;
  tema: string;
  descricao: string;
  status: StatusComissao;
  participantes: { nome: string; cargo: string; partido?: string }[];
  fonteUrl: string;
}

// MOCK — substituir por GetAPI(`/plenario/comissoes-gerais?...`) quando o backend entregar
// (ver BACKEND_TODO.md, Tarefa 4)
const MOCK_COMISSOES: ComissaoGeral[] = [
  {
    id: "cg-1",
    data: "2026-05-08",
    tema: "Crise climática e Amazônia – posição do Brasil na COP31",
    descricao:
      "Comissão geral para debater a estratégia diplomática brasileira na COP31, com presença de ministros e parlamentares do bloco ambientalista.",
    status: "agendada",
    participantes: [
      { nome: "Ministra do Meio Ambiente", cargo: "Convidada principal" },
      { nome: "Líder do bloco ambientalista", cargo: "Coordenação" },
    ],
    fonteUrl: "https://www.camara.leg.br/plenario/comissoes-gerais",
  },
  {
    id: "cg-2",
    data: "2026-04-24",
    tema: "Reforma tributária – regulamentação e impactos regionais",
    descricao:
      "Sessão de debate amplo sobre os efeitos do PLP 108/2024 nos estados, com apresentação dos governadores de SP, MG e BA.",
    status: "realizada",
    participantes: [
      { nome: "Governador SP", cargo: "Convidado" },
      { nome: "Governador MG", cargo: "Convidado" },
      { nome: "Líder do governo na Câmara", cargo: "Mediação" },
    ],
    fonteUrl: "https://www.camara.leg.br/plenario/comissoes-gerais",
  },
  {
    id: "cg-3",
    data: "2026-04-17",
    tema: "Segurança pública – PEC do combate ao crime organizado",
    descricao:
      "Comissão geral para discutir a PEC 18/2025, com participação de governadores, secretários de segurança e MPF.",
    status: "realizada",
    participantes: [
      { nome: "Procurador-Geral da República", cargo: "Convidado" },
      { nome: "Líder da oposição", cargo: "Coordenação" },
    ],
    fonteUrl: "https://www.camara.leg.br/plenario/comissoes-gerais",
  },
  {
    id: "cg-4",
    data: "2026-05-15",
    tema: "Educação e financiamento – futuro do Fundeb",
    descricao:
      "Debate sobre o financiamento permanente da educação básica, com presença do Ministro da Educação e secretários estaduais.",
    status: "agendada",
    participantes: [
      { nome: "Ministro da Educação", cargo: "Convidado principal" },
    ],
    fonteUrl: "https://www.camara.leg.br/plenario/comissoes-gerais",
  },
];

function statusStyle(s: StatusComissao) {
  switch (s) {
    case "agendada":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "realizada":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "cancelada":
      return "bg-red-50 text-red-700 border-red-200";
  }
}

function statusLabel(s: StatusComissao) {
  switch (s) {
    case "agendada":
      return "Agendada";
    case "realizada":
      return "Realizada";
    case "cancelada":
      return "Cancelada";
  }
}

export function ComissoesGeraisSection() {
  const [filter, setFilter] = useState<"all" | StatusComissao>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      MOCK_COMISSOES.filter((c) => {
        if (filter !== "all" && c.status !== filter) return false;
        if (
          search.trim() &&
          !c.tema.toLowerCase().includes(search.toLowerCase().trim())
        )
          return false;
        return true;
      }).sort((a, b) => (a.data < b.data ? 1 : -1)),
    [filter, search],
  );

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-xl font-bold text-[#1a1d1f]">
          Comissões Gerais
        </h2>
        <p className="mb-5 text-sm text-[#6f767e]">
          Sessões plenárias temáticas com convidados externos. Reúne
          parlamentares e atores estratégicos para debate amplo de pautas
          específicas. Fonte:{" "}
          <a
            href="https://www.camara.leg.br/plenario/comissoes-gerais"
            target="_blank"
            rel="noreferrer"
            className="text-[#749c5b] hover:underline"
          >
            camara.leg.br/plenario/comissoes-gerais
          </a>
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por tema…"
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm placeholder-gray-400 focus:border-[#749c5b] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
            <Filter className="ml-2 h-4 w-4 text-gray-400" />
            {(["all", "agendada", "realizada", "cancelada"] as const).map(
              (s) => (
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
                  {s === "all" ? "Todas" : statusLabel(s)}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center text-sm text-gray-500">
          Nenhuma comissão geral para o filtro atual.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className="group flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="font-medium tabular-nums">
                    {new Date(c.data).toLocaleDateString("pt-BR", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                    statusStyle(c.status),
                  )}
                >
                  {statusLabel(c.status)}
                </span>
              </div>

              <h3 className="text-base font-semibold leading-snug text-gray-900 group-hover:text-[#749c5b]">
                {c.tema}
              </h3>
              <p className="line-clamp-2 text-sm text-gray-600">
                {c.descricao}
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {c.participantes.length} participante
                  {c.participantes.length === 1 ? "" : "s"}-chave
                </span>
              </div>

              <ul className="flex flex-wrap gap-1.5">
                {c.participantes.slice(0, 3).map((p, i) => (
                  <li
                    key={i}
                    className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                  >
                    {p.nome}
                  </li>
                ))}
              </ul>

              <a
                href={c.fonteUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-[#749c5b] hover:underline"
              >
                Ver na Câmara
                <ExternalLink className="h-3 w-3" />
              </a>
            </Card>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-gray-400">
        Dados de demonstração — integração com scraper pendente (ver{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-[10px]">
          BACKEND_TODO.md
        </code>
        , Tarefa 4).
      </p>
    </div>
  );
}
