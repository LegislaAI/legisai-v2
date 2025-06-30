"use client";
import { useSidebarContext } from "@/context/SidebarContext";
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
import { useEffect } from "react";
import { Sheet, SheetContent, SheetTitle } from "./ui/sheet";

export function MobileSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isSidebarOpen, setIsSidebarOpen } = useSidebarContext();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <>
      {isSidebarOpen && (
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent
            side="left"
            className="flex h-full flex-col justify-between gap-4"
          >
            <SheetTitle>
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
            </SheetTitle>

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
                  pathname === "/plenary" && "text-secondary font-semibold",
                )}
              >
                <div className="flex items-center gap-2">
                  <Wallet />
                  <span>Plenários e Reuniões</span>
                </div>
                <ChevronRight
                  className={cn(
                    "text-secondary opacity-0 transition duration-200 group-hover:opacity-100",
                    pathname === "/plenary" && "opacity-100",
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
                  <span>Novidades e Mídias</span>
                </div>
                <ChevronRight
                  className={cn(
                    "text-secondary opacity-0 transition duration-200 group-hover:opacity-100",
                    pathname === "/news" && "opacity-100",
                  )}
                />
              </div>
              <div
                className={cn(
                  "group flex w-full cursor-pointer items-center justify-between",
                  // pathname === "/" && "text-secondary font-semibold",
                )}
              >
                <div className="flex items-center gap-2">
                  <Image
                    // ${pathname === "/" ? "secondary" : ""}
                    src={`/icons/circle-star.png`}
                    alt=""
                    width={250}
                    height={250}
                    className="h-max w-5 object-contain"
                  />
                  <span>Tramitação e Informações</span>
                </div>
                <ChevronRight
                  className={cn(
                    "text-secondary opacity-0 transition duration-200 group-hover:opacity-100",
                    // pathname === "/" && "opacity-100",
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
                className={cn(
                  "group flex w-full cursor-pointer items-center justify-between",
                  pathname === "/prediction-ai" &&
                    "text-secondary font-semibold",
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
                className={cn(
                  "group flex w-full cursor-pointer items-center justify-between",
                  // pathname === "/" && "text-secondary font-semibold",
                )}
              >
                <div className="flex items-center gap-2">
                  <Settings2Icon />
                  <span>Configurações</span>
                </div>
                <ChevronRight
                  className={cn(
                    "text-secondary opacity-0 transition duration-200 group-hover:opacity-100",
                    // pathname === "/" && "opacity-100",
                  )}
                />
              </div>
            </div>
            <div className="bg-surface flex h-60 w-60 flex-col overflow-hidden rounded-xl">
              <Image
                src="/static/ad1.png"
                alt=""
                width={500}
                height={500}
                className="h-1/2 w-full object-cover"
              />
              <div className="flex h-1/2 flex-col justify-evenly p-1">
                <span className="text-sm font-semibold">Propaganda XYZ</span>
                <span>Texto da Propaganda XYZ</span>
                <button className="bg-dark cursor-pointer rounded-full p-1 text-xs text-white">
                  Clique aqui e veja a Propaganda
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
