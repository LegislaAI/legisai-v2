import type { PlanLevel } from "@/@types/signature";

/** Rotas permitidas para plano 1 (apenas essas e suas filhas). Perfil e tutoriais em qualquer plano. */
const PLAN_1_ALLOWED_PREFIXES = ["/", "/plenario", "/comissoes", "/deputados", "/perfil", "/tutoriais"] as const;

/**
 * Verifica se o nível do plano tem acesso à tela de tramitações.
 * Apenas planos 3 e 4 têm acesso.
 */
export function canAccessTramitacoes(level: PlanLevel): boolean {
  return level === 3 || level === 4;
}

/**
 * Verifica se a rota (pathname) é permitida para o nível do plano.
 * - Nível 3 e 4: todas as rotas.
 * - Nível 2: todas exceto /tramitacoes.
 * - Nível 1: apenas /, /plenario, /comissoes, /deputados, /perfil, /tutoriais (e filhas).
 */
export function canAccessRoute(pathname: string, level: PlanLevel): boolean {
  const path = pathname.replace(/\/$/, "") || "/";

  if (level === 3 || level === 4) return true;
  if (level === 2) return path !== "/tramitacoes" && !path.startsWith("/tramitacoes/");

  // level === 1
  if (path === "/") return true;
  return PLAN_1_ALLOWED_PREFIXES.some(
    (prefix) => prefix !== "/" && (path === prefix || path.startsWith(prefix + "/"))
  );
}

/**
 * Nível mínimo necessário para um item de menu aparecer.
 * 1 = todos os planos, 2 = planos 2–4, 3 = apenas planos 3 e 4.
 */
export function isMenuItemVisibleForLevel(href: string, level: PlanLevel): boolean {
  if (level === 3 || level === 4) return true;

  const path = href.replace(/\/$/, "") || "/";
  if (level === 2) {
    return path !== "/tramitacoes" && !path.startsWith("/tramitacoes/");
  }

  // level === 1: Home, Plenários, Comissões, Deputados, Perfil, Tutoriais
  if (path === "/") return true;
  return ["/plenario", "/comissoes", "/deputados", "/perfil", "/tutoriais"].some(
    (p) => path === p || path.startsWith(p + "/")
  );
}

/**
 * Para plano 1 na página de detalhes do deputado: mostrar apenas o header (sem abas).
 */
export function deputadoDetailOnlyHeader(level: PlanLevel): boolean {
  return level === 1;
}
