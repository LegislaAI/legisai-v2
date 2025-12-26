"use client";

import { useChatPage } from "@/components/v2/components/chat/chat-history-handler";
import { SectionAi } from "@/components/v2/components/chat/SectionAi";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/v2/components/ui/accordion";
import { Button } from "@/components/v2/components/ui/Button";
import { ScrollArea } from "@/components/v2/components/ui/scroll-area";
import { useApiContext } from "@/context/ApiContext";
import { cn } from "@/lib/utils";
import {
    Bot,
    BrainCircuit,
    ChevronLeft,
    ChevronRight,
    History,
    Plus,
    Scale,
    Sparkles,
    X
} from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";

// Unified Prompt type
export type Prompt = {
    id: string;
    title: string;
    type: string;
    description?: string;
    content?: string;
}
interface Category {
    id: string;
    label: string;
    icon: any;
    color: string;
    description: string;
}

// Category definition (static config for styling/labels)
const CATEGORY_CONFIG: Record<string, Category> = {
    "general": {
        id: "general",
        label: "IA Geral",
        icon: Sparkles,
        color: "text-yellow-600 bg-yellow-100",
        description: "Assistente geral para tarefas diversas."
    },
    "politician": {
        id: "politician",
        label: "IA Politica",
        icon: BrainCircuit,
        color: "text-green-600 bg-green-100",
        description: "Processo legislativo e regimento interno."
    },
    "juridic": {
        id: "juridic",
        label: "IA Jurídica",
        icon: Scale,
        color: "text-blue-600 bg-blue-100",
        description: "Análise de leis, constitucionalidade e regimentos."
    },
    "accounting": {
        id: "accounting",
        label: "IA Contabilidade",
        icon: BrainCircuit,
        color: "text-purple-600 bg-purple-100",
        description: "Orçamento, dados e impacto fiscal."
    },
    "doc": {
        id: "doc",
        label: "IA Documentação",
        icon: BrainCircuit,
        color: "text-green-600 bg-green-100",
        description: "Processo legislativo e regimento interno."
    },
};

export default function AiPage() {
  const apiContext = useApiContext();
  const { GetAPI } = apiContext;
  
  // State for Selection/Navigation
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState<{ id: string, name: string, createdAt: string }[]>([]);
  
  const [loadOldChat, setLoadOldChat] = useState<string | null>(null);
const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const { 
        prompts, 
        activeChatId, 
        handleSelectPrompt,
        setActiveChatId,
        selectedPrompt,
        setSelectedPrompt
    } = useChatPage("ai");



    // Responsive Sidebar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };
        if (window.innerWidth < 768) setSidebarOpen(false);
        
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (activeChatId) {
            setLoadOldChat(activeChatId);
        }
    }, [activeChatId]);
    
    console.log("activeChatId", activeChatId)
    console.log("selectedPrompt", selectedPrompt)
    
  // Auto-close on mobile resize/load
  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        } else {
            setSidebarOpen(true);
        }
    };
    if (window.innerWidth < 768) {
        setSidebarOpen(false);
    }
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

    const fetchSidebarHistory = async () => {
    let endpoint = "/chat/ai?page=1";
       try {
           const res = await GetAPI(endpoint, true);
           if (res.status === 200) {
               setHistoryList(res.body.chats || []);
           }
       } catch (e) {
           console.error(e);
       }
   };

   useEffect(() => {
       fetchSidebarHistory();
   }, []);

   // Handlers
   const handleNewChat = () => {
       setShowHistory(false);
       setSelectedPrompt(null);
       setActiveChatId(null);
       if(window.innerWidth < 768) setSidebarOpen(true);
   };
   
   // Group prompts by category
   const getPromptsByCategory = (catId: string) => {
       return prompts.filter(p => p.type === catId || (catId === 'general' && !['juridic', 'politician', 'accounting', 'doc'].includes(p.type)));
   };
   
   // Derived categories list based on available prompts + config
   const availableCategories = Object.keys(CATEGORY_CONFIG).map(key => ({
       ...CATEGORY_CONFIG[key]
   }));

  return (
    <div className={cn("flex h-[calc(100vh-90px)]   w-full overflow-hidden gap-2  relative")}>
      
      {/* 1. SELECTION SIDEBAR (Left) */}
      
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
          <div 
             className="absolute inset-0 bg-black/40 z-20 md:hidden animate-in fade-in" 
             onClick={() => setSidebarOpen(false)}
          />
      )}

      <div className={cn(
        " bg-white  border-r border-gray-200 rounded-l-2xl flex flex-col transition-all duration-300 ease-in-out z-30",
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
        <div className="p-4 flex flex-col gap-2">


             <div
                className="w-full border-secondary  p-1 rounded-md  text-white flex flex-row gap-2  shadow-sm border-2 "
                >
                 <button onClick={() => { setShowHistory(false); }} className={cn("h-full bg-white flex-1  rounded-md text-black transition-all", !showHistory ? "bg-secondary text-white" : "")}>Categorias</button>
                 <button onClick={() => setShowHistory(true)} className={cn("h-full bg-white flex-1  rounded-md text-black transition-all", showHistory ? "bg-secondary text-white" : "")}>Histórico</button>
             </div>
                 </div>
        <ScrollArea className="flex-1 p-4">
            {showHistory ? (
                // HISTORY VIEW
                      <div className="flex flex-col gap-2">
             <div className="flex items-center justify-between">
                 <h3 className=" font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                     <History size={14} /> Histórico
                 </h3>
             </div>

          <ScrollArea className="flex-1 px-3 min-w-[240px]">
              <div className="space-y-4">
                  {historyList.map(chat => (
                      <button
                         key={chat.id}
                         onClick={() => { 
                             setLoadOldChat(chat.id); 
                             setActiveChatId(chat.id);
                             if(window.innerWidth < 768) setSidebarOpen(false);
                         }}
                         className={cn(
                             "w-full text-left p-3 rounded-lg  transition-all border",
                            loadOldChat === chat.id 
                                ? "bg-white border-gray-200 shadow-sm ring-1 ring-secondary/20" 
                                : "border-transparent hover:bg-white hover:shadow-sm"
                         )}
                      >
                          <div className="font-medium text-gray-700 truncate">{chat?.name}</div>
                          <div className="flex items-center justify-between mt-1">
                              <span className=" text-gray-400">{moment(chat?.createdAt).format("DD/MM HH:mm")}</span>
                          </div>
                      </button>
                  ))}
              </div>
          </ScrollArea>
      </div>
            ) : (
                <div className="h-full flex flex-col">
                  <Accordion type="single" collapsible className="space-y-4" defaultValue="general">
                    {availableCategories.map((category) => (
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
                                {getPromptsByCategory(category.id).map((prompt) => (
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
                                        {prompt.name}
                                    </button>
                                ))}
                            </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
            )}
        </ScrollArea>
        <div className="p-4">

        <Button 
                onClick={handleNewChat}
                className="w-full bg-secondary  text-white hover:bg-secondary/90 shadow-sm border border-transparent"
                >
                 <Plus className="h-4 w-4 mr-2" /> Novo Chat
             </Button>
                    </div>
      </div>

      {/* 2. CHAT AREA (Main) */}
      <div className={cn("flex-1 flex flex-col relative w-full h-full  bg-white rounded-r-2xl overflow-hidden", !isSidebarOpen ? "rounded-l-2xl   " : "rounded-l-none ")}>
        
        <div className="flex-1 h-full  overflow-hidden shadow-sm ring-1 ring-gray-100 ">
            {selectedPrompt ? (
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
                         <div className="flex items-center gap-3">
                                 <Button variant="ghost"  onClick={() => setSidebarOpen(!isSidebarOpen)} className="-ml-2 text-gray-400 hover:text-dark hidden md:flex">
                                     <ChevronRight className={ cn(" transition-all duration-300 ease-in-out rotate-180", !isSidebarOpen && "rotate-0")} size={20} />
                                 </Button>
                             <div className={cn("transition-all", )}>
                                <div className="flex items-center gap-2">
                                 <div className="h-8 w-8 ring-2 ring-white rounded-full text-white flex items-center justify-center shadow-md bg-gradient-to-br from-secondary to-green-700">
                     <Bot size={20} />
                 </div>
                                 <h3 className="font-bold text-dark">{selectedPrompt?.name || "Legis AI"}</h3>
                                    </div>
                                
                             </div>
                         </div>
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                        <SectionAi 
                            activeChatId={activeChatId} 
                            selectedPrompt={selectedPrompt}
                            onChatCreated={fetchSidebarHistory}
                        />
                    </div>
                </div>
            ) : (
                // EMPTY STATE (Welcome)
                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-[#fcfcfc] relative">

                     
                     <div className="h-24 w-24 bg-gradient-to-br from-secondary/20 to-green-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                         <Bot size={48} className="text-secondary" />
                     </div>
                     <h2 className="text-2xl font-bold text-gray-800 mb-2">Bem-vindo ao Legis AI</h2>
                     <p className="text-gray-500 max-w-md leading-relaxed">
                         Sua central de inteligência legislativa. Selecione uma <strong>persona especializada</strong> no menu ao lado para iniciar uma análise precisa.
                     </p>
                     {selectedCategory && <div className="flex flex-row max-w-lg w-full items-center gap-2">
                        <button onClick={() => setSelectedCategory(null)} className="p-2 bg-white border border-gray-200 rounded-xl flex items-center gap-3 shadow-sm opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:border-secondary hover:shadow-md transition-all cursor-pointer text-left">
                     <ChevronLeft size={20} />
                 </button>
                 <h3 className="font-bold text-dark">{selectedCategory.label}</h3>
                        </div>}
                     <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg w-full">
                        {selectedCategory ? (
                            <>
                             {getPromptsByCategory(selectedCategory.id).map((item, i) => (

                                  <button
                               key={i} 
                                    onClick={() => handleSelectPrompt(item)}
                                 className="p-4 bg-white border border-gray-200 rounded-xl flex items-center gap-3 shadow-sm opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:border-secondary hover:shadow-md transition-all cursor-pointer text-left"
                                 >
                                  <div className="p-2 bg-gray-50 rounded-lg">
                                  </div>
                                  <div className="text-left">
                                      <div className="font-bold text-sm text-gray-700">{item.name}</div>
                                  </div>
                             </button>
                                  
                                ))}
                            </>
                        ) : (
                            <>
                           {Object.values(CATEGORY_CONFIG).map((item, i) => (
                               <button
                               key={i} 
                                 onClick={() => {
                                    setSelectedCategory(item);
                                 }}
                                 className="p-4 bg-white border border-gray-200 rounded-xl flex items-center gap-3 shadow-sm opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:border-secondary hover:shadow-md transition-all cursor-pointer text-left"
                                 >
                                  <div className="p-2 bg-gray-50 rounded-lg">
                                      <item.icon size={20} className="text-secondary" />
                                  </div>
                                  <div className="text-left">
                                      <div className="font-bold text-sm text-gray-700">{item.label}</div>
                                      <div className="text-xs text-gray-400">{item.description}</div>
                                  </div>
                             </button>
                         ))} 
                         </>
                        )}
                         
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
