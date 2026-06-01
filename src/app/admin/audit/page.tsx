"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Paginated, useAdminApi } from "../_lib/admin-api";

type AuditItem = {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string | null;
  changes: unknown;
  createdAt: string;
  admin: { id: string; name: string; email: string } | null;
};

const ACTION_LABEL: Record<string, string> = {
  "user.create": "Criou usuário",
  "user.update_data": "Editou dados do usuário",
  "user.update_payment_id": "Trocou ID de pagamento",
  "user.set_role": "Mudou permissão",
  "user.activate": "Ativou conta",
  "user.deactivate": "Desativou conta",
  "signature.create_manual": "Criou assinatura manual",
  "signature.activate": "Ativou / ajustou prazo de assinatura",
  "signature.cancel": "Cancelou assinatura",
  "signature_plan.create": "Criou plano de assinatura",
  "signature_plan.update": "Editou plano de assinatura",
  "signature_plan.delete": "Excluiu plano de assinatura",
  "custom_plan.create": "Criou plano sob medida",
  "custom_plan.update": "Editou plano sob medida",
  "custom_plan.cancel": "Cancelou plano sob medida",
  "partner.create": "Cadastrou parceiro",
  "partner.update": "Editou parceiro",
  "config.set": "Alterou configuração",
  "config.delete": "Excluiu configuração",
  "webhook.reprocess": "Reprocessou webhook",
};

export default function AdminAuditPage() {
  const { list } = useAdminApi();
  const [data, setData] = useState<Paginated<AuditItem> | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await list<Paginated<AuditItem>>("/admin/audit", {
        page: String(page),
        pageSize: String(pageSize),
      });
      setData(res);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [list, page, pageSize]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Auditoria</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Histórico de ações administrativas. Clique em uma linha para ver o
        detalhe da alteração (antes/depois).
      </p>

      <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Data/Hora</th>
              <th className="px-3 py-2 font-medium">Administrador</th>
              <th className="px-3 py-2 font-medium">Ação</th>
              <th className="px-3 py-2 font-medium">Alvo</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-zinc-500">
                  Carregando…
                </td>
              </tr>
            )}
            {!loading && data?.items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-zinc-500">
                  Nenhum registro de auditoria ainda.
                </td>
              </tr>
            )}
            {!loading &&
              data?.items.map((it) => (
                <Fragment key={it.id}>
                  <tr>
                    <td className="px-3 py-2 text-zinc-600">
                      {new Date(it.createdAt).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-3 py-2">
                      {it.admin ? (
                        <div>
                          <div className="font-medium">{it.admin.name}</div>
                          <div className="text-xs text-zinc-500">
                            {it.admin.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">
                          admin removido
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {ACTION_LABEL[it.action] ?? it.action}
                    </td>
                    <td className="px-3 py-2 text-zinc-600">
                      <div>{it.targetType}</div>
                      {it.targetId && (
                        <div className="font-mono text-xs text-zinc-500">
                          {it.targetId.slice(0, 8)}…
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() =>
                          setOpenId(openId === it.id ? null : it.id)
                        }
                        className="rounded border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50"
                      >
                        {openId === it.id ? "Fechar" : "Detalhe"}
                      </button>
                    </td>
                  </tr>
                  {openId === it.id && (
                    <tr className="bg-zinc-50">
                      <td colSpan={5} className="px-3 py-3">
                        <pre className="max-h-72 overflow-auto rounded border border-zinc-200 bg-white p-3 text-xs">
                          {JSON.stringify(it.changes ?? null, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
          </tbody>
        </table>
      </div>

      {data && data.total > data.pageSize && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-zinc-600">
            Página {page} de {totalPages} · {data.total.toLocaleString("pt-BR")}{" "}
            registro(s)
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(1)}
              className="rounded border border-zinc-300 px-3 py-1 disabled:opacity-50"
            >
              «
            </button>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border border-zinc-300 px-3 py-1 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-zinc-300 px-3 py-1 disabled:opacity-50"
            >
              Próxima
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              className="rounded border border-zinc-300 px-3 py-1 disabled:opacity-50"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
