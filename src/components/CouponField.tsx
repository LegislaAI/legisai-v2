"use client";

import axios from "axios";
import { useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

type Resolved = {
  code: string;
  name: string;
  discount: number;
};

type Props = {
  value: Resolved | null;
  onChange: (v: Resolved | null) => void;
};

export function CouponField({ value, onChange }: Props) {
  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apply() {
    const code = input.trim().toUpperCase();
    if (!code) return;
    setChecking(true);
    setError(null);
    try {
      const res = await axios.get<Resolved>(
        `${apiUrl}/partner/validate?code=${encodeURIComponent(code)}`,
      );
      onChange(res.data);
      setInput("");
    } catch (e: unknown) {
      const msg =
        axios.isAxiosError(e) && e.response?.status === 404
          ? "Código inválido."
          : "Não foi possível validar o cupom.";
      setError(msg);
    } finally {
      setChecking(false);
    }
  }

  if (value) {
    return (
      <div className="rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Cupom {value.code}</span>{" "}
            <span className="text-emerald-800">
              · {value.discount}% off ({value.name})
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-emerald-800 underline"
          >
            Remover
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">Cupom (opcional)</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          placeholder="EX: LEGIS10"
          className="flex-1 rounded border border-zinc-300 px-2 py-1 text-sm uppercase"
        />
        <button
          type="button"
          onClick={apply}
          disabled={checking || !input.trim()}
          className="rounded bg-zinc-900 px-3 py-1 text-sm text-white disabled:opacity-50"
        >
          {checking ? "Validando…" : "Aplicar"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export type CouponResolved = Resolved;
