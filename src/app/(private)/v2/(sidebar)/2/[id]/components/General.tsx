"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, History } from "lucide-react";

// Mock Data for Propositions
const mockPropositions = [
    {
        id: "1",
        code: "REQ 123/2023",
        topic: "Requerimento",
        date: "24/10/2023",
        regime: "Ordinário",
        author: "Dep. João Silva",
        summary: "Requer a realização de Audiência Pública para discutir a Reforma Tributária.",
        link: "#",
        history: [
            { date: "24/10/2023", action: "Apresentação do Requerimento" },
            { date: "25/10/2023", action: "Aprovado" }
        ]
    },
    {
        id: "2",
        code: "PL 456/2023",
        topic: "Projeto de Lei",
        date: "20/10/2023",
        regime: "Urgência",
        author: "Dep. Maria Souza",
        summary: "Institui o Programa Nacional de Incentivo à Leitura.",
        link: "#",
        history: [
            { date: "20/10/2023", action: "Apresentação do Projeto" },
            { date: "22/10/2023", action: "Designado Relator" },
            { date: "24/10/2023", action: "Parecer Favorável" }
        ]
    }
];

export function GeneralTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1a1d1f]">Pauta da Reunião</h3>
          <span className="text-sm text-gray-500">{mockPropositions.length} itens em pauta</span>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
          {mockPropositions.map((prop) => (
             <AccordionItem key={prop.id} value={prop.id} className="border border-gray-100 rounded-xl bg-white px-4 shadow-sm overflow-hidden data-[state=open]:border-[#749c5b] transition-all">
                 <AccordionTrigger className="hover:no-underline py-4">
                     <div className="flex flex-col md:flex-row md:items-center gap-4 w-full text-left">
                         <div className="min-w-[120px]">
                             <div className="font-bold text-[#749c5b] text-base">{prop.code}</div>
                             <div className="text-xs text-gray-400">{prop.date}</div>
                         </div>
                         <div className="flex-1">
                             <div className="font-medium text-[#1a1d1f] mb-1">{prop.topic}</div>
                             <div className="text-sm text-gray-500 line-clamp-1">{prop.summary}</div>
                         </div>
                         <div className="flex items-center gap-2 mr-4">
                             <Badge variant="outline" className="bg-gray-50">{prop.regime}</Badge>
                         </div>
                     </div>
                 </AccordionTrigger>
                 <AccordionContent className="pb-4 pt-2 border-t border-gray-50 mt-2">
                     <div className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                 <h4 className="text-xs font-bold uppercase text-gray-400 mb-1">Autor</h4>
                                 <p className="text-sm text-[#1a1d1f]">{prop.author}</p>
                             </div>
                             <div>
                                 <h4 className="text-xs font-bold uppercase text-gray-400 mb-1">Ementa Completa</h4>
                                 <p className="text-sm text-[#1a1d1f] leading-relaxed">{prop.summary}</p>
                             </div>
                         </div>
                         
                         <div className="bg-gray-50 rounded-lg p-4">
                             <h4 className="text-xs font-bold uppercase text-gray-400 mb-3 flex items-center gap-2">
                                <History size={14} /> Histórico Recente
                             </h4>
                             <div className="space-y-2">
                                 {prop.history.map((hist, i) => (
                                     <div key={i} className="flex gap-3 text-sm">
                                         <span className="font-mono text-xs text-gray-500 min-w-[80px]">{hist.date}</span>
                                         <span className="text-[#1a1d1f]">{hist.action}</span>
                                     </div>
                                 ))}
                             </div>
                         </div>

                         <div className="flex justify-end">
                             <a href={prop.link} className="flex items-center gap-2 text-sm font-bold text-[#749c5b] hover:underline">
                                 Ver Inteiro Teor <ExternalLink size={14} />
                             </a>
                         </div>
                     </div>
                 </AccordionContent>
             </AccordionItem>
          ))}
      </Accordion>
    </div>
  );
}
