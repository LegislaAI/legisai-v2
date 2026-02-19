/**
 * Cliente para a API Dados Abertos da Câmara (via proxy Next.js /api/camara).
 * Os dados são buscados diretamente de dadosabertos.camara.leg.br pelo servidor.
 */

const BASE = "/api/camara";

export interface CamaraResponse<T> {
  dados: T;
  links?: Array<{ rel: string; href: string }>;
}

export async function fetchCamara<T = unknown>(
  path: string,
  params?: Record<string, string | number>
): Promise<{ ok: boolean; status: number; body: CamaraResponse<T> & { error?: string }; dados: T }> {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const pathClean = path.replace(/^\//, "");
  const url = new URL(`${BASE}/${pathClean}`, origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }
  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  const body = (await res.json().catch(() => ({}))) as CamaraResponse<T> & { error?: string };
  const dados = (body?.dados ?? body) as T;
  return {
    ok: res.ok,
    status: res.status,
    body,
    dados: (body.dados ?? dados) as T,
  };
}

/** Extrai o número da última página do array links da API Câmara */
export function getTotalPagesFromLinks(links: CamaraResponse<unknown>["links"]): number {
  if (!links?.length) return 1;
  const last = links.find((l) => l.rel === "last");
  if (!last?.href) return 1;
  try {
    const p = new URL(last.href).searchParams.get("pagina");
    return p ? Math.max(1, parseInt(p, 10)) : 1;
  } catch {
    return 1;
  }
}
