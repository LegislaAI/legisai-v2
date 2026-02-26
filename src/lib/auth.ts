/**
 * Obtém o token de autenticação da requisição (cookie ou header Authorization).
 * Usado nas rotas de API para garantir que apenas usuários logados acessem.
 */
const COOKIE_TOKEN_NAME =
  process.env.NEXT_PUBLIC_USER_TOKEN || "legisai-token";

export function getAuthToken(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(
      new RegExp(`(?:^|;\\s*)${COOKIE_TOKEN_NAME}=([^;]*)`)
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
