// MOCK do dashboard de IA da sessão.
// Substituir por POST /api/plenary/session-summary?format=json quando o
// route handler for atualizado para retornar JSON estruturado (ver
// BACKEND_TODO.md, Tarefa 3).

export interface SessionDashboardData {
  meta: {
    eventId: string;
    titulo: string;
    data: string;
    duracaoMinutos: number;
    geradoEm: string;
  };
  sintese: string;
  kpis: {
    totalIntervencoes: number;
    deputadosUnicos: number;
    sentimentoMedio: number; // -1 (negativo) a 1 (positivo)
    topicosDistintos: number;
    minutosTotais: number;
  };
  sentimento: {
    geral: number;
    porTrecho: { minuto: number; score: number; label: string }[];
  };
  temposFala: { deputado: string; partido: string; uf: string; segundos: number }[];
  topicos: {
    nome: string;
    mencoes: number;
    sentimentoAssoc: number;
    citacoes: string[];
  }[];
  intervencoes: {
    deputado: string;
    partido: string;
    uf: string;
    tipo: "discurso" | "questao_ordem" | "aparte" | "encaminhamento";
    resumo: string;
    minuto: number;
  }[];
  citacoesDestaque: {
    autor: string;
    partido: string;
    frase: string;
    contexto: string;
    minuto: number;
  }[];
  blocos: {
    titulo: string;
    inicioMin: number;
    fimMin: number;
    resumoExecutivo: string;
    deputadosEnvolvidos: string[];
  }[];
  previsoes: {
    cenario: string;
    probabilidade: number; // 0–1
    racional: string;
  }[];
}

export const MOCK_DASHBOARD: SessionDashboardData = {
  meta: {
    eventId: "ev-mock-2026-04-29",
    titulo: "Sessão Deliberativa Ordinária – 29/04/2026",
    data: "2026-04-29",
    duracaoMinutos: 248,
    geradoEm: "2026-05-03T10:14:00Z",
  },
  sintese:
    "A sessão foi marcada pela apreciação do PLP 108/2024 (regulamentação do IBS), com forte polarização entre o bloco governista e a oposição em torno do impacto sobre estados produtores. A pauta secundária — PEC 32/2024 e MPV 1.245/2026 — reverberou em discursos transversais. Sentimento geral oscilou para o negativo no segundo bloco devido à discussão sobre alíquotas regionais. Foram registradas 5 questões de ordem, 14 apartes e nenhuma votação simbólica concluída.",
  kpis: {
    totalIntervencoes: 47,
    deputadosUnicos: 28,
    sentimentoMedio: -0.12,
    topicosDistintos: 9,
    minutosTotais: 248,
  },
  sentimento: {
    geral: -0.12,
    porTrecho: [
      { minuto: 0, score: 0.2, label: "Abertura cordial" },
      { minuto: 25, score: 0.1, label: "Apresentação técnica" },
      { minuto: 50, score: -0.05, label: "Início divergências" },
      { minuto: 75, score: -0.4, label: "Embate alíquotas" },
      { minuto: 105, score: -0.55, label: "Pico tensão regional" },
      { minuto: 135, score: -0.3, label: "Encaminhamento líderes" },
      { minuto: 165, score: -0.05, label: "Apartes técnicos" },
      { minuto: 195, score: 0.05, label: "Acordo procedimental" },
      { minuto: 225, score: 0.15, label: "Encerramento" },
      { minuto: 248, score: 0.2, label: "Pronunciamentos finais" },
    ],
  },
  temposFala: [
    { deputado: "Dep. Aguinaldo Ribeiro", partido: "PP", uf: "PB", segundos: 1850 },
    { deputado: "Dep. Reginaldo Lopes", partido: "PT", uf: "MG", segundos: 1620 },
    { deputado: "Dep. Bibo Nunes", partido: "PL", uf: "RS", segundos: 1310 },
    { deputado: "Dep. Tabata Amaral", partido: "PSB", uf: "SP", segundos: 1180 },
    { deputado: "Dep. Marcel van Hattem", partido: "NOVO", uf: "RS", segundos: 1090 },
    { deputado: "Dep. Maria do Rosário", partido: "PT", uf: "RS", segundos: 980 },
    { deputado: "Dep. Kim Kataguiri", partido: "UNIÃO", uf: "SP", segundos: 920 },
    { deputado: "Dep. Erika Hilton", partido: "PSOL", uf: "SP", segundos: 870 },
    { deputado: "Dep. Coronel Chrisóstomo", partido: "PL", uf: "RO", segundos: 760 },
    { deputado: "Dep. Sâmia Bomfim", partido: "PSOL", uf: "SP", segundos: 720 },
  ],
  topicos: [
    { nome: "Reforma Tributária / IBS", mencoes: 87, sentimentoAssoc: -0.25, citacoes: ["impacto regional desigual", "necessidade de fundo compensatório"] },
    { nome: "Alíquotas regionais", mencoes: 54, sentimentoAssoc: -0.42, citacoes: ["tratamento assimétrico"] },
    { nome: "Pacto federativo", mencoes: 41, sentimentoAssoc: -0.18, citacoes: ["repasses aos municípios"] },
    { nome: "Imposto Seletivo", mencoes: 32, sentimentoAssoc: -0.05, citacoes: ["bebidas e tabaco"] },
    { nome: "MPV 1.245 (transição)", mencoes: 28, sentimentoAssoc: 0.1, citacoes: ["prazos de adaptação"] },
    { nome: "PEC 32/2024", mencoes: 24, sentimentoAssoc: -0.15, citacoes: ["urgência legislativa"] },
    { nome: "Educação", mencoes: 18, sentimentoAssoc: 0.25, citacoes: ["Fundeb permanente"] },
    { nome: "Segurança pública", mencoes: 12, sentimentoAssoc: 0.0, citacoes: ["combate ao crime organizado"] },
    { nome: "Meio Ambiente", mencoes: 8, sentimentoAssoc: 0.4, citacoes: ["pré-COP31"] },
  ],
  intervencoes: [
    { deputado: "Aguinaldo Ribeiro", partido: "PP", uf: "PB", tipo: "discurso", resumo: "Defesa do parecer do PLP 108 com ajustes regionais", minuto: 12 },
    { deputado: "Reginaldo Lopes", partido: "PT", uf: "MG", tipo: "discurso", resumo: "Apoio com ressalva sobre fundo de compensação", minuto: 28 },
    { deputado: "Bibo Nunes", partido: "PL", uf: "RS", tipo: "questao_ordem", resumo: "Questionou rito de tramitação da MPV 1.245", minuto: 41 },
    { deputado: "Tabata Amaral", partido: "PSB", uf: "SP", tipo: "discurso", resumo: "Educação como prioridade no novo arcabouço fiscal", minuto: 57 },
    { deputado: "Marcel van Hattem", partido: "NOVO", uf: "RS", tipo: "discurso", resumo: "Crítica à carga tributária e à complexidade do IBS", minuto: 72 },
    { deputado: "Maria do Rosário", partido: "PT", uf: "RS", tipo: "aparte", resumo: "Aparte sobre direitos humanos no contexto fiscal", minuto: 88 },
    { deputado: "Kim Kataguiri", partido: "UNIÃO", uf: "SP", tipo: "encaminhamento", resumo: "Encaminhamento contrário à urgência", minuto: 104 },
    { deputado: "Erika Hilton", partido: "PSOL", uf: "SP", tipo: "discurso", resumo: "Defesa de imposto sobre grandes fortunas", minuto: 119 },
    { deputado: "Coronel Chrisóstomo", partido: "PL", uf: "RO", tipo: "discurso", resumo: "Impactos para Estados da Amazônia Legal", minuto: 137 },
    { deputado: "Sâmia Bomfim", partido: "PSOL", uf: "SP", tipo: "questao_ordem", resumo: "Solicitação de verificação de quórum", minuto: 152 },
    { deputado: "Aguinaldo Ribeiro", partido: "PP", uf: "PB", tipo: "encaminhamento", resumo: "Encaminhamento favorável com destaque", minuto: 178 },
    { deputado: "Reginaldo Lopes", partido: "PT", uf: "MG", tipo: "aparte", resumo: "Aparte ao encaminhamento do relator", minuto: 192 },
  ],
  citacoesDestaque: [
    {
      autor: "Aguinaldo Ribeiro",
      partido: "PP",
      frase:
        "Não podemos aprovar uma reforma tributária que penalize os estados produtores em nome de uma simplificação que não é simétrica.",
      contexto: "Discurso de relatoria sobre o PLP 108/2024",
      minuto: 12,
    },
    {
      autor: "Tabata Amaral",
      partido: "PSB",
      frase:
        "Educação não pode ser variável de ajuste no novo arcabouço — Fundeb permanente é cláusula pétrea da agenda.",
      contexto: "Discurso transversal sobre prioridades fiscais",
      minuto: 57,
    },
    {
      autor: "Marcel van Hattem",
      partido: "NOVO",
      frase:
        "Estamos trocando uma complexidade por outra — o IBS, sem o redesenho de gastos, é apenas um capítulo a mais do velho problema.",
      contexto: "Crítica frontal ao IBS",
      minuto: 72,
    },
    {
      autor: "Erika Hilton",
      partido: "PSOL",
      frase:
        "A reforma tributária só será justa quando incidir sobre grandes patrimônios e dividendos.",
      contexto: "Discurso na linha de progressividade fiscal",
      minuto: 119,
    },
  ],
  blocos: [
    {
      titulo: "1. Abertura e leitura do parecer",
      inicioMin: 0,
      fimMin: 30,
      resumoExecutivo:
        "Sessão aberta com leitura do parecer do PLP 108/2024 e apresentação técnica de pontos sensíveis pelo relator Aguinaldo Ribeiro.",
      deputadosEnvolvidos: ["Aguinaldo Ribeiro", "Mesa Diretora"],
    },
    {
      titulo: "2. Discursos de orientação dos blocos",
      inicioMin: 30,
      fimMin: 90,
      resumoExecutivo:
        "Posicionamentos formais de PT, PSB, PL e NOVO. Surge a divergência sobre alíquotas regionais e fundo de compensação.",
      deputadosEnvolvidos: ["Reginaldo Lopes", "Tabata Amaral", "Bibo Nunes", "Marcel van Hattem"],
    },
    {
      titulo: "3. Embate sobre alíquotas regionais",
      inicioMin: 90,
      fimMin: 160,
      resumoExecutivo:
        "Pico de tensão na sessão. Apartes intensos sobre o impacto fiscal nos estados produtores e na Amazônia Legal. Sentimento geral nitidamente negativo.",
      deputadosEnvolvidos: ["Coronel Chrisóstomo", "Maria do Rosário", "Kim Kataguiri"],
    },
    {
      titulo: "4. Encaminhamentos de votação",
      inicioMin: 160,
      fimMin: 220,
      resumoExecutivo:
        "Encaminhamentos formais — favorável (governo) e contrário (oposição). Acordo procedimental para destaques na próxima sessão.",
      deputadosEnvolvidos: ["Aguinaldo Ribeiro", "Reginaldo Lopes"],
    },
    {
      titulo: "5. Encerramento",
      inicioMin: 220,
      fimMin: 248,
      resumoExecutivo:
        "Pronunciamentos finais e definição da pauta da semana seguinte.",
      deputadosEnvolvidos: ["Mesa Diretora"],
    },
  ],
  previsoes: [
    {
      cenario:
        "PLP 108 é aprovado na próxima sessão deliberativa com 2 destaques aprovados",
      probabilidade: 0.62,
      racional:
        "Acordo procedimental indica avanço; bloco governista mantém maioria simples mesmo com defecções.",
    },
    {
      cenario: "Fundo de compensação regional ganha emenda autônoma",
      probabilidade: 0.48,
      racional:
        "Tema mobilizou bancada do Norte/Nordeste; pressão sobre relator é alta.",
    },
    {
      cenario: "Verificação de quórum atrasa pauta da MPV 1.245",
      probabilidade: 0.27,
      racional:
        "Oposição sinalizou uso de manobras regimentais; ainda assim, prazo constitucional pressiona.",
    },
  ],
};
