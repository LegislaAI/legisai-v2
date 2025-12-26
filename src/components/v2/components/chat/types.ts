import { Dispatch, RefObject, SetStateAction } from "react";

export interface FileData {
  dataUrl: string; // ex: "data:image/png;base64,iVBORw0KG..."
  base64: string; // ex: "iVBORw0KG..."
  mimeType: string; // ex: "image/png" ou "application/pdf"
}

export interface Message {
  id?: string;
  role: "user" | "ai" | "model";
  content: string;
  type?: string;
  file?: File | null | string;
  name?: string;
  createdAt?: string;
}

export interface ChatHistoryItem {
  messages?: Message[];
  role: string;
  parts: { text: string }[];
}

export interface RecordingData {
  dataUrl: string | null;
  base64: string | null;
  mimeType: string | null;
}

/** Estado e referências da gravação */
export interface RecordingControls {
  chunksRef: RefObject<Blob[]>;
  mediaRecorder: MediaRecorder | null;
  recording: boolean;
}

/** Funções que atualizam o estado da gravação */
export interface RecordingSetters {
  setAudioURL: Dispatch<SetStateAction<string | null>>;
  setDataUrl: Dispatch<SetStateAction<string | null>>;
  setBase64: Dispatch<SetStateAction<string | null>>;
  setMimeType: Dispatch<SetStateAction<string | null>>;
  setMediaRecorder: Dispatch<SetStateAction<MediaRecorder | null>>;
  setRecording: Dispatch<SetStateAction<boolean>>;
}

export interface MessagesFromBackend {
  id: string;
  text: string;
  chatId: string;
  messageType: "text" | "file";
  entity: "user" | "ai";
  fileUrl?: string;
  mimeType?: string;
  createdAt: string;
}

export interface Prompt {
  id: string;
  name: string;
  description: string;
  type: string;
  icon?: string;
  prompt?: string;
}

export interface Chat {
    id: string;
    title: string;
    createdAt: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * OpenRouter Types - Compatíveis com a API OpenRouter
 * ───────────────────────────────────────────────────────────────────────────── */

/** Tool/Function definition para enviar ao OpenRouter */
export interface OpenRouterTool {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters: {
      type: "object";
      properties: Record<string, { type: string; description?: string; enum?: string[] }>;
      required?: string[];
    };
  };
}

/** Tool call retornado pelo modelo no stream */
export interface OpenRouterToolCall {
  id: string;
  type: "function";
  index?: number;
  function: {
    name: string;
    arguments: string;
  };
}

/** Mensagem no formato OpenRouter */
export interface OpenRouterMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | OpenRouterContentPart[] | null;
  tool_calls?: OpenRouterToolCall[];
  tool_call_id?: string;
  name?: string;
}

/** Content part para mensagens multimodais */
export interface OpenRouterContentPart {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
    detail?: string;
  };
}

/** Delta recebido durante streaming */
export interface OpenRouterStreamDelta {
  content?: string | null;
  role?: string;
  tool_calls?: OpenRouterToolCall[];
}

/** Chunk do stream SSE */
export interface OpenRouterStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: OpenRouterStreamDelta;
    finish_reason: "stop" | "tool_calls" | "length" | "content_filter" | "error" | null;
  }[];
}

/** File para enviar ao backend */
export interface FileToSend {
  base64: string;
  type: string;
  name: string;
}
