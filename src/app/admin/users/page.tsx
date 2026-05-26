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
import { maskCep, maskCpfCnpj, maskPhone } from "@/lib/masks";

import { Paginated, useAdminApi } from "../_lib/admin-api";

const digits = (s: string) => s.replace(/\D+/g, "");

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string | null;
  profession?: string | null;
  postalCode?: string | null;
  addressNumber?: string | null;
  role: "USER" | "ADMIN";
  active: boolean;
  createdAt: string;
};

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export default function AdminUsersPage() {
  const { list, patch } = useAdminApi();
  const [data, setData] = useState<Paginated<User> | null>(null);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);

  // Debounce de 400ms: só dispara fetch após o usuário parar de digitar.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [q]);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await list<Paginated<User>>("/admin/users", {
        page: String(page),
        pageSize: String(pageSize),
        q: debouncedQ || undefined,
      });
      setData(res);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [list, page, pageSize, debouncedQ]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  function reloadKeepingSelection(updatedUser: User) {
    setData((d) =>
      d
        ? {
            ...d,
            items: d.items.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
          }
        : d,
    );
    setSelected(updatedUser);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Usuários</h1>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, email ou CPF/CNPJ…"
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
          />
          {q !== debouncedQ && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
              …
            </span>
          )}
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
              <th className="px-3 py-2 font-medium">Nome</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">CPF/CNPJ</th>
              <th className="px-3 py-2 font-medium">Permissão</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Criado em</th>
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
                  Nenhum usuário.
                </td>
              </tr>
            )}
            {!loading &&
              data?.items.map((u) => (
                <tr key={u.id} className={!u.active ? "bg-zinc-50/60" : undefined}>
                  <td className="px-3 py-2">{u.name}</td>
                  <td className="px-3 py-2 text-zinc-600">{u.email}</td>
                  <td className="px-3 py-2 text-zinc-600">
                    {u.cpfCnpj ? maskCpfCnpj(u.cpfCnpj) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        u.role === "ADMIN"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {u.role === "ADMIN" ? "Administrador" : "Usuário"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        u.active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.active ? "Ativo" : "Desativado"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-zinc-500">
                    {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => setSelected(u)}
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
        <UserActionsModal
          user={selected}
          onClose={() => setSelected(null)}
          patch={patch}
          onUpdated={reloadKeepingSelection}
        />
      )}
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

type PatchFn = <T,>(path: string, body: unknown) => Promise<T>;

function UserActionsModal({
  user,
  onClose,
  patch,
  onUpdated,
}: {
  user: User;
  onClose: () => void;
  patch: PatchFn;
  onUpdated: (u: User) => void;
}) {
  const [tab, setTab] = useState<"data" | "permission" | "account">("data");

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
            <div className="text-lg font-semibold">{user.name}</div>
            <div className="text-xs text-zinc-500">{user.email}</div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-900">
            ✕
          </button>
        </div>

        <nav className="flex shrink-0 border-b border-zinc-200 px-5">
          {(
            [
              ["data", "Dados de cadastro"],
              ["permission", "Permissão"],
              ["account", "Conta"],
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
            <UserDataTab user={user} patch={patch} onUpdated={onUpdated} />
          )}
          {tab === "permission" && (
            <UserPermissionTab user={user} patch={patch} onUpdated={onUpdated} />
          )}
          {tab === "account" && (
            <UserAccountTab user={user} patch={patch} onUpdated={onUpdated} />
          )}
        </div>
      </div>
    </div>
  );
}

function UserDataTab({
  user,
  patch,
  onUpdated,
}: {
  user: User;
  patch: PatchFn;
  onUpdated: (u: User) => void;
}) {
  // Estado guarda os valores mascarados (UI). No save, normalizamos com digits().
  const [form, setForm] = useState({
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ? maskPhone(user.phone) : "",
    cpfCnpj: user.cpfCnpj ? maskCpfCnpj(user.cpfCnpj) : "",
    profession: user.profession ?? "",
    postalCode: user.postalCode ? maskCep(user.postalCode) : "",
    addressNumber: user.addressNumber ?? "",
  });
  const [saving, setSaving] = useState(false);

  // Comparações na base: dígitos puros para campos mascarados, texto para os demais.
  const dirty = useMemo(() => {
    return (
      form.name !== (user.name ?? "") ||
      form.email !== (user.email ?? "") ||
      digits(form.phone) !== digits(user.phone ?? "") ||
      digits(form.cpfCnpj) !== digits(user.cpfCnpj ?? "") ||
      form.profession !== (user.profession ?? "") ||
      digits(form.postalCode) !== digits(user.postalCode ?? "") ||
      form.addressNumber !== (user.addressNumber ?? "")
    );
  }, [form, user]);

  async function save() {
    setSaving(true);
    try {
      const payload: Record<string, string | null> = {};
      const phoneDigits = digits(form.phone);
      const cpfDigits = digits(form.cpfCnpj);
      const cepDigits = digits(form.postalCode);

      if (form.name !== user.name) payload.name = form.name;
      if (form.email !== user.email) payload.email = form.email;
      if (phoneDigits !== digits(user.phone ?? "")) payload.phone = phoneDigits;
      if (cpfDigits !== digits(user.cpfCnpj ?? ""))
        payload.cpfCnpj = cpfDigits || null;
      if (form.profession !== (user.profession ?? ""))
        payload.profession = form.profession;
      if (cepDigits !== digits(user.postalCode ?? ""))
        payload.postalCode = cepDigits || null;
      if (form.addressNumber !== (user.addressNumber ?? ""))
        payload.addressNumber = form.addressNumber || null;

      await patch(`/admin/users/${user.id}`, payload);
      toast.success("Dados atualizados.");
      onUpdated({
        ...user,
        name: form.name,
        email: form.email,
        phone: phoneDigits,
        cpfCnpj: cpfDigits || null,
        profession: form.profession,
        postalCode: cepDigits || null,
        addressNumber: form.addressNumber || null,
      });
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Field
        label="Nome"
        value={form.name}
        onChange={(v) => setForm({ ...form, name: v })}
        wide
      />
      <Field
        label="Email"
        type="email"
        value={form.email}
        onChange={(v) => setForm({ ...form, email: v })}
      />
      <Field
        label="Telefone"
        value={form.phone}
        onChange={(v) => setForm({ ...form, phone: maskPhone(v) })}
        placeholder="(00) 00000-0000"
      />
      <Field
        label="CPF/CNPJ"
        value={form.cpfCnpj}
        onChange={(v) => setForm({ ...form, cpfCnpj: maskCpfCnpj(v) })}
        placeholder="000.000.000-00 ou 00.000.000/0000-00"
      />
      <Field
        label="Profissão"
        value={form.profession}
        onChange={(v) => setForm({ ...form, profession: v })}
      />
      <Field
        label="CEP"
        value={form.postalCode}
        onChange={(v) => setForm({ ...form, postalCode: maskCep(v) })}
        placeholder="00000-000"
      />
      <Field
        label="Número do endereço"
        value={form.addressNumber}
        onChange={(v) => setForm({ ...form, addressNumber: v })}
      />
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

function UserPermissionTab({
  user,
  patch,
  onUpdated,
}: {
  user: User;
  patch: PatchFn;
  onUpdated: (u: User) => void;
}) {
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = user.role === "ADMIN" ? "USER" : "ADMIN";
    const labelNext = next === "ADMIN" ? "Administrador" : "Usuário";
    if (!window.confirm(`Tornar ${labelNext}?`)) return;
    setSaving(true);
    try {
      await patch(`/admin/users/${user.id}/role`, { role: next });
      toast.success("Permissão atualizada.");
      onUpdated({ ...user, role: next });
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-zinc-700">
        Permissão atual:{" "}
        <strong>{user.role === "ADMIN" ? "Administrador" : "Usuário"}</strong>.
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        Administradores acessam o painel <code>/admin</code> e podem alterar
        configurações, cadastrar parceiros e operar assinaturas.
      </p>
      <button
        onClick={toggle}
        disabled={saving}
        className="mt-4 rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {user.role === "ADMIN"
          ? "Remover permissão de Administrador"
          : "Tornar Administrador"}
      </button>
    </div>
  );
}

function UserAccountTab({
  user,
  patch,
  onUpdated,
}: {
  user: User;
  patch: PatchFn;
  onUpdated: (u: User) => void;
}) {
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !user.active;
    const verb = next ? "Reativar" : "Desativar";
    if (
      !window.confirm(
        `${verb} esta conta? ${
          next
            ? ""
            : "Ela não conseguirá fazer login até ser reativada (a sessão atual continua válida até a expiração)."
        }`,
      )
    )
      return;
    setSaving(true);
    try {
      await patch(`/admin/users/${user.id}/active`, { active: next });
      toast.success(next ? "Conta reativada." : "Conta desativada.");
      onUpdated({ ...user, active: next });
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
        <strong>{user.active ? "Conta ativa" : "Conta desativada"}</strong>.
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        Contas desativadas não conseguem fazer login. Sessões já abertas seguem
        válidas até expirar.
      </p>
      <button
        onClick={toggle}
        disabled={saving}
        className={`mt-4 rounded px-4 py-2 text-sm text-white disabled:opacity-50 ${
          user.active ? "bg-red-600" : "bg-emerald-600"
        }`}
      >
        {user.active ? "Desativar conta" : "Reativar conta"}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  wide,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  wide?: boolean;
  placeholder?: string;
}) {
  return (
    <label className={`text-sm ${wide ? "md:col-span-2" : ""}`}>
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
      />
    </label>
  );
}
