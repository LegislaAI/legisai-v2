"use client";

import { useSignatureContext } from "@/context/SignatureContext";
import { useLoadingContext } from "@/context/LoadingContext";
import { isMenuItemVisibleForLevel } from "@/lib/plan-access";
import type { PlanLevel } from "@/@types/signature";
import { cn } from "@/lib/utils";
import { Home, Search, Sparkles, User, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Plenários", href: "/plenario", icon: Wallet },
  { label: "IA", href: "/ai", icon: Sparkles },
  { label: "Pesquisa", href: "/tramitacoes", icon: Search },
  { label: "Perfil", href: "/perfil", icon: User },
];

export function MobileToolbar() {
  const pathname = usePathname();
  const { handleNavigation } = useLoadingContext();
  const { activeSignature } = useSignatureContext();
  const planLevel: PlanLevel = activeSignature?.signaturePlan?.level ?? 4;
  const visibleNavItems = NAV_ITEMS.filter((item) =>
    isMenuItemVisibleForLevel(item.href, planLevel)
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-gray-200 bg-white/90 backdrop-blur-md md:hidden px-2 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.1)]">
      {visibleNavItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href + "/"));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation(item.href);
            }}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              isActive ? "text-[#749c5b]" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center w-auto px-4 py-1 rounded-full transition-all",
                isActive ? "bg-[#749c5b]/10" : "bg-transparent"
              )}
            >
              <Icon size={isActive ? 20 : 20} className={cn(isActive ? "stroke-[2.5px]" : "stroke-2")} />
            </div>
            <span className={cn("text-[10px] font-medium", isActive ? "font-bold" : "")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
