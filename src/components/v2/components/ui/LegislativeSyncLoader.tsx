import { RefreshCw } from "lucide-react";

export function LegislativeSyncLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f4f4f4] p-6 text-[#1a1d1f]">
      <div className="flex flex-col items-center space-y-6 text-center">
        {/* Animated Icon Container */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#749c5b] opacity-10 duration-1000" />
          <RefreshCw className="h-10 w-10 animate-spin text-[#749c5b]" />
        </div>

        {/* Text Content */}
        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-bold text-[#1a1d1f]">
            Sincronizando dados...
          </h3>
          <p className="text-sm text-gray-500">
            Estamos buscando as informações mais recentes diretamente da Câmara
            dos Deputados para você.
          </p>
        </div>

        {/* Progress Value / Branding */}
        <div className="flex items-center gap-2 rounded-full border border-gray-100 bg-white px-3 py-1.5 shadow-sm">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
            LEGIS AI
          </span>
        </div>
      </div>
    </div>
  );
}
