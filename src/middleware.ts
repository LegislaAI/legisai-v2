"use server";

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
export const config = {
  matcher: ["/", "/sample/:path*"],
};

export async function middleware(req: NextRequest) {
  const loginVerifyAPI = async (token: string) => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL;
    if (!token) {
      return {
        status: 400,
        body: null,
      };
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "any",
      },
    };

    const connect = await fetch(`${baseURL}/user/token`, {
      method: "PATCH",
      headers: config.headers,
    });

    const data = await connect.json();
    const status = connect.status;
    return {
      status,
      body: data,
    };
  };

  if (
    req.nextUrl.pathname.indexOf("icon") > -1 ||
    req.nextUrl.pathname.indexOf("chrome") > -1
  )
    return NextResponse.next();

  const cookieStore = await cookies();
  const Token = process.env.NEXT_PUBLIC_USER_TOKEN;
  if (!Token) return NextResponse.redirect(new URL("/login", req.url));
  const token = cookieStore.get(Token);

  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  const connect = await loginVerifyAPI(token.value);

  if (connect.status !== 200) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (connect.status === 200) {
    const res = NextResponse.next();
    res.cookies.set(Token, connect.body.accessToken);
  }

  return NextResponse.next();
}
