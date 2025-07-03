"use client";
import { useSidebarContext } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { ArrowLeft, BellDot, Menu, Search } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { setIsSidebarOpen } = useSidebarContext();

  return (
    <div className="flex h-14 w-full items-center justify-between lg:h-20">
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
        <button className="bg-primary h-8 rounded-full px-4 text-white">
          xxxxx
        </button>
        <Search />
        <BellDot />
        <div className="bg-primary h-8 w-8 rounded-full">
          <Image
            src="/avatar.jpeg"
            alt="logo"
            width={500}
            height={500}
            className="h-full w-full rounded-full"
          />
        </div>
        <Menu className="lg:hidden" onClick={() => setIsSidebarOpen(true)} />
      </div>
    </div>
  );
}
