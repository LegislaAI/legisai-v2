import { createRunStream } from "@/utils/OpenaiApi";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const data: {
    message: string;
    threadId: string;
    assistantId: string;
  } = await request.json();

  console.log("message", data.message);

  const stream = new ReadableStream({
    start(controller) {
      createRunStream({
        assistantId: data.assistantId,
        message: data.message,
        threadId: data.threadId,
        additionalInstructions: null,
        onMessage: (chunk) => {
          controller.enqueue(chunk);
        },
      }).then(
        (response: {
          usageData: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
          } | null;
        }) => {
          const extraDataChunk = JSON.stringify({ response });
          controller.enqueue(
            new TextEncoder().encode(`\n[EXTRA_DATA]: ${extraDataChunk}`),
          );
          controller.close();
        },
      );
    },
  });

  return new NextResponse(stream);
}
