import { getTokenCookieName } from "@/lib/auth-cookies";

/**
 * Obtém o token de autenticação da requisição (cookie ou header Authorization).
 * Usado nas rotas de API para garantir que apenas usuários logados acessem.
 */
export function getAuthToken(request: Request): string | null {
  const cookieName = getTokenCookieName();
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(
      new RegExp(`(?:^|;\\s*)${cookieName}=([^;]*)`)
    );
    if (match) {
      try {
        return decodeURIComponent(match[1].trim());
      } catch {
        return null;
      }
    }
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    return token || null;
  }

  return null;
}
