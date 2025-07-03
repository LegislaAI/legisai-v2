"use client";
import { Dispatch, SetStateAction } from "react";

interface HandleSendMessageParams {
  assistantId: string;
  isStream: boolean;
  inputMessage: string;
  threadId: string | null;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  setThreadId?: Dispatch<SetStateAction<string | null>>;
  setIsMessageLoading: Dispatch<SetStateAction<boolean>>;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export const handleSendStreamMessage = async ({
  assistantId,
  inputMessage,
  threadId,
  setMessages,
  setThreadId,
  isStream,
  setIsMessageLoading,
}: HandleSendMessageParams): Promise<void> => {
  if (inputMessage.trim() === "") return;

  let finalMessage = "";

  const messageToSend = inputMessage.trim();
  setMessages((prevMessages) => [
    ...prevMessages,
    { role: "user", content: messageToSend },
  ]);
  setMessages((prevMessages) => [
    ...prevMessages,
    { role: "assistant", content: "..." },
  ]);

  setIsMessageLoading(true);
  try {
    if (!assistantId) return;
    const response = await fetch(
      threadId ? "api/current-thread/stream" : "api/new-thread/stream",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageToSend,
          assistantId,
          threadId,
        }),
      },
    );

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let usageData: {
      threadId: string | null;
    } = {
      threadId: null,
    };

    if (reader) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk.includes("[EXTRA_DATA]:")) {
          usageData = JSON.parse(
            chunk.replace("[EXTRA_DATA]:", "").trim(),
          ).response;
        } else {
          setIsMessageLoading(true);
          finalMessage += chunk;
          if (isStream) {
            setMessages((prevMessages) => {
              const updatedMessages = [...prevMessages];
              const lastMessageIndex = updatedMessages.length - 1;

              if (lastMessageIndex >= 0) {
                // Verifica se a última mensagem é apenas "..."
                if (updatedMessages[lastMessageIndex].content === "...") {
                  // Substitui os "..." pelo novo conteúdo
                  updatedMessages[lastMessageIndex] = {
                    ...updatedMessages[lastMessageIndex],
                    content: chunk,
                  };
                } else {
                  // Caso contrário, concatena o novo conteúdo ao existente
                  updatedMessages[lastMessageIndex] = {
                    ...updatedMessages[lastMessageIndex],
                    content: updatedMessages[lastMessageIndex].content + chunk,
                  };
                }
              }

              return updatedMessages;
            });
          }
        }

        if (setThreadId && !threadId) {
          setThreadId(usageData.threadId);
        }
      }

      if (!isStream) {
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            return [
              ...prevMessages.slice(0, -1),
              { ...lastMessage, content: finalMessage },
            ];
          } else {
            return prevMessages;
          }
        });
      }
    }
  } catch (error) {
    console.error("Error sending message:", error);
  } finally {
    setIsMessageLoading(false);
  }
};
