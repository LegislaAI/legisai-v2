import { ChevronDown, ChevronRight, Info, Search } from "lucide-react";

export function Procedures() {
  return (
    <div className="flex h-96 w-1/2 flex-col justify-between rounded-lg bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-dark font-semibold">
            Tramitações e Informações
          </span>
          <Info className="text-light-dark" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-secondary font-semibold">Detalhes aqui</span>
          <ChevronRight className="text-secondary" />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-light-dark border-light-dark flex w-1/2 items-center justify-center gap-2 rounded-t-lg border border-b-0 p-2">
          <span>Selecionar Tipo de Documentos</span>
          <ChevronDown />
        </div>
        <div className="border-light-dark flex h-12 w-4/5 items-center overflow-hidden rounded-lg border">
          <input
            className="h-full w-full px-4 focus:outline-none"
            placeholder="Buscar aqui sobre as Tramitações de preposições."
          />
          <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-r-lg text-white">
            <Search />
          </div>
        </div>
      </div>
    </div>
  );
}
