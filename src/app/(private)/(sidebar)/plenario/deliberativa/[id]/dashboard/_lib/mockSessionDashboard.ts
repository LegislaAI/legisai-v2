// Mock no formato real consumido pela API:
// `eventDetails.aiDashboardJson` (ver components/types.ts → AiDashboardJson),
// gerado por POST /api/plenary/session-summary?format=json e persistido no
// banco junto ao evento.

import type { AiDashboardJson } from "../../components/types";

export interface MockSession {
  meta: { eventId: string; titulo: string; geradoEm: string };
  dashboard: AiDashboardJson;
}

export const MOCK_SESSION: MockSession = {
  meta: {
    eventId: "ev-mock-2026-04-29",
    titulo: "Sessão Deliberativa Ordinária – 29/04/2026",
    geradoEm: "2026-05-03T10:14:00Z",
  },
  dashboard: {
    meta: {
      tom: "Tenso, com momentos de acordo procedimental",
      duracaoEstimada: "4h08min",
      oradoresUnicos: 28,
    },
    resumoExecutivo:
      "A sessão foi marcada pela apreciação do PLP 108/2024 (regulamentação do IBS), com forte polarização entre o bloco governista e a oposição em torno do impacto sobre estados produtores. A pauta secundária — PEC 32/2024 e MPV 1.245/2026 — reverberou em discursos transversais. Foram registradas 5 questões de ordem, 14 apartes e nenhuma votação simbólica concluída.",
    principaisDecisoes: [
      {
        titulo: "Acordo procedimental para destaques na próxima sessão",
        tipo: "Encaminhamento",
        tema: "Reforma Tributária",
        detalhe:
          "Líderes pactuaram a apreciação dos destaques ao PLP 108 na sessão deliberativa seguinte, retirando a urgência da votação principal.",
      },
      {
        titulo: "Pedido de verificação de quórum acolhido",
        tipo: "Q. Ordem",
        tema: "Procedimental",
        detalhe:
          "A Mesa atendeu a solicitação da oposição, suspendendo temporariamente a apreciação da MPV 1.245/2026.",
      },
      {
        titulo: "Inclusão de fundo de compensação em discussão",
        tipo: "Acordo de Liderança",
        tema: "Pacto Federativo",
        detalhe:
          "Bancada do Norte/Nordeste obteve compromisso do relator para destacar emenda de fundo compensatório regional.",
      },
      {
        titulo: "Encaminhamento contrário à urgência",
        tipo: "Encaminhamento",
        tema: "MPV 1.245",
        detalhe:
          "Bloco da oposição registrou voto contrário ao regime de urgência, deflagrando rito ordinário.",
      },
    ],
    embates: [
      {
        tema: "Alíquotas regionais do IBS",
        atores: ["Aguinaldo Ribeiro (PP)", "Coronel Chrisóstomo (PL)", "Reginaldo Lopes (PT)"],
        resumo:
          "Embate sobre o impacto fiscal nos estados produtores e na Amazônia Legal. Norte/Nordeste pressionam por fundo compensatório; relator defende redação atual.",
      },
      {
        tema: "Carga tributária do IBS",
        atores: ["Marcel van Hattem (NOVO)", "Aguinaldo Ribeiro (PP)"],
        resumo:
          "NOVO defende que a unificação não reduz a carga e apenas reorganiza a complexidade; relator rebate apontando ganhos de neutralidade.",
      },
      {
        tema: "Progressividade fiscal",
        atores: ["Erika Hilton (PSOL)", "Kim Kataguiri (UNIÃO)"],
        resumo:
          "PSOL defende imposto sobre grandes fortunas e dividendos; UNIÃO contesta a oportunidade política da inclusão no debate atual.",
      },
    ],
    destaquesDiscursos: [
      {
        deputado: "Aguinaldo Ribeiro",
        partido: "PP",
        trecho:
          "Não podemos aprovar uma reforma tributária que penalize os estados produtores em nome de uma simplificação que não é simétrica.",
      },
      {
        deputado: "Tabata Amaral",
        partido: "PSB",
        trecho:
          "Educação não pode ser variável de ajuste no novo arcabouço — Fundeb permanente é cláusula pétrea da agenda.",
      },
      {
        deputado: "Marcel van Hattem",
        partido: "NOVO",
        trecho:
          "Estamos trocando uma complexidade por outra — o IBS, sem o redesenho de gastos, é apenas um capítulo a mais do velho problema.",
      },
      {
        deputado: "Erika Hilton",
        partido: "PSOL",
        trecho:
          "A reforma tributária só será justa quando incidir sobre grandes patrimônios e dividendos.",
      },
    ],
    dimensoes: {
      conflito: "Alto",
      efetividade: "Parcial",
      fluidez: "Interrompida",
      justificativa:
        "Sessão de alta densidade política: divergências regionais elevaram o conflito; o avanço pactuado dos destaques garantiu efetividade parcial; intercorrências regimentais interromperam a fluidez no segundo bloco.",
    },
    insights: [
      {
        titulo: "Fratura regional dentro da base governista",
        tipo: "Político",
        interpretacao:
          "Bancada do Norte/Nordeste age coordenadamente fora do alinhamento partidário, sinalizando custo político adicional para o Planalto.",
        evidencia:
          "Coronel Chrisóstomo (PL/RO) e parlamentares do PT/MA convergiram em discurso e em encaminhamento sobre fundo compensatório.",
      },
      {
        titulo: "Educação como agenda transversal",
        tipo: "Temático",
        interpretacao:
          "Mesmo em sessão dedicada à reforma tributária, há uso recorrente da pauta educacional para reposicionar o debate fiscal.",
        evidencia:
          "Discurso da Dep. Tabata Amaral (PSB/SP) introduziu Fundeb permanente como vetor da reforma.",
      },
      {
        titulo: "Oposição acumula uso de manobras regimentais",
        tipo: "Procedimental",
        interpretacao:
          "Verificação de quórum e questões de ordem foram usadas para retardar a apreciação da MPV 1.245, ampliando o custo de tramitação.",
        evidencia:
          "5 questões de ordem registradas, com pelo menos 2 acolhidas pela Mesa.",
      },
    ],
    sinteseFinal:
      "Sessão de inflexão: a Câmara avançou no rito do PLP 108, mas o custo político da fratura regional na base e a postura procedimental da oposição apontam para uma deliberação não-trivial nas próximas duas semanas. Recomenda-se monitorar a redação do fundo de compensação e a votação dos destaques.",
  },
};
