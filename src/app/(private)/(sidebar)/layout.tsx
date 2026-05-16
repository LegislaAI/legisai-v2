"use client";

import type { PlanLevel } from "@/@types/signature";
import { Header } from "@/components/v2/components/Header";
import { MobileToolbar } from "@/components/v2/components/MobileToolbar";
import { Sidebar } from "@/components/v2/components/Sidebar";
import { PoliticianContextProvider } from "@/context/PoliticianContext";
import {
  SidebarContextProvider,
  useSidebarContext,
} from "@/context/SidebarContext2";
import { useSignatureContext } from "@/context/SignatureContext";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isDesktopExpanded } = useSidebarContext();
  const pathname = usePathname();
  const router = useRouter();
  const { isSubscribed, activeSignature, isLoading } = useSignatureContext();

  const level: PlanLevel | null = activeSignature?.signaturePlan?.level ?? null;
  const effectiveLevel: PlanLevel = level ?? 4;

  // useEffect(() => {
  //   if (isLoading) return;

  //   if (!isSubscribed) {
  //     router.replace("/plans");
  //     return;
  //   }

  //   if (!canAccessRoute(pathname, effectiveLevel)) {
  //     toast.error("Recurso não disponível no seu plano.");
  //     router.replace("/");
  //   }
  // }, [isLoading, isSubscribed, pathname, effectiveLevel, router]);

  // Só exibe sidebar e conteúdo após validar assinatura/plano (evita flash do menu completo)
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f4f4]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#749c5b] border-t-transparent" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <Sidebar />
      <Header />
      <main
        className={cn(
          "min-h-screen p-4 pt-20 pb-28 transition-all duration-300 md:p-8 md:pt-20 md:pb-0",
          isDesktopExpanded ? "md:ml-64" : "md:ml-20",
        )}
      >
        {children}
      </main>
      <MobileToolbar />
    </div>
  );
}

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PoliticianContextProvider>
      <SidebarContextProvider>
        <LayoutContent>{children}</LayoutContent>
      </SidebarContextProvider>
    </PoliticianContextProvider>
  );
}
