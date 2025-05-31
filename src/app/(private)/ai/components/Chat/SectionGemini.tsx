"use client";
import { aiHistory } from "@/@staticData/ai";
import { Input } from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  File,
  ImageIcon,
  Mic,
  Paperclip,
  Search,
  Send,
  X,
} from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../../components/ui/tooltip";
import { AiList } from "../aiList";
import { AudioPlayer } from "./AudioPlayer";
import { useFileHandler } from "./fileManipulation";
import { analyzeFile, useChatSession } from "./geminiai";
import { Message } from "./types";

export function Section() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Ola, como posso ajudar?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const {
    fileData,
    handleFileUpload,
    startRecording,
    stopRecording,
    clearFileData,
    isRecording,
    elapsedTime,
  } = useFileHandler();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chatSessionRef = useRef<any | null>(null);

  useChatSession(chatSessionRef);

  const appendMessage = (msg: Message) => setMessages((prev) => [...prev, msg]);

  const handleSendFile = async () => {
    if (!fileData) return;
    appendMessage({
      role: "user",
      content: "Arquivo enviado " + fileData.mimeType,
      file: fileData.dataUrl,
      type: fileData.mimeType,
      name: fileData.name,
    });
    appendMessage({
      role: "assistant",
      content: "...",
    });
    setLoading(true);
    if (fileData.mimeType.startsWith("audio/")) {
      clearFileData();
    }
    clearFileData();
    const response = await analyzeFile(fileData);
    sendMessage(response, true);
    setLoading(false);
    clearFileData();
  };

  const sendMessage = async (text: string, isFile?: boolean) => {
    setInputMessage("");
    if (!isFile) {
      appendMessage({ role: "user", content: text });
      appendMessage({ role: "assistant", content: "..." });
    }

    setLoading(true);
    const res = await chatSessionRef.current.sendMessage({ message: text });
    const reply = await res.text;
    setMessages((prev) =>
      prev.map((m) =>
        m.content === "..." ? { ...m, content: reply as string } : m,
      ),
    );
    setLoading(false);
  };

  useEffect(() => {
    if (fileData) {
      if (fileData.mimeType.startsWith("audio/")) {
        return;
      } else {
        handleSendFile();
      }
    }
  }, [fileData]);

  console.log("messages", messages);

  return (
    <>
      <div className="flex w-full items-center justify-center gap-2">
        <div className="flex h-[calc(100vh-150px)] w-9/12 flex-col justify-between rounded-2xl bg-white p-4">
          <div className="relative">
            <h1 className="text-4xl font-bold">Olá Leonardo</h1>
            <br />
            <h2 className="text-2xl font-medium">
              Como podemos te ajudar hoje?
            </h2>
            <button className="bg-primary absolute top-4 right-4 flex items-center gap-2 rounded-full px-4 py-2 text-xl font-medium text-white">
              Mudar IA <ChevronDown />
            </button>
          </div>
          {messages.length === 0 ? (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {AiList.map((ai) => (
                <div
                  key={ai.name}
                  className="flex h-full w-full flex-col gap-6 rounded-xl p-4"
                  style={{ backgroundColor: ai.background }}
                >
                  <h3 className="text-2xl font-semibold">{ai.name}</h3>
                  <p className="text-lg text-gray-600">{ai.description}</p>
                  <div
                    className={cn("h-10 w-10 rounded-xl")}
                    style={{ backgroundColor: ai.color }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <>
              <ScrollArea className="flex h-full w-full flex-col-reverse p-2 xl:p-8">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-2 self-end",
                      message.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {message.role === "user" ? (
                      <div className="flex justify-end gap-2 text-end">
                        <div className="flex flex-col items-end">
                          <div className="bg-primary flex min-h-[40px] flex-col rounded-xl p-2 text-white">
                            {message.type?.includes("image") ? (
                              <>
                                <Image
                                  src={message.file as string}
                                  alt=""
                                  width={2500}
                                  height={2500}
                                  className="h-40 w-max rounded-md object-contain"
                                />
                              </>
                            ) : message.type?.includes("audio") ? (
                              <AudioPlayer
                                className="ai z-[9999] h-full flex-1"
                                size="default"
                                audioUrl={message.file as string}
                              />
                            ) : message.type?.includes("video") ? (
                              <video
                                src={message.file as string}
                                controls
                                className="h-60 rounded-md"
                              />
                            ) : message.type?.includes("pdf") ? (
                              <a
                                href={message.file as string}
                                download
                                className="flex flex-col items-center gap-1"
                              >
                                <Paperclip />

                                <span>{message.name}</span>
                              </a>
                            ) : (
                              <span className="text-xs font-semibold xl:text-base">
                                {message.content}
                              </span>
                            )}
                          </div>
                          <span className="text-default-500">
                            {moment().format("HH:mm")}
                          </span>
                        </div>
                        <Image
                          src="/logos/small-logo.png"
                          alt=""
                          width={250}
                          height={250}
                          className="h-6 w-6 xl:h-10 xl:w-10"
                        />
                      </div>
                    ) : (
                      <div className="flex justify-start gap-2 text-start">
                        <Image
                          src="/logos/small-logo.png"
                          alt=""
                          width={250}
                          height={250}
                          className="h-6 w-6 xl:h-10 xl:w-10"
                        />
                        <div className="flex flex-col">
                          <div className="bg-primary/20 flex flex-col rounded-xl p-2 text-black">
                            {message.content === "..." ? (
                              <div className="mt-2 flex items-center justify-center space-x-2">
                                <span className="sr-only">...</span>
                                <div className="border-primary h-2 w-2 animate-bounce rounded-full border bg-black [animation-delay:-0.3s]"></div>
                                <div className="border-primary h-2 w-2 animate-bounce rounded-full border bg-black [animation-delay:-0.15s]"></div>
                                <div className="border-primary h-2 w-2 animate-bounce rounded-full border bg-black"></div>
                              </div>
                            ) : (
                              <div className="flex flex-col text-xs font-semibold xl:text-base">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                          <span className="text-default-500">
                            {moment().format("HH:mm")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </>
          )}

          <div className="flex h-20 w-full flex-row items-center gap-2 px-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-500 xl:h-11 xl:w-11">
                    <div className="absolute flex h-full w-full items-center justify-center p-1 text-zinc-400">
                      <File />
                    </div>
                    <input
                      className="z-[2] h-8 w-8 rounded-full opacity-0"
                      type="file"
                      accept="application/pdf*"
                      onChange={(e) => handleFileUpload(e)}
                      disabled={loading || !!fileData}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="start"
                  className="border-primary border bg-black"
                >
                  <p className="text-white">PDF</p>
                  <TooltipArrow className="fill-primary" />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-500 xl:h-11 xl:w-11">
                    <div className="absolute flex h-full w-full items-center justify-center p-1 text-zinc-400">
                      <ImageIcon />
                    </div>
                    <input
                      className="iz-[2] h-8 w-8 rounded-full opacity-0"
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleFileUpload(e)}
                      disabled={loading || !!fileData}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="start"
                  className="border-primary border bg-black"
                >
                  <p className="text-white">Imagem ou video</p>
                  <TooltipArrow className="fill-primary" />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <label className="flex h-8 w-full items-center gap-2 overflow-hidden rounded-lg border border-zinc-500 xl:h-11">
              {fileData && fileData.mimeType.startsWith("audio/") ? (
                <>
                  <AudioPlayer
                    className="ai h-full flex-1"
                    size="default"
                    audioUrl={fileData.dataUrl}
                  />
                  <button
                    onClick={() => clearFileData()}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-500/20"
                  >
                    <X className="text-red-500" />
                  </button>
                </>
              ) : (
                <div className="flex flex-1 flex-row items-center gap-1">
                  <input
                    className="border-none bg-transparent px-2 text-black outline-none placeholder:text-black/50 focus:outline-none xl:px-4"
                    placeholder="Digite aqui sua ideia"
                    disabled={isRecording || loading}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(inputMessage);
                        setInputMessage("");
                      }
                    }}
                  />
                </div>
              )}

              <div className="relative">
                <button
                  className="flex h-8 w-8 items-center justify-center gap-2 text-white"
                  disabled={loading}
                  onClick={() => {
                    if (fileData?.mimeType.startsWith("audio/")) {
                      console.log("entrou");
                      handleSendFile();
                    } else if (isRecording) {
                      console.log("entrou2");
                      stopRecording();
                    } else {
                      console.log("entrou3");
                      startRecording();
                    }
                  }}
                >
                  {isRecording && elapsedTime}
                  {fileData?.mimeType.startsWith("audio/") ? (
                    <Send className="text-zinc-500" />
                  ) : isRecording ? (
                    <X className="text-zinc-500" />
                  ) : (
                    <Mic className="text-zinc-500" />
                  )}
                </button>
              </div>
            </label>
          </div>
          {/* <div className="relative">
          <Input className="w-full rounded-full border-none p-4 text-xl font-medium" />
          <button className="bg-primary absolute top-1/2 right-1 -translate-y-1/2 rounded-full px-2 py-2 text-white">
            <ArrowRight />
          </button>
        </div> */}
        </div>
        <div className="flex h-[calc(100vh-150px)] w-3/12 flex-col justify-between rounded-2xl bg-white">
          <div className="flex h-full flex-col justify-between gap-4 pb-8">
            <div>
              <div className="relative w-full border-b border-gray-400 p-2">
                <Search className="text-dark absolute top-1/2 left-6 h-5 w-5 -translate-y-1/2" />
                <Input
                  className="w-full border-none bg-transparent pl-10"
                  placeholder="Pesquisar"
                />
              </div>
              <div className="flex flex-col gap-4 p-4">
                {aiHistory.map((historic, index) => (
                  <div key={index}>
                    <h4 className="text-xl font-semibold">{historic.title}</h4>
                    <p className="text-sm text-gray-600">
                      {historic.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <button className="bg-primary h-12 w-2/3 self-center rounded-3xl text-2xl font-semibold text-white">
              Novo Chat
            </button>
          </div>
        </div>
      </div>
      {/* <div className="h-[calc(100vh-200px)] w-full">
        <div className="flex h-full w-full flex-col items-center justify-between gap-2 rounded-lg xl:flex-row xl:gap-8">
          <div className="flex h-full w-full flex-1 flex-col justify-end rounded-lg bg-red-500">
            <ScrollArea className="flex h-full w-full flex-col-reverse p-2 xl:p-8">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-2 self-end",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {message.role === "user" ? (
                    <div className="flex justify-end gap-2 text-end">
                      <div className="flex flex-col items-end">
                        <div className="bg-primary flex min-h-[40px] flex-col rounded-xl p-2 text-white">
                          {message.type?.includes("image") ? (
                            <>
                              <Image
                                src={message.file as string}
                                alt=""
                                width={2500}
                                height={2500}
                                className="h-40 w-max rounded-md object-contain"
                              />
                            </>
                          ) : message.type?.includes("audio") ? (
                            <AudioPlayer
                              className="ai z-[9999] h-full flex-1"
                              size="default"
                              audioUrl={message.file as string}
                            />
                          ) : message.type?.includes("video") ? (
                            <video
                              src={message.file as string}
                              controls
                              className="h-60 rounded-md"
                            />
                          ) : message.type?.includes("pdf") ? (
                            <a
                              href={message.file as string}
                              download
                              className="flex flex-col items-center gap-1"
                            >
                              <Paperclip />

                              <span>{message.name}</span>
                            </a>
                          ) : (
                            <span className="text-xs font-semibold xl:text-base">
                              {message.content}
                            </span>
                          )}
                        </div>
                        <span className="text-default-500">
                          {moment().format("HH:mm")}
                        </span>
                      </div>
                      <Image
                        src="/images/logo/icon.png"
                        alt=""
                        width={250}
                        height={250}
                        className="h-6 w-6 xl:h-10 xl:w-10"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-start gap-2 text-start">
                      <Image
                        src="/images/logo/icon.png"
                        alt=""
                        width={250}
                        height={250}
                        className="h-6 w-6 xl:h-10 xl:w-10"
                      />
                      <div className="flex flex-col">
                        <div className="bg-primary/20 flex flex-col rounded-xl p-2 text-white">
                          {message.content === "..." ? (
                            <div className="mt-2 flex items-center justify-center space-x-2">
                              <span className="sr-only">...</span>
                              <div className="border-primary h-2 w-2 animate-bounce rounded-full border bg-black [animation-delay:-0.3s]"></div>
                              <div className="border-primary h-2 w-2 animate-bounce rounded-full border bg-black [animation-delay:-0.15s]"></div>
                              <div className="border-primary h-2 w-2 animate-bounce rounded-full border bg-black"></div>
                            </div>
                          ) : (
                            <div className="flex flex-col text-xs font-semibold xl:text-base">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                        <span className="text-default-500">
                          {moment().format("HH:mm")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </ScrollArea>
            <div className="flex h-20 w-full flex-row items-center gap-2 px-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-500 xl:h-11 xl:w-11">
                      <div className="absolute flex h-full w-full items-center justify-center p-1 text-zinc-400">
                        <File />
                      </div>
                      <input
                        className="z-[2] h-8 w-8 rounded-full opacity-0"
                        type="file"
                        accept="application/pdf*"
                        onChange={(e) => handleFileUpload(e)}
                        disabled={loading || !!fileData}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="start"
                    className="border-primary border bg-black"
                  >
                    <p className="text-white">PDF</p>
                    <TooltipArrow className="fill-primary" />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-500 xl:h-11 xl:w-11">
                      <div className="absolute flex h-full w-full items-center justify-center p-1 text-zinc-400">
                        <ImageIcon />
                      </div>
                      <input
                        className="iz-[2] h-8 w-8 rounded-full opacity-0"
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => handleFileUpload(e)}
                        disabled={loading || !!fileData}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="start"
                    className="border-primary border bg-black"
                  >
                    <p className="text-white">Imagem ou video</p>
                    <TooltipArrow className="fill-primary" />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <label className="flex h-8 w-full items-center gap-2 overflow-hidden rounded-lg border border-zinc-500 xl:h-11">
                {fileData && fileData.mimeType.startsWith("audio/") ? (
                  <>
                    <AudioPlayer
                      className="ai h-full flex-1"
                      size="default"
                      audioUrl={fileData.dataUrl}
                    />
                    <button
                      onClick={() => clearFileData()}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-500/20"
                    >
                      <X className="text-red-500" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-1 flex-row items-center gap-1">
                    <input
                      className="border-none bg-transparent px-2 text-white outline-none placeholder:text-zinc-500 focus:outline-none xl:px-4"
                      placeholder="Digite aqui sua ideia"
                      disabled={isRecording || loading}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(inputMessage);
                          setInputMessage("");
                        }
                      }}
                    />
                  </div>
                )}

                <div className="relative">
                  <button
                    className="flex h-8 w-8 items-center justify-center gap-2 text-white"
                    disabled={loading}
                    onClick={() => {
                      if (fileData?.mimeType.startsWith("audio/")) {
                        console.log("entrou");
                        handleSendFile();
                      } else if (isRecording) {
                        console.log("entrou2");
                        stopRecording();
                      } else {
                        console.log("entrou3");
                        startRecording();
                      }
                    }}
                  >
                    {isRecording && elapsedTime}
                    {fileData?.mimeType.startsWith("audio/") ? (
                      <Send className="text-zinc-500" />
                    ) : isRecording ? (
                      <X className="text-zinc-500" />
                    ) : (
                      <Mic className="text-zinc-500" />
                    )}
                  </button>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
}
