import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    // Support both env var naming conventions observed in the project
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    // 1. OPTIMIZATION: Clean and truncate context
    const cleanContext = messages.map((m: any) => ({
      role: m.role,
      // Truncate to 1000 chars to save tokens and focus on main topic
      content: m.content ? String(m.content).substring(0, 1000) : "",
    }));

    // 2. STRATEGY: Instruction at the end
    const promptMessage = {
      role: "user",
      content:
        "Baseado na conversa acima, gere um título MUITO CURTO (3 a 5 palavras) que resuma o tópico jurídico. Responda APENAS com o texto do título, sem aspas, sem 'Título:', apenas o texto cru.",
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
          "X-Title": "LegisAI Title Gen",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001", // Fast model
          messages: finalPayload,
          stream: false,
          temperature: 0.3, // Low temp for directness
        }),
      }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Title Gen Error:", errorText);
        return NextResponse.json({ title: "Novo Chat" }, { status: 200 }); // Fallback on error to avoid breaking UI
    }

    const data = await response.json();

    const newTitle = data.choices?.[0]?.message?.content?.trim() || "Novo Chat";

    // Clean up quotes if present
    const cleanTitle = newTitle.replace(/^"|"$/g, "").replace(/\.$/, "");

    return NextResponse.json({ title: cleanTitle });
  } catch (error: any) {
    console.error("Error generating title:", error);
    return NextResponse.json({ title: "Novo Chat" }, { status: 500 });
  }
}
