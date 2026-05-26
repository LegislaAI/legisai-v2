"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/v2/components/ui/select";

import { useAdminApi } from "../_lib/admin-api";

type FieldKind = "boolean" | "number" | "text";

type FieldDef = {
  key: string;
  label: string;
  description: string;
  kind: FieldKind;
  group: "Suporte" | "Outros";
  numberSuffix?: string;
};

// Campos da seção "Avaliação gratuita" são renderizados num bloco dedicado
// (não passam por este array). Aqui ficam só configs genéricas.
const KNOWN_FIELDS: FieldDef[] = [
  {
    key: "support.whatsappNumber",
    label: "Telefone do suporte (WhatsApp)",
    description:
      "Número usado nos botões de contato (apenas dígitos com código do país, ex.: 5511999999999). Deixe vazio para esconder o botão.",
    kind: "text",
    group: "Suporte",
  },
  {
    key: "support.refundInstructions",
    label: "Instruções de reembolso",
    description:
      "Texto exibido aos usuários explicando como solicitar reembolso. Aparece na página de perfil.",
    kind: "text",
    group: "Suporte",
  },
];

const TRIAL_KEYS = new Set(["trial.enabled", "trial.durationDays", "trial.planId"]);

function defOf(key: string): FieldDef {
  const found = KNOWN_FIELDS.find((f) => f.key === key);
  if (found) return found;
  return {
    key,
    label: key,
    description: "",
    kind: "text",
    group: "Outros",
  };
}

type SignaturePlanLite = {
  id: string;
  name: string;
  level: number;
  isInternal: boolean;
};

export default function AdminConfigPage() {
  const { list, patch } = useAdminApi();
  const [config, setConfig] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<SignaturePlanLite[]>([]);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await list<Record<string, string>>("/admin/config");
      setConfig(res);
      setDraft(res);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [list]);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await list<{ plans: SignaturePlanLite[] }>(
        "/admin/signature-plans",
      );
      setPlans(res.plans);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  }, [list]);

  useEffect(() => {
    fetchConfig();
    fetchPlans();
  }, [fetchConfig, fetchPlans]);

  async function save(key: string, valueOverride?: string) {
    const value = valueOverride ?? draft[key];
    if (value === config[key]) return;
    try {
      await patch(`/admin/config/${encodeURIComponent(key)}`, { value });
      toast.success("Configuração salva.");
      // Otimização: atualiza local em vez de refetch completo.
      setConfig((c) => ({ ...c, [key]: value }));
      setDraft((d) => ({ ...d, [key]: value }));
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  }

  // Outras chaves (suporte + desconhecidas), agrupadas por seção.
  const otherGrouped = useMemo(() => {
    const keys = Object.keys(config).filter((k) => !TRIAL_KEYS.has(k));
    const map: Record<string, FieldDef[]> = {};
    for (const k of keys) {
      const d = defOf(k);
      (map[d.group] ??= []).push(d);
    }
    for (const g of Object.keys(map)) {
      map[g].sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
    }
    return map;
  }, [config]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Configurações do sistema</h1>
      <p className="mt-1 text-sm text-zinc-600">
        As alterações são aplicadas imediatamente. Todo histórico fica
        registrado na auditoria.
      </p>

      {loading && (
        <div className="mt-6 rounded border border-zinc-200 bg-white px-3 py-6 text-center text-zinc-500">
          Carregando…
        </div>
      )}

      {!loading && (
        <TrialSection
          enabled={config["trial.enabled"] === "true"}
          durationDays={config["trial.durationDays"] ?? "0"}
          durationDraft={draft["trial.durationDays"] ?? "0"}
          onDurationDraftChange={(v) =>
            setDraft((d) => ({ ...d, "trial.durationDays": v }))
          }
          planId={config["trial.planId"] ?? ""}
          plans={plans}
          onToggleEnabled={() =>
            save("trial.enabled", config["trial.enabled"] === "true" ? "false" : "true")
          }
          onSaveDuration={() => save("trial.durationDays")}
          onSavePlan={(planId) => save("trial.planId", planId)}
        />
      )}

      {!loading &&
        Object.entries(otherGrouped).map(([group, fields]) => (
          <section key={group} className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {group}
            </h2>
            <div className="mt-2 divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
              {fields.map((field) => (
                <GenericField
                  key={field.key}
                  field={field}
                  current={config[field.key] ?? ""}
                  draft={draft[field.key] ?? ""}
                  onDraftChange={(v) =>
                    setDraft((d) => ({ ...d, [field.key]: v }))
                  }
                  onSave={() => save(field.key)}
                  onToggle={() =>
                    save(field.key, (config[field.key] ?? "").toLowerCase() === "true" ? "false" : "true")
                  }
                />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}

// ===========================================================================
// --- TrialSection ---
// ===========================================================================

function TrialSection({
  enabled,
  durationDays,
  durationDraft,
  onDurationDraftChange,
  planId,
  plans,
  onToggleEnabled,
  onSaveDuration,
  onSavePlan,
}: {
  enabled: boolean;
  durationDays: string;
  durationDraft: string;
  onDurationDraftChange: (v: string) => void;
  planId: string;
  plans: SignaturePlanLite[];
  onToggleEnabled: () => void;
  onSaveDuration: () => void;
  onSavePlan: (planId: string) => void;
}) {
  const durationDirty = durationDraft !== durationDays;
  const numericDuration = Number(durationDraft);
  const showsAsDisabled = !enabled || numericDuration === 0;

  return (
    <section className="mt-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Avaliação gratuita
      </h2>

      <div className="mt-2 rounded-lg border border-zinc-200 bg-white">
        {/* Linha 1: Liga/Desliga */}
        <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-4 py-4">
          <div className="flex-1">
            <div className="text-sm font-medium">Status do período de avaliação</div>
            <div className="mt-1 text-xs text-zinc-600">
              {enabled
                ? "Novos cadastros recebem acesso gratuito antes de exigir pagamento."
                : "Novos usuários precisam contratar um plano para acessar o sistema."}
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleEnabled}
            className={`shrink-0 rounded px-4 py-2 text-sm font-medium text-white ${
              enabled
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {enabled ? "Desativar avaliação" : "Ativar avaliação"}
          </button>
        </div>

        {/* Linha 2: Plano */}
        <div className="border-b border-zinc-100 px-4 py-4">
          <div className="text-sm font-medium">Plano aplicado durante a avaliação</div>
          <div className="mt-1 text-xs text-zinc-600">
            Define o nível de acesso (recursos liberados) enquanto a avaliação
            está ativa.
          </div>
          <div className="mt-2 max-w-md">
            <Select
              value={planId || undefined}
              onValueChange={(v) => onSavePlan(v)}
              disabled={!enabled}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecione um plano…" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} · Nível {p.level}
                    {p.isInternal ? " (interno)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Linha 3: Duração */}
        <div className="px-4 py-4">
          <div className="text-sm font-medium">Duração da avaliação</div>
          <div className="mt-1 text-xs text-zinc-600">
            Por quantos dias o novo usuário pode usar o sistema gratuitamente.{" "}
            <strong>Use 0</strong> para conceder a assinatura mas com expiração
            imediata (equivalente a desativar).
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={durationDraft}
              onChange={(e) => onDurationDraftChange(e.target.value)}
              disabled={!enabled}
              className="w-28 rounded border border-zinc-300 px-2 py-1 text-sm disabled:bg-zinc-50 disabled:text-zinc-400"
            />
            <span className="text-xs text-zinc-500">dias</span>
            <button
              type="button"
              onClick={onSaveDuration}
              disabled={!durationDirty || !enabled}
              className="ml-auto rounded bg-zinc-900 px-3 py-1 text-xs text-white disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
          {showsAsDisabled && enabled && (
            <p className="mt-2 text-xs text-amber-700">
              Com duração 0, novos usuários recebem assinatura já expirada e
              precisam contratar um plano logo após o cadastro.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// --- GenericField (suporte + outras chaves) ---
// ===========================================================================

function GenericField({
  field,
  current,
  draft,
  onDraftChange,
  onSave,
  onToggle,
}: {
  field: FieldDef;
  current: string;
  draft: string;
  onDraftChange: (v: string) => void;
  onSave: () => void;
  onToggle: () => void;
}) {
  if (field.kind === "boolean") {
    const isOn = current.toLowerCase() === "true";
    return (
      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-sm font-medium">{field.label}</div>
            <div className="mt-1 text-xs text-zinc-600">{field.description}</div>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className={`shrink-0 rounded-full px-4 py-1 text-xs font-medium ${
              isOn ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-700"
            }`}
          >
            {isOn ? "Ativado" : "Desativado"}
          </button>
        </div>
      </div>
    );
  }

  if (field.kind === "number") {
    return (
      <div className="px-4 py-4">
        <div className="text-sm font-medium">{field.label}</div>
        <div className="mt-1 text-xs text-zinc-600">{field.description}</div>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            className="w-32 rounded border border-zinc-300 px-2 py-1 text-sm"
          />
          {field.numberSuffix && (
            <span className="text-xs text-zinc-500">{field.numberSuffix}</span>
          )}
          <button
            onClick={onSave}
            disabled={draft === current}
            className="ml-auto rounded bg-zinc-900 px-3 py-1 text-xs text-white disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="text-sm font-medium">{field.label}</div>
      <div className="mt-1 text-xs text-zinc-600">{field.description}</div>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          className="flex-1 rounded border border-zinc-300 px-2 py-1 text-sm"
        />
        <button
          onClick={onSave}
          disabled={draft === current}
          className="shrink-0 rounded bg-zinc-900 px-3 py-1 text-xs text-white disabled:opacity-50"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
