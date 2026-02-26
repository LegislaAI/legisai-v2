import { NextRequest, NextResponse } from "next/server";

import { getAuthToken } from "@/lib/auth";

const CAMARA_API_BASE = "https://dadosabertos.camara.leg.br/api/v2";

/**
 * Proxy para a API Dados Abertos da Câmara dos Deputados.
 * GET /api/camara/orgaos?itens=50&pagina=1
 * GET /api/camara/orgaos/123
 * GET /api/camara/partidos
 * GET /api/camara/legislaturas/57/lideres
 * etc.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    if (!getAuthToken(request)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { path } = await context.params;
    const pathStr = path?.length ? path.join("/") : "";
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    if (!pathStr) {
      return NextResponse.json(
        { error: "Caminho da API Câmara é obrigatório (ex: orgaos, partidos, legislaturas)" },
        { status: 400 }
      );
    }

    const url = `${CAMARA_API_BASE}/${pathStr}?${queryString ? `${queryString}&` : ""}formato=json`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 300 }, // cache 5 min
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Erro na API Câmara", details: text },
        { status: res.status }
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      return NextResponse.json(
        { error: "API Câmara retornou formato inesperado (use JSON)", details: text.slice(0, 200) },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/camara] proxy error:", err);
    return NextResponse.json(
      { error: "Falha ao buscar dados da Câmara" },
      { status: 500 }
    );
  }
}
