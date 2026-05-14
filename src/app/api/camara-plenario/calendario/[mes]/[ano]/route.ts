import { NextRequest, NextResponse } from "next/server";

import { getAuthToken } from "@/lib/auth";

const PORTAL_BASE = "https://www.camara.leg.br/plenario/calendario";

interface SessaoCalendario {
  codReuniao: number;
  contaPrazo: 0 | 1 | null;
  dataSessao: string;
  txtDescricao: string;
}

/**
 * Proxy para o endpoint não-documentado do portal da Câmara que alimenta
 * o calendário de "Contagem de Prazos" (https://www.camara.leg.br/plenario/contagem-de-prazos).
 *
 * Fonte (extraído de calendarioContagemPrazo.js):
 *   GET https://www.camara.leg.br/plenario/calendario/{mes}/{ano}
 *
 * Cada item da lista traz `contaPrazo`:
 *   1  → sessão válida para contar prazo (dia em negrito no calendário oficial)
 *   0/null → sessão existente, mas que não conta para prazos regimentais
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ mes: string; ano: string }> },
) {
  try {
    if (!getAuthToken(request)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { mes, ano } = await context.params;
    const mesNum = Number(mes);
    const anoNum = Number(ano);

    if (
      !Number.isInteger(mesNum) ||
      mesNum < 1 ||
      mesNum > 12 ||
      !Number.isInteger(anoNum) ||
      anoNum < 1900 ||
      anoNum > 2100
    ) {
      return NextResponse.json(
        { error: "Parâmetros inválidos. Use /api/camara-plenario/calendario/{1-12}/{ano}" },
        { status: 400 },
      );
    }

    const url = `${PORTAL_BASE}/${mesNum}/${anoNum}`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 }, // portal serve com Cache-Control: max-age=3601
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erro no portal da Câmara", status: res.status },
        { status: res.status },
      );
    }

    const raw = (await res.json()) as {
      mes: string;
      ano: string;
      dados?: { lista?: SessaoCalendario[] };
    };

    const lista = raw?.dados?.lista ?? [];
    const diasValidos = Array.from(
      new Set(
        lista
          .filter((s) => s.contaPrazo === 1)
          .map((s) => s.dataSessao),
      ),
    ).sort();

    return NextResponse.json({
      mes: mesNum,
      ano: anoNum,
      sessoes: lista,
      diasValidos,
    });
  } catch (err) {
    console.error("[api/camara-plenario/calendario] proxy error:", err);
    return NextResponse.json(
      { error: "Falha ao buscar calendário de contagem de prazos" },
      { status: 500 },
    );
  }
}
