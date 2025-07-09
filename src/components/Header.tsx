"use client";
import { useApiContext } from "@/context/ApiContext";
import { useSidebarContext } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import { ArrowLeft, CogIcon, LogOut, Menu, User2 } from "lucide-react";
import { useCookies } from "next-client-cookies";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const cookies = useCookies();
  const { setIsSidebarOpen } = useSidebarContext();
  const { clearToken } = useApiContext();

  return (
    <div className="flex h-14 w-full items-center justify-between xl:h-20">
      <div
        onClick={() => {
          if (pathname === "/") {
            return;
          }
          router.push("/");
        }}
        className={cn("flex items-center gap-2", pathname === "/" && "hidden")}
      >
        <ArrowLeft />
        <span className="font-semibold">Home</span>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <button
          onClick={() => router.push("/prediction-ai")}
          className="bg-secondary h-8 rounded-full px-4 text-white"
        >
          Upgrade
        </button>
        {/* <Search />
        <BellDot /> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="bg-secondary flex h-8 w-8 items-center justify-center rounded-full text-white">
              <User2 />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="max-h-[20vh] w-full gap-2 overflow-hidden p-0"
          >
            <DropdownMenuArrow className="fill-zinc-400" />
            <DropdownMenuItem className="group rounded-none border-b border-b-zinc-400 p-0 hover:bg-transparent">
              <button
                onClick={() => router.push("/profile")}
                className="group-hover:bg-secondary text-secondary flex w-full cursor-pointer flex-row items-center gap-2 p-2 text-lg transition-all duration-300 group-hover:text-white"
              >
                <CogIcon
                  className={cn(
                    "h-max w-5 object-contain text-[20px] text-current",
                  )}
                />
                Meus dados
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem className="group rounded-none border-b border-b-zinc-400 p-0 hover:bg-transparent">
              <button
                onClick={() => {
                  if (window.confirm("Tem certeza que deseja sair?")) {
                    clearToken();
                    cookies.remove(
                      process.env.NEXT_PUBLIC_USER_TOKEN as string,
                    );
                  }
                }}
                className="group-hover:bg-secondary text-secondary flex w-full cursor-pointer flex-row items-center gap-2 p-2 text-lg transition-all duration-300 group-hover:text-white"
              >
                <LogOut
                  className={cn(
                    "h-max w-5 object-contain text-[20px] text-current",
                  )}
                />
                Sair
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Menu className="lg:hidden" onClick={() => setIsSidebarOpen(true)} />
      </div>
    </div>
  );
}
