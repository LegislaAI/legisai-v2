"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { DatePicker } from "@/components/v2/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/v2/components/ui/select";

import { UserCombobox } from "../_components/UserCombobox";
import { Paginated, useAdminApi } from "../_lib/admin-api";

type SignatureStatus = "active" | "inactive" | "expired" | "overdue";

type Signature = {
  id: string;
  status: SignatureStatus;
  expirationDate: string;
  overdueUntil: string | null;
  paymentType: "pix" | "credit_card";
  yearly: boolean;
  asaasSubscriptionId: string | null;
  isAutoRenewActivated: boolean;
  installmentCount: number;
  createdAt: string;
  signaturePlan: { name: string; level: number };
  user: { id: string; name: string; email: string };
};

const STATUS_LABEL: Record<SignatureStatus, string> = {
  active: "Ativa",
  overdue: "Em atraso",
  inactive: "Inativa",
  expired: "Expirada",
};

const STATUS_BADGE: Record<SignatureStatus, string> = {
  active: "bg-emerald-100 text-emerald-800",
  overdue: "bg-amber-100 text-amber-800",
  inactive: "bg-zinc-200 text-zinc-700",
  expired: "bg-zinc-200 text-zinc-700",
};

const PAYMENT_TYPE_LABEL: Record<Signature["paymentType"], string> = {
  pix: "Pix",
  credit_card: "Cartão de crédito",
};

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export default function AdminSignaturesPage() {
  const { list, post } = useAdminApi();
  const [data, setData] = useState<Paginated<Signature> | null>(null);
  const [statusFilter, setStatusFilter] = useState<SignatureStatus | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Signature | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await list<Paginated<Signature>>("/admin/signatures", {
        page: String(page),
        pageSize: String(pageSize),
        status: statusFilter || undefined,
      });
      setData(res);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [list, page, pageSize, statusFilter]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  function applyLocalUpdate(updated: Signature) {
    setData((d) =>
      d
        ? {
            ...d,
            items: d.items.map((s) => (s.id === updated.id ? updated : s)),
          }
        : d,
    );
    setSelected(updated);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Assinaturas</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white"
        >
          Nova assinatura manual
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="w-44">
          <Select
            value={statusFilter || "all"}
            onValueChange={(v) => {
              setStatusFilter(v === "all" ? "" : (v as SignatureStatus));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="overdue">Em atraso</SelectItem>
              <SelectItem value="inactive">Inativas</SelectItem>
              <SelectItem value="expired">Expiradas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <span>Por página</span>
          <div className="w-20">
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {data && (
          <span className="text-xs text-zinc-500">
            {data.total.toLocaleString("pt-BR")} resultado(s)
          </span>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Usuário</th>
              <th className="px-3 py-2 font-medium">Plano</th>
              <th className="px-3 py-2 font-medium">Forma de pagamento</th>
              <th className="px-3 py-2 font-medium">Periodicidade</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Expira em</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-zinc-500">
                  Carregando…
                </td>
              </tr>
            )}
            {!loading && data?.items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-zinc-500">
                  Nenhuma assinatura.
                </td>
              </tr>
            )}
            {!loading &&
              data?.items.map((s) => (
                <tr key={s.id}>
                  <td className="px-3 py-2">
                    <div className="font-medium">{s.user.name}</div>
                    <div className="text-xs text-zinc-500">{s.user.email}</div>
                  </td>
                  <td className="px-3 py-2">
                    {s.signaturePlan.name}{" "}
                    <span className="text-xs text-zinc-500">
                      Nível {s.signaturePlan.level}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-zinc-600">
                    {PAYMENT_TYPE_LABEL[s.paymentType]}
                  </td>
                  <td className="px-3 py-2 text-zinc-600">
                    {s.yearly ? "Anual" : "Mensal"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[s.status]}`}
                    >
                      {STATUS_LABEL[s.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-zinc-600">
                    {new Date(s.expirationDate).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => setSelected(s)}
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
        <Pagination
          page={page}
          total={data.total}
          pageSize={data.pageSize}
          onChange={setPage}
        />
      )}

      {selected && (
        <SignatureActionsModal
          signature={selected}
          onClose={() => setSelected(null)}
          onUpdated={applyLocalUpdate}
        />
      )}

      {showCreate && (
        <CreateSignatureModal
          post={post}
          list={list}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchPage();
          }}
        />
      )}
    </div>
  );
}

type PostFn = <T,>(path: string, body: unknown) => Promise<T>;
type ListFn = <T,>(
  path: string,
  query?: Record<string, string | undefined>,
) => Promise<T>;

type PlanLite = {
  id: string;
  name: string;
  level: number;
  isInternal: boolean;
};

function CreateSignatureModal({
  post,
  list,
  onClose,
  onCreated,
}: {
  post: PostFn;
  list: ListFn;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [planId, setPlanId] = useState("");
  const [plans, setPlans] = useState<PlanLite[]>([]);
  const [expirationDate, setExpirationDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  );
  const [yearly, setYearly] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    list<{ plans: PlanLite[] }>("/admin/signature-plans")
      .then((r) => setPlans(r.plans))
      .catch((e: unknown) => toast.error((e as Error).message));
  }, [list]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return toast.error("Selecione um usuário.");
    if (!planId) return toast.error("Escolha um plano.");
    setSaving(true);
    try {
      await post("/admin/signatures", {
        userId: user.id,
        planId,
        expirationDate: new Date(expirationDate + "T23:59:59").toISOString(),
        yearly,
      });
      toast.success("Assinatura criada manualmente.");
      onCreated();
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
        className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-zinc-200 px-5 py-4">
          <div>
            <div className="text-lg font-semibold">Nova assinatura manual</div>
            <div className="text-xs text-zinc-500">
              Concede acesso sem cobrança (cortesia, reembolso compensatório,
              testes). A ação é registrada na auditoria.
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-900">
            ✕
          </button>
        </div>

        <form
          onSubmit={submit}
          className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
        >
          <div>
            <label className="text-sm font-medium">Usuário</label>
            <div className="mt-1">
              <UserCombobox value={user} onChange={setUser} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Plano</label>
            <div className="mt-1">
              <Select value={planId} onValueChange={setPlanId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} (Nível {p.level})
                      {p.isInternal ? " · interno" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Data de expiração</label>
            <div className="mt-1 max-w-xs">
              <DatePicker
                value={expirationDate}
                onValueChange={setExpirationDate}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={yearly}
              onChange={(e) => setYearly(e.target.checked)}
            />
            Marcar como assinatura anual (afeta exibição; sem efeito em
            cobrança)
          </label>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? "Criando…" : "Criar assinatura"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Pagination({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (n: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <span className="text-zinc-600">
        Página {page} de {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onChange(1)}
          className="rounded border border-zinc-300 px-3 py-1 disabled:opacity-50"
        >
          «
        </button>
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded border border-zinc-300 px-3 py-1 disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="rounded border border-zinc-300 px-3 py-1 disabled:opacity-50"
        >
          Próxima
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onChange(totalPages)}
          className="rounded border border-zinc-300 px-3 py-1 disabled:opacity-50"
        >
          »
        </button>
      </div>
    </div>
  );
}

function SignatureActionsModal({
  signature,
  onClose,
  onUpdated,
}: {
  signature: Signature;
  onClose: () => void;
  onUpdated: (s: Signature) => void;
}) {
  const { post } = useAdminApi();
  const [busy, setBusy] = useState(false);

  // Estado do form de "definir data de expiração"
  const todayPlusDays = (d: number) =>
    new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const currentExpDate = new Date(signature.expirationDate)
    .toISOString()
    .slice(0, 10);
  const [newExpDate, setNewExpDate] = useState(currentExpDate);

  const isActive = signature.status === "active" || signature.status === "overdue";

  async function activateUntil(dateISO: string) {
    if (!dateISO) return;
    setBusy(true);
    try {
      await post(`/admin/signatures/${signature.id}/activate`, {
        expirationDate: new Date(dateISO + "T23:59:59").toISOString(),
      });
      toast.success("Assinatura ativada / prazo atualizado.");
      onUpdated({
        ...signature,
        status: "active",
        expirationDate: new Date(dateISO + "T23:59:59").toISOString(),
        overdueUntil: null,
      });
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function cancelNow() {
    if (
      !window.confirm(
        "Cancelar esta assinatura imediatamente? O usuário perde acesso agora.",
      )
    )
      return;
    setBusy(true);
    try {
      await post(`/admin/signatures/${signature.id}/cancel`, {});
      toast.success("Assinatura cancelada.");
      onUpdated({
        ...signature,
        status: "inactive",
        isAutoRenewActivated: false,
        overdueUntil: null,
      });
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function turnOffAutoRenew() {
    if (
      !window.confirm(
        "Desligar a renovação automática? A assinatura segue válida até a data de expiração, mas não cobra novamente.",
      )
    )
      return;
    setBusy(true);
    try {
      await post(`/signature/${signature.id}/cancel-renewal`, {});
      toast.success("Renovação automática desligada.");
      onUpdated({ ...signature, isAutoRenewActivated: false });
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
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
          <div>
            <div className="text-lg font-semibold">
              {signature.signaturePlan.name}{" "}
              <span className="text-xs font-normal text-zinc-500">
                Nível {signature.signaturePlan.level}
              </span>
            </div>
            <div className="text-xs text-zinc-500">
              {signature.user.name} · {signature.user.email}
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
          {/* Detalhes */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Detalhes
            </h2>
            <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Info label="Status">
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[signature.status]}`}
                >
                  {STATUS_LABEL[signature.status]}
                </span>
              </Info>
              <Info label="Forma de pagamento">
                {PAYMENT_TYPE_LABEL[signature.paymentType]}
              </Info>
              <Info label="Periodicidade">
                {signature.yearly ? "Anual" : "Mensal"}
              </Info>
              <Info label="Renovação automática">
                {signature.isAutoRenewActivated ? "Ligada" : "Desligada"}
              </Info>
              <Info label="Expira em">
                {new Date(signature.expirationDate).toLocaleDateString("pt-BR")}
              </Info>
              {signature.overdueUntil && (
                <Info label="Período de carência até">
                  {new Date(signature.overdueUntil).toLocaleDateString("pt-BR")}
                </Info>
              )}
              <Info label="Parcelas">{signature.installmentCount}</Info>
              <Info label="Criada em">
                {new Date(signature.createdAt).toLocaleDateString("pt-BR")}
              </Info>
            </dl>
          </section>

          {/* Estender / definir prazo */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Ajustar prazo
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              Define a nova data de expiração. Se a assinatura estava inativa ou
              expirada, ela volta a ficar ativa.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="w-44">
                <DatePicker
                  value={newExpDate}
                  onValueChange={setNewExpDate}
                  placeholder="Nova data de expiração"
                />
              </div>
              <button
                onClick={() => activateUntil(newExpDate)}
                disabled={busy || !newExpDate}
                className="rounded bg-zinc-900 px-3 py-1 text-xs text-white disabled:opacity-50"
              >
                Aplicar data
              </button>
              <span className="text-xs text-zinc-400">ou</span>
              {[
                { label: "+30 dias", days: 30 },
                { label: "+90 dias", days: 90 },
                { label: "+1 ano", days: 365 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => activateUntil(todayPlusDays(opt.days))}
                  disabled={busy}
                  className="rounded border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50 disabled:opacity-50"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* Renovação automática */}
          {isActive && signature.isAutoRenewActivated && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Renovação automática
              </h2>
              <p className="mt-1 text-xs text-zinc-600">
                Mantém a assinatura ativa até a expiração, mas o gateway não
                tenta nova cobrança.
              </p>
              <button
                onClick={turnOffAutoRenew}
                disabled={busy}
                className="mt-2 rounded border border-amber-300 bg-amber-50 px-3 py-1 text-xs text-amber-900 hover:bg-amber-100 disabled:opacity-50"
              >
                Desligar renovação automática
              </button>
            </section>
          )}

          {/* Cancelar */}
          {isActive && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Cancelar agora
              </h2>
              <p className="mt-1 text-xs text-zinc-600">
                Marca a assinatura como inativa imediatamente. O usuário perde
                acesso. Use quando houver decisão definitiva (reembolso, fraude,
                solicitação do cliente).
              </p>
              <button
                onClick={cancelNow}
                disabled={busy}
                className="mt-2 rounded bg-red-600 px-3 py-1 text-xs text-white disabled:opacity-50"
              >
                Cancelar imediatamente
              </button>
            </section>
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
