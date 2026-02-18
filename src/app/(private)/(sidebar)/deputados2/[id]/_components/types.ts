export interface HistoricoMovimentacao {
  data: string;
  descricao: string;
}

export interface HistoricoResponse {
  id: string;
  nome: string;
  partido: string;
  movimentacoes: HistoricoMovimentacao[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AgendaResumo {
  countHoje: number;
  countProximos7Dias: number;
  link: string;
}

export interface EventoAgenda {
  id: string;
  dt_inicio: string;
  dt_fim: string | null;
  cod_tipo_evento: string;
  descricao_tipo_evento: string;
  cod_situacao_evento: string;
  sigla_orgao: string;
  nome_orgao: string;
  local_evento: string;
  descricao?: string;
  uri?: string;
}

export interface ProposicaoDeputado {
  id: string;
  sigla_tipo: string;
  numero: number;
  ano: number;
  ementa: string;
  dt_apresentacao: string;
  situacao_descricao: string;
  uri_proposicao?: string;
}

export interface ProposicoesResumo {
  total: number;
  ultimaData: string | null;
  cnt_prop_por_tipo: { sigla_tipo: string; count: number }[];
  link: string;
}

export interface Contadores {
  eventos: number;
  proposicoes: number;
  discursos: number;
  votacoes: number;
}

export interface Presenca {
  presencas: number;
  ausencias: number;
  dataInicio: string;
  dataFim: string;
}

export interface VotacoesIndicadores {
  baseVotosCount: number;
  alinhamentoPct: number | null;
  dataInicio: string;
  dataFim: string;
}

export interface TemaItem {
  cod_tema: string;
  tema_nome: string;
  count: number;
}

export interface TemasResponse {
  temas: TemaItem[];
}

export interface DespesasResumoCEAP {
  total: number;
  ultimaData: string | null;
  topCategorias: {
    tipoDespesa: string;
    descricao?: string;
    valor: number;
    count: number;
  }[];
  link: string;
}

export interface DespesaCEAP {
  ano?: number;
  mes?: number;
  tipoDespesa?: string;
  descricao?: string;
  dataDocumento?: string;
  valorDocumento?: number;
  valorLiquido?: number;
  nomeFornecedor?: string;
  urlDocumento?: string;
}

export interface DiscursosResumo {
  total: number;
  ultimaData: string | null;
  link: string;
}

export interface SocialLink {
  label: string;
  url: string | undefined;
}
