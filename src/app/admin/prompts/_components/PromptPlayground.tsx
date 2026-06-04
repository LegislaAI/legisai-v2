"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PLAYGROUND_MODELS } from "../_data/catalog";

export type PlaygroundSeed = {
  title: string;
  systemPrompt: string;
  model?: string;
  /** Quando presente, habilita o botão "Salvar alterações" (prompts do banco). */
  onSave?: (newPrompt: string) => Promise<void>;
  readOnlyReason?: string;
};

export function PromptPlayground({
  seed,
  onClose,
}: {
  seed: PlaygroundSeed;
  onClose: () => void;
}) {
  const [systemPrompt, setSystemPrompt] = useState(seed.systemPrompt);
  const [userMessage, setUserMessage] = useState(
    "Olá! Apresente-se e mostre como pode me ajudar.",
  );
  const [model, setModel] = useState(seed.model || PLAYGROUND_MODELS[0]);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const cancelRef = useRef(false);

  // Reinicializa quando troca o prompt selecionado.
  useEffect(() => {
    setSystemPrompt(seed.systemPrompt);
    setModel(seed.model || PLAYGROUND_MODELS[0]);
    setOutput("");
  }, [seed]);

  const dirty = systemPrompt !== seed.systemPrompt;

  async function run() {
    if (running) {
      cancelRef.current = true;
      return;
    }
    setRunning(true);
    setOutput("");
    cancelRef.current = false;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userMessage }],
          model,
          systemPrompt,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Erro ${res.status}: ${txt}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Sem corpo de resposta.");
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done || cancelRef.current) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]" || !data) continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              full += delta;
              setOutput(full);
            }
          } catch {
            // chunk parcial — ignora
          }
        }
      }
    } catch (e) {
      toast.error((e as Error).message);
      setOutput((o) => o + `\n\n[Erro: ${(e as Error).message}]`);
    } finally {
      setRunning(false);
      cancelRef.current = false;
    }
  }

  async function handleSave() {
    if (!seed.onSave) return;
    setSaving(true);
    try {
      await seed.onSave(systemPrompt);
      toast.success("Prompt salvo.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="flex h-full w-full max-w-3xl flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Playground
            </div>
            <div className="truncate text-sm font-medium">{seed.title}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-100"
          >
            Fechar
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-auto px-5 py-4">
          {seed.readOnlyReason && (
            <p className="rounded bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {seed.readOnlyReason}
            </p>
          )}

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-600">
                System prompt
              </label>
              {dirty && (
                <span className="text-xs text-amber-700">• editado</span>
              )}
            </div>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={12}
              className="w-full resize-y rounded border border-zinc-300 p-2 font-mono text-xs leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <label className="mb-1 block text-xs font-semibold text-zinc-600">
                Mensagem de teste (usuário)
              </label>
              <input
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-600">
                Modelo
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="rounded border border-zinc-300 px-2 py-1 text-sm"
              >
                {PLAYGROUND_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-600">
                Resposta
              </label>
              {running && (
                <span className="text-xs text-zinc-500">gerando…</span>
              )}
            </div>
            <div className="min-h-[140px] whitespace-pre-wrap rounded border border-zinc-200 bg-zinc-50 p-3 text-sm">
              {output || (
                <span className="text-zinc-400">
                  Clique em &quot;Testar&quot; para rodar o prompt.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 border-t border-zinc-200 px-5 py-3">
          <button
            onClick={run}
            className={`rounded px-4 py-2 text-sm font-medium text-white ${
              running ? "bg-red-600 hover:bg-red-700" : "bg-zinc-900 hover:bg-zinc-800"
            }`}
          >
            {running ? "Parar" : output ? "Testar novamente" : "Testar"}
          </button>
          {seed.onSave && (
            <button
              onClick={handleSave}
              disabled={!dirty || saving}
              className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Salvando…" : "Salvar alterações"}
            </button>
          )}
          {dirty && (
            <button
              onClick={() => setSystemPrompt(seed.systemPrompt)}
              className="rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              Reverter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
