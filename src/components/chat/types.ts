import { FunctionCall } from "@google/genai";
import { Dispatch, RefObject, SetStateAction } from "react";

export interface FileData {
  dataUrl: string; // ex: "data:image/png;base64,iVBORw0KG..."
  base64: string; // ex: "iVBORw0KG..."
  mimeType: string; // ex: "image/png" ou "application/pdf"
}

export interface Message {
  role: "user" | "ai";
  content: string;
  type?: string;
  file?: File | null | string;
  name?: string;
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

/** Callback genérico para quando a gravação estiver pronta */
export type OnRecordedCallback = (data: RecordingData) => void;
export interface StartRecordingOptions
  extends Pick<RecordingControls, "chunksRef">,
    Pick<
      RecordingSetters,
      | "setAudioURL"
      | "setDataUrl"
      | "setBase64"
      | "setMimeType"
      | "setMediaRecorder"
      | "setRecording"
    > {}

/** Props para parar a gravação */
export interface StopRecordingOptions {
  mediaRecorder: MediaRecorder;
  setRecording: (recording: boolean) => void;
}

/** Props para cancelar/resetar a gravação */
export interface CancelRecordingOptions
  extends Pick<RecordingControls, "chunksRef" | "recording">,
    Pick<RecordingSetters, "setAudioURL" | "setRecording"> {
  mediaRecorder: MediaRecorder | null;
}

/** Props para enviar/consumir a gravação final */
export interface HandleSendOptions {
  dataUrl: string | null;
  base64: string | null;
  mimeType: string | null;
  audioURL: string | null;
  message: string | null;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setFileData: (fd: FileData) => void;
  addMessage: (msg: {
    role: string;
    content: string;
    file: string | null;
    type: string;
  }) => void;
  handleRun: () => void;
  setAudioURL: (url: string | null) => void;
  setRecording: (rec: boolean) => void;
}

export interface ImagePart {
  inlineData: {
    mimeType: string;
    data: string;
  };
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

export type Prompt = {
  id: string;
  name: string;
  prompt: string;
  description: string;
  type?: string;
};

export type ChatItem = {
  id: string;
  name: string;
  promptId: string;
  createdAt?: string;
  type?: string;
};
export type FunctionCallWithId = FunctionCall & {
  id?: string; // versões mais novas do SDK
  toolCallId?: string; // versões mais antigas
};
