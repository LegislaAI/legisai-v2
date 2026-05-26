"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Paginated, useAdminApi } from "../_lib/admin-api";

type Partner = {
  id: string;
  code: string;
  name: string;
  walletId: string | null;
  discount: number;
  commission: number;
  active: boolean;
  createdAt: string;
};

export default function AdminPartnersPage() {
  const { list, post } = useAdminApi();
  const [data, setData] = useState<Paginated<Partner> | null>(null);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<Partner | null>(null);

  // form de criação
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [walletId, setWalletId] = useState("");
  const [discount, setDiscount] = useState("0");
  const [commission, setCommission] = useState("0");

  // Debounce na busca para suportar lista grande.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [q]);

  const fetchPage = useCallback(async () => {
    try {
      const res = await list<Paginated<Partner>>("/admin/partners", {
        page: String(page),
        q: debouncedQ || undefined,
      });
      setData(res);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  }, [list, page, debouncedQ]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await post("/admin/partners", {
        code,
        name,
        walletId: walletId || undefined,
        discount: Number(discount),
        commission: Number(commission),
      });
      toast.success("Parceiro criado.");
      setShowForm(false);
      setCode("");
      setName("");
      setWalletId("");
      setDiscount("0");
      setCommission("0");
      fetchPage();
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function applyLocalUpdate(updated: Partner) {
    setData((d) =>
      d
        ? {
            ...d,
            items: d.items.map((p) => (p.id === updated.id ? updated : p)),
          }
        : d,
    );
    setSelected(updated);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Parceiros</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white"
        >
          {showForm ? "Fechar" : "Novo parceiro"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={create}
          className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-zinc-200 bg-white p-4 md:grid-cols-2"
        >
          <label className="text-sm">
            Código (será maiúsculo)
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm uppercase"
            />
          </label>
          <label className="text-sm">
            Nome
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm md:col-span-2">
            walletId Asaas (opcional — só se houver split)
            <input
              type="text"
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Desconto (% para o cliente, 0–100)
            <input
              type="number"
              step="0.01"
              min={0}
              max={100}
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              required
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm">
            Comissão (% para o parceiro, 0–100)
            <input
              type="number"
              step="0.01"
              min={0}
              max={100}
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              required
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {submitting ? "Criando…" : "Criar"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-4">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por código ou nome…"
          className="w-80 rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Código</th>
              <th className="px-3 py-2 font-medium">Nome</th>
              <th className="px-3 py-2 font-medium">Desconto</th>
              <th className="px-3 py-2 font-medium">Comissão</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {data?.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-zinc-500">
                  Nenhum parceiro.
                </td>
              </tr>
            )}
            {data?.items.map((p) => (
              <tr key={p.id} className={!p.active ? "bg-zinc-50/60" : undefined}>
                <td className="px-3 py-2 font-mono text-xs">{p.code}</td>
                <td className="px-3 py-2">{p.name}</td>
                <td className="px-3 py-2">{p.discount}%</td>
                <td className="px-3 py-2">{p.commission}%</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      p.active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-zinc-200 text-zinc-700"
                    }`}
                  >
                    {p.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => setSelected(p)}
                    className="rounded border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50"
                  >
                    Ações
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <PartnerActionsModal
          partner={selected}
          onClose={() => setSelected(null)}
          onUpdated={applyLocalUpdate}
        />
      )}
    </div>
  );
}

type PatchFn = <T,>(path: string, body: unknown) => Promise<T>;

function PartnerActionsModal({
  partner,
  onClose,
  onUpdated,
}: {
  partner: Partner;
  onClose: () => void;
  onUpdated: (p: Partner) => void;
}) {
  const { patch } = useAdminApi();
  const [tab, setTab] = useState<"data" | "status">("data");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-zinc-200 px-5 py-4">
          <div>
            <div className="text-lg font-semibold">{partner.name}</div>
            <div className="text-xs text-zinc-500">
              Código <span className="font-mono">{partner.code}</span> · criado em{" "}
              {new Date(partner.createdAt).toLocaleDateString("pt-BR")}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <nav className="flex shrink-0 border-b border-zinc-200 px-5">
          {(
            [
              ["data", "Dados"],
              ["status", "Status"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm ${
                tab === k
                  ? "border-zinc-900 font-medium text-zinc-900"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {tab === "data" && (
            <PartnerDataTab partner={partner} patch={patch} onUpdated={onUpdated} />
          )}
          {tab === "status" && (
            <PartnerStatusTab partner={partner} patch={patch} onUpdated={onUpdated} />
          )}
        </div>
      </div>
    </div>
  );
}

function PartnerDataTab({
  partner,
  patch,
  onUpdated,
}: {
  partner: Partner;
  patch: PatchFn;
  onUpdated: (p: Partner) => void;
}) {
  const [name, setName] = useState(partner.name);
  const [walletId, setWalletId] = useState(partner.walletId ?? "");
  const [discount, setDiscount] = useState(String(partner.discount));
  const [commission, setCommission] = useState(String(partner.commission));
  const [saving, setSaving] = useState(false);

  const dirty = useMemo(() => {
    return (
      name !== partner.name ||
      (walletId || null) !== partner.walletId ||
      Number(discount) !== partner.discount ||
      Number(commission) !== partner.commission
    );
  }, [name, walletId, discount, commission, partner]);

  async function save() {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      if (name !== partner.name) payload.name = name;
      if ((walletId || null) !== partner.walletId)
        payload.walletId = walletId || null;
      if (Number(discount) !== partner.discount) payload.discount = Number(discount);
      if (Number(commission) !== partner.commission)
        payload.commission = Number(commission);

      const updated = await patch<Partner>(
        `/admin/partners/${partner.id}`,
        payload,
      );
      toast.success("Dados atualizados.");
      onUpdated(updated);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <label className="text-sm md:col-span-2">
        Nome
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
        />
      </label>
      <label className="text-sm md:col-span-2">
        walletId Asaas (vazio = sem split de pagamento)
        <input
          type="text"
          value={walletId}
          onChange={(e) => setWalletId(e.target.value)}
          className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 font-mono text-xs"
        />
      </label>
      <label className="text-sm">
        Desconto para o cliente (%)
        <input
          type="number"
          min={0}
          max={100}
          step="0.01"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
        />
      </label>
      <label className="text-sm">
        Comissão para o parceiro (%)
        <input
          type="number"
          min={0}
          max={100}
          step="0.01"
          value={commission}
          onChange={(e) => setCommission(e.target.value)}
          className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
        />
      </label>
      <div className="md:col-span-2 flex justify-end">
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}

function PartnerStatusTab({
  partner,
  patch,
  onUpdated,
}: {
  partner: Partner;
  patch: PatchFn;
  onUpdated: (p: Partner) => void;
}) {
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !partner.active;
    const verb = next ? "Ativar" : "Desativar";
    if (
      !window.confirm(
        `${verb} este parceiro? ${
          next
            ? ""
            : "Cupons com esse código deixam de ser aceitos no checkout imediatamente."
        }`,
      )
    )
      return;
    setSaving(true);
    try {
      const updated = await patch<Partner>(`/admin/partners/${partner.id}`, {
        active: next,
      });
      toast.success(next ? "Parceiro ativado." : "Parceiro desativado.");
      onUpdated(updated);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-zinc-700">
        Estado atual:{" "}
        <strong>{partner.active ? "Ativo" : "Inativo"}</strong>.
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        Parceiros inativos têm o cupom rejeitado pelo endpoint público de
        validação. Cobranças já criadas com split continuam válidas até o final
        do ciclo.
      </p>
      <button
        onClick={toggle}
        disabled={saving}
        className={`mt-4 rounded px-4 py-2 text-sm text-white disabled:opacity-50 ${
          partner.active ? "bg-red-600" : "bg-emerald-600"
        }`}
      >
        {partner.active ? "Desativar parceiro" : "Ativar parceiro"}
      </button>
    </div>
  );
}
