"use client";
/* --------------------------------------------------------------------
 * --------------------------------------------------------------------
 *  Hook para componentizar TODO o estado e lógica "não‑UI" do componente
 *  Chat (página pai) — exceto handlers de mouse/drag, conforme pedido.
 *
 *  Inclui:
 *   • prompts + selectedPrompt
 *   • buscas, histórico de chats, flags de carregamento
 *   • efeitos de carregamento de dados (prompts, chats)
 *   • animação de entrada da seção
 *   • funções de CRUD de chat / prompts
 *
 *  Dependências externas (axios, cookies) continuam intactas; basta
 *  importar este hook no componente e remover o código duplicado.
 * ------------------------------------------------------------------*/

import { useApiContext } from "@/context/ApiContext";
import { useEffect, useState } from "react";
import { ChatItem, Prompt } from "./types";

/* ---------- Tipagens reproduzidas do componente ---------- */

/* ---------- Defaults ---------- */
const DefaultPrompts: Prompt[] = [
  { id: "1", name: "1", prompt: "1", description: "1" },
  { id: "2", name: "2", prompt: "2", description: "2" },
  { id: "3", name: "3", prompt: "3", description: "3" },
  { id: "4", name: "4", prompt: "4", description: "4" },
];

export function useChatPage() {
  /* ==================================================================
   * ESTADOS PRINCIPAIS (mesmos do componente)
   * =================================================================*/
  const [prompts, setPrompts] = useState<Prompt[]>(DefaultPrompts);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  const [types, setTypes] = useState<string>("");
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loadHistory, setLoadHistory] = useState(true);
  const [loadChat, setLoadChat] = useState<string | null>(null);
  const [newChat, setNewChat] = useState(false);
  const { GetAPI } = useApiContext();
  /* cookies / auth */

  /* ==================================================================
   * FUNÇÕES
   * =================================================================*/
  async function handleGetChat() {
    try {
      const response = await GetAPI(`/chat?page=1&type=${types}`, true);
      console.log("response", response);
      if (response.status === 200) {
        setChats(response.body.chats);
        setLoadHistory(false);
      }
    } catch (error) {
      console.error("Error carregando chats:", error);
    }
  }

  async function handleGetPrompt() {
    console.log("types1", types);
    try {
      const response = await GetAPI(`/prompt?&types=${types}`, true);
      console.log("response1", response);
      if (response.status === 200) {
        setPrompts(response.body.prompts);
      }
    } catch (error) {
      console.error("Error carregando prompts:", error);
    }
  }

  function handleChangeChat(chat: ChatItem) {
    const promptFound = prompts.find((p) => p.id === chat.promptId);
    setLoadChat(chat.id);
    setSelectedPrompt(promptFound ?? DefaultPrompts[0]);
  }

  /* ==================================================================
   * EFEITOS
   * =================================================================*/

  useEffect(() => {
    handleGetPrompt();
  }, [types]);

  useEffect(() => {
    handleGetChat();
  }, [loadHistory, types]);

  /* ------------------------------------------------------------------
   * EXPORTA
   * ----------------------------------------------------------------*/
  return {
    /* prompts */
    prompts,
    selectedPrompt,
    setSelectedPrompt,

    isChatHistoryOpen,
    setIsChatHistoryOpen,
    types,
    setTypes,
    /* chats */
    chats,
    loadHistory,
    setLoadHistory,
    loadChat,
    setLoadChat,
    newChat,
    setNewChat,

    /* funcs */
    handleGetChat,
    handleGetPrompt,
    handleChangeChat,
  } as const;
}

/* --------------------------------------------------------------------
 * COMO UTILIZAR NO COMPONENTE CHAT
 * --------------------------------------------------------------------
 * const {
 *   prompts,
 *   selectedPrompt,
 *   setSelectedPrompt,
 *   animateSection,
 *   search,
 *   setSearch,
 *   isChatHistoryOpen,
 *   setIsChatHistoryOpen,
 *   chats,
 *   loadHistory,
 *   setLoadHistory,
 *   loadChat,
 *   setLoadChat,
 *   newChat,
 *   setNewChat,
 *   handleGetChat,
 *   handleGetPrompt,
 *   handleChangeChat,
 * } = useChatPage();
 * ------------------------------------------------------------------*/
