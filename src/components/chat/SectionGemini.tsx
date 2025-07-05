"use client";
import { AudioPlayer } from "@/components/AudioPlayer";
import { cn } from "@/lib/utils";
import {
  FileIcon,
  ImageIcon,
  Mic,
  Paperclip,
  Send,
  Square,
  X,
} from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSectionChat } from "./chat-handler";
import { ScrollArea } from "./scroll-area";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { Message, Prompt } from "./types";

interface props {
  setLoadHistory?: React.Dispatch<React.SetStateAction<boolean>>;
  loadNewChat?: boolean;
  setLoadNewChat?: React.Dispatch<React.SetStateAction<boolean>>;
  loadOldChat?: string | null;
  setLoadOldChat?: React.Dispatch<React.SetStateAction<string | null>>;
  selectedPrompt?: Prompt;
  setSelectedPrompt?: React.Dispatch<React.SetStateAction<Prompt | null>>;
  startMessage?: string;
  actualScreenType: string;
}

export function Section({
  setLoadHistory,
  loadOldChat,
  setLoadOldChat,
  loadNewChat,
  setLoadNewChat,
  startMessage,
  selectedPrompt,
  actualScreenType,
}: props) {
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
    setMessages,
    handleSendMessage,
    screenType,
    setScreenType,
  } = useSectionChat({
    loadNewChat,
    setLoadNewChat,
    shouldUseFunctions: true,
    shouldCreateChat: true,
    shouldSaveFile: true,
    shouldSaveMessage: true,
    loadOldChat,
    setLoadOldChat,
    setLoadHistory,
    selectedPrompt,
  });

  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollAreaViewportRef.current) {
      scrollAreaViewportRef.current.scrollTop =
        scrollAreaViewportRef.current.scrollHeight;
    }
  }, [messages]);
  useEffect(() => {
    if (
      startMessage &&
      (!messages.length || messages[0]?.content !== startMessage)
    ) {
      const newMessage: Message = {
        content: startMessage,
        role: "ai",
      };
      setMessages((prevMessages) =>
        prevMessages.find((m) => m.content === startMessage)
          ? prevMessages
          : [newMessage, ...prevMessages],
      );
    }
  }, [startMessage, messages]);

  useEffect(() => {
    if (screenType !== actualScreenType) {
      setScreenType(actualScreenType);
    }
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("param2");
    if (query && !messages.find((m) => m.content === query)) {
      handleSendMessage(query);
      urlParams.delete("param2");
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${urlParams.toString()}`,
      );
    }
  }, [messages]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-full w-full flex-col items-center justify-between gap-2 rounded-lg xl:flex-row xl:gap-8">
        <div className="bg-default-100 flex h-full w-full flex-col rounded-lg">
          {/* ÁREA DE EXIBIÇÃO DAS MENSAGENS (Nenhuma alteração necessária aqui) */}
          <ScrollArea
            viewportRef={scrollAreaViewportRef}
            className="flex h-[calc(100%-80px)] max-h-[calc(100%-80px)] w-full overflow-y-auto p-2 xl:p-2"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-2 self-end",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {message.type !== "hiddenText" && (
                  <>
                    {message.role === "user" ? (
                      <div className="flex justify-end gap-2 text-end">
                        <div className="flex flex-col items-end">
                          <div className="bg-secondary flex min-h-[40px] flex-col rounded-xl p-2 text-white">
                            {/* Lógica de renderização de arquivos na mensagem (já compatível) */}
                            {message.type?.includes("image") ? (
                              <Image
                                src={message.file as string}
                                alt={message.name || "imagem"}
                                width={2500}
                                height={2500}
                                className="h-40 w-max rounded-md object-contain"
                              />
                            ) : message.type?.includes("audio") ? (
                              <div className="flex flex-row justify-end">
                                <div className="">
                                  <AudioPlayer
                                    className="ai z-[9999] m-0 max-w-60 md:max-w-full"
                                    size="default"
                                    audioUrl={message.file as string}
                                  />
                                </div>
                              </div>
                            ) : message.type?.includes("video") ? (
                              <video
                                src={message.file as string}
                                controls
                                className="h-60 rounded-md"
                              />
                            ) : message.type?.includes("pdf") ||
                              message.type?.includes("application") ? (
                              <a
                                href={message.file as string}
                                download={message.name}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-1 p-2"
                              >
                                <Paperclip />
                                <span>{message.name}</span>
                              </a>
                            ) : (
                              message.content && (
                                <span className="text-xs font-semibold xl:text-base">
                                  {message.content}
                                </span>
                              )
                            )}
                          </div>
                          <span className="text-secondary">
                            {moment().format("HH:mm")}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-start gap-2 text-start">
                        <Image
                          src="/logos/small-logo.png"
                          alt="AI Avatar"
                          width={250}
                          height={250}
                          className="h-6 w-max object-contain xl:h-10 xl:w-max"
                        />
                        <div className="flex flex-col">
                          <div className="bg-secondary/80 flex flex-col rounded-xl p-2 text-white">
                            {message.content === "..." ? (
                              <div className="mt-2 flex items-center justify-center space-x-2">
                                <span className="sr-only text-white">...</span>
                                <div className="border-secondary h-2 w-2 animate-bounce rounded-full border bg-white [animation-delay:-0.3s]"></div>
                                <div className="border-secondary h-2 w-2 animate-bounce rounded-full border bg-white [animation-delay:-0.15s]"></div>
                                <div className="border-secondary h-2 w-2 animate-bounce rounded-full border bg-white"></div>
                              </div>
                            ) : (
                              <div className="flex flex-col text-xs font-semibold xl:text-base">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                          <span className="text-secondary">
                            {moment().format("HH:mm")}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </ScrollArea>

          {/* ÁREA DE INPUT (INTEGRADA E CORRIGIDA) */}
          <div className="relative flex h-20 w-full flex-row items-center gap-2 px-2 lg:px-4">
            {/* CORREÇÃO: Os inputs de arquivo agora usam a nova função e estado */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="border-secondary relative flex h-8 w-8 items-center justify-center rounded-lg border xl:h-11 xl:w-11">
                    <div className="text-secondary absolute flex h-full w-full items-center justify-center p-1">
                      <FileIcon />{" "}
                      {/* Renomeado para não conflitar com o tipo 'File' */}
                    </div>
                    <input
                      className="z-[2] h-full w-full cursor-pointer rounded-full opacity-0"
                      type="file"
                      // INTEGRADO: Aceita vários tipos
                      accept="application/pdf"
                      onChange={handleFileUpload} // CORREÇÃO: chamada corrigida
                      disabled={loading || !!file} // CORREÇÃO: estado corrigido
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="start"
                  className="border-secondary bg-secondary border"
                >
                  <p className="text-white">Documento</p>
                  <TooltipArrow className="fill-secondary" />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="border-secondary relative flex h-8 w-8 items-center justify-center rounded-lg border xl:h-11 xl:w-11">
                    <div className="text-secondary absolute flex h-full w-full items-center justify-center p-1">
                      <ImageIcon />
                    </div>
                    <input
                      className="z-[2] h-full w-full cursor-pointer rounded-full opacity-0"
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload} // CORREÇÃO: chamada corrigida
                      disabled={loading || !!file} // CORREÇÃO: estado corrigido
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="start"
                  className="border-secondary bg-secondary border"
                >
                  <p className="text-white">Imagem ou vídeo</p>
                  <TooltipArrow className="fill-secondary" />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* BARRA DE INPUT PRINCIPAL */}
            <div className="border-secondary flex h-8 flex-1 items-center gap-2 rounded-lg border px-2 xl:h-11">
              {/* CORREÇÃO: Lógica de preview de arquivo selecionado */}

              <div className="flex-1 lg:relative">
                {file && (
                  <div className="border-secondary absolute -top-6 right-2 left-2 flex h-10 items-center justify-between gap-2 rounded-t-md border px-4 pl-2 lg:-top-12 lg:left-0">
                    <div className="flex flex-1 items-center gap-2">
                      {file.type.startsWith("audio") ? (
                        <AudioPlayer
                          audioUrl={URL.createObjectURL(file)}
                          className="h-8 w-full"
                        />
                      ) : (
                        <>
                          <Paperclip
                            size={16}
                            className="text-secondary flex-shrink-0"
                          />
                          <span className="text-secondary line-clamp-1 w-[100px] flex-1 truncate text-sm">
                            {file.name}
                          </span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => setFile(null)} // CORREÇÃO: usa setFile(null) para limpar
                      className="bg-secondary/20 hover:bg-secondary/30 flex h-6 min-h-6 w-6 min-w-6 flex-shrink-0 items-center justify-center rounded-full"
                    >
                      <X className="text-red-500" size={16} />
                    </button>
                  </div>
                )}
                {isRecording ? (
                  <>
                    <div className="flex w-full flex-1 flex-row md:hidden">
                      <span className="text-secondary text-sm">
                        Gravando - {elapsedTime}
                      </span>
                    </div>
                    <span className="text-secondary hidden font-mono text-sm md:block">
                      Gravando áudio - {elapsedTime}
                    </span>
                  </>
                ) : (
                  <input
                    className="text-secondary placeholder:text-secondary w-full flex-1 border-none bg-transparent pr-2 outline-none focus:outline-none"
                    placeholder="Digite aqui sua ideia..."
                    disabled={isRecording || loading}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(); // CORREÇÃO: Chama a nova função unificada
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {/* BOTÃO DE AÇÃO UNIFICADO (Enviar / Gravar / Parar) */}
            <div className="relative flex justify-center pr-1">
              <button
                className="border-secondary text-secondary flex h-8 w-8 items-center justify-center gap-2 rounded-lg border disabled:cursor-not-allowed disabled:opacity-50 xl:h-11 xl:w-11"
                disabled={loading}
                onClick={() => {
                  if (isRecording) {
                    stopRecording();
                  } else if (inputMessage || file) {
                    handleSendMessage();
                  } else {
                    startRecording();
                  }
                }}
              >
                {isRecording ? (
                  <div className="text-secondary flex items-center gap-2">
                    <Square className="animate-pulse" />
                  </div>
                ) : inputMessage || file ? (
                  <Send />
                ) : (
                  <Mic />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
