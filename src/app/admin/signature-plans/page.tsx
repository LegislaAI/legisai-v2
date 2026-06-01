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

type PlanStatus = "active" | "inactive" | "expired" | "overdue";

type SignaturePlan = {
  id: string;
  name: string;
  description: string;
  pixPrice: number;
  creditCardPrice: number;
  userQuantity: number;
  yearlyDiscount: number;
  level: number;
  isInternal: boolean;
  status: PlanStatus;
  createdAt: string;
};

const STATUS_LABEL: Record<PlanStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  expired: "Expirado",
  overdue: "Em atraso",
};

const STATUS_BADGE: Record<PlanStatus, string> = {
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-zinc-200 text-zinc-700",
  expired: "bg-zinc-200 text-zinc-700",
  overdue: "bg-amber-100 text-amber-800",
};

function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const EMPTY_FORM = {
  name: "",
  description: "",
  pixPrice: "",
  creditCardPrice: "",
  userQuantity: "1",
  yearlyDiscount: "0",
  level: "1",
  isInternal: false,
  status: "active" as PlanStatus,
};

type FormState = typeof EMPTY_FORM;

export default function AdminSignaturePlansPage() {
  const { list, post, patch, del } = useAdminApi();
  const [plans, setPlans] = useState<SignaturePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<SignaturePlan | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await list<{ plans: SignaturePlan[] }>(
        "/admin/signature-plans",
      );
      setPlans(res.plans);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [list]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  async function remove(plan: SignaturePlan) {
    if (
      !window.confirm(
        `Excluir o plano "${plan.name}"? Só funciona se nenhuma assinatura ou plano sob medida estiver usando.`,
      )
    )
      return;
    try {
      await del(`/admin/signature-plans/${plan.id}`);
      toast.success("Plano excluído.");
      fetchPlans();
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Planos de assinatura</h1>
        <button
          onClick={() => setCreating(true)}
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white"
        >
          Novo plano
        </button>
      </div>
      <p className="mt-1 text-sm text-zinc-600">
        Catálogo de planos. Planos <strong>internos</strong> (ex.: trial) ficam
        escondidos do catálogo público mas podem ser atribuídos manualmente.
      </p>

      <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Nome</th>
              <th className="px-3 py-2 font-medium">Nível</th>
              <th className="px-3 py-2 font-medium">PIX (mensal)</th>
              <th className="px-3 py-2 font-medium">Cartão (mensal)</th>
              <th className="px-3 py-2 font-medium">Desconto anual</th>
              <th className="px-3 py-2 font-medium">Visibilidade</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-zinc-500">
                  Carregando…
                </td>
              </tr>
            )}
            {!loading && plans.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-zinc-500">
                  Nenhum plano cadastrado.
                </td>
              </tr>
            )}
            {!loading &&
              plans.map((p) => (
                <tr
                  key={p.id}
                  className={p.status !== "active" ? "bg-zinc-50/60" : undefined}
                >
                  <td className="px-3 py-2">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-zinc-500">
                      {p.userQuantity} usuário(s)
                    </div>
                  </td>
                  <td className="px-3 py-2">{p.level}</td>
                  <td className="px-3 py-2 text-zinc-600">
                    {formatBRL(p.pixPrice)}
                  </td>
                  <td className="px-3 py-2 text-zinc-600">
                    {formatBRL(p.creditCardPrice)}
                  </td>
                  <td className="px-3 py-2 text-zinc-600">
                    {p.yearlyDiscount}%
                  </td>
                  <td className="px-3 py-2">
                    {p.isInternal ? (
                      <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                        Interno
                      </span>
                    ) : (
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        Catálogo
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[p.status]}`}
                    >
                      {STATUS_LABEL[p.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditing(p)}
                        className="rounded border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className="rounded border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <PlanFormModal
          title="Novo plano"
          initial={EMPTY_FORM}
          onClose={() => setCreating(false)}
          onSubmit={async (form) => {
            await post("/admin/signature-plans", formToPayload(form));
            toast.success("Plano criado.");
            setCreating(false);
            fetchPlans();
          }}
        />
      )}

      {editing && (
        <PlanFormModal
          title={`Editar plano · ${editing.name}`}
          initial={planToForm(editing)}
          onClose={() => setEditing(null)}
          onSubmit={async (form) => {
            await patch(
              `/admin/signature-plans/${editing.id}`,
              formToPayload(form),
            );
            toast.success("Plano atualizado.");
            setEditing(null);
            fetchPlans();
          }}
        />
      )}
    </div>
  );
}

function planToForm(p: SignaturePlan): FormState {
  return {
    name: p.name,
    description: p.description,
    pixPrice: String(p.pixPrice),
    creditCardPrice: String(p.creditCardPrice),
    userQuantity: String(p.userQuantity),
    yearlyDiscount: String(p.yearlyDiscount),
    level: String(p.level),
    isInternal: p.isInternal,
    status: p.status,
  };
}

function formToPayload(f: FormState) {
  return {
    name: f.name,
    description: f.description,
    pixPrice: Number(f.pixPrice),
    creditCardPrice: Number(f.creditCardPrice),
    userQuantity: Number(f.userQuantity),
    yearlyDiscount: Number(f.yearlyDiscount),
    level: Number(f.level),
    isInternal: f.isInternal,
    status: f.status,
  };
}

function PlanFormModal({
  title,
  initial,
  onClose,
  onSubmit,
}: {
  title: string;
  initial: FormState;
  onClose: () => void;
  onSubmit: (form: FormState) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const valid = useMemo(() => {
    return (
      form.name.trim().length > 0 &&
      Number(form.pixPrice) >= 0 &&
      Number(form.creditCardPrice) >= 0 &&
      Number(form.userQuantity) >= 1 &&
      Number(form.yearlyDiscount) >= 0 &&
      Number(form.yearlyDiscount) <= 100 &&
      Number(form.level) >= 1 &&
      Number(form.level) <= 10
    );
  }, [form]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return toast.error("Revise os campos obrigatórios.");
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

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
          <div className="text-lg font-semibold">{title}</div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-900">
            ✕
          </button>
        </div>

        <form
          onSubmit={submit}
          className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto px-5 py-5 md:grid-cols-2"
        >
          <label className="text-sm md:col-span-2">
            Nome do plano
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              required
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm md:col-span-2">
            Descrição
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={2}
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm">
            Preço PIX mensal (R$)
            <input
              type="number"
              step="0.01"
              min={0}
              value={form.pixPrice}
              onChange={(e) => setField("pixPrice", e.target.value)}
              required
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm">
            Preço cartão mensal (R$)
            <input
              type="number"
              step="0.01"
              min={0}
              value={form.creditCardPrice}
              onChange={(e) => setField("creditCardPrice", e.target.value)}
              required
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm">
            Desconto anual (% de 0 a 100)
            <input
              type="number"
              step="0.01"
              min={0}
              max={100}
              value={form.yearlyDiscount}
              onChange={(e) => setField("yearlyDiscount", e.target.value)}
              required
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm">
            Qtd. de usuários
            <input
              type="number"
              min={1}
              value={form.userQuantity}
              onChange={(e) => setField("userQuantity", e.target.value)}
              required
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm">
            Nível (1 = mais restrito, 10 = acesso total)
            <input
              type="number"
              min={1}
              max={10}
              value={form.level}
              onChange={(e) => setField("level", e.target.value)}
              required
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm">
            Status
            <Select
              value={form.status}
              onValueChange={(v) => setField("status", v as PlanStatus)}
            >
              <SelectTrigger className="mt-1 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
                <SelectItem value="overdue">Em atraso</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={form.isInternal}
              onChange={(e) => setField("isInternal", e.target.checked)}
            />
            Plano interno (não aparece no catálogo público — usado para trial,
            cortesia etc.)
          </label>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!valid || saving}
              className="rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
