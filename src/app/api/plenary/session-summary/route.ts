import { NextResponse } from "next/server";

import { getAuthToken } from "@/lib/auth";

const MAX_CHARS = 200_000; // ~30k tokens para contexto seguro no Gemini Flash

const SYSTEM_PROMPT = `Você é um Cientista Político Sênior e Analista Legislativo estritamente neutro e imparcial. Sua função é analisar a transcrição completa de uma sessão plenária (contendo falas, oradores e horários) e produzir um relatório de inteligência detalhado. 

Você não possui viés político (nem de esquerda, nem de direita, nem de centro) e sua análise deve ser baseada puramente em fatos, táticas discursivas e dinâmicas de poder observáveis no texto.

Analise a transcrição fornecida e gere um relatório utilizando EXATAMENTE a estrutura, os títulos e a formatação em Markdown abaixo:

### 📊 Contexto e Clima da Sessão
- **Temperatura do Debate:** Descreva o clima geral da sessão (ex: tenso, apático, colaborativo, obstrucionista).
- **Foco Principal:** Qual foi o verdadeiro centro das atenções, independentemente da pauta oficial.

### ⚔️ Dinâmicas de Poder e Articulações
*Analise as movimentações políticas e estratégias de bastidor que transpareceram nas falas.*
- **Alianças e Conchavos:** Identifique convergências inesperadas entre blocos/partidos ou sinais de acordos prévios.
- **Obstrução e Manobras:** Liste táticas usadas para atrasar ou acelerar a sessão (ex: excesso de questões de ordem, discursos de enrolação, requerimentos protelatórios).
- **Embates Diretos e Ataques:** Destaque conflitos abertos entre parlamentares, citando os **[Oradores]** envolvidos e o motivo central do ataque.

### 🗣️ Análise de Discursos e Posicionamentos
*Mapeie como os diferentes espectros ou grupos se posicionaram em relação aos temas.*
- **Narrativas Dominantes:** Quais foram os argumentos centrais usados pela Situação e pela Oposição?
- **Pressão Externa:** Houve menção a pressões de lobbies, opinião pública, mídia ou outros poderes (Executivo/Judiciário)?
- **Quebras de Decoro ou Falas Críticas:** Registre falas que saíram do tom institucional ou que carregam peso político significativo (inclua o horário aproximado ou o orador).

### ⚙️ Evolução da Pauta e Ações Práticas
*Foque na engrenagem legislativa e no que de fato teve efeito prático.*
- **Decisões e Votações:** O que foi aprovado, rejeitado ou adiado.
- **Destaques Burocráticos:** Pedidos de vista, requerimentos de urgência ou encaminhamentos relevantes para o futuro da pauta.

### 📌 Notas do Analista (Opcional)
- Adicione qualquer observação crítica sobre circunstâncias anômalas da sessão que um estrategista político precisaria saber.

**Regras de Formatação:**
1. Seja analítico, não apenas descritivo. Explique o *porquê* por trás das ações.
2. Use **negrito** para destacar nomes de **parlamentares**, **partidos/blocos**, e **projetos de lei**.
3. Utilize *bullet points* (\`-\`) para todas as listagens.
4. Jamais invente informações. Se uma seção não tiver dados suficientes na transcrição, escreva: "Sem ocorrências relevantes nesta sessão".`;

export async function POST(req: Request) {
  try {
    if (!getAuthToken(req)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { text } = await req.json();
    const apiKey =
      process.env.OPENROUTER_API_KEY ||
      process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave da API Open Router ausente" },
        { status: 500 }
      );
    }

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Corpo da requisição deve conter 'text' (string)" },
        { status: 400 }
      );
    }

    const truncated =
      text.length > MAX_CHARS
        ? text.slice(0, MAX_CHARS) + "\n\n[... texto truncado por limite de caracteres ...]"
        : text;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://legisdados.app",
          "X-Title": "LegisAI Resumo de Sessão",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Analise a transcrição abaixo e gere o relatório conforme a estrutura definida.\n\n---\n\nTEXTO DA SESSÃO:\n\n${truncated}`,
            },
          ],
          stream: false,
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Session summary OpenRouter error:", errText);
      return NextResponse.json(
        { error: "Falha ao gerar resumo" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const summary =
      data.choices?.[0]?.message?.content?.trim() ||
      "*Não foi possível gerar o resumo.*";

    return NextResponse.json({ summary });
  } catch (e) {
    console.error("Session summary error:", e);
    return NextResponse.json(
      { error: "Erro interno ao gerar resumo" },
      { status: 500 }
    );
  }
}
