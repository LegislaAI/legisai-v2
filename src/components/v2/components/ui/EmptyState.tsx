import { AlertCircle, Calculator, CloudOff, Inbox, LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export type EmptyStateVariant = "no-occurrence" | "partial" | "no-source" | "computing";

type Props = {
  variant?: EmptyStateVariant;
  title?: string;
  message?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
};

const PRESETS: Record<
  EmptyStateVariant,
  { title: string; message: string; icon: LucideIcon; tone: string }
> = {
  "no-occurrence": {
    title: "Sem ocorrência",
    message: "Até o momento, não há registros desse tipo para esta matéria.",
    icon: Inbox,
    tone: "text-gray-400 bg-gray-100",
  },
  partial: {
    title: "Cobertura parcial",
    message: "Este bloco está disponível parcialmente nesta fase da plataforma.",
    icon: AlertCircle,
    tone: "text-amber-600 bg-amber-50",
  },
  "no-source": {
    title: "Fonte sem retorno",
    message: "A fonte consultada não retornou conteúdo estruturado para este bloco.",
    icon: CloudOff,
    tone: "text-slate-500 bg-slate-100",
  },
  computing: {
    title: "Em cálculo",
    message: "Este indicador será exibido quando houver base suficiente para cálculo confiável.",
    icon: Calculator,
    tone: "text-indigo-600 bg-indigo-50",
  },
};

export function EmptyState({
  variant = "no-occurrence",
  title,
  message,
  icon: IconOverride,
  action,
  className = "",
  compact = false,
}: Props) {
  const preset = PRESETS[variant];
  const Icon = IconOverride ?? preset.icon;
  const finalTitle = title ?? preset.title;
  const finalMessage = message ?? preset.message;

  if (compact) {
    return (
      <div className={`flex items-start gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/40 p-4 ${className}`}>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${preset.tone}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-700">{finalTitle}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{finalMessage}</p>
          {action && <div className="mt-2">{action}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/40 px-6 py-10 text-center ${className}`}>
      <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${preset.tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="text-sm font-semibold text-gray-800">{finalTitle}</h4>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">{finalMessage}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
