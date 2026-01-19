import * as Dialog from "@radix-ui/react-dialog";
import { Clock, User, X } from "lucide-react";

interface SpeechModalProps {
  isOpen: boolean;
  onClose: () => void;
  speakerName: string;
  party?: string;
  time: string;
  duration?: string;
  transcription: string;
}

export function SpeechModal({
  isOpen,
  onClose,
  speakerName,
  party,
  time,
  duration,
  transcription,
}: SpeechModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-100 bg-white p-6 shadow-lg duration-200 sm:rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-[#749c5b]">
                <User size={20} />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold text-[#1a1d1f]">
                  {speakerName}
                </Dialog.Title>
                {party && (
                  <p className="text-sm font-medium text-[#749c5b]">{party}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-2 flex items-center gap-4 text-xs font-medium tracking-wide text-gray-500 uppercase">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              Início: {time}
            </div>
            {duration && (
              <div className="flex items-center gap-1">
                <Clock size={14} />
                Duração: {duration}
              </div>
            )}
          </div>

          <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-lg bg-[#f4f4f4] p-4 text-sm leading-relaxed text-[#1a1d1f]">
            {transcription || "Transcrição não disponível."}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
