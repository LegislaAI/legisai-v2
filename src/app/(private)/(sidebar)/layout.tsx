"use client";

import { Header } from "@/components/v2/components/Header";
import { Sidebar } from "@/components/v2/components/Sidebar";
import { PoliticianContextProvider } from "@/context/PoliticianContext";
import {
  SidebarContextProvider,
  useSidebarContext,
} from "@/context/SidebarContext2";
import { cn } from "@/lib/utils";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isDesktopExpanded } = useSidebarContext();
  // Validação de assinatura desativada: usuários podem acessar sem assinatura ativa

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <Sidebar />
      <Header />
      <main
        className={cn(
          "min-h-screen p-4 pt-20 pb-0 transition-all duration-300 md:p-8 md:pt-20 md:pb-0",
          isDesktopExpanded ? "md:ml-64" : "md:ml-20",
        )}
      >
        {children}
      </main>
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
