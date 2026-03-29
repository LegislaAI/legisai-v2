"use client";

import { useSectionChat } from "@/hooks/useSectionChat";
import { Bot, Mic, Paperclip, Send, StopCircle } from "lucide-react";
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
import { cn } from "@/lib/utils";
import remarkGfm from "remark-gfm";
import { FileViewer } from "./FileViewer";
import { Prompt } from "./types";

interface SectionGeminiProps {
  activeChatId?: string | null;
  selectedPrompt?: Prompt | null;
  onChatCreated?: () => void;
}

export function SectionAi({
  activeChatId,
  selectedPrompt,
  onChatCreated,
}: SectionGeminiProps) {
  // Internal state to trigger hook reloads
  const [loadNewChat, setLoadNewChat] = useState(false);
  const [loadOldChat, setLoadOldChat] = useState<string | null>(null);
  const [, setLoadHistory] = useState(false);
  const isInputDisabled = !activeChatId && !selectedPrompt; // Disable if new chat but no prompt selected
  // Initial load sync
  useEffect(() => {
    if (activeChatId) {
      setLoadOldChat(activeChatId);
    } else {
      setLoadNewChat(true);
    }
  }, [activeChatId]);
  useEffect(() => {
    if (selectedPrompt) {
      setLoadNewChat(true);
    }
  }, [selectedPrompt]);
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
    type: "ai",
  });

  // Notify parent if chat created (checking if chatId changed from empty to something)
  useEffect(() => {
    if (chatId && chatId !== activeChatId) {
      if (onChatCreated) onChatCreated();
    }
  }, [chatId]);

  const [showHistory, setShowHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  //   useEffect(() => {
  //      if(scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  //   }, [messages, loading]);

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

  // Preserving the exact UI structure from the previous file
  return (
    <div className="relative isolate flex h-full w-full overflow-hidden rounded-2xl border border-gray-100 shadow-lg">
      {showHistory && (
        <div
          className="animate-in fade-in absolute inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setShowHistory(false)}
        />
      )}

      {/* Internal Sidebar for Chat History */}

      {/* 2. MAIN CHAT AREA */}
      <div className="relative flex min-w-0 flex-1 flex-col bg-white">
        {/* HEADER */}

        {/* MESSAGES */}
        <ScrollArea
          onScroll={(e) => e.preventDefault()}
          className="flex-1 bg-[#fcfcfc] p-4"
        >
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
        <div className="z-10 flex w-full max-w-full flex-col gap-1 border-t border-gray-100 bg-white p-4">
          <span className="text-center text-sm text-gray-400">
            Em treinamento... Em breve disponível para uso.
          </span>
          <div className="mx-auto w-full max-w-3xl">
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
