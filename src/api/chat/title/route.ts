import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    // 1. OTIMIZAÇÃO: Limpa e trunca o contexto para não confundir a IA
    // Pegamos a mensagem do usuário e um pedaço da resposta da IA
    const cleanContext = messages.map((m: any) => ({
      role: m.role,
      // Cortamos em 1000 chars para economizar e focar no tópico principal
      content: m.content ? m.content.substring(0, 1000) : "",
    }));

    // 2. ESTRATÉGIA: Instrução no final (Funciona melhor com Gemini/GPT)
    // Ao colocar a ordem no final, forçamos a IA a executar a tarefa sobre o contexto anterior.
    const promptMessage = {
      role: "user",
      content:
        "Baseado na conversa acima, gere um título MUITO CURTO (3 a 5 palavras) que resuma o tópico jurídico. Responda APENAS com o texto do título, sem aspas, sem 'Título:', apenas o texto.",
    };

    const finalPayload = [...cleanContext, promptMessage];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Executivos Voice Title",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash", // Modelo rápido
          messages: finalPayload,
          stream: false,
          temperature: 0.3, // Temperatura baixa para ser mais direto
        }),
      }
    );

    const data = await response.json();

    // Log para debug

    const newTitle = data.choices?.[0]?.message?.content?.trim() || "Novo Chat";

    // Remove aspas se o modelo teimoso colocou
    const cleanTitle = newTitle.replace(/^"|"$/g, "").replace(/\.$/, "");

    return NextResponse.json({ title: cleanTitle });
  } catch (error: any) {
    console.error("Erro ao gerar título:", error);
    return NextResponse.json({ title: "Novo Chat" }, { status: 500 });
  }
}
