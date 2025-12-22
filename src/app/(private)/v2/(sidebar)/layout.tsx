"use client";

import { Header } from "@/components/v2/components/Header";
import { Sidebar } from "@/components/v2/components/Sidebar";
import { PoliticianContextProvider } from "@/context/PoliticianContext";
import { SidebarContextProvider, useSidebarContext } from "@/context/SidebarContext2";
import { cn } from "@/lib/utils";

function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
    const { isDesktopExpanded } = useSidebarContext();

    return (
        <div className="min-h-screen bg-[#f4f4f4]">
            <Sidebar />
            <Header />
            <main 
                className={cn(
                    "min-h-screen   p-4 md:p-8 pt-20 md:pt-20 transition-all duration-300",
                    isDesktopExpanded ? "md:ml-64" : "md:ml-20"
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
