"use client";
import { useSidebarContext } from "@/context/SidebarContext";
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
            className="flex h-full flex-col gap-4 bg-white p-2"
          >
            <SheetTitle>
              <div className="flex w-full items-center justify-between">
                <Image
                  src="/logos/logo.png"
                  alt=""
                  width={1000}
                  height={350}
                  className="mx-auto h-40 w-max object-contain"
                />
              </div>
            </SheetTitle>

            <div className="flex h-[calc(100%-432px)] flex-col gap-8 overflow-y-scroll">
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
                  <Wallet />
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
                  "group flex w-full cursor-pointer items-center justify-between",
                  pathname === "/procedures" && "text-secondary font-semibold",
                )}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={
                      pathname === "/procedures"
                        ? "/icons/circle-start-secondary.png"
                        : `/icons/circle-star.png`
                    }
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
                onClick={() => router.push("/tutorials")}
                className={cn(
                  "group flex w-full cursor-pointer items-center justify-between",
                  pathname === "/tutorials" && "text-secondary font-semibold",
                )}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className={cn(
                      "h-7 object-contain text-[20px] text-current",
                    )}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        d="M4 8C4 5.17157 4 3.75736 4.87868 2.87868C5.75736 2 7.17157 2 10 2H14C16.8284 2 18.2426 2 19.1213 2.87868C20 3.75736 20 5.17157 20 8V16C20 18.8284 20 20.2426 19.1213 21.1213C18.2426 22 16.8284 22 14 22H10C7.17157 22 5.75736 22 4.87868 21.1213C4 20.2426 4 18.8284 4 16V8Z"
                        stroke={cn(
                          pathname === "/tutorials" ? "#749c5b" : "#000",
                        )}
                        stroke-width="1.5"
                      ></path>{" "}
                      <path
                        d="M19.8978 16H7.89778C6.96781 16 6.50282 16 6.12132 16.1022C5.08604 16.3796 4.2774 17.1883 4 18.2235"
                        stroke={cn(
                          pathname === "/tutorials" ? "#749c5b" : "#000",
                        )}
                        stroke-width="1.5"
                      ></path>{" "}
                      <path
                        d="M8 7H16"
                        stroke={cn(
                          pathname === "/tutorials" ? "#749c5b" : "#000",
                        )}
                        stroke-width="1.5"
                        stroke-linecap="round"
                      ></path>{" "}
                      <path
                        d="M8 10.5H13"
                        stroke={cn(
                          pathname === "/tutorials" ? "#749c5b" : "#000",
                        )}
                        stroke-width="1.5"
                        stroke-linecap="round"
                      ></path>{" "}
                      <path
                        d="M13 16V19.5309C13 19.8065 13 19.9443 12.9051 20C12.8103 20.0557 12.6806 19.9941 12.4211 19.8708L11.1789 19.2808C11.0911 19.2391 11.0472 19.2182 11 19.2182C10.9528 19.2182 10.9089 19.2391 10.8211 19.2808L9.57889 19.8708C9.31943 19.9941 9.18971 20.0557 9.09485 20C9 19.9443 9 19.8065 9 19.5309V16.45"
                        stroke={cn(
                          pathname === "/tutorials" ? "#749c5b" : "#000",
                        )}
                        stroke-width="1.5"
                        stroke-linecap="round"
                      ></path>{" "}
                    </g>
                  </svg>
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
                    pathname === "/profile" && "opacity-100",
                  )}
                />
              </div>
            </div>
            <div className="bg-surface absolute bottom-4 left-1/2 flex h-60 w-11/12 -translate-x-1/2 flex-col overflow-hidden rounded-xl">
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
