/**
 * Helper centralizado para cookies de autenticação (token JWT).
 * Segue o fluxo descrito em AUTHENTICATION_FLOW.md.
 */

const COOKIE_DAYS_REMEMBER_ME = 90;
const COOKIE_DAYS_SESSION = 7;

export function getTokenCookieName(): string {
  return process.env.NEXT_PUBLIC_USER_TOKEN || "legisai-token";
}

export function getTokenCookieOptions(rememberMe: boolean = true): {
  path: string;
  expires: Date;
  sameSite: "lax";
  secure?: boolean;
} {
  const days = rememberMe ? COOKIE_DAYS_REMEMBER_ME : COOKIE_DAYS_SESSION;
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  return {
    path: "/",
    expires,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
}
