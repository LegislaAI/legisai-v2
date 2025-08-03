"use client";
import { cn } from "@/lib/utils";
import {
  BellDot,
  ChevronRight,
  Home,
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
    <div className="hidden min-h-screen w-80 min-w-80 flex-col justify-between bg-white p-2 lg:flex 2xl:p-4">
      <div className="flex flex-col gap-2 text-xs xl:gap-4 xl:text-sm">
        <div
          onClick={() => router.push("/")}
          className="flex w-full cursor-pointer items-center justify-between"
        >
          <Image
            src="/logos/logo.png"
            alt=""
            width={1000}
            height={350}
            className="mx-auto h-max w-2/3 object-contain 2xl:w-full"
          />
        </div>
        <div className="flex flex-col 2xl:gap-4">
          <div
            onClick={() => router.push("/")}
            className={cn(
              "group flex w-full cursor-pointer items-center justify-between",
              pathname === "/" && "text-secondary font-semibold",
            )}
          >
            <div className="flex items-center gap-2">
              <Home
                className={cn(
                  "h-5 object-contain text-[20px] text-current xl:h-8",
                  pathname === "/" && "text-secondary",
                )}
              />
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
              <Wallet
                className={cn(
                  "h-5 object-contain text-[20px] text-current xl:h-8",
                  pathname === "/plenary" && "text-secondary",
                )}
              />
              <span>Plenários / Sessões</span>
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
            onClick={() => router.push("/commissions")}
            className={cn(
              "group flex w-full cursor-pointer items-center justify-between",
              (pathname === "/commissions" ||
                pathname.includes("commissions")) &&
                "text-secondary font-semibold",
            )}
          >
            <div className="flex items-center gap-2">
              <Wallet
                className={cn(
                  "h-5 object-contain text-[20px] text-current xl:h-8",
                  pathname === "/commissions" && "text-secondary",
                )}
              />
              <span>Comissões / Reuniões</span>
            </div>
            <ChevronRight
              className={cn(
                "text-secondary opacity-0 transition duration-200 group-hover:opacity-100",
                (pathname === "/commissions" ||
                  pathname.includes("commissions")) &&
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
              <BellDot
                className={cn(
                  "h-5 object-contain text-[20px] text-current xl:h-8",
                  pathname === "/news" && "text-secondary",
                )}
              />

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
                  "h-5 object-contain text-[20px] text-current xl:h-8",
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
              <Sparkles
                className={cn(
                  "h-5 object-contain text-[20px] text-current xl:h-8",
                  pathname === "/ai" && "text-secondary",
                )}
              />
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
              <Sparkle
                className={cn(
                  "h-5 object-contain text-[20px] text-current xl:h-8",
                  pathname === "/prediction-ai" && "text-secondary",
                )}
              />
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
              <Settings2Icon
                className={cn(
                  "h-5 object-contain text-[20px] text-current xl:h-8",
                  pathname === "/tutorials" && "text-secondary",
                )}
              />
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
              <Settings2Icon
                className={cn(
                  "h-5 object-contain text-[20px] text-current xl:h-8",
                  pathname === "/profile" && "text-secondary",
                )}
              />
              <span>Configurações</span>
            </div>
            <ChevronRight
              className={cn(
                "text-secondary opacity-0 transition duration-200 group-hover:opacity-100",
                pathname === "/profile" && "opacity-100",
              )}
            />
          </div>
        </div>
      </div>
      <div className="bg-surface fixed bottom-4 left-4 flex h-40 w-72 flex-col items-center justify-between overflow-hidden rounded-xl 2xl:h-80">
        <Image
          src="/static/ad1.png"
          alt=""
          width={500}
          height={500}
          className="h-2/5 w-full object-cover 2xl:h-1/2"
        />
        <div className="flex h-3/5 flex-col justify-between p-1 2xl:h-1/2 2xl:p-2">
          <div className="flex flex-col">
            <span className="text-xs font-semibold 2xl:text-lg">
              Comissão debate crise no financiamento estudantil
            </span>
            <span className="relative text-[10px] 2xl:text-sm">
              Nesta quinta-feira (3/7) ...
            </span>
          </div>
          <button className="bg-dark cursor-pointer rounded-full p-1 text-xs text-white 2xl:p-2 2xl:text-sm">
            Clique aqui e veja a Propaganda
          </button>
        </div>
      </div>
    </div>
  );
}
