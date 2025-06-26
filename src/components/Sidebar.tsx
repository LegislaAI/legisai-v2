"use client";
import {
  BellDot,
  ChevronRight,
  Home,
  Menu,
  Settings2Icon,
  Sparkle,
  Sparkles,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const router = useRouter();
  return (
    <div className="hidden min-h-screen w-80 min-w-80 flex-col justify-between bg-white p-4 lg:flex">
      <div className="flex flex-col gap-4">
        <div className="flex w-full items-center justify-between">
          <Image
            src="/logos/logo.png"
            alt=""
            width={1000}
            height={350}
            className="h-max w-full object-contain"
          />
          <Menu />
        </div>
        <div className="flex flex-col gap-4">
          <div
            onClick={() => router.push("/")}
            className="group flex w-full cursor-pointer items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Home className="text-light-dark" />
              <span>Home</span>
            </div>
            <ChevronRight className="text-secondary opacity-0 transition duration-200 group-hover:opacity-100" />
          </div>
          <div
            onClick={() => router.push("/plenary")}
            className="group flex w-full cursor-pointer items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Wallet className="text-light-dark" />
              <span>Plenários e Reuniões</span>
            </div>
            <ChevronRight className="text-secondary opacity-0 transition duration-200 group-hover:opacity-100" />
          </div>
          <div
            onClick={() => router.push("/news")}
            className="group flex w-full cursor-pointer items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <BellDot className="text-light-dark" />
              <span>Novidades e Mídias</span>
            </div>
            <ChevronRight className="text-secondary opacity-0 transition duration-200 group-hover:opacity-100" />
          </div>
          <div className="group flex w-full cursor-pointer items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/icons/circle-star.png"
                alt=""
                width={250}
                height={250}
                className="h-max w-5 object-contain"
              />
              <span>Tramitação e Informações</span>
            </div>
            <ChevronRight className="text-secondary opacity-0 transition duration-200 group-hover:opacity-100" />
          </div>
          <div
            onClick={() => router.push("/ai")}
            className="group flex w-full cursor-pointer items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="text-light-dark" />
              <span>Inteligência Artificial - Legis AI</span>
            </div>
            <ChevronRight className="text-secondary opacity-0 transition duration-200 group-hover:opacity-100" />
          </div>
          <div className="group flex w-full cursor-pointer items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkle className="text-light-dark" />
              <span>IA Preditiva - Legis AI</span>
            </div>
            <ChevronRight className="text-secondary opacity-0 transition duration-200 group-hover:opacity-100" />
          </div>

          <div className="group flex w-full cursor-pointer items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2Icon className="text-light-dark" />
              <span>Configurações</span>
            </div>
            <ChevronRight className="text-secondary opacity-0 transition duration-200 group-hover:opacity-100" />
          </div>
        </div>
      </div>
      <div className="bg-surface flex h-72 w-full flex-col overflow-hidden rounded-xl">
        <Image
          src="/static/ad1.png"
          alt=""
          width={500}
          height={500}
          className="h-1/2 w-full object-cover"
        />
        <div className="flex h-1/2 flex-col justify-between p-4">
          <span className="text-lg font-semibold">Propaganda XYZ</span>
          <span>Texto da Propaganda XYZ</span>
          <button className="bg-dark rounded-full p-2 text-white">
            Clique aqui e veja a Propaganda
          </button>
        </div>
      </div>
    </div>
  );
}
