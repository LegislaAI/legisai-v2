"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/v2/components/ui/select";

import { UserCombobox } from "../_components/UserCombobox";
import { Paginated, useAdminApi } from "../_lib/admin-api";

type CustomPlan = {
  id: string;
  basePlanId: string;
  userId: string;
  status: "ACTIVE" | "EXPIRED" | "USED" | "CANCELED";
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
  pixMonthlyEnabled: boolean;
  pixYearlyEnabled: boolean;
  creditMonthlyEnabled: boolean;
  creditYearlyEnabled: boolean;
  pixMonthlyPrice: number | null;
  pixYearlyPrice: number | null;
  creditMonthlyPrice: number | null;
  creditYearlyPrice: number | null;
  basePlan: { name: string; level: number };
  user: { id: string; name: string; email: string } | null;
};

type SelectedUser = { id: string; name: string; email: string };

type CreateResponse = { customPlan: CustomPlan; token: string };

type SignaturePlanLite = {
  id: string;
  name: string;
  level: number;
  isInternal: boolean;
};

const STATUS_BADGE: Record<CustomPlan["status"], string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  EXPIRED: "bg-zinc-200 text-zinc-700",
  USED: "bg-blue-100 text-blue-800",
  CANCELED: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<CustomPlan["status"], string> = {
  ACTIVE: "Ativo",
  EXPIRED: "Expirado",
  USED: "Utilizado",
  CANCELED: "Cancelado",
};

function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type Method = {
  label: string;
  price: number;
};

function methodsOf(cp: CustomPlan): Method[] {
  const out: Method[] = [];
  if (cp.pixMonthlyEnabled && cp.pixMonthlyPrice != null)
    out.push({ label: "PIX mensal", price: cp.pixMonthlyPrice });
  if (cp.pixYearlyEnabled && cp.pixYearlyPrice != null)
    out.push({ label: "PIX anual", price: cp.pixYearlyPrice });
  if (cp.creditMonthlyEnabled && cp.creditMonthlyPrice != null)
    out.push({ label: "Cartão mensal", price: cp.creditMonthlyPrice });
  if (cp.creditYearlyEnabled && cp.creditYearlyPrice != null)
    out.push({ label: "Cartão anual", price: cp.creditYearlyPrice });
  return out;
}

export default function AdminCustomPlansPage() {
  const { list, post } = useAdminApi();
  const [data, setData] = useState<Paginated<CustomPlan> | null>(null);
  const [plans, setPlans] = useState<SignaturePlanLite[]>([]);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [lastToken, setLastToken] = useState<{ id: string; url: string } | null>(null);
  const [actionTarget, setActionTarget] = useState<CustomPlan | null>(null);

  // ---- Form state ----
  const [basePlanId, setBasePlanId] = useState("");
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [validForMinutes, setValidForMinutes] = useState(1440);
  const [pixMonthlyPrice, setPixMonthlyPrice] = useState("");
  const [pixYearlyPrice, setPixYearlyPrice] = useState("");
  const [creditMonthlyPrice, setCreditMonthlyPrice] = useState("");
  const [creditYearlyPrice, setCreditYearlyPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPage = useCallback(async () => {
    try {
      const res = await list<Paginated<CustomPlan>>("/admin/custom-plans", {
        page: String(page),
      });
      setData(res);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  }, [list, page]);

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
    fetchPage();
  }, [fetchPage]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  function buildLink(token: string): string {
    if (typeof window === "undefined") return token;
    return `${window.location.origin}/custom-plans/checkout?token=${encodeURIComponent(token)}`;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!basePlanId || !selectedUser) {
      toast.error("Plano base e usuário são obrigatórios.");
      return;
    }
    setSubmitting(true);
    const body = {
      basePlanId,
      userId: selectedUser.id,
      validForMinutes,
      pixMonthlyPrice: pixMonthlyPrice ? Number(pixMonthlyPrice) : undefined,
      pixYearlyPrice: pixYearlyPrice ? Number(pixYearlyPrice) : undefined,
      creditMonthlyPrice: creditMonthlyPrice ? Number(creditMonthlyPrice) : undefined,
      creditYearlyPrice: creditYearlyPrice ? Number(creditYearlyPrice) : undefined,
      pixMonthlyEnabled: !!pixMonthlyPrice,
      pixYearlyEnabled: !!pixYearlyPrice,
      creditMonthlyEnabled: !!creditMonthlyPrice,
      creditYearlyEnabled: !!creditYearlyPrice,
    };
    try {
      const res = await post<CreateResponse>("/admin/custom-plans", body);
      const link = buildLink(res.token);
      setLastToken({ id: res.customPlan.id, url: link });
      toast.success("Custom plan criado.");
      setShowForm(false);
      setBasePlanId("");
      setSelectedUser(null);
      setPixMonthlyPrice("");
      setPixYearlyPrice("");
      setCreditMonthlyPrice("");
      setCreditYearlyPrice("");
      fetchPage();
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function cancel(id: string) {
    if (!window.confirm("Cancelar este custom plan?")) return;
    try {
      await post(`/admin/custom-plans/${id}/cancel`, {});
      toast.success("Cancelado.");
      fetchPage();
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado.");
    } catch {
      toast.error("Não foi possível copiar.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Planos sob medida</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white"
        >
          {showForm ? "Fechar" : "Criar novo"}
        </button>
      </div>

      {lastToken && (
        <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 p-4">
          <div className="text-sm font-medium text-emerald-900">
            Link de checkout do plano {lastToken.id.slice(0, 8)}…
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={lastToken.url}
              readOnly
              className="flex-1 rounded border border-emerald-300 bg-white px-2 py-1 font-mono text-xs"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              onClick={() => copyLink(lastToken.url)}
              className="rounded bg-emerald-700 px-3 py-1 text-xs text-white"
            >
              Copiar
            </button>
            <button
              onClick={() => setLastToken(null)}
              className="text-xs text-emerald-800 underline"
            >
              Fechar
            </button>
          </div>
          <div className="mt-2 text-xs text-emerald-800">
            Envie ao cliente. O link expira em {validForMinutes} min (ou quando usado).
          </div>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={submit}
          className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-zinc-200 bg-white p-4 md:grid-cols-2"
        >
          <div className="text-sm">
            <label className="block">Plano base</label>
            <div className="mt-1">
              <Select
                value={basePlanId}
                onValueChange={(v) => setBasePlanId(v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} (L{p.level}){p.isInternal ? " · interno" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-sm">
            <label className="block">Usuário</label>
            <div className="mt-1">
              <UserCombobox
                value={selectedUser}
                onChange={setSelectedUser}
                placeholder="Buscar e selecionar usuário…"
              />
            </div>
          </div>
          <label className="text-sm">
            PIX mensal (R$, deixe vazio se desativado)
            <input
              type="number"
              step="0.01"
              value={pixMonthlyPrice}
              onChange={(e) => setPixMonthlyPrice(e.target.value)}
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm">
            PIX anual (R$, vazio se desativado)
            <input
              type="number"
              step="0.01"
              value={pixYearlyPrice}
              onChange={(e) => setPixYearlyPrice(e.target.value)}
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm">
            Cartão mensal (R$)
            <input
              type="number"
              step="0.01"
              value={creditMonthlyPrice}
              onChange={(e) => setCreditMonthlyPrice(e.target.value)}
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm">
            Cartão anual (R$)
            <input
              type="number"
              step="0.01"
              value={creditYearlyPrice}
              onChange={(e) => setCreditYearlyPrice(e.target.value)}
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm md:col-span-2">
            Validade do link (minutos, 1–43200)
            <input
              type="number"
              min={1}
              max={43200}
              value={validForMinutes}
              onChange={(e) => setValidForMinutes(Number(e.target.value))}
              className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
              required
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {submitting ? "Criando…" : "Criar e gerar link"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Criado</th>
              <th className="px-3 py-2 font-medium">Base</th>
              <th className="px-3 py-2 font-medium">Usuário</th>
              <th className="px-3 py-2 font-medium">Métodos</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Expira</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {data?.items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-zinc-500">
                  Nenhum custom plan.
                </td>
              </tr>
            )}
            {data?.items.map((cp) => (
              <tr key={cp.id}>
                <td className="px-3 py-2 text-zinc-600">
                  {new Date(cp.createdAt).toLocaleString("pt-BR")}
                </td>
                <td className="px-3 py-2">
                  {cp.basePlan.name}{" "}
                  <span className="text-xs text-zinc-500">L{cp.basePlan.level}</span>
                </td>
                <td className="px-3 py-2">
                  {cp.user ? (
                    <div>
                      <div className="font-medium">{cp.user.name}</div>
                      <div className="text-xs text-zinc-500">{cp.user.email}</div>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-400">usuário removido</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {methodsOf(cp).map((m) => (
                      <span
                        key={m.label}
                        className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2 py-0.5 text-xs"
                      >
                        <span className="text-zinc-700">{m.label}</span>
                        <span className="font-medium text-zinc-900">
                          {formatBRL(m.price)}
                        </span>
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[cp.status]}`}
                  >
                    {STATUS_LABEL[cp.status]}
                  </span>
                </td>
                <td className="px-3 py-2 text-zinc-600">
                  {new Date(cp.expiresAt).toLocaleString("pt-BR")}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => setActionTarget(cp)}
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

      {data && data.total > data.pageSize && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-zinc-600">
            Página {data.page} de {Math.ceil(data.total / data.pageSize)}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border border-zinc-300 px-3 py-1 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              disabled={page * data.pageSize >= data.total}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-zinc-300 px-3 py-1 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {actionTarget && (
        <CustomPlanActionsModal
          customPlan={actionTarget}
          onClose={() => setActionTarget(null)}
          onCancel={async () => {
            await cancel(actionTarget.id);
            setActionTarget(null);
          }}
        />
      )}
    </div>
  );
}

function CustomPlanActionsModal({
  customPlan,
  onClose,
  onCancel,
}: {
  customPlan: CustomPlan;
  onClose: () => void;
  onCancel: () => Promise<void> | void;
}) {
  const cp = customPlan;
  const isActive = cp.status === "ACTIVE";

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
            <div className="text-lg font-semibold">
              {cp.basePlan.name}{" "}
              <span className="text-xs font-normal text-zinc-500">
                Nível {cp.basePlan.level}
              </span>
            </div>
            <div className="text-xs text-zinc-500">
              {cp.user
                ? `${cp.user.name} · ${cp.user.email}`
                : "usuário removido"}
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

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Detalhes
            </h2>
            <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Info label="Status">
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[cp.status]}`}
                >
                  {STATUS_LABEL[cp.status]}
                </span>
              </Info>
              <Info label="Criado em">
                {new Date(cp.createdAt).toLocaleString("pt-BR")}
              </Info>
              <Info label="Expira em">
                {new Date(cp.expiresAt).toLocaleString("pt-BR")}
              </Info>
              {cp.usedAt && (
                <Info label="Utilizado em">
                  {new Date(cp.usedAt).toLocaleString("pt-BR")}
                </Info>
              )}
            </dl>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Métodos disponíveis
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {methodsOf(cp).map((m) => (
                <span
                  key={m.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs"
                >
                  <span className="text-zinc-700">{m.label}</span>
                  <span className="font-medium text-zinc-900">
                    {formatBRL(m.price)}
                  </span>
                </span>
              ))}
            </div>
          </section>

          {isActive && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Link de checkout
              </h2>
              <p className="mt-1 text-xs text-zinc-600">
                O link único só é exibido no momento da criação (o token
                assinado não pode ser regerado depois). Se você o perdeu,
                cancele este plano e crie outro.
              </p>
            </section>
          )}

          {isActive && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Cancelar plano
              </h2>
              <p className="mt-1 text-xs text-zinc-600">
                Inutiliza o link de checkout imediatamente. O usuário não
                consegue mais consumir esta oferta.
              </p>
              <button
                onClick={onCancel}
                className="mt-2 rounded bg-red-600 px-3 py-1 text-xs text-white"
              >
                Cancelar plano
              </button>
            </section>
          )}

          {!isActive && (
            <p className="rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
              Nenhuma ação disponível: este plano está {STATUS_LABEL[cp.status].toLowerCase()}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}
