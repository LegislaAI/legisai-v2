"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

const mockVotes = [
    {
        id: "v1",
        title: "Requerimento de Urgência PL 1234/23",
        result: "Aprovado",
        yes: 25,
        no: 5,
        total: 30,
        type: "nominal"
    },
    {
        id: "v2",
        title: "Emenda Aditiva nº 2",
        result: "Rejeitado",
        yes: 10,
        no: 20,
        total: 30,
        type: "nominal"
    },
    {
        id: "v3",
        title: "Aprovação da Ata Anterior",
        result: "Aprovado",
        type: "simbolica"
    }
];

export function VotesTab() {
  return (
    <div className="space-y-6">
        <h3 className="text-lg font-bold text-[#1a1d1f]">Votações Realizadas</h3>
        
        <div className="grid gap-4">
            {mockVotes.map((vote) => (
                <div key={vote.id} className="border border-gray-100 rounded-xl bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                         <div>
                             <h4 className="text-base font-bold text-[#1a1d1f]">{vote.title}</h4>
                             <span className="text-xs text-gray-500 uppercase tracking-wide">Votação {vote.type}</span>
                         </div>
                         <Badge 
                            color={vote.result === "Aprovado" ? "success" : "destructive"}
                            className={vote.result === "Aprovado" ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200" : "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"} 
                         >
                             {vote.result}
                         </Badge>
                    </div>

                    {vote.type === "nominal" ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 text-sm font-medium">
                                <span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={16} /> Sim: {vote.yes}</span>
                                <span className="flex items-center gap-1 text-red-600"><XCircle size={16} /> Não: {vote.no}</span>
                            </div>
                            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-100">
                                <div style={{ width: `${(vote.yes! / vote.total!) * 100}%` }} className="bg-green-500 h-full"></div>
                                <div style={{ width: `${(vote.no! / vote.total!) * 100}%` }} className="bg-red-500 h-full"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500 italic">
                            Votação simbólica: os parlamentares aprovaram por acordo ou maioria visual.
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
}
