/**
 * Tipos para Grupos Interparlamentares (API Dados Abertos Câmara).
 * ETL: Dados básicos (id, nome, pais, situacao) + Parlamentares (deputado, partido, UF, função).
 */

export interface GrupoStatus {
  idLegislatura?: string;
  dataStatus?: string;
  presidenteNome?: string;
  presidenteUri?: string;
  oficioTitulo?: string | null;
  oficioUri?: string | null;
  documento?: string;
  oficioAutorTipo?: string;
  oficioAutorNome?: string;
  oficioAutorUri?: string;
  oficioDataApresentacao?: string;
  oficioDataPublicacao?: string;
}

export interface Grupo {
  id: number;
  nome: string;
  anoCriacao?: string | number;
  uri?: string;
  resolucaoTitulo?: string | null;
  resolucaoUri?: string | null;
  subvencionado?: string;
  grupoMisto?: string;
  ativo?: string;
  observacoes?: string;
  ultimoStatus?: GrupoStatus | null;
  ultimoStatusID?: GrupoStatus | null;
  projetoTitulo?: string | null;
  projetoUri?: string | null;
}

export interface GrupoMembro {
  id: number;
  nome: string;
  siglaUf?: string;
  siglaPartido?: string;
  urlFoto?: string;
  uri?: string;
  /** Função no grupo (ex.: presidente, vice) - quando a API retorna */
  titulo?: string;
  funcao?: string;
}

/** Extrai país/tema do nome do grupo (ex.: "Brasil/África" → "África" ou "Brasil/África") */
export function getPaisTemaFromNome(nome: string): string {
  if (!nome?.trim()) return "—";
  const parts = nome.split("/").map((p) => p.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1]! : parts[0] || nome;
}

/** Situação legível (ativo "1" = Ativo, "0" = Inativo) */
export function getSituacaoLabel(ativo?: string): string {
  if (ativo === "1") return "Ativo";
  if (ativo === "0") return "Inativo";
  return "—";
}

/** Nome do presidente a partir de ultimoStatus ou ultimoStatusID */
export function getPresidenteNome(grupo: Grupo): string | undefined {
  return grupo.ultimoStatus?.presidenteNome ?? grupo.ultimoStatusID?.presidenteNome;
}

/** URI do presidente (deputado) */
export function getPresidenteUri(grupo: Grupo): string | undefined {
  return grupo.ultimoStatus?.presidenteUri ?? grupo.ultimoStatusID?.presidenteUri;
}
