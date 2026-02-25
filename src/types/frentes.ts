/**
 * Tipos para Frentes Parlamentares (API Dados Abertos Câmara).
 * Alinhados ao dicionário ETL (Fase 0): Detalhe/Ficha, Detalhe/Membros, Lista/Pesquisa.
 */

/** Item da lista GET /frentes */
export interface Frente {
  id: number;
  titulo: string;
  idLegislatura?: number;
  uri?: string;
}

/** Coordenador da frente (objeto aninhado em GET /frentes/{id}) */
export interface CoordenadorFrente {
  id: number;
  uri?: string;
  nome: string;
  siglaPartido?: string;
  uriPartido?: string;
  siglaUf?: string;
  idLegislatura?: number;
  urlFoto?: string;
  email?: string;
}

/** Detalhe completo GET /frentes/{id} */
export interface FrenteDetail {
  id: number;
  titulo: string;
  idLegislatura?: number;
  uri?: string;
  telefone?: string;
  email?: string;
  keywords?: string | null;
  idSituacao?: number | null;
  situacao?: string | null;
  urlWebsite?: string | null;
  urlDocumento?: string | null;
  coordenador?: CoordenadorFrente | null;
}

/** Membro GET /frentes/{id}/membros (cargo na frente quando a API retornar) */
export interface MembroFrente {
  id: number;
  nome: string;
  siglaUf?: string;
  siglaPartido?: string;
  urlFoto?: string;
  uri?: string;
  /** Cargo na frente (ETL: cargo_frente) */
  cargo?: string;
}
