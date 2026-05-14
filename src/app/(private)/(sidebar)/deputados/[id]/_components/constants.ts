import {
  BarChart3,
  Briefcase,
  Calendar,
  CheckSquare,
  FileText,
  Receipt,
  ScrollText,
  User,
} from "lucide-react";

export const START_YEAR = 2019;

export const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export const HISTORICO_YEARS = [2026, 2025, 2024, 2023];
export const HISTORICO_PAGE_SIZES = [5, 10, 20];

export const TABS = [
  { id: "overview", label: "Visão geral", icon: BarChart3 },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "proposicoes", label: "Proposições", icon: ScrollText },
  { id: "presencas", label: "Presenças", icon: CheckSquare },
  { id: "posicionamento", label: "Posicionamento", icon: FileText },
  { id: "despesas-financeiro", label: "Despesas e Financeiro", icon: Receipt },
  { id: "atuacao", label: "Atuação parlamentar", icon: User },
  { id: "perfil", label: "Perfil", icon: Briefcase },
] as const;
