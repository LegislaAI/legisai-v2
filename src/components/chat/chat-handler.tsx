/* --------------------------------------------------------------------
 *  src/hooks/useSectionChat.ts
 *  -------------------------------------------------------------------
 *  Hook de chat Gemini com:
 *    • Flags: shouldCreateChat, shouldSaveMessage, shouldSaveFile,
 *             shouldUseFunctions  (todas false por padrão)
 *    • Integração automática com "@/ai/functions"
 *    • Upload de arquivos, gravação de áudio, histórico, streaming, etc.
 *    • Detecção de “functionCall” em cada chunk → handleFunctionCalls(...)
 * ------------------------------------------------------------------*/

"use client";

import { GoogleGenAI, Part } from "@google/genai";
import {
  ChangeEvent,
  startTransition,
  useEffect,
  useRef,
  useState,
} from "react";
import fixWebmDuration from "webm-duration-fix";
import {
  getFunctionDeclarations,
  handleFunctionCalls,
} from "./functions-handler";
import {
  ChatHistoryItem,
  FunctionCallWithId,
  Message,
  MessagesFromBackend,
  Prompt,
} from "./types";

/*  🔧  hub de function calling */
import { useApiContext } from "@/context/ApiContext";

export interface UseSectionChatParams {
  /* controles de UI/histórico */
  setLoadHistory?: React.Dispatch<React.SetStateAction<boolean>>;
  loadNewChat?: boolean;
  setLoadNewChat?: React.Dispatch<React.SetStateAction<boolean>>;
  loadOldChat?: string | null;
  setLoadOldChat?: React.Dispatch<React.SetStateAction<string | null>>;
  selectedPrompt?: Prompt;

  /* flags backend */
  shouldCreateChat?: boolean;
  shouldSaveMessage?: boolean;
  shouldSaveFile?: boolean;

  /* flag function-calling */
  shouldUseFunctions?: boolean;
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
}: UseSectionChatParams) {
  /* ──────────────────────────────────── STATE/REFS ─────────────────────────────────── */
  const [messages, setMessages] = useState<Message[]>([]);
  const { PostAPI, GetAPI } = useApiContext();
  const [chatId, setChatId] = useState("");
  const [loading, setLoading] = useState(false);
  const [screenType, setScreenType] = useState("ai");
  const [initialHistory, setInitialHistory] = useState<ChatHistoryItem[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  /* gravação */
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const chunksRef = useRef<Blob[]>([]);
  const [recordStartTime, setRecordStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00");

  /* arquivo */
  const [file, setFile] = useState<File | null>(null);

  /* Gemini */
  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "";
  const aiInstanceRef = useRef<GoogleGenAI | null>(null);
  const chatSessionRef = useRef<ReturnType<
    GoogleGenAI["chats"]["create"]
  > | null>(null);

  /* ─────────────────────────────── INIT GEMINI ─────────────────────────────── */
  useEffect(() => {
    if (!aiInstanceRef.current)
      aiInstanceRef.current = new GoogleGenAI({ apiKey: API_KEY });
    console.log("sectedPrompt1232321", selectedPrompt);
    console.log("selectedPromptType", selectedPrompt?.prompt);
    console.log("initialHistory", initialHistory);
    chatSessionRef.current = null;
    if (aiInstanceRef.current) {
      chatSessionRef.current = aiInstanceRef.current.chats.create({
        model: "gemini-2.5-flash",
        history: initialHistory,
        config: {
          systemInstruction: selectedPrompt?.prompt,
          ...(shouldUseFunctions && {
            tools: [{ functionDeclarations: getFunctionDeclarations() }],
          }),
        },
      });
    }
  }, [initialHistory, selectedPrompt, shouldUseFunctions]);

  async function handleCreateChat(first: string): Promise<string | null> {
    console.log("tento");
    console.log("selectedPrompt.ID", selectedPrompt);
    if (!shouldCreateChat || !selectedPrompt) return null;
    try {
      console.log("selectedPromptType", selectedPrompt.type);
      const r = await PostAPI(
        "chat",
        {
          name: first.split(" ").slice(0, 5).join(" ") || "Novo Chat",
          promptId: selectedPrompt.id,
          type: screenType,
          //  selectedPrompt.type,
        },
        true,
      );
      console.log(r.body);
      if (r.status === 200) {
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
    msg: { text: string; entity: string; mimeType: string; fileUrl?: string },
  ) {
    if (!shouldSaveMessage) return;
    try {
      console.log("salvando a mensagem,", msg.text, "da entidade", msg.entity);
      const response = await PostAPI(`/message/${id}`, msg, true);
      console.log("message2323", msg.entity);
      console.log("response2323", response);
    } catch (e) {
      console.error("postMessage:", e);
    }
  }

  async function uploadFileBackend(id: string, f: File) {
    if (!shouldSaveFile) return;
    const form = new FormData();
    form.append("file", f);
    try {
      await PostAPI(`message/${id}/file`, form, true);
    } catch (e) {
      console.error("uploadBackend:", e);
    }
  }

  /* new / old chat helpers … */
  function handleNewChat() {
    chatSessionRef.current = null;
    setMessages([]);
    setInitialHistory([]);
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
    setInitialHistory([]);
    try {
      const r = await GetAPI(`message/${id}`, true);
      console.log("mesangens", r.body);
      if (r.status === 200) {
        const histMsgs = r.body.messages.map((m: MessagesFromBackend) => ({
          content: m.text,
          role: m.entity === "user" ? "user" : "ai",
          type: m.mimeType,
          file: m.fileUrl,
        }));
        const histAI = r.body.messages.map((m: MessagesFromBackend) => ({
          parts: [{ text: m.text }],
          role: m.entity === "user" ? "user" : "model",
        }));
        setMessages(histMsgs);
        setInitialHistory(histAI);
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
  async function uploadToGemini(f: File) {
    if (!aiInstanceRef.current) return null;
    let gfile = await aiInstanceRef.current.files.upload({ file: f });
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    for (let i = 0; i < 30 && gfile.state !== "ACTIVE"; i++) {
      if (gfile.state === "FAILED")
        throw new Error("Gemini upload falhou (FAILED)");
      if (!gfile.name) throw new Error("Gemini sem name");
      await delay(2000);
      gfile = await aiInstanceRef.current.files.get({ name: gfile.name });
    }
    if (gfile.state !== "ACTIVE")
      throw new Error("Timeout: arquivo não ficou ACTIVE");
    return gfile;
  }

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
            .padStart(2, "0")}`,
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
          i === placeholderIndexRef.current ? { ...m, content: txt } : m,
        ),
      );
    });
  function getCallId(fc: FunctionCallWithId): string {
    return fc.toolCallId ?? fc.id ?? crypto.randomUUID();
  }
  async function handleSendMessage(message?: string) {
    const inputMessages2 = message ?? inputMessage;
    console.log(
      "entro",
      "inputMessages",
      inputMessage,
      "file",
      file,
      "carregando",
      loading,
    );

    if (loading || (!inputMessages2.trim() && !file)) return;
    cancelStreamRef.current = false;
    setLoading(true);
    console.log("enviando");
    /* push user message + placeholder */
    const outgoing: Message[] = [];
    if (file)
      outgoing.push({
        role: "user",
        content: "",
        file: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
      });
    if (inputMessages2.trim())
      outgoing.push({ role: "user", content: inputMessages2 });
    const AI_ROLE = "ai";
    setMessages((prev) => {
      const list = [
        ...prev,
        ...outgoing,
        { role: AI_ROLE as "ai", content: "..." },
      ];
      placeholderIndexRef.current = list.length - 1;
      return list;
    });

    /* clean inputs */
    const fileToSend = file;
    setInputMessage("");
    setFile(null);

    let curChatId = chatId;
    const parts: Part[] = [];

    try {
      /* chatId */
      if (!curChatId && shouldCreateChat) {
        const newId = await handleCreateChat(
          inputMessages2 || `Chat com arquivo ${file?.name || ""}`,
        );
        if (!newId) throw new Error("Falha createChat");
        curChatId = newId;
      }

      /* FILE */
      if (fileToSend) {
        if (curChatId) await uploadFileBackend(curChatId, fileToSend);
        const gfile = await uploadToGemini(fileToSend);
        if (gfile)
          parts.push({
            fileData: { mimeType: gfile.mimeType, fileUri: gfile.uri },
          });
      }

      /* TEXT */
      if (inputMessages2.trim()) parts.push({ text: inputMessages2 });
      if (inputMessages2.trim() && curChatId) {
        await handlePostMessage(curChatId, {
          text: inputMessages2,
          entity: "user",
          mimeType: "text",
        });
      }

      if (!chatSessionRef.current)
        throw new Error("Sessão Gemini não iniciada");

      /* STREAM */
      const stream = await chatSessionRef.current.sendMessageStream({
        message: parts,
      });

      streamBufRef.current = "";
      const collectedCalls: {
        name: string;
        args: Record<string, unknown>;
        toolCallId: string;
      }[] = [];

      for await (const chunk of stream) {
        if (cancelStreamRef.current) break;

        /* ── extrai todas as functionCalls deste chunk ─────────────────── */
        const newCalls = (chunk.candidates?.[0]?.content?.parts as Part[])
          .filter(
            (p): p is Part & { functionCall: FunctionCallWithId } =>
              p.functionCall !== undefined,
          )
          .map(({ functionCall }) => ({
            name: functionCall.name ?? "unknown",
            args: functionCall.args ?? {},
            toolCallId: getCallId(functionCall), // ← helper tipado
          }));

        collectedCalls.push(...newCalls);

        /* se não houve functionCall, processa texto incremental */
        if (newCalls.length === 0) {
          const piece =
            (chunk.candidates?.[0]?.content?.parts as Part[])
              .map((p) => p.text ?? "")
              .join("") ?? "";
          if (piece) {
            streamBufRef.current += piece;
            flushUI();
          }
        }
      }

      /* ==== executa TODAS as chamadas, se houver ======================== */
      if (shouldUseFunctions && collectedCalls.length) {
        streamBufRef.current = await handleFunctionCalls(
          collectedCalls,
          chatSessionRef.current!,
          { GetAPI, PostAPI },
        );
        flushUI(); // exibe a resposta final
      }
      flushUI();

      /* salva resposta final */
      const reply = streamBufRef.current;
      streamBufRef.current = "";
      if (!cancelStreamRef.current && curChatId) {
        await handlePostMessage(curChatId, {
          text: reply,
          entity: "model",
          mimeType: "text",
        });
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m, i) =>
          i === placeholderIndexRef.current
            ? { ...m, content: "Desculpe, ocorreu um erro." }
            : m,
        ),
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
/*  Exemplo de uso
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
    } = useSectionChat({
      selectedPrompt,
      shouldUseFunctions: true,
      shouldCreateChat: true,
      shouldSaveMessage: true,
      shouldSaveFile: false,
    });
*/
/* Comentário de uso:
   > Passe shouldCreateChat / shouldSaveMessage / shouldSaveFile conforme
     a necessidade. Por padrão todos são false — ou seja, o hook funciona
     apenas com Gemini, sem tocar no backend. */
/* Uso: shouldUseFunctions habilita o registro e execução de ferramentas
   definidas em ./functions */
