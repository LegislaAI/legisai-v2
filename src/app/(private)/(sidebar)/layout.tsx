"use client";

import { Header } from "@/components/v2/components/Header";
import { Sidebar } from "@/components/v2/components/Sidebar";
import { PoliticianContextProvider } from "@/context/PoliticianContext";
import {
  SidebarContextProvider,
  useSidebarContext,
} from "@/context/SidebarContext2";
import { useSignatureContext } from "@/context/SignatureContext";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isDesktopExpanded } = useSidebarContext();
  const { isSubscribed, isLoading } = useSignatureContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isSubscribed) {
      router.replace("/plans");
    }
  }, [isLoading, isSubscribed, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f4f4]">
        <Loader2 className="text-secondary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isSubscribed) {
    return null;
  }

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
