"use client";

import { useApiContext } from "@/context/ApiContext";
import { useEffect, useState } from "react";

export interface Chat {
  id: string;
  name: string;
  createdAt: string;
}

export interface Prompt {
  id: string;
  name: string;
  description: string;
  type: string;
  icon?: string;
}

export function useChatPage(type: string = "ai") {
  const { GetAPI } = useApiContext();

  const [chats, setChats] = useState<Chat[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Fetch History
  const fetchChats = async () => {
    setLoadingChats(true);
    try {
      let endpoint = "";
      if (type === "ai") endpoint = "/chat/ai?page=1";
      if (type === "proposition") endpoint = "/chat/proposition?page=1";
      if (type === "prediction") endpoint = "/chat/prediction?page=1";
      const response = await GetAPI(endpoint, true);
      if (response.status === 200) {
        setChats(response.body.chats || []);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoadingChats(false);
    }
  };

  // Fetch Prompts (Personas)
  const fetchPrompts = async () => {
    setLoadingPrompts(true);
    try {
      let endpoint = "";
      if (type === "ai") endpoint = "/prompt?types=ai";
      if (type === "proposition") endpoint = "/prompt?&types=proposition";
      if (type === "prediction") endpoint = "/prompt?&types=prediction";
      const response = await GetAPI(endpoint, true);
      if (response.status === 200) {
        setPrompts(response.body.prompts || []);
      }
    } catch (error) {
      console.error("Error fetching prompts:", error);
    } finally {
      setLoadingPrompts(false);
    }
  };

  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setActiveChatId(null); // New chat based on prompt
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    // Find prompt related to this chat if needed, or just set active chat mode
    // Ideally backend returns prompt info with chat details
  };

  useEffect(() => {
    // Initial fetch
    fetchChats();
    fetchPrompts();
  }, [type]); // Re-fetch if type changes

  return {
    chats,
    prompts,
    selectedPrompt,
    loadingChats,
    loadingPrompts,
    activeChatId,
    setActiveChatId,
    setSelectedPrompt,
    handleSelectPrompt,
    handleSelectChat,
    fetchChats, // To refresh list after new chat
  };
}
