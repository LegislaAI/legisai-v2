"use client";

import { useEffect, useState } from "react";

import { TYPE_LABEL, type PromptDbType } from "../_data/catalog";

export type DbPrompt = {
  id: string;
  name: string;
  description: string;
  prompt: string;
  type: PromptDbType;
  feature: string | null;
  model: string | null;
  temperature: number | null;
  isActive: boolean;
  /** Soft delete: preenchido quando o prompt está na lixeira. */
  deletedAt: string | null;
};

export type PromptDraft = Omit<DbPrompt, "id"> & { id?: string };

/**
 * Tipos que PODEM ser criados pelo admin. São apenas as personas do chat de IA
 * (/ai). O `type` é o ÚNICO campo que define o comportamento em runtime.
 * Ficam de fora:
 *  - "proposition" → o chat de /tramitacoes não tem seletor de persona (é fixo);
 *  - "politic"     → tipo legado, não deve receber novos prompts.
 * Ao EDITAR um prompt já existente desses tipos, o tipo atual é incluído na
 * lista para não ser perdido (ver `typeOptions`).
 * (model/temperatura/feature não são lidos pelo runtime, por isso não estão
 * mais neste formulário.)
 */
const CREATABLE_TYPES: PromptDbType[] = [
  "general",
  "politician",
  "juridic",
  "accounting",
  "doc",
];

export function PromptEditor({
  draft,
  onChange,
  onSubmit,
  onCancel,
  saving,
}: {
  draft: PromptDraft;
  onChange: (d: PromptDraft) => void;
  onSubmit: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [local, setLocal] = useState<PromptDraft>(draft);

  useEffect(() => setLocal(draft), [draft]);

  function set<K extends keyof PromptDraft>(key: K, value: PromptDraft[K]) {
    const next = { ...local, [key]: value };
    setLocal(next);
    onChange(next);
  }

  const isEdit = Boolean(local.id);
  const valid =
    local.name.trim().length > 0 && local.prompt.trim().length > 0;

  // Só personas do /ai podem ser criadas; ao editar um prompt de tipo legado/
  // proposition, mantém o tipo atual disponível para não sobrescrevê-lo.
  const typeOptions = CREATABLE_TYPES.includes(local.type)
    ? CREATABLE_TYPES
    : [local.type, ...CREATABLE_TYPES];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
        <div className="border-b border-zinc-200 px-5 py-3">
          <h2 className="text-sm font-semibold">
            {isEdit ? "Editar prompt" : "Novo prompt"}
          </h2>
        </div>

        <div className="flex-1 space-y-4 overflow-auto px-5 py-4">
          <Field label="Nome">
            <input
              value={local.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </Field>

          <Field label="Descrição">
            <input
              value={local.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </Field>

          <Field label="Persona (tipo)">
            <select
              value={local.type}
              onChange={(e) => set("type", e.target.value as PromptDbType)}
              className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            >
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABEL[t]} ({t})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-zinc-500">
              {local.type === "proposition"
                ? "Aparece como persona no chat de Pesquisa Legislativa (/tramitacoes)."
                : "Aparece como persona no chat de Inteligência Artificial (/ai)."}
            </p>
          </Field>

          <Field label="Prompt">
            <textarea
              value={local.prompt}
              onChange={(e) => set("prompt", e.target.value)}
              rows={12}
              className="w-full resize-y rounded border border-zinc-300 p-2 font-mono text-xs leading-relaxed"
            />
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={local.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
            />
            Ativo
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-3">
          <button
            onClick={onCancel}
            className="rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={!valid || saving}
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Salvando…" : isEdit ? "Salvar" : "Criar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-zinc-600">
        {label}
      </label>
      {children}
    </div>
  );
}
