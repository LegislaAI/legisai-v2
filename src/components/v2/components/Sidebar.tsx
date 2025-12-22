"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/v2/components/ui/tooltip";
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
    UsersRound,
    Wallet
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  disabled?: boolean;
}

const menuItems: MenuItem[] = [
  { label: "Home", href: "/v2/", icon: Home },
  { label: "Plenários / Sessões", href: "/v2/plenary", icon: Wallet },
  { label: "Comissões / Reuniões", href: "/v2/commissions", icon: UsersRound, disabled: false },
  { label: "Novidades e Notícias", href: "/v2/news", icon: BellDot, disabled: false },
  { label: "Tramitação e Informações", href: "/v2/procedures", icon: Cog },
  { label: "Inteligência Artificial", href: "/v2/ai", icon: Sparkles, disabled: false },
  { label: "IA Preditiva", href: "/v2/prediction-ai", icon: Sparkles, disabled: true },
  { label: "Tutoriais", href: "/v2/tutorials", icon: PlayCircle, disabled: false },
  { label: "Configurações", href: "/v2/profile", icon: Settings2, disabled: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const { clearToken } = useApiContext();
  const { handleNavigation } = useLoadingContext();
  const { isMobileOpen, isDesktopExpanded, closeMobileSidebar } = useSidebarContext();

  const handleLogout = () => {
    clearToken();
    handleNavigation("/v2/login");
  };

  const SidebarContent = () => (
      <div className="flex flex-col h-full">
        <div className={cn("flex items-center h-16 px-6", isDesktopExpanded ? "justify-between" : "justify-center")}>
            <Link href="/v2/" className="font-bold text-xl text-secondary flex items-center gap-2">
            {isDesktopExpanded ? (
                <>
                    <span className="bg-secondary text-white w-8 h-8 flex items-center justify-center rounded-lg">LA</span>
                    <span className="text-dark">LegisAi</span>
                </>
            ) : (
                <span className="bg-secondary text-white w-8 h-8 flex items-center justify-center rounded-lg">LA</span>
            )}
            </Link>
            
        </div>

        <nav className="flex-1 flex flex-col w-full gap-2 px-3 py-4 overflow-y-auto">
            <TooltipProvider>
            {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>
                    {item.disabled ? (
                        <div
                        className={cn(
                            "relative flex items-center p-3 rounded-xl transition-colors cursor-not-allowed group opacity-50 hover:bg-gray-50",
                            isDesktopExpanded ? "justify-start gap-3" : "justify-center",
                            isActive && "bg-secondary/10 text-secondary"
                        )}
                        >
                        <Icon className="h-6 w-6 min-w-[24px]" />
                        {isDesktopExpanded && <span className="font-medium truncate">{item.label}</span>}
                        {/* Badge for disabled */}
                        <div className={cn("absolute rounded-full bg-gray-300", isDesktopExpanded ? "right-3 top-1/2 -translate-y-1/2 h-2 w-2" : "top-0 right-0 h-2 w-2")} />
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
                            "relative flex items-center p-3 rounded-xl transition-colors hover:bg-surface group",
                            isDesktopExpanded ? "justify-start gap-3" : "justify-center",
                            isActive ? "bg-secondary text-white shadow-md hover:bg-secondary/90" : "text-gray-500"
                        )}
                        >
                        <Icon className="h-6 w-6 min-w-[24px]" />
                        {isDesktopExpanded && <span className="font-medium truncate">{item.label}</span>}
                        
                        {!isDesktopExpanded && isActive && (
                            <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 bg-white rounded-full p-0.5 shadow-sm hidden">
                                <ChevronRight className="h-3 w-3 text-secondary" />
                            </div>
                        )}
                        </Link>
                    )}
                    </TooltipTrigger>
                    {!isDesktopExpanded && <TooltipContent side="right" className="flex items-center gap-2">
                        {item.label}
                    </TooltipContent>}
                </Tooltip>
                );
            })}
            </TooltipProvider>
        </nav>

        <div className="p-4 border-t border-gray-100">
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <button
                            onClick={handleLogout}
                            className={cn(
                                "flex items-center p-3 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors w-full",
                                isDesktopExpanded ? "justify-start gap-3" : "justify-center"
                            )}
                        >
                            <LogOut className="h-6 w-6 min-w-[24px]" />
                            {isDesktopExpanded && <span className="font-medium">Sair</span>}
                        </button>
                    </TooltipTrigger>
                    {!isDesktopExpanded && <TooltipContent side="right">Sair</TooltipContent>}
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
                className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in"
                onClick={closeMobileSidebar}
            />
        )}

        {/* Sidebar Element */}
        <aside 
            className={cn(
                "fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-50 transition-all duration-300 ease-in-out",
                // Mobile Open/Close
                isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                // Desktop Width
                isDesktopExpanded ? "w-64" : "w-20"
            )}
        >
            <SidebarContent />
        </aside>
    </>
  );
}
