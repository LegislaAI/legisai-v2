import { ChangeEvent, useEffect, useRef, useState } from "react";

type FileData = {
  dataUrl: string;
  base64: string;
  mimeType: string;
  name?: string;
};

export function useFileHandler() {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [isRecording, setIsRecording] = useState(false);
  const clearFileData = () => setFileData(null);

  const fileToBase64 = (file: File): Promise<FileData> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const [, base64] = reader.result.split(",");
          resolve({ dataUrl: reader.result, base64, mimeType: file.type });
        } else reject(new Error("Unexpected format"));
      };
      reader.onerror = reject;
    });

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size >= 20_000_000) return;
    const fd = await fileToBase64(file);
    setFileData({ ...fd, name: file.name });
    e.target.value = "";
  };
  const [recordStartTime, setRecordStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (recordStartTime && isRecording) {
      intervalId = setInterval(() => {
        const elapsedTime = (Date.now() - recordStartTime) / 1000;
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = Math.floor(elapsedTime % 60);
        setElapsedTime(
          `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        );
      }, 100);
    }
    return () => clearInterval(intervalId);
  }, [recordStartTime, isRecording]);
  const startRecording = async () => {
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (e) =>
      e.data.size && chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const result = reader.result as string;
        const b64 = result.split(",")[1];
        setFileData({ dataUrl: result, base64: b64, mimeType: blob.type });
      };
    };
    recorder.start();
    setMediaRecorder(recorder);
    setRecordStartTime(Date.now());
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
    setRecordStartTime(null);
    setElapsedTime("00:00");
  };
  const cancelRecording = () => {
    if (mediaRecorder?.state === "recording") mediaRecorder.stop();
    chunksRef.current = [];
    clearFileData();
  };

  return {
    fileData,
    elapsedTime,
    handleFileUpload,
    startRecording,
    stopRecording,
    cancelRecording,
    clearFileData,
    isRecording,
  };
}
