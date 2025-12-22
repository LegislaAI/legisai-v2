import { FunctionCall } from "@google/genai";
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

export type FunctionCallWithId = FunctionCall & {
  id?: string;
  toolCallId?: string;
};
