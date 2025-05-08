import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, ChevronRight, Info } from "lucide-react";

export function News() {
  return (
    <div className="flex h-96 w-1/2 flex-col rounded-lg bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-dark font-semibold">Notícias de Políticos</span>
          <Info className="text-light-dark" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-secondary font-semibold">Ver últimos</span>
          <ChevronRight className="text-secondary" />
        </div>
      </div>
      <ScrollArea>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="group flex h-16 w-full items-center justify-between rounded-lg border border-transparent px-4 py-2 transition duration-200 hover:cursor-pointer hover:border-zinc-200 hover:shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
                <ArrowUpRight className="text-green-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">Título x...</span>
                <span className="text-secondary">Sites Diversos</span>
              </div>
            </div>
            <ChevronRight className="fill-secondary text-secondary" />
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
