"use server";

import { NextRequest, NextResponse } from "next/server";
export const config = {
  matcher: [
    "/",
    "/plenary",
    "/plenary/:path*",
    "/commissions",
    "/commissions/:path*",
    "/news",
    "/procedures",
    "/ai",
    "/prediction-ai",
    "/tutorials",
    "/profile",
    "/plans",
    "/checkout",
  ],
};

export async function middleware(req: NextRequest) {
  // Validação de assinatura/autenticação desativada temporariamente
  return NextResponse.next();
}
