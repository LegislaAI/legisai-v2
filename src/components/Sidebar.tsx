"use client";
import { cn } from "@/lib/utils";
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
import { usePathname, useRouter } from "next/navigation";

import CogIcon from "../../public/icons/cog.svg";
export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="hidden min-h-screen w-80 min-w-80 flex-col justify-between bg-white p-4 lg:flex">
      <div className="flex flex-col gap-4">
        <div
          onClick={() => router.push("/")}
          className="flex w-full cursor-pointer items-center justify-between"
        >
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
            className={cn(
              "group flex w-full cursor-pointer items-center justify-between",
              pathname === "/" && "text-secondary font-semibold",
            )}
          >
            <div className="flex items-center gap-2">
              <Home />
              <span>Home</span>
            </div>
            <ChevronRight
              className={cn(
                "text-secondary opacity-0 transition duration-200 group-hover:opacity-100",
                pathname === "/" && "opacity-100",
              )}
            />
          </div>
          <div
            onClick={() => router.push("/plenary")}
            className={cn(
              "group flex w-full cursor-pointer items-center justify-between",
              (pathname === "/plenary" || pathname.includes("plenary")) &&
                "text-secondary font-semibold",
            )}
          >
            <div className="flex items-center gap-2">
              <Wallet />
              <span>Plenários e Reuniões</span>
            </div>
            <ChevronRight
              className={cn(
                "text-secondary opacity-0 transition duration-200 group-hover:opacity-100",
                (pathname === "/plenary" || pathname.includes("plenary")) &&
                  "opacity-100",
              )}
            />
          </div>
          <div
            onClick={() => router.push("/news")}
            className={cn(
              "group flex w-full cursor-pointer items-center justify-between",
              pathname === "/news" && "text-secondary font-semibold",
            )}
          >
            <div className="flex items-center gap-2">
              <BellDot />
              <span>Novidades e Notícias</span>
            </div>
            <ChevronRight
              className={cn(
                "text-secondary opacity-0 transition duration-200 group-hover:opacity-100",
                pathname === "/news" && "opacity-100",
              )}
            />
          </div>
          <div
            onClick={() => router.push("/procedures")}
            className={cn(
              "group flex w-full cursor-pointer items-center justify-between text-black",
              pathname === "/procedures" && "text-secondary font-semibold",
            )}
          >
            <div className="flex items-center gap-2">
              <CogIcon
                className={cn(
                  "h-max w-5 object-contain text-[20px] text-current",
                  pathname === "/procedures" && "text-secondary",
                )}
              />
              <span>Tramitação e Informações</span>
            </div>
            <ChevronRight
              className={cn(
                "text-secondary opacity-0 transition duration-200 group-hover:opacity-100",
                pathname === "/procedures" && "opacity-100",
              )}
            />
          </div>
          <div
            onClick={() => router.push("/ai")}
            className={cn(
              "group flex w-full cursor-pointer items-center justify-between",
              pathname === "/ai" && "text-secondary font-semibold",
            )}
          >
            <div className="flex items-center gap-2">
              <Sparkles />
              <span>Inteligência Artificial - Legis AI</span>
            </div>
            <ChevronRight
              className={cn(
                "text-secondary opacity-0 transition duration-200 group-hover:opacity-100",
                pathname === "/ai" && "opacity-100",
              )}
            />
          </div>
          <div
            onClick={() => router.push("/prediction-ai")}
            className={cn(
              "group flex w-full cursor-pointer items-center justify-between",
              pathname === "/prediction-ai" && "text-secondary font-semibold",
            )}
          >
            <div className="flex items-center gap-2">
              <Sparkle />
              <span>IA Preditiva - Legis AI</span>
            </div>
            <ChevronRight
              className={cn(
                "text-secondary opacity-0 transition duration-200 group-hover:opacity-100",
                pathname === "/prediction-ai" && "opacity-100",
              )}
            />
          </div>
          <div
            onClick={() => router.push("/tutorials")}
            className={cn(
              "group flex w-full cursor-pointer items-center justify-between",
              pathname === "/tutorials" && "text-secondary font-semibold",
            )}
          >
            <div className="flex items-center gap-2">
              <Settings2Icon />
              <span>Tutoriais</span>
            </div>
            <ChevronRight
              className={cn(
                "text-secondary opacity-0 transition duration-200 group-hover:opacity-100",
                pathname === "/tutorials" && "opacity-100",
              )}
            />
          </div>
          <div
            onClick={() => router.push("/profile")}
            className={cn(
              "group flex w-full cursor-pointer items-center justify-between",
              pathname === "/profile" && "text-secondary font-semibold",
            )}
          >
            <div className="flex items-center gap-2">
              <Settings2Icon />
              <span>Configurações</span>
            </div>
            <ChevronRight
              className={cn(
                "text-secondary opacity-0 transition duration-200 group-hover:opacity-100",
                pathname === "/" && "opacity-100",
              )}
            />
          </div>
        </div>
      </div>
      <div className="bg-surface fixed bottom-4 left-4 flex h-80 w-72 flex-col overflow-hidden rounded-xl">
        <Image
          src="/static/ad1.png"
          alt=""
          width={500}
          height={500}
          className="h-1/2 w-full object-cover"
        />
        <div className="flex h-1/2 flex-col justify-between p-4">
          <span className="text-lg font-semibold">
            Comissão debate crise no financiamento estudantil
          </span>

          <span className="relative">Nesta quinta-feira (3/7) ...</span>

          <button className="bg-dark cursor-pointer rounded-full p-2 text-white">
            Clique aqui e veja a Propaganda
          </button>
        </div>
      </div>
    </div>
  );
}
