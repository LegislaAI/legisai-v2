"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useAdminApi } from "../_lib/admin-api";
import {
  CHAT_PIPELINE_PROMPTS,
  KIND_LABEL,
  TYPE_LABEL,
  TYPE_ORDER,
  type ChatScreen,
  type FeatureScreen,
  type InlinePrompt,
  type PromptDbType,
} from "./_data/catalog";
import {
  PromptEditor,
  type DbPrompt,
  type PromptDraft,
} from "./_components/PromptEditor";
import {
  PromptPlayground,
  type PlaygroundSeed,
} from "./_components/PromptPlayground";

/** Prompts hardcoded do pipeline filtrados por tela. */
function pipelineFor(screen: ChatScreen) {
  return CHAT_PIPELINE_PROMPTS.filter((p) => p.screens.includes(screen));
}

const EMPTY_DRAFT: PromptDraft = {
  name: "",
  description: "",
  prompt: "",
  type: "general",
  feature: null,
  model: null,
  temperature: null,
  isActive: true,
  deletedAt: null,
};

/** Categorias que exigem ao menos uma persona (espelha o backend). */
const REQUIRED_TYPES: PromptDbType[] = [
  "general",
  "politician",
  "juridic",
  "accounting",
  "doc",
  "proposition",
];

export default function AdminPromptsPage() {
  const { list, post, patch, del } = useAdminApi();
  const [dbPrompts, setDbPrompts] = useState<DbPrompt[]>([]);
  const [loading, setLoading] = useState(false);

  const [seed, setSeed] = useState<PlaygroundSeed | null>(null);
  const [draft, setDraft] = useState<PromptDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    try {
      // includeDeleted=true: traz também a lixeira; o toggle decide o que exibir.
      const res = await list<{ prompts: DbPrompt[] }>("/admin/prompts", {
        includeDeleted: "true",
      });
      setDbPrompts(res.prompts);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [list]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  // Personas de IA do chat /ai: todos os prompts do banco exceto os de
  // proposition (que alimentam um chat separado em /tramitacoes), agrupados
  // pela persona (coluna `type`).
  const aiPersonasByType = useMemo(() => {
    const map = new Map<PromptDbType, DbPrompt[]>();
    for (const p of dbPrompts) {
      if (p.type === "proposition") continue;
      const list = map.get(p.type) ?? [];
      list.push(p);
      map.set(p.type, list);
    }
    const known = new Set(TYPE_ORDER);
    const extras = [...map.keys()].filter((t) => !known.has(t));
    return [...TYPE_ORDER, ...extras]
      .filter((t) => map.has(t))
      .map((type) => ({
        type,
        // Ordena por nome para que editar um prompt não mude sua posição.
        prompts: map
          .get(type)!
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
      }));
  }, [dbPrompts]);

  // Personas do chat de /tramitacoes (type = proposition).
  const propositionPrompts = useMemo(
    () =>
      dbPrompts
        .filter((p) => p.type === "proposition")
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [dbPrompts],
  );

  const deletedCount = useMemo(
    () => dbPrompts.filter((p) => p.deletedAt).length,
    [dbPrompts],
  );

  // Há algo visível considerando o toggle da lixeira?
  const aiHasVisible = useMemo(
    () =>
      aiPersonasByType.some(({ prompts }) =>
        prompts.some((p) => showDeleted || !p.deletedAt),
      ),
    [aiPersonasByType, showDeleted],
  );
  const propHasVisible = useMemo(
    () => propositionPrompts.some((p) => showDeleted || !p.deletedAt),
    [propositionPrompts, showDeleted],
  );

  // ---- CRUD handlers ----

  async function submitDraft() {
    if (!draft) return;
    setSaving(true);
    try {
      const payload = {
        name: draft.name,
        description: draft.description,
        prompt: draft.prompt,
        type: draft.type,
        feature: draft.feature,
        model: draft.model,
        temperature: draft.temperature,
        isActive: draft.isActive,
      };
      if (draft.id) {
        await patch(`/admin/prompts/${draft.id}`, payload);
        toast.success("Prompt atualizado.");
      } else {
        await post("/admin/prompts", payload);
        toast.success("Prompt criado.");
      }
      setDraft(null);
      await fetchPrompts();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // Soft delete: move para a lixeira (reversível).
  async function softDeletePrompt(p: DbPrompt) {
    if (!window.confirm(`Mover "${p.name}" para a lixeira?`)) return;
    try {
      await del(`/admin/prompts/${p.id}`);
      toast.success("Prompt movido para a lixeira.");
      setDbPrompts((prev) =>
        prev.map((x) =>
          x.id === p.id ? { ...x, deletedAt: new Date().toISOString() } : x,
        ),
      );
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  // Restaura da lixeira.
  async function restorePrompt(p: DbPrompt) {
    try {
      await post(`/admin/prompts/${p.id}/restore`, {});
      toast.success("Prompt restaurado.");
      setDbPrompts((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, deletedAt: null } : x)),
      );
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  // Exclusão definitiva (só na lixeira).
  async function hardDeletePrompt(p: DbPrompt) {
    if (
      !window.confirm(
        `Excluir DEFINITIVAMENTE "${p.name}"? Esta ação não pode ser desfeita.`,
      )
    )
      return;
    try {
      await del(`/admin/prompts/${p.id}?hard=true`);
      toast.success("Prompt excluído definitivamente.");
      setDbPrompts((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  function openInlinePlayground(p: InlinePrompt) {
    setSeed({
      title: p.title,
      systemPrompt: p.content,
      model: p.model,
      readOnlyReason: `Este prompt está hardcoded no código (${p.repo}/${p.file}${p.line ? `:${p.line}` : ""}). As edições aqui são só para teste — não persistem. Para alterar de verdade, edite o arquivo de origem.`,
    });
  }

  function openDbPlayground(p: DbPrompt) {
    setSeed({
      title: p.name,
      systemPrompt: p.prompt,
      model: p.model ?? undefined,
      onSave: async (newPrompt) => {
        await patch(`/admin/prompts/${p.id}`, { prompt: newPrompt });
        setDbPrompts((prev) =>
          prev.map((x) => (x.id === p.id ? { ...x, prompt: newPrompt } : x)),
        );
      },
    });
  }

  async function toggleActive(p: DbPrompt) {
    try {
      await patch(`/admin/prompts/${p.id}`, { isActive: !p.isActive });
      setDbPrompts((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, isActive: !p.isActive } : x)),
      );
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">Prompts de IA</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-600">
          Todos os prompts das funcionalidades de IA (legis-api + dashboard). As
          personas do chat de IA ficam no banco e são editáveis; os demais
          prompts vivem no código e aparecem como referência — todos podem ser
          abertos no Playground para teste.
        </p>
      </div>

      {loading && (
        <div className="mt-6 rounded border border-zinc-200 bg-white px-3 py-6 text-center text-zinc-500">
          Carregando…
        </div>
      )}

      <label className="mt-6 flex w-fit cursor-pointer items-center gap-2 text-xs text-zinc-600">
        <input
          type="checkbox"
          checked={showDeleted}
          onChange={(e) => setShowDeleted(e.target.checked)}
        />
        Mostrar prompts na lixeira
        {deletedCount > 0 && (
          <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700">
            {deletedCount}
          </span>
        )}
      </label>

      {/* Personas editáveis do chat /ai (banco) — topo */}
      <section className="mt-3 rounded-lg border border-emerald-200 bg-white">
        <div className="border-b border-emerald-100 bg-emerald-50/40 px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-base font-semibold">
              Personas do chat de IA (/ai)
            </h2>
            <button
              onClick={() => setDraft({ ...EMPTY_DRAFT })}
              className="shrink-0 rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
            >
              + Novo prompt
            </button>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-zinc-600">
            Personas editáveis da IA conversacional. Aparecem na tela de
            Inteligência Artificial (/ai) e embutidas num card da Home. No chat,
            o usuário primeiro escolhe uma <strong>categoria</strong> e depois
            uma <strong>persona</strong>, deixando a conversa específica para
            aquele domínio (proposições, tramitação, votação, jurídico,
            pareceres). São carregadas do banco via{" "}
            <code>GET /prompt?types=ai</code>; o texto do prompt vira o system
            prompt da conversa.
          </p>
          <ScreenLinks
            screens={[
              { label: "Tela de IA", href: "/ai" },
              { label: "Home", href: "/" },
            ]}
          />
        </div>
        <div className="space-y-6 px-4 py-4">
          {!aiHasVisible ? (
            <p className="text-xs text-zinc-400">
              Nenhuma persona cadastrada. Use “+ Novo prompt” para criar.
            </p>
          ) : (
            aiPersonasByType.map(({ type, prompts }) => (
              <PersonaTypeGroup
                key={type}
                type={type}
                prompts={prompts}
                showDeleted={showDeleted}
                onPlayground={openDbPlayground}
                onEdit={(p) => setDraft({ ...p })}
                onSoftDelete={softDeletePrompt}
                onRestore={restorePrompt}
                onHardDelete={hardDeletePrompt}
                onToggle={toggleActive}
              />
            ))
          )}

          <HardcodedPromptList
            title="Prompts hardcoded enviados no /ai (referência · read-only)"
            prompts={pipelineFor("ai")}
            onPlayground={openInlinePlayground}
          />
        </div>
      </section>

      {/* Personas editáveis do chat de /tramitacoes (type = proposition) */}
      {propHasVisible && (
        <section className="mt-6 rounded-lg border border-emerald-200 bg-white">
          <div className="border-b border-emerald-100 bg-emerald-50/40 px-4 py-3">
            <h2 className="text-base font-semibold">
              Personas do chat de Proposições (/tramitacoes)
            </h2>
            <p className="mt-1 max-w-2xl text-xs text-zinc-600">
              Prompts com <code>type = proposition</code>. Atenção: estes{" "}
              <strong>não</strong> aparecem na tela de IA (/ai) — eles alimentam
              o chat da Pesquisa Legislativa (/tramitacoes), via{" "}
              <code>GET /prompt?types=proposition</code>.
            </p>
            <ScreenLinks
              screens={[{ label: "Pesquisa Legislativa", href: "/tramitacoes" }]}
            />
          </div>
          <div className="space-y-6 px-4 py-4">
            <PersonaTypeGroup
              type="proposition"
              prompts={propositionPrompts}
              showDeleted={showDeleted}
              onPlayground={openDbPlayground}
              onEdit={(p) => setDraft({ ...p })}
              onSoftDelete={softDeletePrompt}
              onRestore={restorePrompt}
              onHardDelete={hardDeletePrompt}
              onToggle={toggleActive}
            />

            <HardcodedPromptList
              title="Prompts hardcoded enviados no /tramitacoes (referência · read-only)"
              prompts={pipelineFor("tramitacoes")}
              onPlayground={openInlinePlayground}
            />
          </div>
        </section>
      )}

      {/*
        Prompts das OUTRAS telas (notícias, sessões, breves comunicações,
        análise de proposição, etc.) foram removidos desta tela a pedido —
        ela agora mostra apenas o que /ai e /tramitacoes usam de verdade.
        O catálogo completo continua em _data/catalog.ts (PROMPT_FEATURES)
        caso seja preciso reexibir.
      */}

      {seed && (
        <PromptPlayground seed={seed} onClose={() => setSeed(null)} />
      )}
      {draft && (
        <PromptEditor
          draft={draft}
          onChange={setDraft}
          onSubmit={submitDraft}
          onCancel={() => setDraft(null)}
          saving={saving}
        />
      )}
    </div>
  );
}

// ===========================================================================
// --- HardcodedPromptList / ScreenLinks ---
// ===========================================================================

// Lista de prompts hardcoded (read-only) enviados em algum ponto do pipeline.
function HardcodedPromptList({
  title,
  prompts,
  onPlayground,
}: {
  title: string;
  prompts: InlinePrompt[];
  onPlayground: (p: InlinePrompt) => void;
}) {
  if (prompts.length === 0) return null;
  return (
    <div className="border-t border-emerald-100 pt-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </div>
      <div className="space-y-2">
        {prompts.map((p) => (
          <InlinePromptRow
            key={p.id}
            p={p}
            onPlayground={() => onPlayground(p)}
          />
        ))}
      </div>
    </div>
  );
}

function ScreenLinks({ screens }: { screens: FeatureScreen[] }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
        Abrir tela:
      </span>
      {screens.map((s) => (
        <a
          key={s.href}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded border border-sky-300 bg-sky-50 px-2 py-1 text-xs font-medium text-sky-800 hover:bg-sky-100"
        >
          {s.label}
          <svg
            viewBox="0 0 24 24"
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      ))}
    </div>
  );
}

// ===========================================================================
// --- PersonaTypeGroup (prompts editáveis do banco, agrupados por type) ---
// ===========================================================================

function PersonaTypeGroup({
  type,
  prompts,
  showDeleted,
  onPlayground,
  onEdit,
  onSoftDelete,
  onRestore,
  onHardDelete,
  onToggle,
}: {
  type: PromptDbType;
  prompts: DbPrompt[];
  showDeleted: boolean;
  onPlayground: (p: DbPrompt) => void;
  onEdit: (p: DbPrompt) => void;
  onSoftDelete: (p: DbPrompt) => void;
  onRestore: (p: DbPrompt) => void;
  onHardDelete: (p: DbPrompt) => void;
  onToggle: (p: DbPrompt) => void;
}) {
  const activeCount = prompts.filter((p) => !p.deletedAt).length;
  const visible = prompts.filter((p) => showDeleted || !p.deletedAt);
  // Categorias obrigatórias precisam manter ao menos uma persona não-deletada.
  const isRequired = REQUIRED_TYPES.includes(type);
  const isLastActive = isRequired && activeCount <= 1;

  if (visible.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-zinc-800">
          {TYPE_LABEL[type] ?? type}
        </h3>
        <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700">
          {type}
        </span>
        <span className="text-xs text-zinc-400">
          {activeCount} ativo{activeCount === 1 ? "" : "s"}
        </span>
      </div>
      <div className="mt-2 space-y-2">
        {visible.map((p) => (
          <DbPromptRow
            key={p.id}
            p={p}
            // Não deixa excluir a última persona ativa de uma categoria obrigatória.
            blockSoftDelete={!p.deletedAt && isLastActive}
            onPlayground={() => onPlayground(p)}
            onEdit={() => onEdit(p)}
            onSoftDelete={() => onSoftDelete(p)}
            onRestore={() => onRestore(p)}
            onHardDelete={() => onHardDelete(p)}
            onToggle={() => onToggle(p)}
          />
        ))}
      </div>
    </div>
  );
}

function InlinePromptRow({
  p,
  onPlayground,
}: {
  p: InlinePrompt;
  onPlayground: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded border border-zinc-200">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{p.title}</span>
            <KindBadge kind={p.kind} />
          </div>
          <div className="mt-0.5 truncate text-xs text-zinc-500">
            {p.repo}/{p.file}
            {p.line ? `:${p.line}` : ""}
            {p.model ? ` · ${p.model}` : ""}
            {p.temperature != null ? ` · temp ${p.temperature}` : ""}
          </div>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100"
          >
            {open ? "Ocultar" : "Ver"}
          </button>
          {p.playground === "chat" && (
            <button
              onClick={onPlayground}
              className="rounded bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-200"
            >
              Playground
            </button>
          )}
        </div>
      </div>
      {open && (
        <>
          {p.notes && (
            <p className="border-t border-zinc-100 px-3 py-1.5 text-xs text-amber-700">
              {p.notes}
            </p>
          )}
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap border-t border-zinc-100 bg-zinc-50 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-700">
            {p.content}
          </pre>
        </>
      )}
    </div>
  );
}

function DbPromptRow({
  p,
  blockSoftDelete,
  onPlayground,
  onEdit,
  onSoftDelete,
  onRestore,
  onHardDelete,
  onToggle,
}: {
  p: DbPrompt;
  blockSoftDelete: boolean;
  onPlayground: () => void;
  onEdit: () => void;
  onSoftDelete: () => void;
  onRestore: () => void;
  onHardDelete: () => void;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  const isDeleted = Boolean(p.deletedAt);

  return (
    <div
      className={`rounded border ${
        isDeleted
          ? "border-zinc-200 bg-zinc-50 opacity-75"
          : "border-emerald-200 bg-emerald-50/30"
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex items-center gap-2">
            <span
              className={`truncate text-sm font-medium ${
                isDeleted ? "text-zinc-500 line-through" : ""
              }`}
            >
              {p.name}
            </span>
            <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700">
              {p.type}
            </span>
            {isDeleted ? (
              <span className="rounded bg-red-200 px-1.5 py-0.5 text-[10px] font-medium text-red-800">
                na lixeira
              </span>
            ) : (
              !p.isActive && (
                <span className="rounded bg-zinc-300 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700">
                  inativo
                </span>
              )
            )}
          </div>
          <div className="mt-0.5 truncate text-xs text-zinc-500">
            {p.description || "sem descrição"}
            {p.model ? ` · ${p.model}` : ""}
          </div>
        </button>
        <div className="flex shrink-0 items-center gap-1.5">
          {isDeleted ? (
            <>
              <button
                onClick={onRestore}
                className="rounded bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-200"
              >
                Restaurar
              </button>
              <button
                onClick={onHardDelete}
                className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
              >
                Excluir definitivamente
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onToggle}
                className={`rounded px-2 py-1 text-xs font-medium ${
                  p.isActive
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-zinc-200 text-zinc-600"
                }`}
              >
                {p.isActive ? "Ativo" : "Inativo"}
              </button>
              <button
                onClick={onPlayground}
                className="rounded bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-200"
              >
                Playground
              </button>
              <button
                onClick={onEdit}
                className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-white"
              >
                Editar
              </button>
              <button
                onClick={onSoftDelete}
                disabled={blockSoftDelete}
                title={
                  blockSoftDelete
                    ? "Esta é a última persona da categoria. Crie outra antes de excluir."
                    : "Mover para a lixeira"
                }
                className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Excluir
              </button>
            </>
          )}
        </div>
      </div>
      {open && (
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap border-t border-emerald-100 bg-white px-3 py-2 font-mono text-xs leading-relaxed text-zinc-700">
          {p.prompt}
        </pre>
      )}
    </div>
  );
}

function KindBadge({ kind }: { kind: InlinePrompt["kind"] }) {
  const map: Record<InlinePrompt["kind"], string> = {
    "system-pequeno": "bg-zinc-100 text-zinc-600",
    "persona-grande": "bg-amber-100 text-amber-800",
    "user-template": "bg-zinc-100 text-zinc-500",
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${map[kind]}`}>
      {KIND_LABEL[kind]}
    </span>
  );
}
