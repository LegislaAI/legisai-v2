"use client";
import { cn } from "@/lib/utils";
import { ArrowLeft, BellDot, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

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
        <button className="h-8 rounded-full bg-[#0C68E9] px-4 text-white">
          xxxxx
        </button>
        <Search />
        <BellDot />
        <div className="h-8 w-8 rounded-full bg-[#0C68E9]"></div>
      </div>
    </div>
  );
}
