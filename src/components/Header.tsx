"use client";
import { ArrowLeft, BellDot, Search } from "lucide-react";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  return (
    <div className="flex h-20 w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <ArrowLeft />
        <span className="font-semibold">
          {pathname === "/" ? "Dashboard" : "Home"}
        </span>
      </div>
      <div className="flex items-center gap-4">
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
