"use client";
import { handleSendStreamMessage } from "@/utils/chatFunctions";
import { useState } from "react";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    {
      content: string;
      role: "user" | "assistant";
    }[]
  >([]);
  const [isMessageLoading, setIsMessageLoading] = useState(false);

  const handleSendMessageWrapper = () => {
    handleSendStreamMessage({
      assistantId: "asst_3wZYpIdbfLaxC0DEi21R2h46",
      inputMessage: message,
      threadId: threadId,
      setMessages: setMessages,
      setThreadId: setThreadId,
      setIsMessageLoading: setIsMessageLoading,
      isStream: true,
    });
  };

  return (
    <div className="h-screen w-full">
      <div className="flex h-[80%] w-full flex-col">
        {messages.map((message, index) => (
          <div key={index}>{message.content}</div>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border-2 border-black"
      />

      <button onClick={handleSendMessageWrapper}>
        {isMessageLoading ? (
          <div className="h-10 w-10 animate-spin rounded-full border-r border-b border-l border-red-500 duration-200" />
        ) : (
          "Enviar"
        )}
      </button>
    </div>
  );
}
