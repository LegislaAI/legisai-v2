import { ArrowLeft } from "lucide-react";

export function Header() {
  return (
    <div className="flex h-20 w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <ArrowLeft />
        <span className="font-semibold">Dashboard</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="bg-[#0C68E9]"></button>
      </div>
    </div>
  );
}
