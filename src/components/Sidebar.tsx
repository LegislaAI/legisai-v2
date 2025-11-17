"use client";
import { useLoadingContext } from "@/context/LoadingContext";
import { cn } from "@/lib/utils";
import {
  BellDot,
  ChevronRight,
  Home,
  Settings2Icon,
  Sparkle,
  Sparkles,
  UsersRound,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import CogIcon from "../../public/icons/cog.svg";
import { LoadingOverlay } from "./loading-overlay";

export function Sidebar() {
  const pathname = usePathname();
  const { isNavigating, handleNavigation } = useLoadingContext();

  return (
    <>
      {isNavigating && <LoadingOverlay />}
      <div className="hidden min-h-screen w-80 min-w-80 flex-col justify-between bg-white p-2 lg:flex 2xl:p-4">
        <div className="flex flex-col gap-2 text-xs xl:gap-4 xl:text-sm">
          <div
            onClick={() => handleNavigation("/")}
            className="flex w-full items-center justify-between"
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
              onClick={() => handleNavigation("/")}
              className={cn(
                "group flex w-full items-center justify-between",
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
              onClick={() => handleNavigation("/plenary")}
              className={cn(
                "group relative flex w-full cursor-not-allowed items-center justify-between",
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
              <div className="absolute flex h-full w-full flex-row items-center justify-end gap-2 rounded-md bg-white/60 text-white">
                <div className="bg-secondary rounded-lg p-1">Em Breve</div>
                {/* <Image
                  src={"/static/lock-and-chain.svg"}
                  alt=""
                  width={400}
                  height={400}
                  className="h-full w-max object-contain"
                /> */}
              </div>
            </div>
            <div
              onClick={() => handleNavigation("/commissions")}
              className={cn(
                "group relative flex w-full cursor-not-allowed items-center justify-between",
                (pathname === "/commissions" ||
                  pathname.includes("commissions")) &&
                  "text-secondary font-semibold",
              )}
            >
              <div className="flex items-center gap-2">
                <UsersRound
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
              <div className="absolute flex h-full w-full flex-row items-center justify-end gap-2 rounded-md bg-white/60 text-white">
                <div className="bg-secondary rounded-lg p-1">Em Breve</div>
                {/* <Image
                  src={"/static/lock-and-chain.svg"}
                  alt=""
                  width={400}
                  height={400}
                  className="h-full w-max object-contain"
                /> */}
              </div>
            </div>
            <div
              onClick={() => handleNavigation("/news")}
              className={cn(
                "group relative flex w-full cursor-not-allowed items-center justify-between",
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
              <div className="absolute flex h-full w-full flex-row items-center justify-end gap-2 rounded-md bg-white/60 text-white">
                <div className="bg-secondary rounded-lg p-1">Em Breve</div>
                {/* <Image
                  src={"/static/lock-and-chain.svg"}
                  alt=""
                  width={400}
                  height={400}
                  className="h-full w-max object-contain"
                /> */}
              </div>
            </div>
            <div
              onClick={() => handleNavigation("/procedures")}
              className={cn(
                "group relative flex w-full cursor-pointer items-center justify-between",
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
                  "text-secondary transition duration-200 group-hover:opacity-100",
                  pathname === "/procedures" && "opacity-100",
                )}
              />
            </div>
            <div
              onClick={() => handleNavigation("/ai")}
              className={cn(
                "group relative flex w-full cursor-not-allowed items-center justify-between",
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
              <div className="absolute flex h-full w-full flex-row items-center justify-end gap-2 rounded-md bg-white/60 text-white">
                <div className="bg-secondary rounded-lg p-1">Em Breve</div>
              </div>
            </div>
            <div
              onClick={() => handleNavigation("/prediction-ai")}
              className={cn(
                "group relative flex w-full cursor-not-allowed items-center justify-between",
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
              <div className="absolute flex h-full w-full flex-row items-center justify-end gap-2 rounded-md bg-white/60 text-white">
                <div className="bg-secondary rounded-lg p-1">Em Breve</div>
                {/* <Image
                  src={"/static/lock-and-chain.svg"}
                  alt=""
                  width={400}
                  height={400}
                  className="h-full w-max object-contain"
                /> */}
              </div>
            </div>
            <div
              onClick={() => handleNavigation("/tutorials")}
              className={cn(
                "group relative flex w-full cursor-not-allowed items-center justify-between",
                pathname === "/tutorials" && "text-secondary font-semibold",
              )}
            >
              <div className="flex items-center gap-2">
                <svg
                  className={cn(
                    "h-5 object-contain text-[20px] text-current xl:h-7",
                  )}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      d="M4 8C4 5.17157 4 3.75736 4.87868 2.87868C5.75736 2 7.17157 2 10 2H14C16.8284 2 18.2426 2 19.1213 2.87868C20 3.75736 20 5.17157 20 8V16C20 18.8284 20 20.2426 19.1213 21.1213C18.2426 22 16.8284 22 14 22H10C7.17157 22 5.75736 22 4.87868 21.1213C4 20.2426 4 18.8284 4 16V8Z"
                      stroke={cn(
                        pathname === "/tutorials" ? "#749c5b" : "#000",
                      )}
                      strokeWidth="1.5"
                    ></path>{" "}
                    <path
                      d="M19.8978 16H7.89778C6.96781 16 6.50282 16 6.12132 16.1022C5.08604 16.3796 4.2774 17.1883 4 18.2235"
                      stroke={cn(
                        pathname === "/tutorials" ? "#749c5b" : "#000",
                      )}
                      strokeWidth="1.5"
                    ></path>{" "}
                    <path
                      d="M8 7H16"
                      stroke={cn(
                        pathname === "/tutorials" ? "#749c5b" : "#000",
                      )}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    ></path>{" "}
                    <path
                      d="M8 10.5H13"
                      stroke={cn(
                        pathname === "/tutorials" ? "#749c5b" : "#000",
                      )}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    ></path>{" "}
                    <path
                      d="M13 16V19.5309C13 19.8065 13 19.9443 12.9051 20C12.8103 20.0557 12.6806 19.9941 12.4211 19.8708L11.1789 19.2808C11.0911 19.2391 11.0472 19.2182 11 19.2182C10.9528 19.2182 10.9089 19.2391 10.8211 19.2808L9.57889 19.8708C9.31943 19.9941 9.18971 20.0557 9.09485 20C9 19.9443 9 19.8065 9 19.5309V16.45"
                      stroke={cn(
                        pathname === "/tutorials" ? "#749c5b" : "#000",
                      )}
                      strokeWidth="1.5"
                      strokeLinecap="round"
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
              <div className="absolute flex h-full w-full flex-row items-center justify-end gap-2 rounded-md bg-white/60 text-white">
                <div className="bg-secondary rounded-lg p-1">Em Breve</div>
                {/* <Image
                  src={"/static/lock-and-chain.svg"}
                  alt=""
                  width={400}
                  height={400}
                  className="h-full w-max object-contain"
                /> */}
              </div>
            </div>
            <div
              onClick={() => handleNavigation("/profile")}
              className={cn(
                "group relative flex w-full cursor-not-allowed items-center justify-between",
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
              <div className="absolute flex h-full w-full flex-row items-center justify-end gap-2 rounded-md bg-white/60 text-white">
                <div className="bg-secondary rounded-lg p-1">Em Breve</div>
                {/* <Image
                  src={"/static/lock-and-chain.svg"}
                  alt=""
                  width={400}
                  height={400}
                  className="h-full w-max object-contain"
                /> */}
              </div>
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
    </>
  );
}
