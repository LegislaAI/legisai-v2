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
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="relative flex w-full cursor-pointer flex-col items-center justify-between rounded-lg border border-transparent p-1 pb-2 transition-all duration-300 hover:border-zinc-200 hover:shadow-sm lg:flex-row"
      >
        <div className="flex items-center gap-2">
          <div className="bg-secondary/10 border-secondary h-max w-max rounded-full border-2 p-2">
            <Image
              src="./icons/news.svg"
              alt=""
              width={20}
              height={20}
              className="h-5 max-h-5 min-h-5 w-5 max-w-5 min-w-5"
            />
          </div>
          <div>
            <h2 className="text-dark text-lg font-medium lg:w-full">{title}</h2>
            <p className="w-full text-gray-600 lg:hidden">
              {summary.length > 100 ? summary.slice(0, 100) + "..." : summary}
            </p>
            <p className="hidden w-full text-gray-600 lg:block lg:w-full">
              {summary.length > 100 ? summary.slice(0, 100) + "..." : summary}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-gray-600">2m atrás</span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-secondary rounded-xl px-4 py-1 font-bold text-white duration-700 hover:scale-[1.005]"
          >
            Resumo
          </button>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        close={() => setIsModalOpen(false)}
        className="h-max lg:h-max lg:w-[700px]"
      >
        <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 py-2 pb-8">
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-secondary absolute top-2 left-2 flex items-center gap-2 font-bold"
          >
            <div className="rounded-full">
              <ArrowLeft className="text-secondary h-6 w-6" />
            </div>
            Voltar
          </button>
          <Image
            src="/logos/logo.png"
            alt=""
            width={2000}
            height={2000}
            className="h-auto w-40"
          />
          <div className="flex flex-col p-2 text-center">
            <h1 className="text-dark self-center text-3xl font-bold">
              {title}
            </h1>
            <p className="max-w-[750px] px-4 py-4 text-justify">{summary}</p>
          </div>

          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-secondary bottom-4 rounded-xl px-6 py-4 text-xl text-white"
          >
            Voltar para Legis Dados
          </button>
        </div>
      </Modal>
    </>
  );
}
