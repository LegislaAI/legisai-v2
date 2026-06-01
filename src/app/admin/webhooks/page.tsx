"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Paginated, useAdminApi } from "../_lib/admin-api";

type WebhookEvent = {
  id: string;
  asaasEventId: string | null;
  event: string;
  rawPayload: unknown;
  receivedAt: string;
  processedAt: string | null;
  attemptCount: number;
  lastAttemptAt: string | null;
  processingError: string | null;
  alreadyAppliedToSignature: boolean;
};

export default function AdminWebhooksPage() {
  const { list, post } = useAdminApi();
  const [data, setData] = useState<Paginated<WebhookEvent> | null>(null);
  const [onlyPending, setOnlyPending] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await list<Paginated<WebhookEvent>>("/admin/webhooks", {
        page: String(page),
        pageSize: String(pageSize),
        onlyPending: onlyPending ? "true" : undefined,
      });
      setData(res);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [list, page, pageSize, onlyPending]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  async function reprocess(id: string) {
    if (
      !window.confirm(
        "Reprocessar este webhook? Ele volta para a fila e será processado de novo.",
      )
    )
      return;
    setBusyId(id);
    try {
      await post(`/admin/webhooks/${id}/reprocess`, {});
      toast.success("Webhook enfileirado para reprocessamento.");
      fetchPage();
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  const totalPages = data
    ? Math.max(1, Math.ceil(data.total / data.pageSize))
    : 1;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Webhooks de pagamento</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Eventos enviados pelo Asaas. Pendentes são reprocessados automaticamente
        por cron; use “Reprocessar” quando precisar forçar a retomada após
        ajuste manual.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyPending}
            onChange={(e) => {
              setOnlyPending(e.target.checked);
              setPage(1);
            }}
          />
          Mostrar somente pendentes (não processados)
        </label>
        {data && (
          <span className="ml-auto text-xs text-zinc-500">
            {data.total.toLocaleString("pt-BR")} evento(s)
          </span>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Recebido em</th>
              <th className="px-3 py-2 font-medium">Evento</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Tentativas</th>
              <th className="px-3 py-2 font-medium">Último erro</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-zinc-500">
                  Carregando…
                </td>
              </tr>
            )}
            {!loading && data?.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-zinc-500">
                  Nenhum webhook nesse filtro.
                </td>
              </tr>
            )}
            {!loading &&
              data?.items.map((w) => {
                const processed = !!w.processedAt;
                return (
                  <Fragment key={w.id}>
                    <tr className={processed ? undefined : "bg-amber-50/40"}>
                      <td className="px-3 py-2 text-zinc-600">
                        {new Date(w.receivedAt).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{w.event}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                            processed
                              ? "bg-emerald-100 text-emerald-800"
                              : w.processingError
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {processed
                            ? "Processado"
                            : w.processingError
                              ? "Com erro"
                              : "Pendente"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-zinc-600">
                        {w.attemptCount}
                      </td>
                      <td
                        className="max-w-xs truncate px-3 py-2 text-xs text-red-700"
                        title={w.processingError ?? undefined}
                      >
                        {w.processingError ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              setOpenId(openId === w.id ? null : w.id)
                            }
                            className="rounded border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50"
                          >
                            {openId === w.id ? "Fechar" : "Ver payload"}
                          </button>
                          <button
                            onClick={() => reprocess(w.id)}
                            disabled={busyId === w.id}
                            className="rounded bg-zinc-900 px-3 py-1 text-xs text-white disabled:opacity-50"
                          >
                            Reprocessar
                          </button>
                        </div>
                      </td>
                    </tr>
                    {openId === w.id && (
                      <tr className="bg-zinc-50">
                        <td colSpan={6} className="px-3 py-3">
                          <pre className="max-h-72 overflow-auto rounded border border-zinc-200 bg-white p-3 text-xs">
                            {JSON.stringify(w.rawPayload ?? null, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
          </tbody>
        </table>
      </div>

      {data && data.total > data.pageSize && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-zinc-600">
            Página {page} de {totalPages}
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
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-zinc-300 px-3 py-1 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
