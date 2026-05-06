"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { Input } from "@/components/v2/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/v2/components/ui/select";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { cn } from "@/lib/utils";
import * as Tabs from "@radix-ui/react-tabs";
import {
  Award,
  Calendar,
  ExternalLink,
  FileText,
  Filter,
  LayoutGrid,
  List,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";

type AuthorshipRole = "AUTHOR" | "CO_AUTHOR" | "ANY";
type PropositionType =
  | "PL"
  | "PLP"
  | "PEC"
  | "PDL"
  | "RIC"
  | "INC"
  | "MPV"
  | "PRC";

interface Proposition {
  id: string;
  sigla_tipo: PropositionType | string;
  numero: number;
  ano: number;
  ementa: string;
  dt_apresentacao: string;
  situacao_descricao: string;
  proponente: boolean; // true = autor principal, false = coautor
  uri_proposicao?: string;
  relevanceScore?: number; // 0–100, vem do backend para sort=relevance
}

interface ProposicoesResponse {
  proposicoes: Proposition[];
  total: number;
  pages: number;
  page: number;
}

// MOCK — substituir por GetAPI(`/politician/${id}/proposicoes?...`) quando o backend entregar
// (ver BACKEND_TODO.md, Tarefa 1)
const MOCK_PROPOSICOES_AUTOR: Proposition[] = [
  {
    id: "p-1",
    sigla_tipo: "PEC",
    numero: 32,
    ano: 2024,
    ementa:
      "Altera o Sistema Tributário Nacional, simplifica a tributação sobre o consumo e estabelece bases para a reforma do imposto de renda.",
    dt_apresentacao: "2024-09-15",
    situacao_descricao: "Aguardando designação de relator na CCJC",
    proponente: true,
    relevanceScore: 92,
  },
  {
    id: "p-2",
    sigla_tipo: "PL",
    numero: 4567,
    ano: 2025,
    ementa:
      "Institui o programa nacional de modernização tecnológica das micro e pequenas empresas, com incentivo fiscal específico.",
    dt_apresentacao: "2025-03-20",
    situacao_descricao: "Em análise – Comissão de Finanças e Tributação (CFT)",
    proponente: true,
    relevanceScore: 78,
  },
  {
    id: "p-3",
    sigla_tipo: "PLP",
    numero: 108,
    ano: 2024,
    ementa:
      "Regulamenta o Imposto sobre Bens e Serviços (IBS) no contexto da reforma tributária aprovada pela EC 132/2023.",
    dt_apresentacao: "2024-11-08",
    situacao_descricao: "Pronto para Pauta no Plenário",
    proponente: true,
    relevanceScore: 88,
  },
  {
    id: "p-4",
    sigla_tipo: "PL",
    numero: 1234,
    ano: 2025,
    ementa:
      "Dispõe sobre a obrigatoriedade de divulgação de relatórios de impacto ambiental em projetos de infraestrutura.",
    dt_apresentacao: "2025-01-10",
    situacao_descricao: "Apresentação",
    proponente: true,
    relevanceScore: 45,
  },
  {
    id: "p-5",
    sigla_tipo: "PDL",
    numero: 789,
    ano: 2024,
    ementa:
      "Susta a aplicação de portaria do Ministério da Saúde sobre regulação de medicamentos genéricos.",
    dt_apresentacao: "2024-12-02",
    situacao_descricao: "Em tramitação na CCJC",
    proponente: true,
    relevanceScore: 52,
  },
  {
    id: "p-6",
    sigla_tipo: "RIC",
    numero: 345,
    ano: 2025,
    ementa:
      "Solicita informações ao Ministério da Fazenda sobre a execução orçamentária do programa de transferência de renda.",
    dt_apresentacao: "2025-02-14",
    situacao_descricao: "Aguardando resposta",
    proponente: true,
    relevanceScore: 35,
  },
];

const MOCK_PROPOSICOES_COAUTOR: Proposition[] = [
  {
    id: "c-1",
    sigla_tipo: "PEC",
    numero: 45,
    ano: 2023,
    ementa:
      "Reforma tributária – simplificação de tributos sobre o consumo (matriz histórica que originou a EC 132/2023).",
    dt_apresentacao: "2023-04-12",
    situacao_descricao: "Promulgada (EC 132/2023)",
    proponente: false,
    relevanceScore: 95,
  },
  {
    id: "c-2",
    sigla_tipo: "PL",
    numero: 2630,
    ano: 2020,
    ementa:
      "Institui a Lei Brasileira de Liberdade, Responsabilidade e Transparência na Internet (PL das Fake News).",
    dt_apresentacao: "2020-05-04",
    situacao_descricao: "Em análise – Comissão Especial",
    proponente: false,
    relevanceScore: 82,
  },
  {
    id: "c-3",
    sigla_tipo: "PLP",
    numero: 68,
    ano: 2024,
    ementa:
      "Estabelece normas gerais sobre o IBS, a CBS e o Imposto Seletivo (regulamentação da reforma tributária).",
    dt_apresentacao: "2024-04-25",
    situacao_descricao: "Aprovado pelo Senado, retorna à Câmara",
    proponente: false,
    relevanceScore: 90,
  },
  {
    id: "c-4",
    sigla_tipo: "PL",
    numero: 5678,
    ano: 2024,
    ementa:
      "Dispõe sobre o uso de inteligência artificial em decisões automatizadas que afetem direitos individuais.",
    dt_apresentacao: "2024-08-19",
    situacao_descricao: "Em análise – CCJC",
    proponente: false,
    relevanceScore: 68,
  },
  {
    id: "c-5",
    sigla_tipo: "PEC",
    numero: 12,
    ano: 2025,
    ementa:
      "Altera o art. 100 da Constituição para tratar do regime de pagamento de precatórios.",
    dt_apresentacao: "2025-02-28",
    situacao_descricao: "Aguardando admissibilidade na CCJC",
    proponente: false,
    relevanceScore: 55,
  },
];

const TYPE_OPTIONS: PropositionType[] = [
  "PL",
  "PLP",
  "PEC",
  "PDL",
  "RIC",
  "INC",
  "MPV",
  "PRC",
];

function typeColor(t: string) {
  switch (t) {
    case "PEC":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "PLP":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "PL":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "PDL":
      return "bg-teal-100 text-teal-800 border-teal-200";
    case "MPV":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "RIC":
    case "INC":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function statusColor(s: string) {
  const lower = s.toLowerCase();
  if (
    lower.includes("aprovad") ||
    lower.includes("promulgad") ||
    lower.includes("sanção")
  )
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (lower.includes("plenário") || lower.includes("pauta"))
    return "bg-blue-50 text-blue-700 border-blue-200";
  if (lower.includes("comissão") || lower.includes("ccj"))
    return "bg-violet-50 text-violet-700 border-violet-200";
  if (lower.includes("apresentaç"))
    return "bg-gray-50 text-gray-700 border-gray-200";
  return "bg-gray-50 text-gray-600 border-gray-200";
}

function HighlightCard({ p }: { p: Proposition }) {
  return (
    <Card className="group flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold",
              typeColor(p.sigla_tipo),
            )}
          >
            {p.sigla_tipo}
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {p.numero}/{p.ano}
          </span>
          {p.relevanceScore !== undefined && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#749c5b] to-[#4E9F3D] px-2 py-0.5 text-xs font-medium text-white">
              <Sparkles className="h-3 w-3" />
              {p.relevanceScore}
            </span>
          )}
        </div>
      </div>

      <p className="line-clamp-3 text-sm leading-relaxed text-gray-700">
        {p.ementa}
      </p>

      <div className="mt-auto flex flex-col gap-2 pt-2">
        <span
          className={cn(
            "inline-flex w-fit items-center rounded-md border px-2 py-0.5 text-xs font-medium",
            statusColor(p.situacao_descricao),
          )}
        >
          {p.situacao_descricao}
        </span>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(p.dt_apresentacao).toLocaleDateString("pt-BR")}
          </span>
          {p.uri_proposicao && (
            <a
              href={p.uri_proposicao}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[#749c5b] hover:underline"
            >
              Ver na Câmara
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}

interface TabProposicoesProps {
  // data?: DeputadoPageData;
}

export function TabProposicoes(_props: TabProposicoesProps = {}) {
  const [role, setRole] = useState<AuthorshipRole>("AUTHOR");
  const [view, setView] = useState<"resumo" | "detalhada">("resumo");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterYear, setFilterYear] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // TODO[backend]: trocar mock por GetAPI(`/politician/${id}/proposicoes?role=${role}&...`)
  const allByRole =
    role === "CO_AUTHOR"
      ? MOCK_PROPOSICOES_COAUTOR
      : role === "AUTHOR"
        ? MOCK_PROPOSICOES_AUTOR
        : [...MOCK_PROPOSICOES_AUTOR, ...MOCK_PROPOSICOES_COAUTOR];

  // Top 3 por relevância (resumo)
  const top3 = useMemo(
    () =>
      [...allByRole]
        .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))
        .slice(0, 3),
    [allByRole],
  );

  // Filtros para detalhada
  const filtered = useMemo(() => {
    return allByRole.filter((p) => {
      if (filterType !== "ALL" && p.sigla_tipo !== filterType) return false;
      if (filterYear !== "ALL" && String(p.ano) !== filterYear) return false;
      if (filterStatus !== "ALL") {
        const lower = p.situacao_descricao.toLowerCase();
        if (filterStatus === "tramitacao" && !lower.includes("comissão") && !lower.includes("plenário"))
          return false;
        if (filterStatus === "aprovado" && !lower.includes("aprovad") && !lower.includes("promulgad"))
          return false;
      }
      if (
        search.trim() &&
        !p.ementa.toLowerCase().includes(search.toLowerCase().trim())
      )
        return false;
      return true;
    });
  }, [allByRole, filterType, filterYear, filterStatus, search]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const years = useMemo(() => {
    const set = new Set(allByRole.map((p) => String(p.ano)));
    return Array.from(set).sort().reverse();
  }, [allByRole]);

  return (
    <div className="space-y-6">
      {/* Toggle Autor / Coautor */}
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#749c5b]/10">
            <FileText className="h-5 w-5 text-[#749c5b]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Atuação em proposições
            </p>
            <p className="text-xs text-gray-500">
              Alternar entre proposições onde é autor principal ou coautor
            </p>
          </div>
        </div>

        <div
          role="radiogroup"
          aria-label="Filtrar por autoria"
          className="flex rounded-xl border border-gray-200 bg-gray-50 p-1"
        >
          {[
            { value: "AUTHOR" as const, label: "Autor principal" },
            { value: "CO_AUTHOR" as const, label: "Coautor" },
            { value: "ANY" as const, label: "Todas" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={role === opt.value}
              onClick={() => {
                setRole(opt.value);
                setPage(1);
              }}
              className={cn(
                "rounded-lg px-4 py-1.5 text-xs font-medium transition-all",
                role === opt.value
                  ? "bg-white text-[#749c5b] shadow-sm"
                  : "text-gray-600 hover:text-gray-900",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Sub-tabs Resumo / Detalhada */}
      <Tabs.Root
        value={view}
        onValueChange={(v) => setView(v as "resumo" | "detalhada")}
      >
        <Tabs.List className="mb-5 inline-flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
          <Tabs.Trigger
            value="resumo"
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
              view === "resumo"
                ? "bg-[#749c5b] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50",
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Resumo (3 destaques)
          </Tabs.Trigger>
          <Tabs.Trigger
            value="detalhada"
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
              view === "detalhada"
                ? "bg-[#749c5b] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50",
            )}
          >
            <List className="h-4 w-4" />
            Detalhada ({filtered.length})
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="resumo" className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award className="h-4 w-4 text-[#749c5b]" />
            <span>
              <strong>Mais relevantes</strong> de acordo com o score (0–100)
              calculado por: tramitação ativa, fase atual, tipo, autoria
              principal, número de coautores e urgência declarada.
            </span>
          </div>
          {top3.length === 0 ? (
            <Card className="text-center text-sm text-gray-500">
              Nenhuma proposição encontrada para o filtro atual.
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {top3.map((p) => (
                <HighlightCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </Tabs.Content>

        <Tabs.Content value="detalhada" className="space-y-4">
          {/* Filtros */}
          <Card className="flex flex-wrap items-center gap-3 p-4">
            <Filter className="h-4 w-4 text-gray-400" />
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar na ementa…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={(v) => { setFilterType(v); setPage(1); }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os tipos</SelectItem>
                {TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterYear} onValueChange={(v) => { setFilterYear(v); setPage(1); }}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os anos</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterStatus}
              onValueChange={(v) => { setFilterStatus(v); setPage(1); }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os status</SelectItem>
                <SelectItem value="tramitacao">Em tramitação</SelectItem>
                <SelectItem value="aprovado">Aprovada/Promulgada</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* Tabela */}
          <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              <div className="col-span-1">Tipo</div>
              <div className="col-span-1">Nº</div>
              <div className="col-span-5">Ementa</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-2 text-right">Apresentada</div>
            </div>
            {paged.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-gray-500">
                Nenhuma proposição encontrada.
              </div>
            ) : (
              paged.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-12 items-center gap-4 border-b border-gray-100 px-4 py-3 text-sm transition-colors last:border-b-0 hover:bg-gray-50"
                >
                  <div className="col-span-1">
                    <span
                      className={cn(
                        "inline-flex rounded-md border px-1.5 py-0.5 text-xs font-bold",
                        typeColor(p.sigla_tipo),
                      )}
                    >
                      {p.sigla_tipo}
                    </span>
                  </div>
                  <div className="col-span-1 font-medium tabular-nums text-gray-900">
                    {p.numero}/{String(p.ano).slice(-2)}
                  </div>
                  <div className="col-span-5">
                    <p className="line-clamp-2 text-gray-700">{p.ementa}</p>
                    {role === "ANY" && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-gray-400">
                        <TrendingUp className="h-3 w-3" />
                        {p.proponente ? "Autor principal" : "Coautor"}
                      </span>
                    )}
                  </div>
                  <div className="col-span-3">
                    <span
                      className={cn(
                        "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
                        statusColor(p.situacao_descricao),
                      )}
                    >
                      {p.situacao_descricao}
                    </span>
                  </div>
                  <div className="col-span-2 text-right text-xs text-gray-500 tabular-nums">
                    {new Date(p.dt_apresentacao).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              ))
            )}
          </Card>

          {filtered.length > pageSize && (
            <div className="flex justify-center">
              <CustomPagination
                currentPage={page}
                pages={Math.ceil(filtered.length / pageSize)}
                setCurrentPage={setPage}
              />
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>

      <p className="text-center text-xs text-gray-400">
        Dados de demonstração — integração com backend pendente (ver{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-[10px]">
          BACKEND_TODO.md
        </code>
        , Tarefa 1).
      </p>
    </div>
  );
}
