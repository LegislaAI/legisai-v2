import { Modal } from "@/components/ui/modal";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface NewsCardProps {
  title: string;
  summary: string;
}

export function NewsCard({ title, summary }: NewsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 border-primary h-max w-max rounded-full border-2 px-3 py-3">
          <Image
            src="./icons/news.svg"
            alt=""
            width={20}
            height={20}
            className="h-5 w-5"
          />
        </div>
        <div>
          <h2 className="text-dark text-lg font-medium">{title}</h2>
          <p className="w-[750px] truncate text-gray-600">{summary}</p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-gray-600">2m atrás</span>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary rounded-xl px-4 py-1 font-bold text-white"
        >
          Resumo
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        close={() => setIsModalOpen(false)}
        className="h-max w-max"
      >
        <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 py-2 pb-8">
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-primary absolute top-2 left-2 flex items-center gap-2 font-bold"
          >
            <div className="bg-primary rounded-full">
              <ArrowLeft className="h-6 w-6 text-white" />
            </div>
            Voltar
          </button>
          <Image
            src="/logos/logo.png"
            alt=""
            width={100}
            height={100}
            className="h-auto w-64"
          />
          <div className="flex flex-col">
            <h1 className="text-dark self-center text-3xl font-bold">
              {title}
            </h1>
            <p className="max-w-[750px] px-4 py-4 text-justify">{summary}</p>
          </div>

          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-primary bottom-4 rounded-xl px-6 py-4 text-xl font-bold text-white"
          >
            Voltar para Legis Dados
          </button>
        </div>
      </Modal>
    </div>
  );
}
