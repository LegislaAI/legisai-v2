"use client";

import axios from "axios";
import { useCookies } from "next-client-cookies";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  getTokenCookieName,
  getTokenCookieOptions,
} from "@/lib/auth-cookies";
import { maskCep, maskCpfCnpj, maskPhone } from "@/lib/masks";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

const digits = (s: string) => s.replace(/\D+/g, "");

type Offer = {
  method: "PIX" | "CARD";
  frequency: "MONTHLY" | "YEARLY";
  price: number;
};

type ResolveResponse = {
  customPlan: {
    id: string;
    expiresAt: string;
    status: string;
    basePlan: { name: string; description: string; level: number };
  };
  offers: Offer[];
  user: {
    name: string | null;
    email: string | null;
    phone: string | null;
    cpfCnpj: string | null;
    postalCode: string | null;
    addressNumber: string | null;
  } | null;
};

function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function labelOf(o: Offer): string {
  const method = o.method === "PIX" ? "PIX" : "Cartão";
  const freq = o.frequency === "MONTHLY" ? "mensal" : "anual";
  return `${method} · ${freq}`;
}

function CheckoutInner() {
  const search = useSearchParams();
  const cookies = useCookies();
  const token = search.get("token") ?? "";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ResolveResponse | null>(null);
  const [selected, setSelected] = useState<Offer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pixPayload, setPixPayload] = useState<{
    encodedImage?: string | null;
    payload: string;
    expirationDate?: string;
  } | null>(null);
  // Token de sessão devolvido após consume bem-sucedido.
  // PIX: guardamos para usar nas chamadas de polling de status; após confirmação, gravamos no cookie e redirecionamos.
  // Cartão: gravamos cookie e redirecionamos imediatamente.
  const sessionTokenRef = useRef<string | null>(null);

  function loginAndRedirect(accessToken: string) {
    cookies.set(getTokenCookieName(), accessToken, getTokenCookieOptions(true));
    toast.success("Pagamento confirmado! Redirecionando…");
    // window.location ao invés de router.push para forçar reload do middleware
    // e popular o UserContext já com o novo token.
    window.location.href = "/";
  }

  // Card form state (simples — sem libs)
  const [card, setCard] = useState({
    holderName: "",
    number: "",
    expiryMonth: "",
    expiryYear: "",
    ccv: "",
  });
  const [holder, setHolder] = useState({
    name: "",
    email: "",
    cpfCnpj: "",
    postalCode: "",
    addressNumber: "",
    phone: "",
  });
  const [installments, setInstallments] = useState(1);

  const resolve = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get<ResolveResponse>(
        `${apiUrl}/custom-plan/resolve?token=${encodeURIComponent(token)}`,
      );
      setData(res.data);
      if (res.data.offers.length > 0) setSelected(res.data.offers[0]);

      // Pré-preenche dados do titular com o que o admin já cadastrou.
      if (res.data.user) {
        const u = res.data.user;
        setHolder({
          name: u.name ?? "",
          email: u.email ?? "",
          phone: u.phone ? maskPhone(u.phone) : "",
          cpfCnpj: u.cpfCnpj ? maskCpfCnpj(u.cpfCnpj) : "",
          postalCode: u.postalCode ? maskCep(u.postalCode) : "",
          addressNumber: u.addressNumber ?? "",
        });
        setCard((c) => ({ ...c, holderName: u.name ?? "" }));
      }
    } catch (e: unknown) {
      const msg =
        axios.isAxiosError(e) && e.response?.data?.message
          ? e.response.data.message
          : "Token inválido ou expirado.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    resolve();
  }, [resolve]);

  async function payPix() {
    if (!selected || selected.method !== "PIX") return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${apiUrl}/custom-plan/consume/pix`, {
        token,
        frequency: selected.frequency,
      });
      const payment = res.data.payment;
      if (res.data?.accessToken) {
        sessionTokenRef.current = res.data.accessToken;
      }
      if (payment?.payload) {
        setPixPayload(payment);
        toast.success("PIX gerado. Escaneie o QR ou copie o código.");
      } else {
        toast.success("Pagamento iniciado.");
      }
    } catch (e: unknown) {
      const msg =
        axios.isAxiosError(e) && e.response?.data?.message
          ? e.response.data.message
          : "Falha ao gerar PIX.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // Polling: após gerar PIX, verifica a cada 4s se a assinatura ficou ativa
  // (webhook do Asaas → cron processa → status='active'). Quando confirmar,
  // grava o cookie de sessão e redireciona.
  useEffect(() => {
    if (!pixPayload?.payload || !sessionTokenRef.current) return;

    const sessionToken = sessionTokenRef.current;
    let stopped = false;

    async function poll() {
      if (stopped) return;
      try {
        const r = await axios.get(`${apiUrl}/signature/active`, {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
        if (r.data?.signature?.status === "active") {
          stopped = true;
          loginAndRedirect(sessionToken);
        }
      } catch {
        // ignora — tenta de novo no próximo tick
      }
    }

    const id = setInterval(poll, 4000);
    poll();
    return () => {
      stopped = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pixPayload?.payload]);

  async function payCard() {
    if (!selected || selected.method !== "CARD") return;
    if (!validateCardForm()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${apiUrl}/custom-plan/consume/card`, {
        token,
        frequency: selected.frequency,
        installmentCount: selected.frequency === "YEARLY" ? installments : 1,
        creditCard: {
          ...card,
          number: digits(card.number),
        },
        creditCardHolderInfo: {
          ...holder,
          cpfCnpj: digits(holder.cpfCnpj),
          postalCode: digits(holder.postalCode),
          phone: digits(holder.phone),
        },
      });
      if (res.data?.success && res.data?.accessToken) {
        loginAndRedirect(res.data.accessToken);
      } else if (res.data?.success) {
        toast.success("Pagamento processado.");
      } else {
        toast.success("Pagamento enviado.");
      }
    } catch (e: unknown) {
      const msg =
        axios.isAxiosError(e) && e.response?.data?.message
          ? e.response.data.message
          : "Falha ao processar cartão.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function validateCardForm(): boolean {
    if (
      !card.holderName ||
      !card.number ||
      !card.expiryMonth ||
      !card.expiryYear ||
      !card.ccv
    ) {
      toast.error("Preencha todos os dados do cartão.");
      return false;
    }
    if (
      !holder.name ||
      !holder.email ||
      !holder.cpfCnpj ||
      !holder.postalCode ||
      !holder.addressNumber ||
      !holder.phone
    ) {
      toast.error("Preencha todos os dados do titular.");
      return false;
    }
    return true;
  }

  if (loading) {
    return <div className="p-10 text-center text-zinc-500">Carregando…</div>;
  }
  if (!token) {
    return <div className="p-10 text-center">Token ausente.</div>;
  }
  if (!data) {
    return (
      <div className="p-10 text-center">
        Não foi possível carregar este plano. O link pode ter expirado.
      </div>
    );
  }

  const finalPrice = selected ? selected.price : 0;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Plano sob medida</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Oferta personalizada baseada em{" "}
        <span className="font-medium">{data.customPlan.basePlan.name}</span>.
      </p>
      <p className="mt-3 text-sm text-zinc-700">
        {data.customPlan.basePlan.description}
      </p>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold">Forma de pagamento</h2>
        <div className="mt-3 space-y-2">
          {data.offers.map((o) => {
            const id = `${o.method}-${o.frequency}`;
            const checked =
              selected?.method === o.method && selected?.frequency === o.frequency;
            return (
              <label
                key={id}
                className={`flex cursor-pointer items-center justify-between rounded border px-3 py-2 text-sm ${
                  checked ? "border-zinc-900 bg-zinc-50" : "border-zinc-200"
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="offer"
                    checked={checked}
                    onChange={() => setSelected(o)}
                  />
                  {labelOf(o)}
                </span>
                <span className="font-semibold">{formatBRL(o.price)}</span>
              </label>
            );
          })}
        </div>

        {selected && (
          <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 text-sm">
            <span className="font-medium">Total</span>
            <span className="text-lg font-bold">{formatBRL(finalPrice)}</span>
          </div>
        )}
      </div>

      {selected?.method === "CARD" && (
        <div className="mt-6 space-y-4 rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold">Dados do cartão</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-sm md:col-span-2">
              Nome impresso
              <input
                value={card.holderName}
                onChange={(e) => setCard({ ...card, holderName: e.target.value })}
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
              />
            </label>
            <label className="text-sm md:col-span-2">
              Número
              <input
                value={card.number}
                onChange={(e) => {
                  const d = digits(e.target.value).slice(0, 19);
                  const grouped = d.replace(/(\d{4})(?=\d)/g, "$1 ");
                  setCard({ ...card, number: grouped });
                }}
                placeholder="0000 0000 0000 0000"
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
              />
            </label>
            <label className="text-sm">
              Mês (MM)
              <input
                value={card.expiryMonth}
                onChange={(e) => setCard({ ...card, expiryMonth: e.target.value })}
                maxLength={2}
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
              />
            </label>
            <label className="text-sm">
              Ano (AA)
              <input
                value={card.expiryYear}
                onChange={(e) => setCard({ ...card, expiryYear: e.target.value })}
                maxLength={2}
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
              />
            </label>
            <label className="text-sm md:col-span-2">
              CCV
              <input
                value={card.ccv}
                onChange={(e) => setCard({ ...card, ccv: e.target.value })}
                maxLength={4}
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
              />
            </label>
          </div>

          <h2 className="mt-2 text-sm font-semibold">Dados do titular</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-sm md:col-span-2">
              Nome
              <input
                value={holder.name}
                onChange={(e) => setHolder({ ...holder, name: e.target.value })}
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
              />
            </label>
            <label className="text-sm">
              E-mail
              <input
                type="email"
                value={holder.email}
                onChange={(e) => setHolder({ ...holder, email: e.target.value })}
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
              />
            </label>
            <label className="text-sm">
              CPF/CNPJ
              <input
                value={holder.cpfCnpj}
                onChange={(e) =>
                  setHolder({ ...holder, cpfCnpj: maskCpfCnpj(e.target.value) })
                }
                placeholder="000.000.000-00"
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
              />
            </label>
            <label className="text-sm">
              CEP
              <input
                value={holder.postalCode}
                onChange={(e) =>
                  setHolder({ ...holder, postalCode: maskCep(e.target.value) })
                }
                placeholder="00000-000"
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
              />
            </label>
            <label className="text-sm">
              Número
              <input
                value={holder.addressNumber}
                onChange={(e) =>
                  setHolder({ ...holder, addressNumber: e.target.value })
                }
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
              />
            </label>
            <label className="text-sm md:col-span-2">
              Telefone
              <input
                value={holder.phone}
                onChange={(e) =>
                  setHolder({ ...holder, phone: maskPhone(e.target.value) })
                }
                placeholder="(00) 00000-0000"
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
              />
            </label>
            {selected.frequency === "YEARLY" && (
              <label className="text-sm md:col-span-2">
                Parcelas (1–12)
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                  className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm"
                />
              </label>
            )}
          </div>
        </div>
      )}

      <div className="mt-6">
        {selected?.method === "PIX" && (
          <button
            onClick={payPix}
            disabled={submitting}
            className="w-full rounded bg-zinc-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Gerando PIX…" : "Pagar com PIX"}
          </button>
        )}
        {selected?.method === "CARD" && (
          <button
            onClick={payCard}
            disabled={submitting}
            className="w-full rounded bg-zinc-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Processando…" : `Pagar ${formatBRL(finalPrice)}`}
          </button>
        )}
      </div>

      {pixPayload && (
        <div className="mt-6 rounded-lg border border-emerald-300 bg-white p-4">
          <h3 className="text-sm font-semibold">PIX gerado</h3>
          {pixPayload.encodedImage && (
            <img
              src={`data:image/png;base64,${pixPayload.encodedImage}`}
              alt="QR Code"
              className="mx-auto mt-3 h-56 w-56"
            />
          )}
          <div className="mt-3">
            <label className="text-xs text-zinc-600">Código copia-e-cola</label>
            <textarea
              value={pixPayload.payload}
              readOnly
              rows={3}
              className="mt-1 w-full rounded border border-zinc-300 p-2 font-mono text-xs"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(pixPayload.payload);
                toast.success("Copiado.");
              }}
              className="mt-2 rounded bg-zinc-900 px-3 py-1 text-xs text-white"
            >
              Copiar
            </button>
          </div>
          <p className="mt-3 text-xs text-zinc-600">
            Após o pagamento, sua assinatura será ativada automaticamente.
          </p>
        </div>
      )}
    </div>
  );
}

export default function CustomPlanCheckoutPage() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center text-zinc-500">Carregando…</div>}
    >
      <CheckoutInner />
    </Suspense>
  );
}
