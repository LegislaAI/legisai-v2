"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/v2/components/ui/tooltip";
import { useApiContext } from "@/context/ApiContext";
import { useLoadingContext } from "@/context/LoadingContext";
import { useSidebarContext } from "@/context/SidebarContext2";
import { cn } from "@/lib/utils";
import {
  BellDot,
  ChevronRight,
  Cog,
  Home,
  LogOut,
  PlayCircle,
  Settings2,
  Sparkles,
  UserCircle,
  UsersRound,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  disabled?: boolean;
}

const menuItems: MenuItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Deputados", href: "/deputados", icon: UserCircle, disabled: false },
  { label: "Plenários / Sessões", href: "/plenary", icon: Wallet },
  { label: "Comissões", href: "/commissions", icon: UsersRound, disabled: false },
  {
    label: "Novidades e Notícias",
    href: "/news",
    icon: BellDot,
    disabled: false,
  },
  { label: "Pesquisa Legislativa", href: "/procedures", icon: Cog },
  {
    label: "Inteligência Artificial",
    href: "/ai",
    icon: Sparkles,
    disabled: false,
  },
  //   { label: "IA Preditiva", href: "/prediction-ai", icon: Sparkles, disabled: true },
  {
    label: "Tutoriais",
    href: "/tutorials",
    icon: PlayCircle,
    disabled: false,
  },
  {
    label: "Configurações",
    href: "/profile",
    icon: Settings2,
    disabled: false,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { clearToken } = useApiContext();
  const { handleNavigation } = useLoadingContext();
  const { isMobileOpen, isDesktopExpanded, closeMobileSidebar } =
    useSidebarContext();

  const handleLogout = () => {
    clearToken();
    handleNavigation("/login");
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-16 items-center px-6",
          isDesktopExpanded ? "justify-between" : "justify-center",
        )}
      >
        <Link
          href="/"
          className="text-secondary flex items-center gap-2 text-xl font-bold"
        >
          {isDesktopExpanded ? (
            <Image
              src="/logos/logo.png"
              alt=""
              width={1000}
              height={250}
              className="h-32 w-max object-contain"
            />
          ) : (
            <Image
              src="/logos/small-logo.png"
              alt=""
              width={1000}
              height={1000}
              className="h-full w-full object-contain"
            />
          )}
        </Link>
      </div>

      <nav className="flex w-full flex-1 flex-col gap-2 overflow-y-auto px-3 py-4">
        <TooltipProvider>
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/deputados" && pathname.startsWith("/deputados/"));
            const Icon = item.icon;

            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  {item.disabled ? (
                    <div
                      className={cn(
                        "group relative flex cursor-not-allowed items-center rounded-xl p-3 opacity-50 transition-colors hover:bg-gray-50",
                        isDesktopExpanded
                          ? "justify-start gap-3"
                          : "justify-center",
                        isActive && "bg-secondary/10 text-secondary",
                      )}
                    >
                      <Icon className="h-6 w-6 min-w-[24px]" />
                      {isDesktopExpanded && (
                        <span className="truncate font-medium">
                          {item.label}
                        </span>
                      )}
                      {/* Badge for disabled */}
                      <div
                        className={cn(
                          "absolute rounded-full bg-gray-300",
                          isDesktopExpanded
                            ? "top-1/2 right-3 h-2 w-2 -translate-y-1/2"
                            : "top-0 right-0 h-2 w-2",
                        )}
                      />
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigation(item.href);
                        closeMobileSidebar(); // Close on mobile navigation
                      }}
                      className={cn(
                        "hover:bg-surface group relative flex items-center rounded-xl p-3 transition-colors",
                        isDesktopExpanded
                          ? "justify-start gap-3"
                          : "justify-center",
                        isActive
                          ? "bg-secondary hover:bg-secondary/90 text-white shadow-md"
                          : "text-gray-500",
                      )}
                    >
                      <Icon className="h-6 w-6 min-w-[24px]" />
                      {isDesktopExpanded && (
                        <span className="truncate font-medium">
                          {item.label}
                        </span>
                      )}

                      {!isDesktopExpanded && isActive && (
                        <div className="absolute top-1/2 right-[-8px] hidden -translate-y-1/2 rounded-full bg-white p-0.5 shadow-sm">
                          <ChevronRight className="text-secondary h-3 w-3" />
                        </div>
                      )}
                    </Link>
                  )}
                </TooltipTrigger>
                {!isDesktopExpanded && (
                  <TooltipContent
                    side="right"
                    className="flex items-center gap-2"
                  >
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      <div className="border-t border-gray-100 p-4">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className={cn(
                  "flex w-full items-center rounded-xl p-3 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500",
                  isDesktopExpanded ? "justify-start gap-3" : "justify-center",
                )}
              >
                <LogOut className="h-6 w-6 min-w-[24px]" />
                {isDesktopExpanded && <span className="font-medium">Sair</span>}
              </button>
            </TooltipTrigger>
            {!isDesktopExpanded && (
              <TooltipContent side="right">Sair</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="animate-in fade-in fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar Element */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full border-r border-gray-100 bg-white transition-all duration-300 ease-in-out",
          // Mobile Open/Close
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          // Desktop Width
          isDesktopExpanded ? "w-64" : "w-20",
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
