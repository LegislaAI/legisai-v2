import { NextRequest, NextResponse } from "next/server";

const COOKIE_TOKEN_NAME =
  process.env.NEXT_PUBLIC_USER_TOKEN || "legisai-token";

export const config = {
  matcher: [
    "/",
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

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_TOKEN_NAME)?.value;

  if (!token || token.trim() === "") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("returnUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
