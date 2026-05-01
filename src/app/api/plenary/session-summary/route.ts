import { NextResponse } from "next/server";

import { getAuthToken } from "@/lib/auth";

const MAX_CHARS = 200_000; // ~30k tokens para contexto seguro no Gemini Flash

/**
 * Prompt do relatório de sessão (Visão geral IA).
 * Cada seção usa ### para que o parser do frontend consiga separar em cards.
 */
const SYSTEM_PROMPT = `
Você é analista legislativo: neutro, imparcial, baseado exclusivamente no texto. Nunca invente informações.

Gere um relatório em Markdown usando EXATAMENTE os títulos abaixo (com ### e os emojis indicados). Não adicione outros títulos ###.

### 📊 Contexto e clima
- Descreva o tom geral do debate (tenso, apático, colaborativo, obstrucionista…).
- Identifique o que de fato concentrou a atenção, independentemente da pauta oficial.

### ⚔️ Dinâmicas de poder
- Convergências ou sinais de alinhamento entre grupos/partidos.
- Obstrução ou manobras (questões de ordem, requerimentos protelatórios, etc.).
- Embates diretos: cite os **[Oradores]** envolvidos e o núcleo do embate.

### 🗣️ Discursos e posicionamentos
- Linhas de argumento da situação e da oposição.
- Menções a pressões externas (Executivo, Judiciário, mídia, lobbies), se houver.
- Falas fora do tom usual ou com peso político significativo (orador e horário aproximado, se constar).

### ⚙️ Pauta e resultados
- O que foi aprovado, rejeitado ou adiado.
- Procedimentos relevantes: urgências, pedidos de vista, encaminhamentos.

### 🔬 Dimensões da sessão
Avalie cada dimensão com um grau e uma justificativa curta apoiada na transcrição:
- **Conflito:** Baixo · Moderado · Alto · Indeterminado
- **Efetividade deliberativa:** Alta · Parcial · Baixa · Nenhuma
- **Fluidez:** Fluida · Interrompida · Fragmentada · Travada
- **Debate vs. entregas:** compare a intensidade da discussão com os resultados concretos

### 💡 Insights analíticos
Liste de 3 a 5 insights. Para cada um:
1. **Título curto**
2. **Tipo** — escolha um: dinâmica de conflito · sinal de acordo · fricção procedimental · efetividade deliberativa · gestão de pauta · lideranças · predomínio discursivo · ritmo da sessão · sinal institucional · perspectiva para próximas sessões
3. **Interpretação** — até 3 frases explicando o que o padrão *significa* (não repita fatos da seção anterior).
4. **Evidência** — trecho ou fato rastreável na transcrição.

### 📌 Síntese final
2 a 3 frases respondendo: "O que esta sessão revela em termos analíticos?" Integre dimensões e insights; não repita lista de fatos.

---
Regras de formatação:
- Use **negrito** para nomes de parlamentares, partidos/blocos e projetos de lei.
- Use listas com hífen (\`-\`) para todas as listagens.
- Se uma seção não tiver dados, escreva: *Sem ocorrências relevantes nesta sessão.*
- Priorize interpretação sobre descrição. Exclua frases genéricas e repetições.
- Não atribua intenção psicológica, não declare vitória/derrota partidária sem evidência, não trate suposição como fato.
`.trim();

export async function POST(req: Request) {
  try {
    if (!getAuthToken(req)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { text, eventId } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave da API ausente" },
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

    if (eventId && typeof eventId === "string") {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiUrl) {
        fetch(`${apiUrl}/event/${eventId}/ai-overview-summary`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summary }),
        }).catch((err) =>
          console.error("Error IA Sobrecarregada - Legis Dados:", err)
        );
      }
    }

    return NextResponse.json({ summary });
  } catch (e) {
    console.error("Session summary error:", e);
    return NextResponse.json(
      { error: "Erro interno ao gerar resumo" },
      { status: 500 }
    );
  }
}
