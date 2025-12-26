/* --------------------------------------------------------------------
 *  src/hooks/useSectionChat.ts
 *  -------------------------------------------------------------------
 *  Hook de chat usando OpenRouter API via backend route.
 *    • Flags: shouldCreateChat, shouldSaveMessage, shouldSaveFile,
 *             shouldUseFunctions
 *    • Upload de arquivos, gravação de áudio, histórico, streaming.
 *    • Detecção de tool_calls e execução local
 * ------------------------------------------------------------------*/

"use client";

import {
  executeToolCalls,
  getOpenRouterTools,
} from "@/components/v2/components/chat/functions";
import {
  FileToSend,
  Message,
  MessagesFromBackend,
  OpenRouterMessage,
  OpenRouterStreamChunk,
  OpenRouterToolCall,
  Prompt,
} from "@/components/v2/components/chat/types";
import {
  ChangeEvent,
  startTransition,
  useEffect,
  useRef,
  useState,
} from "react";
import fixWebmDuration from "webm-duration-fix";

import { useApiContext } from "@/context/ApiContext";

// Default prompt fallback
const PromptFunctionTest: string = `Você é um assistente legislativo especializado em busca, interpretação e acompanhamento de Projetos de Lei na Câmara Legislativa do Brasil.
Sempre se comunique de forma formal, profissional e institucional, priorizando clareza, objetividade e precisão.
Utilize exclusivamente o banco de dados interno ou os dados fornecidos.`;

export interface UseSectionChatParams {
  /* controles de UI/histórico */
  setLoadHistory?: React.Dispatch<React.SetStateAction<boolean>>;
  loadNewChat?: boolean;
  setLoadNewChat?: React.Dispatch<React.SetStateAction<boolean>>;
  loadOldChat?: string | null;
  setLoadOldChat?: React.Dispatch<React.SetStateAction<string | null>>;
  selectedPrompt?: Prompt | null;

  /* flags backend */
  shouldCreateChat?: boolean;
  shouldSaveMessage?: boolean;
  shouldSaveFile?: boolean;

  /* flag function-calling */
  shouldUseFunctions?: boolean;

  /* Current Screen Type */
  type?: string;
}

export function useSectionChat({
  setLoadHistory,
  loadNewChat,
  setLoadNewChat,
  loadOldChat,
  setLoadOldChat,
  selectedPrompt,
  shouldCreateChat = false,
  shouldSaveMessage = false,
  shouldSaveFile = false,
  shouldUseFunctions = false,
  type = "ai",
}: UseSectionChatParams) {
  /* ──────────────────────────────────── STATE/REFS ─────────────────────────────────── */
  const [messages, setMessages] = useState<Message[]>([]);
  const { PostAPI, GetAPI } = useApiContext();
  const [chatId, setChatId] = useState("");
  const [loading, setLoading] = useState(false);
  const [screenType, setScreenType] = useState(type);
  const [inputMessage, setInputMessage] = useState("");

  // Histórico de conversação no formato OpenRouter
  const conversationHistoryRef = useRef<OpenRouterMessage[]>([]);

  /* gravação */
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recordStartTime, setRecordStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00");

  /* arquivo */
  const [file, setFile] = useState<File | null>(null);


  /* ─────────────────────────────── RESET ON PROMPT CHANGE ─────────────────────────────── */
  useEffect(() => {
    // Reset conversation history when prompt changes
    conversationHistoryRef.current = [];
  }, [selectedPrompt]);

  useEffect(() => {
    setScreenType(type);
  }, [type]);

  /* ─────────────────────────────── HELPERS ─────────────────────────────── */
  async function fileToBase64(f: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  }

  async function handleCreateChat(first: string): Promise<string | null> {
    if (!shouldCreateChat) return null;
    try {
      // 1. Generate Title via AI
      let generatedTitle = first.split(" ").slice(0, 5).join(" ") || "Novo Chat";
      try {
         const titleRes = await fetch("/api/chat/title", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ messages: [{ role: "user", content: first }] })
         });
         if(titleRes.ok) {
             const data = await titleRes.json();
             if(data.title) generatedTitle = data.title;
         }
      } catch(err) {
          console.error("Title gen errored, using fallback", err);
      }

      const payload = {
        name: generatedTitle,
        promptId: selectedPrompt?.id,
        type: screenType,
      };

      const r = await PostAPI("/chat", payload, true);

      if (r.status === 200 || r.status === 201) {
        setLoadHistory?.(true);
        const id = r.body.chat.id;
        setChatId(id);
        return id;
      }
    } catch (e) {
      console.error("createChat:", e);
    }
    return null;
  }

  async function handlePostMessage(
    id: string,
    msg: { text: string; entity: string; mimeType: string; fileUrl?: string }
  ) {
    if (!shouldSaveMessage) return;
    try {
      const payload = {
        message: msg.text,
        ...msg,
      };

      await PostAPI(`/message/${id}`, payload, true);
    } catch (e) {
      console.error("postMessage:", e);
    }
  }

  async function uploadFileBackend(id: string, f: File) {
    if (!shouldSaveFile) return;
    const form = new FormData();
    form.append("file", f);

    try {
      await PostAPI(`/message/${id}/file`, form, true);
    } catch (e) {
      console.error("uploadBackend:", e);
    }
  }

  /* new / old chat helpers */
  function handleNewChat() {
    setMessages([]);
    conversationHistoryRef.current = [];
    setChatId("");
    setFile(null);
    setInputMessage("");
    setLoadNewChat?.(false);
  }

  useEffect(() => {
    if (loadNewChat) handleNewChat();
  }, [loadNewChat]);

  async function handleGetOldChat(id: string) {
    setLoading(true);
    setMessages([]);
    conversationHistoryRef.current = [];
    try {
      const r = await GetAPI(`/message/${id}`, true);
      if (r.status === 200) {
        const histMsgs = r.body.messages.map((m: MessagesFromBackend) => ({
          content: m.text,
          role: m.entity === "user" ? "user" : "ai",
          type: m.mimeType,
          file: m.fileUrl,
        }));
        
        // Rebuild conversation history for OpenRouter
        const histOpenRouter: OpenRouterMessage[] = r.body.messages.map(
          (m: MessagesFromBackend) => ({
            role: m.entity === "user" ? "user" : "assistant",
            content: m.text,
          })
        );
        
        setMessages(histMsgs);
        conversationHistoryRef.current = histOpenRouter;
      }
    } catch (e) {
      console.error("getOldChat:", e);
    } finally {
      setLoadOldChat?.(null);
      setLoadHistory?.(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (loadOldChat) {
      setChatId(loadOldChat);
      handleGetOldChat(loadOldChat);
    }
  }, [loadOldChat]);

  /* ─────────────────────────────── FILE / AUDIO ─────────────────────────────── */
  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      if (f.size >= 20_000_000) {
        alert("Arquivo > 20 MB");
      } else setFile(f);
    }
    e.target.value = "";
  }

  /* gravação */
  const startRecording = async () => {
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    chunksRef.current = [];
    rec.ondataavailable = (ev) =>
      ev.data.size > 0 && chunksRef.current.push(ev.data);
    rec.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const fixed = await fixWebmDuration(blob);
      setFile(new File([fixed], "audio.webm", { type: "audio/webm" }));
      stream.getTracks().forEach((t) => t.stop());
    };
    rec.start();
    setMediaRecorder(rec);
    setRecordStartTime(Date.now());
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
    setRecordStartTime(null);
    setElapsedTime("00:00");
  };

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | undefined;
    if (recordStartTime && isRecording) {
      id = setInterval(() => {
        const el = (Date.now() - recordStartTime) / 1000;
        setElapsedTime(
          `${Math.floor(el / 60)
            .toString()
            .padStart(2, "0")}:${Math.floor(el % 60)
            .toString()
            .padStart(2, "0")}`
        );
      }, 1000);
    }
    return () => id && clearInterval(id);
  }, [recordStartTime, isRecording]);

  /* ─────────────────────────────── STREAM / SEND ─────────────────────────────── */
  const placeholderIndexRef = useRef(-1);
  const cancelStreamRef = useRef(false);
  const streamBufRef = useRef("");

  const flushUI = () =>
    startTransition(() => {
      const txt = streamBufRef.current;
      setMessages((prev) =>
        prev.map((m, i) =>
          i === placeholderIndexRef.current ? { ...m, content: txt } : m
        )
      );
    });

  async function callOpenRouterAPI(
    conversationMessages: OpenRouterMessage[],
    filesToSend: FileToSend[]
  ): Promise<Response> {
    const systemPrompt =
      selectedPrompt?.prompt ||
      selectedPrompt?.description ||
      PromptFunctionTest;

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: conversationMessages,
        model: "google/gemini-2.5-flash",
        files: filesToSend.length > 0 ? filesToSend : undefined,
        systemPrompt,
        tools: shouldUseFunctions ? getOpenRouterTools() : undefined,
      }),
    });
    console.log("response", response)
    console.log("response body", response.body)
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${errorText}`);
    }

    return response;
  }

  async function processStream(response: Response): Promise<{
    text: string;
    toolCalls: OpenRouterToolCall[];
  }> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";
    const toolCalls: OpenRouterToolCall[] = [];
    const toolCallsInProgress: Record<number, OpenRouterToolCall> = {};

    while (true) {
      const { done, value } = await reader.read();
      if (done || cancelStreamRef.current) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          if (!data) continue;

          try {
            const parsed: OpenRouterStreamChunk = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;

            // Handle text content
            if (delta?.content) {
              fullText += delta.content;
              streamBufRef.current = fullText;
              flushUI();
            }

            // Handle tool calls (may come in chunks)
            if (delta?.tool_calls) {
              for (const tc of delta.tool_calls) {
                const idx = tc.index ?? 0;
                
                if (!toolCallsInProgress[idx]) {
                  toolCallsInProgress[idx] = {
                    id: tc.id || "",
                    type: "function",
                    index: idx,
                    function: {
                      name: tc.function?.name || "",
                      arguments: tc.function?.arguments || "",
                    },
                  };
                } else {
                  // Append to existing
                  if (tc.id) toolCallsInProgress[idx].id = tc.id;
                  if (tc.function?.name) {
                    toolCallsInProgress[idx].function.name = tc.function.name;
                  }
                  if (tc.function?.arguments) {
                    toolCallsInProgress[idx].function.arguments += tc.function.arguments;
                  }
                }
              }
            }

            // Check finish reason
            const finishReason = parsed.choices?.[0]?.finish_reason;
            if (finishReason === "tool_calls") {
              // Collect all tool calls
              Object.values(toolCallsInProgress).forEach((tc) => {
                if (tc.id && tc.function.name) {
                  toolCalls.push(tc);
                }
              });
            }
          } catch (e) {
            // Ignore parse errors for malformed chunks
            console.debug("Parse error:", e);
          }
        }
      }
    }

    return { text: fullText, toolCalls };
  }

  async function handleSendMessage(message?: string) {
    const inputMessages2 = message ?? inputMessage;

    if (loading || (!inputMessages2.trim() && !file)) return;
    cancelStreamRef.current = false;
    setLoading(true);

    /* push user message + placeholder */
    const outgoing: Message[] = [];
    if (file) {
      outgoing.push({
        role: "user",
        content: "",
        file: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
      });
    }
    if (inputMessages2.trim()) {
      outgoing.push({ role: "user", content: inputMessages2 });
    }

    setMessages((prev) => {
      const list = [...prev, ...outgoing, { role: "ai" as const, content: "..." }];
      placeholderIndexRef.current = list.length - 1;
      return list;
    });

    /* clean inputs */
    const fileToSend = file;
    setInputMessage("");
    setFile(null);

    let curChatId = chatId;
    const filesToSend: FileToSend[] = [];

    try {
      /* Process file but don't upload yet */
      if (fileToSend) {
        const base64 = await fileToBase64(fileToSend);
        filesToSend.push({
          base64,
          type: fileToSend.type,
          name: fileToSend.name,
        });
      }

      /* Add user message to conversation history */
      const userMessage: OpenRouterMessage = {
        role: "user",
        content: inputMessages2.trim() || "Analise o arquivo enviado.",
      };
      conversationHistoryRef.current.push(userMessage);

      /* POST MESSAGE (User) logic deferred... */

      /* Initial API call */
      streamBufRef.current = "";
      let response = await callOpenRouterAPI(
        conversationHistoryRef.current,
        filesToSend
      );
      let result = await processStream(response);

      /* Handle tool calls if any */
      if (shouldUseFunctions && result.toolCalls.length > 0) {
        // Show processing message
        streamBufRef.current = "🔍 Executando funções...";
        flushUI();

        // Execute tool calls locally
        const toolResults = await executeToolCalls(result.toolCalls, {
          GetAPI,
          PostAPI,
        });

        // Add assistant message with tool_calls to history
        conversationHistoryRef.current.push({
          role: "assistant",
          content: null,
          tool_calls: result.toolCalls,
        });

        // Add tool results to history
        for (const result of toolResults) {
          conversationHistoryRef.current.push({
            role: "tool",
            tool_call_id: result.id,
            content: JSON.stringify(result.output),
            name: result.name,
          });
        }

        // Make follow-up call to get final response
        streamBufRef.current = "";
        response = await callOpenRouterAPI(conversationHistoryRef.current, []);
        result = await processStream(response);
      }

      flushUI();

      /* Add assistant response to history */
      const assistantMessage: OpenRouterMessage = {
        role: "assistant",
        content: result.text,
      };
      conversationHistoryRef.current.push(assistantMessage);

      /* --- NOW CREATE CHAT AND SAVE --- */
      const reply = result.text;
      
      if(!curChatId && shouldCreateChat) {
          // Use a combination of User Input + AI Reply to generate the title
          // This ensures that even if user sent audio (no text), the Title AI can use the AI's reply (which contains the answer)
          // to guess the topic.
          let titleContext = "";
          if (inputMessages2 && inputMessages2.trim().length > 0) {
              titleContext = "Usuário: " + inputMessages2;
          } else {
              // If only file/audio, rely on what the AI answered
              titleContext = "AI (Resumo): " + reply.substring(0, 300);
          }
          
          const newId = await handleCreateChat(titleContext);
          
          if (!newId) {
             console.error("Failed to create chat at the end.");
             // We still displayed the response, but failed to save.
          } else {
             curChatId = newId;
          }
      }

      if (curChatId) {
          // 1. Upload file if needed
          if (fileToSend) {
              await uploadFileBackend(curChatId, fileToSend);
          }
          
          // 2. Save User Message
          if (inputMessages2.trim()) {
            await handlePostMessage(curChatId, {
              text: inputMessages2,
              entity: "user",
              mimeType: "text",
            });
          } else if (fileToSend) {
             // ensure we save at least a marker if text was empty
             await handlePostMessage(curChatId, {
              text: "Arquivo enviado: " + fileToSend.name,
              entity: "user",
              mimeType: "text",
            });
          }

          // 3. Save AI Message
          if (!cancelStreamRef.current) {
            await handlePostMessage(curChatId, {
              text: reply,
              entity: "model",
              mimeType: "text",
            });
          }
      }

    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m, i) =>
          i === placeholderIndexRef.current
            ? {
                ...m,
                content:
                  "Desculpe, ocorreu um erro. " +
                  (err instanceof Error ? err.message : ""),
              }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function handleAbortStream() {
    if (loading) {
      cancelStreamRef.current = true;
      setLoading(false);
    }
  }

  /* ─────────────────────────────── EXPORT ─────────────────────────────── */
  return {
    messages,
    setMessages,
    loading,
    chatId,
    inputMessage,
    setInputMessage,
    file,
    setFile,
    isRecording,
    elapsedTime,
    screenType,
    setScreenType,
    handleFileUpload,
    startRecording,
    stopRecording,
    handleSendMessage,
    handleAbortStream,

    handleCreateChat,
    handlePostMessage,
    handleGetOldChat,
    handleNewChat,
  } as const;
}
