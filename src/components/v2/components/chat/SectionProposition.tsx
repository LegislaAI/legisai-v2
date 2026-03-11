"use client";

import { useSectionChat } from "@/hooks/useSectionChat";
import {
  Bot,
  ChevronLeft,
  History,
  Menu,
  Mic,
  Paperclip,
  Plus,
  Send,
  StopCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import { Avatar, AvatarFallback } from "@/components/v2/components/ui/avatar";
import { Button } from "@/components/v2/components/ui/Button";
import { ScrollArea } from "@/components/v2/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/v2/components/ui/tooltip";
import { useApiContext } from "@/context/ApiContext";
import { cn } from "@/lib/utils";
import moment from "moment";
import remarkGfm from "remark-gfm";
import { Prompt } from "./chat-history-handler";
import { FileViewer } from "./FileViewer";

interface SectionGeminiProps {
  activeChatId?: string | null;
  selectedPrompt?: Prompt | null;
  onChatCreated?: () => void;
  type: string;
  /** Quando vindo da ficha do deputado, ID do autor para contexto da busca */
  initialAuthorId?: string;
  initialPrompt?: string;
}

export function SectionProposition({
  activeChatId,
  selectedPrompt,
  onChatCreated,
  type,
  initialPrompt,
}: SectionGeminiProps) {
  const { GetAPI } = useApiContext();
  const [historyList, setHistoryList] = useState<
    { id: string; name: string; createdAt: string }[]
  >([]);
  const [chatTotalPages, setChatTotalPages] = useState(1);
  const [currentLastPage, setCurrentLastPage] = useState(1);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Internal state to trigger hook reloads
  const [loadNewChat, setLoadNewChat] = useState(false);
  const [loadOldChat, setLoadOldChat] = useState<string | null>(null);
  const [loadHistory, setLoadHistory] = useState(false);

  const isInputDisabled = !activeChatId && !selectedPrompt; // Disable if new chat but no prompt selected

  const {
    messages,
    loading,
    inputMessage,
    setInputMessage,
    file,
    setFile,
    isRecording,
    elapsedTime,
    handleFileUpload,
    startRecording,
    stopRecording,
    handleSendMessage,
    addLocalExchange,
    chatId,
  } = useSectionChat({
    loadNewChat,
    setLoadNewChat,
    loadOldChat,
    setLoadOldChat,
    setLoadHistory,
    selectedPrompt,
    shouldCreateChat: true,
    shouldSaveMessage: true,
    shouldSaveFile: true,
    shouldUseFunctions: true,
    type: type,
  });

  // Sincroniza com o chat ativo: ao selecionar um chat do histórico, carrega; ao estar em "novo chat", reseta só quando não há chatId (evita apagar balões após a primeira mensagem) e só na transição para null (evita loop)
  const prevActiveChatIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (activeChatId) {
      setLoadOldChat(activeChatId);
    } else if (!chatId) {
      const isInitial = prevActiveChatIdRef.current === undefined;
      const switchedToNew = prevActiveChatIdRef.current !== null;
      if (isInitial || switchedToNew) setLoadNewChat(true);
    }
    prevActiveChatIdRef.current = activeChatId ?? null;
  }, [activeChatId, chatId]);

  // Notify parent if chat created (checking if chatId changed from empty to something)
  useEffect(() => {
    if (chatId && chatId !== activeChatId) {
      if (onChatCreated) onChatCreated();
    }
  }, [chatId]);

  const [showHistory, setShowHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SHORTCUT_ASSISTANT_REPLY =
    "Estou pronto para ajudar com essa busca. Gostaria de refinar? Por exemplo: os **últimos PLs** requeridos, PLs de um **tema ou área** específica, de um **período** ou de um **parlamentar** específico. Diga como prefere e eu busco para você.";

  const tramitacoesShortcuts = [
    { label: "Buscar PL de Saúde", userText: "Buscar PL de Saúde" },
    { label: "PL pronto para Pauta", userText: "PL pronto para Pauta" },
    { label: "PL aguardando Parecer", userText: "PL aguardando Parecer" },
  ];

  // Auto-send initial prompt if present
  const initialPromptSent = useRef(false);
  useEffect(() => {
    if (
      initialPrompt &&
      !initialPromptSent.current &&
      selectedPrompt &&
      !loading &&
      !activeChatId &&
      !loadOldChat
    ) {
      initialPromptSent.current = true;
      setInputMessage(initialPrompt);
      setTimeout(() => {
        handleSendMessage(initialPrompt);
      }, 100);
    }
  }, [
    initialPrompt,
    selectedPrompt,
    loading,
    activeChatId,
    loadOldChat,
    handleSendMessage,
    setInputMessage,
  ]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Handle Resize for History Sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowHistory(false);
      } else {
        setShowHistory(true);
      }
    };
    if (window.innerWidth < 768) setShowHistory(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchSidebarHistory = async (page: number = 1) => {
    let endpoint = "";
    if (type === "ai") endpoint = `/chat/ai?page=${page}`;
    if (type === "proposition") endpoint = `/chat/proposition?page=${page}`;
    if (type === "prediction") endpoint = `/chat/prediction?page=${page}`;

    setIsLoadingHistory(true);
    try {
      const res = await GetAPI(endpoint, true);
      if (res.status === 200) {
        if (page === 1) {
          setHistoryList(res.body.chats || []);
        } else {
          setHistoryList((prev) => [...prev, ...res.body.chats]);
        }
        setChatTotalPages(res.body.pages || 1);
        setCurrentLastPage(page);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchSidebarHistory(1);
  }, [loadHistory, type]);

  // Preserving the exact UI structure from the previous file
  return (
    <div className="relative isolate flex h-full w-full overflow-hidden border border-gray-100 shadow-lg">
      {showHistory && (
        <div
          className="animate-in fade-in absolute inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setShowHistory(false)}
        />
      )}

      {/* Internal Sidebar for Chat History */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 z-30 flex shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white shadow-xl transition-all duration-300 md:relative md:shadow-none",
          showHistory
            ? "w-[85%] translate-x-0 md:w-80"
            : "w-0 -translate-x-full md:w-0 md:translate-x-0",
        )}
      >
        <div className="px-6 py-2">
          <Button
            onClick={() => {
              setLoadNewChat(true);
              if (window.innerWidth < 768) setShowHistory(false);
            }}
            className="bg-secondary hover:bg-secondary/90 w-full border border-transparent text-white shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Chat
          </Button>
        </div>
        <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="from-secondary/20 rounded-lg bg-gradient-to-br to-green-100 p-1.5">
                <History size={16} className="text-secondary" />
              </div>
              <h3 className="font-bold text-gray-700">Histórico</h3>
            </div>
            <Button
              variant="ghost"
              className="hover:text-dark h-8 w-8 text-gray-400 md:hidden"
              onClick={() => setShowHistory(false)}
            >
              <ChevronLeft size={18} />
            </Button>
          </div>
        </div>

        <ScrollArea className="min-w-[240px] flex-1 px-4 py-4">
          <div className="space-y-2 p-1 pb-4">
            {historyList.length === 0 && !isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
                <div className="mb-3 rounded-lg bg-gray-50 p-3">
                  <History size={24} className="opacity-20" />
                </div>
                <p className="max-w-[200px] text-xs">
                  Nenhum histórico de conversas encontrado
                </p>
              </div>
            ) : (
              historyList.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => {
                    setLoadOldChat(chat.id);
                    if (window.innerWidth < 768) setShowHistory(false);
                  }}
                  className={cn(
                    "group relative box-border w-full max-w-[280px] overflow-hidden rounded-xl p-3 text-left transition-all duration-200",
                    loadOldChat === chat.id
                      ? "from-secondary/10 border-secondary/40 border-2 bg-gradient-to-r to-green-50 shadow-md"
                      : "border border-gray-100 bg-white hover:scale-[1.01] hover:border-gray-200 hover:shadow-sm",
                  )}
                >
                  {loadOldChat === chat.id && (
                    <div className="from-secondary absolute top-0 bottom-0 left-0 w-1 rounded-l-xl bg-gradient-to-b to-green-500" />
                  )}

                  <div className="flex items-start gap-3 overflow-hidden">
                    <div
                      className={cn(
                        "shrink-0 rounded-lg p-2 transition-all",
                        loadOldChat === chat.id
                          ? "bg-secondary text-white shadow-sm"
                          : "group-hover:bg-secondary/10 group-hover:text-secondary bg-gray-100 text-gray-500",
                      )}
                    >
                      <Bot size={16} />
                    </div>

                    <div className="w-full max-w-full min-w-0 flex-1 overflow-hidden">
                      <div
                        className={cn(
                          "mb-0.5 truncate text-sm font-semibold",
                          loadOldChat === chat.id
                            ? "text-secondary"
                            : "text-gray-700",
                        )}
                      >
                        {chat?.name}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        <span className="shrink-0">
                          {moment(chat?.createdAt).format("DD/MM")}
                        </span>
                        <span className="shrink-0">
                          {moment(chat?.createdAt).format("HH:mm")}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}

            {currentLastPage < chatTotalPages && (
              <Button
                variant="ghost"
                className="hover:text-secondary mt-2 w-full text-xs text-gray-400"
                onClick={() => fetchSidebarHistory(currentLastPage + 1)}
                disabled={isLoadingHistory}
              >
                {isLoadingHistory ? (
                  <div className="flex justify-center p-2">
                    <div className="border-secondary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  </div>
                ) : (
                  "Carregar mais"
                )}
              </Button>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 2. MAIN CHAT AREA */}
      <div className="relative flex min-w-0 flex-1 flex-col bg-white">
        {/* Toggle Sidebar Button (Floating) */}
        {!showHistory && (
          <button
            onClick={() => setShowHistory(true)}
            className="hover:text-secondary absolute top-4 left-4 z-20 rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-md transition-all md:hidden"
          >
            <Menu size={18} />
          </button>
        )}

        {/* HEADER */}
        {/* <div className="flex items-center justify-between p-4 py-2 border-b border-gray-100 bg-white/80 backdrop-blur-md z-10">
        
             <div className={cn("flex items-center gap-3 transition-all", !showHistory ? 'ml-12 md:ml-0' : '')}>
                 <Avatar className="h-10 w-10 ring-2 ring-white shadow-md bg-gradient-to-br from-secondary to-green-700">
                     <AvatarFallback className="bg-transparent text-white"><Bot size={20} /></AvatarFallback>
                 </Avatar>
                 <div className="">
                 </div>
             </div>
        </div> */}

        {/* MESSAGES */}
        <ScrollArea className="flex-1 bg-[#fcfcfc] p-4">
          <div className="space-y-6 pb-4">
            {messages.length === 0 && !loading && (
              <div className="animate-in fade-in zoom-in flex min-h-[300px] flex-col items-center justify-center space-y-6 text-center duration-500">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <Bot size={40} className="text-secondary/80" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-700">
                    Olá! Eu sou o Legis AI.
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-gray-500">
                    {selectedPrompt
                      ? `Estou operando no modo ${selectedPrompt.name}.`
                      : "Selecione uma persona para começar."}
                  </p>
                </div>

                {/* Quick Actions based on type could go here */}
                <div className="grid w-full max-w-sm grid-cols-1 gap-3">
                  <button
                    onClick={() => setInputMessage("O que você pode fazer?")}
                    className="hover:border-secondary rounded-xl border border-gray-200 bg-white p-3 text-center text-sm text-gray-600 transition-all hover:shadow-md"
                  >
                    &quot;O que você pode fazer?&quot;
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.content === "..." ? (
                  <div className="flex gap-4">
                    <Avatar className="mt-1 h-8 w-8 border border-gray-100 bg-white shadow-sm">
                      <AvatarFallback>
                        <Bot size={14} className="text-secondary" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-gray-100 bg-white p-4 shadow-sm">
                      <div className="bg-secondary/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.3s]"></div>
                      <div className="bg-secondary/60 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.15s]"></div>
                      <div className="bg-secondary h-1.5 w-1.5 animate-bounce rounded-full"></div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "relative max-w-[85%] rounded-2xl p-4 leading-relaxed shadow-sm",
                      msg.role === "user"
                        ? "bg-dark rounded-tr-sm text-white"
                        : "markdown-body rounded-tl-sm border border-gray-100 bg-white text-gray-800",
                    )}
                  >
                    {msg.file && (
                      <div className="mb-3 max-w-[280px]">
                        <FileViewer
                          file={msg.file}
                          mimeType={msg.type}
                          fileName={msg.name}
                          className={
                            msg.role === "user"
                              ? "border-white/20 bg-white text-white"
                              : ""
                          }
                        />
                      </div>
                    )}
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* INPUT AREA */}
        <div className="z-10 w-full max-w-full border-t border-gray-100 bg-white p-4">
          <div className="mx-auto max-w-3xl">
            {/* Shortcuts tramitações: acima do input */}
            {type === "proposition" && (
              <div className="mb-3 flex flex-wrap justify-center gap-2">
                {messages.length < 1 &&
                  tramitacoesShortcuts.map((s) => (
                    <button
                      key={s.userText}
                      type="button"
                      onClick={() =>
                        addLocalExchange(s.userText, SHORTCUT_ASSISTANT_REPLY)
                      }
                      disabled={loading}
                      className="hover:border-secondary hover:bg-secondary/5 hover:text-secondary rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {s.label}
                    </button>
                  ))}
              </div>
            )}

            {/* Files */}
            {file && (
              <div className="animate-in slide-in-from-bottom-2 fade-in mb-2 flex gap-2">
                <FileViewer
                  file={file}
                  onRemove={() => setFile(null)}
                  isInput
                />
              </div>
            )}

            {/* Recording */}
            {isRecording && (
              <div className="animate-in slide-in-from-bottom-2 absolute right-4 bottom-20 left-4 z-20 flex items-center gap-4 rounded-full border border-red-100 bg-white p-2 px-4 shadow-xl md:left-1/2 md:w-auto md:-translate-x-1/2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
                <span className="font-mono font-bold text-red-500">
                  {elapsedTime}
                </span>
                <Button
                  variant="ghost"
                  onClick={stopRecording}
                  className="h-6 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <StopCircle size={14} className="mr-1" /> Parar
                </Button>
              </div>
            )}

            <div className="focus-within:border-secondary flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-2 shadow-inner transition-all focus-within:ring-0">
              <div className="flex gap-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="hover:text-secondary rounded-xl p-2 text-gray-400 transition-all hover:bg-white hover:shadow-sm"
                      >
                        <Paperclip size={18} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Anexar</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  isInputDisabled
                    ? "Nenhum assistente disponível para este contexto."
                    : isRecording
                      ? "Gravando..."
                      : `Mensagem para ${selectedPrompt?.name || "LegisAI"}...`
                }
                className="text-dark max-h-32 min-h-[44px] flex-1 resize-none border-none bg-transparent py-3 outline-none placeholder:text-gray-400 focus:ring-0"
                rows={1}
                disabled={isRecording || isInputDisabled}
              />

              <div className="flex gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={cn(
                          "rounded-xl p-2 transition-all",
                          isRecording
                            ? "bg-red-50 text-red-500"
                            : "hover:text-secondary text-gray-400 hover:bg-white hover:shadow-sm",
                        )}
                      >
                        <Mic size={18} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Gravar</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  onClick={() => handleSendMessage()}
                  disabled={(!inputMessage.trim() && !file) || isInputDisabled}
                  className="bg-secondary hover:bg-secondary/90 h-10 w-10 shrink-0 rounded-xl p-0 text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
