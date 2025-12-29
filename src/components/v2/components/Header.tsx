"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/v2/components/ui/avatar";
import { Button } from "@/components/v2/components/ui/Button";
import { useSidebarContext } from "@/context/SidebarContext2";
import { useUserContext } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const { user } = useUserContext();
  const { isDesktopExpanded, toggleDesktopSidebar, toggleMobileSidebar } =
    useSidebarContext();

  const getTitle = () => {
    if (pathname === "/") return "Home";
    if (pathname === "/procedures") return "Tramitação e Informações";
    if (pathname === "/plenary") return "Plenários / Sessões";
    if (pathname === "/news") return "Novidades e Notícias";
    if (pathname === "/ai") return "Inteligência Artificial";
    if (pathname === "/profile") return "Meu Perfil";
    if (pathname === "/tutorials") return "Tutoriais";
    return "LegisAI";
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white/80 px-4 backdrop-blur-md transition-all duration-300 md:px-8",
        isDesktopExpanded ? "left-64" : "left-0 md:left-20",
      )}
    >
      <div className="flex items-center gap-4">
        {/* Mobile Toggle */}
        <Button
          variant="ghost"
          className="md:hidden"
          onClick={toggleMobileSidebar}
        >
          <Menu size={20} />
        </Button>

        {/* Desktop Toggle */}
        <Button
          variant="ghost"
          className="hidden text-gray-500 md:flex"
          onClick={toggleDesktopSidebar}
        >
          {isDesktopExpanded ? (
            <PanelLeftClose size={20} />
          ) : (
            <PanelLeftOpen size={20} />
          )}
        </Button>

        <h1 className="text-dark text-lg font-semibold">{getTitle()}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Potentially Notification Bell here */}

        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-dark text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-500">Plano Pro</p>
          </div>
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
