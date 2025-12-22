"use client";

import {
    Bot,
    BrainCircuit,
    ChevronRight,
    Landmark,
    Scale,
    Sparkles,
    X
} from "lucide-react";
import { useEffect, useState } from "react";

import { Prompt } from "@/components/v2/components/chat/chat-history-handler";
import { SectionGemini } from "@/components/v2/components/chat/SectionGemini";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/v2/components/ui/accordion";
import { Button } from "@/components/v2/components/ui/Button";
import { ScrollArea } from "@/components/v2/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Mock Data based on Spec
const AI_CATEGORIES = [
  {
    id: "juridica",
    label: "IA Jurídica",
    icon: Scale,
    color: "text-blue-600 bg-blue-100",
    description: "Análise de leis, constitucionalidade e regimentos.",
    prompts: [
      { id: "827364", title: "Análise de Constitucionalidade", type: "juridica" },
      { id: "536781", title: "Revisão de Documentos Jurídicos", type: "juridica" },
      { id: "123123", title: "Parecer Técnico-Legislativo", type: "juridica" },
    ]
  },
  {
    id: "politica",
    label: "IA Política",
    icon: Landmark,
    color: "text-red-600 bg-red-100",
    description: "Contexto político, articulação e tendências.",
    prompts: [
      { id: "264891", title: "Análise de Clima Político", type: "politica" },
      { id: "491205", title: "Perfil Parlamentar", type: "politica" },
    ]
  },
  {
    id: "tecnica",
    label: "IA Técnica",
    icon: BrainCircuit,
    color: "text-purple-600 bg-purple-100",
    description: "Orçamento, dados e impacto fiscal.",
    prompts: [
      { id: "945672", title: "Análise Orçamentária", type: "tecnica" },
      { id: "678302", title: "Auditoria de Contas", type: "tecnica" },
    ]
  },
  {
    id: "geral",
    label: "IA Geral",
    icon: Sparkles,
    color: "text-yellow-600 bg-yellow-100",
    description: "Assistente geral para tarefas diversas.",
    prompts: [
      { id: "183947", title: "Chat Livre", type: "geral" },
    ]
  }
];

export default function AiPage() {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Auto-close on mobile resize/load
  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        } else {
            setSidebarOpen(true);
        }
    };
    // Initial check
    if (window.innerWidth < 768) {
        setSidebarOpen(false);
    }
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectPrompt = (prompt: any) => {
    setSelectedPrompt({
        id: prompt.id,
        name: prompt.title,
        type: prompt.type,
        description: "",
        icon: ""
    });
    setActiveChatId(null); 
    
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
        setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-20px)] overflow-hidden bg-[#f4f4f4] rounded-tl-2xl relative">
      
      {/* 1. SELECTION SIDEBAR (Left) */}
      
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
          <div 
             className="absolute inset-0 bg-black/40 z-20 md:hidden animate-in fade-in" 
             onClick={() => setSidebarOpen(false)}
          />
      )}

      <div className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-30",
        // Mobile: absolute overlay
        // Desktop: relative push
        "absolute md:relative inset-y-0 left-0 h-full",
        isSidebarOpen ? "w-[85%] md:w-80 translate-x-0 shadow-2xl md:shadow-none" : "w-0 -translate-x-full opacity-0 overflow-hidden"
      )}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold text-dark flex items-center gap-2">
                    <Sparkles className="text-secondary fill-secondary/20" />
                    Legis AI
                </h2>
                <p className="text-sm text-gray-500 mt-1">Selecione uma especialidade</p>
            </div>
            {/* Mobile Close Button */}
            <Button variant="ghost"  className="md:hidden" onClick={() => setSidebarOpen(false)}>
                <X size={20} className="text-gray-400" />
            </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <Accordion type="single" collapsible className="space-y-4" defaultValue="juridica">
            {AI_CATEGORIES.map((category) => (
              <AccordionItem key={category.id} value={category.id} className="border-none">
                <AccordionTrigger className="hover:no-underline py-2 rounded-lg hover:bg-gray-50 px-2 transition-all [&[data-state=open]]:bg-gray-50">
                   <div className="flex items-center gap-3">
                       <div className={cn("p-2 rounded-lg", category.color)}>
                           <category.icon size={18} />
                       </div>
                       <div className="text-left w-full">
                           <div className="font-bold text-sm text-gray-700">{category.label}</div>
                           <div className="text-[10px] text-gray-400 font-normal truncate max-w-[160px]">{category.description}</div>
                       </div>
                   </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-0 px-2">
                    <div className="space-y-1 ml-9 border-l-2 border-gray-100 pl-2">
                        {category.prompts.map((prompt) => (
                            <button
                                key={prompt.id}
                                onClick={() => handleSelectPrompt(prompt)}
                                className={cn(
                                    "w-full text-left p-2 rounded-md text-xs font-medium transition-all flex items-center gap-2",
                                    selectedPrompt?.id === prompt.id 
                                        ? "bg-secondary text-white shadow-md" 
                                        : "text-gray-600 hover:bg-gray-100 hover:text-dark"
                                )}
                            >
                                <span className={cn("w-1.5 h-1.5 rounded-full", selectedPrompt?.id === prompt.id ? "bg-white" : "bg-gray-300")}></span>
                                {prompt.title}
                            </button>
                        ))}
                    </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </div>

      {/* 2. CHAT AREA (Main) */}
      <div className="flex-1 flex flex-col relative w-full h-full px-4 overflow-hidden">
        
        {/* Toggle Sidebar (Mobile/Desktop) - Floating Trigger */}
        {!isSidebarOpen && (
            <Button 
                variant="ghost" 
                onClick={() => setSidebarOpen(true)}
                className="absolute left-6 top-6 z-20 bg-white shadow-md border hover:bg-gray-50"
            >
                <ChevronRight size={18} />
            </Button>
        )}

        <div className="flex-1 h-full rounded-2xl overflow-hidden shadow-sm ring-1 ring-gray-100 bg-white">
            {selectedPrompt ? (
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
                         <div className="flex items-center gap-3">
                             {isSidebarOpen && (
                                 <Button variant="ghost"  onClick={() => setSidebarOpen(false)} className="-ml-2 text-gray-400 hover:text-dark hidden md:flex">
                                     <ChevronRight className="rotate-180" size={20} />
                                 </Button>
                             )}
                             <div className={cn("transition-all", isSidebarOpen ? "" : "ml-10")}>
                                 <h3 className="font-bold text-dark">{selectedPrompt.name}</h3>
                                 <div className="flex items-center gap-2 text-xs text-gray-500">
                                     <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                     IA Especializada Ativa
                                 </div>
                             </div>
                         </div>
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                        <SectionGemini 
                            activeChatId={activeChatId} 
                            selectedPrompt={selectedPrompt}
                            onChatCreated={() => {}} 
                            type="ai"
                        />
                    </div>
                </div>
            ) : (
                // EMPTY STATE
                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-[#fcfcfc] relative">
                     {isSidebarOpen && (
                         <Button variant="ghost"  onClick={() => setSidebarOpen(false)} className="absolute left-4 top-4 text-gray-400 hidden md:flex">
                             <ChevronRight className="rotate-180" size={20} />
                         </Button>
                     )}
                     
                     <div className="h-24 w-24 bg-gradient-to-br from-secondary/20 to-green-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                         <Bot size={48} className="text-secondary" />
                     </div>
                     <h2 className="text-2xl font-bold text-gray-800 mb-2">Bem-vindo ao Legis AI</h2>
                     <p className="text-gray-500 max-w-md leading-relaxed">
                         Sua central de inteligência legislativa. Selecione uma <strong>persona especializada</strong> no menu ao lado para iniciar uma análise precisa.
                     </p>
                     
                     <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg w-full">
                         {[
                             { icon: Scale, label: "IA Jurídica", desc: "Análise de leis" },
                             { icon: Landmark, label: "IA Política", desc: "Contexto parlamentar" },
                             { icon: BrainCircuit, label: "IA Técnica", desc: "Dados e orçamento" },
                             { icon: Sparkles, label: "IA Geral", desc: "Assistente livre" },
                         ].map((item, i) => (
                             <div key={i} className="p-4 bg-white border border-gray-200 rounded-xl flex items-center gap-3 shadow-sm opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:border-secondary hover:shadow-md transition-all cursor-default">
                                  <div className="p-2 bg-gray-50 rounded-lg">
                                      <item.icon size={20} className="text-secondary" />
                                  </div>
                                  <div className="text-left">
                                      <div className="font-bold text-sm text-gray-700">{item.label}</div>
                                      <div className="text-xs text-gray-400">{item.desc}</div>
                                  </div>
                             </div>
                         ))}
                     </div>
                     
                     {!isSidebarOpen && (
                         <Button onClick={() => setSidebarOpen(true)} className="mt-8 bg-secondary text-white hover:bg-secondary/90">
                             Abrir Menu de Seleção
                         </Button>
                     )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
