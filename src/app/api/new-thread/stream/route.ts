import { createThreadAndRunStream } from "@/utils/OpenaiApi";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const data: {
    message: string;
    assistantId: string;
  } = await request.json();

  const stream = new ReadableStream({
    start(controller) {
      createThreadAndRunStream(
        data.assistantId,
        [{ role: "user", content: data.message }],
        (chunk) => {
          controller.enqueue(chunk);
        },
      ).then(
        (
          response:
            | {
                threadId: string | undefined;
                usageData: {
                  prompt_tokens: number;
                  completion_tokens: number;
                  total_tokens: number;
                } | null;
              }
            | undefined,
        ) => {
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
