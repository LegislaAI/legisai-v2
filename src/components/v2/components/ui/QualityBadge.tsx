import { CheckCircle2, Calculator, AlertCircle, MinusCircle } from "lucide-react";

export type QualityFlag = "stable" | "partial" | "derived" | "no-data";

const PRESETS: Record<
  QualityFlag,
  { label: string; tooltip: string; tone: string; Icon: typeof CheckCircle2 }
> = {
  stable: {
    label: "Estável",
    tooltip: "Bloco íntegro a partir da fonte canônica.",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Icon: CheckCircle2,
  },
  partial: {
    label: "Parcial",
    tooltip: "Este bloco ainda pode não refletir toda a cadeia processual.",
    tone: "bg-amber-50 text-amber-700 border-amber-100",
    Icon: AlertCircle,
  },
  derived: {
    label: "Derivado",
    tooltip: "Informação calculada a partir de dados integrados.",
    tone: "bg-indigo-50 text-indigo-700 border-indigo-100",
    Icon: Calculator,
  },
  "no-data": {
    label: "Sem dado",
    tooltip: "A fonte consultada não retornou conteúdo estruturado.",
    tone: "bg-gray-100 text-gray-600 border-gray-200",
    Icon: MinusCircle,
  },
};

export function QualityBadge({
  flag,
  hideLabel = false,
}: {
  flag?: QualityFlag;
  hideLabel?: boolean;
}) {
  if (!flag) return null;
  const preset = PRESETS[flag];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${preset.tone}`}
      title={preset.tooltip}
    >
      <preset.Icon className="h-3 w-3" />
      {!hideLabel && preset.label}
    </span>
  );
}
