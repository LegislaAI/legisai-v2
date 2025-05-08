import axios, { AxiosInstance, AxiosResponse } from "axios";
import OpenAI from "openai";
import { Message } from "./ApiTypes";

const API_URL = "https://api.openai.com/v1";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "OpenAI-Beta": "assistants=v2",
  },
});

const openAiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const createMessage = async (
  threadId: string,
  message: string,
): Promise<Message> => {
  try {
    const response: AxiosResponse<Message> = await apiClient.post(
      `/threads/${threadId}/messages`,
      {
        role: "user",
        content: message,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error creating message:", error);
    throw error;
  }
};

export const createRunStream = async ({
  message,
  threadId,
  assistantId,
  additionalInstructions,
  onMessage,
}: {
  message: string;
  threadId: string;
  assistantId: string;
  additionalInstructions: string | null;
  onMessage: (message: string) => void;
}) => {
  try {
    // Criação do stream com os parâmetros necessários
    let usageData = null;
    await createMessage(threadId, message);

    const stream = await openAiClient.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
      additional_instructions: additionalInstructions,
      stream: true, // Habilitar o streaming
    });

    // Iterar sobre cada evento recebido no stream
    for await (const event of stream) {
      if (event.event === "thread.message.delta") {
        const delta = event.data.delta;

        // Verifica se delta e content estão definidos
        if (delta && delta.content && delta.content[0]) {
          const content = delta.content[0];

          // Type guard para verificar se content é do tipo esperado com a propriedade `text`
          if ("text" in content && content.text && content.text.value) {
            const messageContent = content.text.value;
            onMessage(messageContent); // Chama o callback passando a mensagem
          } else {
            console.warn(
              "Conteúdo da mensagem não encontrado ou indefinido",
              event,
            );
          }
        }
      }
      if (event.event === "thread.run.completed") {
        // Captura os dados de uso ao final do stream
        usageData = event.data.usage;
      }
    }

    return {
      usageData,
    };
  } catch (error) {
    console.error("Error creating run with stream:", error);
    throw error; // Lança o erro para ser tratado fora da função
  }
};

export const createThreadAndRunStream = async (
  assistantId: string,
  messages: { role: "user" | "assistant"; content: string }[],
  onMessage: (message: string) => void, // Função de callback para cada mensagem de stream
) => {
  try {
    const stream = await openAiClient.beta.threads.createAndRun({
      assistant_id: assistantId,
      thread: {
        messages,
      },
      stream: true,
    });
    let threadId: string | undefined;
    let usageData = null;
    for await (const event of stream) {
      if (event.event === "thread.created") {
        threadId = event.data.id;
      }
      if (
        event.event === "thread.message.delta" &&
        event.data.delta.content?.[0] &&
        "text" in event.data.delta.content[0] &&
        event.data.delta.content[0].text?.value
      ) {
        onMessage(event.data.delta.content[0].text.value);
      }
      if (event.event === "thread.run.completed") {
        usageData = event.data.usage;
      }
    }

    return {
      threadId,
      usageData,
    };
  } catch (error) {
    console.error("Error creating thread and run:", error);
  }
};
