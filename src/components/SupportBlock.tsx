"use client";

import { useEffect, useState } from "react";

import { useApiContext } from "@/context/ApiContext";

type SupportInfo = {
  whatsappNumber: string;
  refundInstructions: string;
};

function digitsOnly(s: string): string {
  return s.replace(/\D+/g, "");
}

export function SupportBlock() {
  const { GetAPI } = useApiContext();
  const [info, setInfo] = useState<SupportInfo | null>(null);

  useEffect(() => {
    let mounted = true;
    GetAPI("/support", false).then((res) => {
      if (mounted && res.status === 200) {
        setInfo(res.body as SupportInfo);
      }
    });
    return () => {
      mounted = false;
    };
  }, [GetAPI]);

  if (!info) return null;
  const digits = digitsOnly(info.whatsappNumber ?? "");
  const hasWhatsapp = digits.length > 0;
  const message = encodeURIComponent(
    "Olá! Preciso de suporte sobre minha assinatura no LegisDados.",
  );
  const href = hasWhatsapp
    ? `https://wa.me/${digits}?text=${message}`
    : undefined;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <h3 className="text-sm font-semibold">Suporte e reembolso</h3>
      <p className="mt-1 text-sm text-zinc-600">
        {info.refundInstructions ||
          "Para solicitar reembolso, entre em contato com nossa equipe."}
      </p>
      {hasWhatsapp && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Falar no WhatsApp
        </a>
      )}
    </div>
  );
}
