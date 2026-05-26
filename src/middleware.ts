import { NextRequest, NextResponse } from "next/server";

import { getTokenCookieName } from "@/lib/auth-cookies";

export const config = {
  matcher: [
    "/",
    "/admin",
    "/admin/:path*",
    "/ai",
    "/blocos",
    "/blocos/:path*",
    "/comissoes",
    "/comissoes/:path*",
    "/deputados",
    "/deputados/:path*",
    "/frentes",
    "/frentes/:path*",
    "/grupos",
    "/grupos/:path*",
    "/liderancas",
    "/noticias",
    "/orgaos",
    "/orgaos/:path*",
    "/partidos",
    "/partidos/:path*",
    "/perfil",
    "/plenario",
    "/plenario/deliberativa/:path*",
    "/plenario/solene/:path*",
    "/proposicoes",
    "/proposicoes/:path*",
    "/tramitacoes",
    "/tutoriais",
  ],
};

/**
 * Rotas que NÃO exigem assinatura ativa (mas exigem token).
 */
const ROUTES_WITHOUT_SIGNATURE_REQUIRED = new Set<string>([
  // Admin tem seu próprio gate (role=ADMIN); não exige assinatura.
  "/admin",
]);

function isAdminRoute(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function requiresSignature(pathname: string): boolean {
  if (isAdminRoute(pathname)) return false;
  const normalized = pathname.replace(/\/$/, "") || "/";
  if (ROUTES_WITHOUT_SIGNATURE_REQUIRED.has(normalized)) return false;
  return true;
}

async function fetchProfile(
  token: string,
  apiUrl: string,
): Promise<{ ok: boolean; role: string | null }> {
  try {
    const res = await fetch(`${apiUrl}/user`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, role: null };
    const body = await res.json();
    return { ok: true, role: body?.user?.role ?? "USER" };
  } catch {
    return { ok: false, role: null };
  }
}

async function isSignatureValid(
  token: string,
  apiUrl: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${apiUrl}/signature/validation`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

function applyAdminHeaders(res: NextResponse): NextResponse {
  // CSP estrita em /admin: minimiza superfície XSS (mesmo app é mais sensível).
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' " + (process.env.NEXT_PUBLIC_API_URL ?? ""),
      "frame-ancestors 'none'",
    ].join("; "),
  );
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "no-referrer");
  return res;
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(getTokenCookieName())?.value;
  const pathname = req.nextUrl.pathname;

  if (!token || token.trim() === "") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(url);
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // ─── /admin/* ─────────────────────────────────────────────────────────────
  if (isAdminRoute(pathname)) {
    if (!apiUrl) {
      return NextResponse.next();
    }
    const profile = await fetchProfile(token, apiUrl);
    if (!profile.ok || profile.role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return applyAdminHeaders(NextResponse.next());
  }

  // ─── Rotas privadas com assinatura ────────────────────────────────────────
  if (!requiresSignature(pathname)) {
    return NextResponse.next();
  }

  if (!apiUrl) {
    return NextResponse.next();
  }

  const ok = await isSignatureValid(token, apiUrl);
  if (!ok) {
    const url = req.nextUrl.clone();
    url.pathname = "/plans";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
