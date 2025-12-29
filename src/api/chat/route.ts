import { NextResponse } from "next/server";

export const runtime = "edge";

// Helper para transcrever áudio usando um modelo rápido (Gemini Flash)
// Isso economiza dinheiro e tempo comparado ao Whisper ou GPT-4o
async function transcribeAudio(
  audioBase64: string,
  apiKey: string,
): Promise<string> {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Title": "LegisAI Transcriber",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001", // Modelo rápido e barato e confiável para transcrição
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Transcreva o áudio a seguir exatamente como falado, sem adicionar comentários ou formatação. Apenas o texto bruto.",
                },
                { type: "image_url", image_url: { url: audioBase64 } }, // Gemini aceita áudio via image_url hack no OpenRouter
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) return "";
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (e) {
    console.error("Erro na transcrição auxiliar:", e);
    return "";
  }
}

interface Tool {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters: object;
  };
}

export async function POST(req: Request) {
  try {
    const { messages, model, files, systemPrompt, tools } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key ausente" }, { status: 500 });
    }

    console.error("--------------- DEBUG REQUEST (FORCE) ---------------");
    console.error("Model:", model);
    console.error("Files received:", files ? files.length : 0);
    if (files)
      files.forEach((f: any) =>
        console.error(`File: ${f.name} (${f.type}) size:${f.base64?.length}`),
      );

    const modelId = model || "google/gemini-2.5-flash";

    // DETECÇÃO DE CAPACIDADES
    const isGemini = modelId.includes("gemini");
    const isClaude = modelId.includes("claude");

    // Modelos que suportam IMAGEM nativamente (Vision)
    const supportsVision =
      isGemini ||
      isClaude ||
      modelId.includes("gpt") ||
      modelId.includes("llama") ||
      modelId.includes("vision");

    // Apenas Gemini suporta ÁUDIO/PDF nativamente de forma robusta na rota chat padrão do OpenRouter atualmente
    const supportsNativeAudioPdf = isGemini;

    const now = new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      weekday: "long", // segunda-feira
      year: "numeric", // 2025
      month: "long", // dezembro
      day: "numeric", // 09
      hour: "2-digit",
      minute: "2-digit",
    });

    // Build system message with custom prompt if provided
    const systemContent = systemPrompt
      ? `${systemPrompt}\n\nData e Hora atual (Brasília): ${now}. Use essa data como referência absoluta para responder perguntas sobre "hoje", "ontem", "amanhã" ou prazos.\nSEMPRE RESPONDA EM PORTUGUÊS DO BRASIL!`
      : `Data e Hora atual (Brasília): ${now}. Use essa data como referência absoluta para responder perguntas sobre "hoje", "ontem", "amanhã" ou prazos.\nSEMPRE RESPONDA EM PORTUGUÊS DO BRASIL!`;

    const timeContextMessage = {
      role: "system",
      content: systemContent,
    };

    let finalMessages = [timeContextMessage, ...messages];

    // --- PROCESSAMENTO DE ARQUIVOS ---
    if (files && Array.isArray(files) && files.length > 0) {
      const lastMsgIndex = finalMessages.length - 1;
      const lastMsg = finalMessages[lastMsgIndex];

      const contentArray: any[] = [
        {
          type: "text",
          text: lastMsg.content || "Analise o contexto enviado.",
        },
      ];

      // Processa cada arquivo
      for (const fileItem of files) {
        const { base64, type, name } = fileItem;

        const isImage = type.startsWith("image");
        const isPdf = type === "application/pdf";
        const isAudio = type.startsWith("audio");

        // 1. CENÁRIO: GEMINI (Aceita Tudo)
        if (supportsNativeAudioPdf) {
          if (isImage || isPdf) {
            contentArray.push({
              type: "image_url", // Hack do OpenRouter para Gemini
              image_url: { url: base64 },
            });
          }
          // Para áudio, mesmo no Gemini, vamos FORÇAR a transcrição para garantir que ele entenda
          else if (isAudio) {
            const transcription = await transcribeAudio(base64, apiKey);
            if (transcription) {
              contentArray.push({
                type: "text",
                text: `\n\n[TRANSCRIÇÃO DO ÁUDIO ANEXADO (${name})]:\n"${transcription}"\n`,
              });
            }
            // Opcional: Mandar o áudio junto se quiser que ele "ouça" o tom, mas a transcrição é o fallback de ouro
            contentArray.push({
              type: "image_url",
              image_url: { url: base64 },
            });
          }
        }

        // 2. CENÁRIO: MODELOS VISION (GPT, Llama, Claude)
        // Aceitam Imagem, mas NÃO aceitam Áudio/PDF nativo
        else if (supportsVision) {
          if (isImage) {
            // Imagem vai normal
            contentArray.push({
              type: "image_url",
              image_url: { url: base64 },
            });
          } else if (isAudio) {
            // --- A MÁGICA DA VERSÃO ANTIGA RECRIADA ---
            // Se o modelo não ouve, nós transcrevemos antes de enviar!
            const transcription = await transcribeAudio(base64, apiKey);
            if (transcription) {
              contentArray.push({
                type: "text",
                text: `\n\n[TRANSCRIÇÃO DO ÁUDIO ANEXADO (${name})]:\n"${transcription}"\n`,
              });
            } else {
              contentArray.push({
                type: "text",
                text: `\n[Erro ao transcrever áudio ${name}]`,
              });
            }
          } else if (isPdf) {
            // PDF em modelos Vision (sem OCR nativo) é complexo.
            // O ideal seria usar o plugin 'pdf-text', mas via rota padrão, vamos avisar.
            // Ou, se quiser arriscar, mandar como imagem (alguns aceitam), mas é instável.
            contentArray.push({
              type: "text",
              text: `\n[O arquivo PDF ${name} foi anexado, mas este modelo (${modelId}) não suporta leitura direta de PDF. Peça ao usuário para enviar como imagem ou use o modelo Legis AI (Gemini).]`,
            });
          }
        }

        // 3. CENÁRIO: MODELOS DE TEXTO APENAS (Sonar, versões antigas)
        else {
          if (isAudio) {
            const transcription = await transcribeAudio(base64, apiKey);
            contentArray.push({
              type: "text",
              text: `\n[TRANSCRIÇÃO DE ÁUDIO]: ${transcription}`,
            });
          } else {
            contentArray.push({
              type: "text",
              text: `[Arquivo ${name} ignorado: Modelo não suporta anexos]`,
            });
          }
        }
      }

      finalMessages[lastMsgIndex] = {
        role: lastMsg.role,
        content: contentArray,
      };
    }

    // --- CHAMADA FINAL ---
    const requestBody: any = {
      model: modelId,
      messages: finalMessages,
      stream: true,
    };

    // Add tools if provided
    if (tools && Array.isArray(tools) && tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = "auto";
    }
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "LegisAI",
        },
        body: JSON.stringify(requestBody),
      },
    );
    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: `Erro OpenRouter: ${err}` },
        { status: response.status },
      );
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
