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
    Menu,
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
  const [historyList, setHistoryList] = useState<{ id: string, name: string,promptId: string ,createdAt: string }[]>([]);
  
  const [loadOldChat, setLoadOldChat] = useState<string | null>(null);
const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const { 
        prompts, 
        activeChatId, 
        handleSelectPrompt,
        setActiveChatId,
        loadingPrompts,
        selectedPrompt,
        setSelectedPrompt
    } = useChatPage("ai");

    // Helper to find prompt by ID
    const getPromptById = (promptId: string | undefined) => {
        if (!promptId) return null;
        return prompts.find(p => p.id === promptId) || null;
    };

    // Helper to get category config by prompt type
    const getCategoryByType = (type: string | undefined) => {
        if (!type) return null;
        return CATEGORY_CONFIG[type] || CATEGORY_CONFIG['general'] || null;
    };



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
    const [chatTotalPages,setChatTotalPages] = useState(1);
    const [currentLastPage,setCurrentLastPage] = useState(1);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const fetchSidebarHistory = async (page: number = 1) => {
    let endpoint = `/chat/ai?page=${page}`;
    setIsLoadingHistory(true);
    try {
        const res = await GetAPI(endpoint, true);
           if (res.status === 200) {
               if(page === 1) {
                   setHistoryList(res.body.chats || []);
               } else {
                   setHistoryList(prev => [...prev, ...res.body.chats]);
               }
               setChatTotalPages(res.body.pages|| 1);
               setCurrentLastPage(page);
           }
       } catch (e) {
           console.error(e);
       } finally {
           setIsLoadingHistory(false);
       }
   };

   useEffect(() => {
       fetchSidebarHistory(1);
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
        isSidebarOpen ? "w-[95%] md:w-80 translate-x-0 shadow-2xl md:shadow-none" : "w-0 -translate-x-full opacity-0 overflow-hidden"
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
             <div className="w-full bg-gray-100/80 p-1.5 rounded-xl flex flex-row gap-1.5 shadow-inner backdrop-blur-sm">
                 <button 
                     onClick={() => { setShowHistory(false); }} 
                     className={cn(
                         "flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-300 ease-out flex items-center justify-center gap-2",
                         !showHistory 
                             ? "bg-gradient-to-r from-secondary to-green-600 text-white shadow-lg shadow-secondary/30 scale-[1.02]" 
                             : "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-white/60"
                     )}
                 >
                     <Sparkles size={16} className={cn("transition-all", !showHistory ? "fill-white/30" : "")} />
                     Categorias
                 </button>
                 <button 
                     onClick={() => setShowHistory(true)} 
                     className={cn(
                         "flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-300 ease-out flex items-center justify-center gap-2",
                         showHistory 
                             ? "bg-gradient-to-r from-secondary to-green-600 text-white shadow-lg shadow-secondary/30 scale-[1.02]" 
                             : "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-white/60"
                     )}
                 >
                     <History size={16} />
                     Histórico
                 </button>
             </div>
        </div>
        <ScrollArea className="flex-1 p-4 flex w-full">
            {showHistory ? (
                // HISTORY VIEW
                <div className="flex flex-col gap-4 w-full overflow-hidden">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gradient-to-br from-secondary/20 to-green-100 rounded-lg">
                                <History size={14} className="text-secondary" />
                            </div>
                            <h3 className="font-semibold text-gray-600 text-sm">Conversas Recentes</h3>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {historyList.length}
                        </span>
                    </div>

                    <div className="space-y-2 px-2 w-full flex flex-col max-w-[calc(100%-8px)] overflow-hidden">
                        {isLoadingHistory && historyList.length === 0 ? (
                           <div className="flex flex-col gap-2 p-2">
                               {[1,2,3].map(i => (
                                   <div key={i} className="h-16 w-full bg-gray-100 animate-pulse rounded-xl" />
                               ))}
                           </div>
                        ) : historyList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="p-3 bg-gray-100 rounded-full mb-3">
                                    <History size={24} className="text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-500">Nenhuma conversa ainda</p>
                                <p className="text-xs text-gray-400 mt-1">Inicie um novo chat para começar</p>
                            </div>
                        ) : (
                            historyList.map(chat => {
                                const prompt = getPromptById(chat.promptId);
                                const category = getCategoryByType(prompt?.type);
                                const CategoryIcon = category?.icon || Bot;
                                
                                return (
                                    <button
                                        key={chat.id}
                                        onClick={() => { 
                                            setLoadOldChat(chat.id); 
                                            setActiveChatId(chat.id);
                                            if (prompt) {
                                                setSelectedPrompt(prompt);
                                            }
                                            if(window.innerWidth < 768) setSidebarOpen(false);
                                        }}
                                        className={cn(
                                            "w-full max-w-full text-left p-3  rounded-xl transition-all duration-200 group relative overflow-hidden box-border",
                                            loadOldChat === chat.id 
                                                ? "bg-gradient-to-r from-secondary/10 to-green-50 border-2 border-secondary/40 shadow-md" 
                                                : "bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm hover:scale-[1.01]"
                                        )}
                                    >
                                        {/* Active indicator bar */}
                                        {loadOldChat === chat.id && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-secondary to-green-500 rounded-l-xl" />
                                        )}
                                        
                                        <div className="flex items-start gap-3 overflow-hidden">
                                            {/* Icon */}
                                            <div className={cn(
                                                "p-2 rounded-lg shrink-0 transition-all",
                                                loadOldChat === chat.id 
                                                    ? "bg-secondary text-white shadow-sm" 
                                                    : "bg-gray-100 text-gray-500 group-hover:bg-secondary/10 group-hover:text-secondary"
                                            )}>
                                                <CategoryIcon size={16} />
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="flex-1 min-w-0 w-full max-w-full overflow-hidden" style={{ maxWidth: '190px' }}>
                                                <div className={cn(
                                                    "font-semibold text-sm truncate mb-0.5",
                                                    loadOldChat === chat.id ? "text-secondary" : "text-gray-700"
                                                )}>
                                                    {chat?.name || "Nova conversa"}
                                                </div>
                                                
                                                {prompt?.name && (
                                                    <div className="text-[11px] w-full max-w-full text-gray-400 block overflow-hidden text-ellipsis whitespace-nowrap mb-1">
                                                        {prompt.name}
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                                    {category && (
                                                        <>
                                                            <span className={cn(
                                                                "text-[10px] font-medium px-1.5 py-0.5 rounded truncate max-w-[80px]",
                                                                category.color
                                                            )}>
                                                                {category.label.replace("IA ", "")}
                                                            </span>
                                                            <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                                                        </>
                                                    )}
                                                    <span className="shrink-0">{moment(chat?.createdAt).format("DD/MM")}</span>
                                                    <span className="shrink-0">{moment(chat?.createdAt).format("HH:mm")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                        {currentLastPage < chatTotalPages && (
                             <Button 
                                variant="ghost" 
                                className="w-full text-xs text-gray-400 hover:text-secondary mt-2"
                                onClick={() => fetchSidebarHistory(currentLastPage + 1)}
                             >
                                 Carregar mais
                             </Button>
                        )}
                        {isLoadingHistory && historyList.length > 0 && (
                            <div className="flex justify-center p-2">
                                <div className="h-4 w-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
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
                                {loadingPrompts ? (
                                    <div className="flex flex-col gap-2 py-2">
                                        <div className="h-4 w-3/4 bg-gray-100 animate-pulse rounded" />
                                        <div className="h-4 w-1/2 bg-gray-100 animate-pulse rounded" />
                                    </div>
                                ) : (
                                getPromptsByCategory(category.id).map((prompt) => (
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
                                ))
                                )}
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
                             <div className={cn("transition-all hidden md:block", )}>
                                <div className="flex items-center gap-2">
                                 <div className="h-8 w-8  ring-2 ring-white rounded-full text-white flex items-center justify-center shadow-md bg-gradient-to-br from-secondary to-green-700">
                     <Bot size={20} />
                 </div>
                                 <h3 className="font-bold text-dark">{selectedPrompt?.name || "Legis AI"}</h3>
                                    </div>
                                
                             </div>
                              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={cn("transition-all block md:hidden", )}>
                                <div className="flex items-center gap-2">
                                 <div className="h-8 w-8  ring-2 ring-white rounded-md text-white flex items-center justify-center shadow-md bg-gradient-to-br from-secondary to-green-700">
                     <Menu size={20} />
                 </div>
                                 <h3 className="font-bold text-dark">{selectedPrompt?.name || "Legis AI"}</h3>
                                    </div>
                                
                             </button>
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
                <div className="h-full flex flex-col items-center justify-center text-center p-4 px-2 md:px-8  bg-gradient-to-b from-gray-50/50 to-white relative">

                     <div className="relative group  mb-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-secondary to-green-400 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-all duration-700"></div>
                        <div className="h-20 w-20 bg-white ring-8 ring-white/50 rounded-full flex items-center justify-center relative shadow-xl transform transition-transform duration-500 group-hover:scale-105">
                            <Bot size={52} className="text-secondary drop-shadow-sm" />
                        </div>
                     </div>
                     
                     <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 mb-3 tracking-tight">
                        Bem-vindo ao Legis AI
                     </h2>
                     <p className="text-gray-500 max-w-lg text-base leading-relaxed mb-4">
                         Sua central de inteligência legislativa. Selecione uma <strong className="text-secondary font-semibold">persona especializada</strong> abaixo para iniciar.
                     </p>

                     {/* Navigation Header (Back Button) */}
                     {selectedCategory && (
                        <div className="flex flex-row max-w-2xl w-full items-center gap-4 mb-6 animate-in fade-in slide-in-from-bottom-2">
                             <button 
                                onClick={() => setSelectedCategory(null)} 
                                className="group p-2.5 bg-white border border-gray-200 rounded-xl hover:border-secondary hover:text-secondary hover:shadow-md transition-all duration-300 text-gray-500"
                             >
                                <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                             </button>
                             <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg bg-gray-50", selectedCategory.color)}>
                                   <selectedCategory.icon size={20} />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-gray-800 text-lg">{selectedCategory.label}</h3>
                                    <p className="text-xs text-gray-400">Selecione um prompt para começar</p>
                                </div>
                             </div>
                        </div>
                     )}

                     <div className="h-max overflow-y-auto p-4">

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {selectedCategory ? (
                            <>
                             {getPromptsByCategory(selectedCategory.id).map((item, i) => (
                                  <button
                                    key={i} 
                                    onClick={() => handleSelectPrompt(item)}
                                    className="group relative p-2 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 cursor-pointer text-left overflow-hidden"
                                    >
                                     <div className="absolute inset-0 bg-gradient-to-r from-secondary/0 via-secondary/0 to-secondary/0 group-hover:via-secondary/5 group-hover:to-secondary/10 transition-all duration-500" />
                                     <div>

                                     <div className="h-10 w-10 shrink-0 bg-gray-50 rounded-xl flex flex-row md:flex-col items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all text-secondary">
                                         <Sparkles size={20} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute" />
                                         <div className="w-2 h-2 rounded-full bg-secondary/40 group-hover:opacity-0 transition-opacity" />
                                     </div>
                                     
                                     <div className="text-left relative z-10">
                                         <div className="font-bold text-sm text-gray-700 group-hover:text-secondary transition-colors">{item.name}</div>
                                     </div>
                                         <p className="text-xs text-gray-400 hidden md:block line-clamp-2 mt-0.5 group-hover:text-gray-500">Clique para iniciar esta conversa</p>
                                     </div>
                                     
                                     <ChevronRight size={16} className="ml-auto text-gray-300 group-hover:text-secondary group-hover:translate-x-1 transition-all" />
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
                                 className="group p-2 md:p-5 bg-white border border-gray-100 rounded-2xl flex flex-col md:flex-row md:items-center sm:items-start gap-2 md:gap-4 shadow-sm hover:shadow-lg hover:border-secondary/30 transition-all duration-300 cursor-pointer text-center sm:text-left"
                                 >
                                    <div className="flex items-center gap-3">

                                  <div className={cn("p-3 rounded-xl shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md", item.color)}>
                                      <item.icon size={24} />
                                  </div>
                                  <div className="md:flex-1">
                                      <div className="font-bold text-base text-gray-800 group-hover:text-secondary transition-colors mb-1">{item.label}</div>
                                      <div className="text-xs text-gray-500 leading-relaxed hidden md:block font-medium">{item.description}</div>
                                  </div>
                                    </div>
                                    <div className="text-xs text-gray-500 leading-relaxed md:hidden font-medium">{item.description}</div>
                             </button>
                         ))} 
                         </>
                        )}
                         
                     </div>
                     </div>
                     {!isSidebarOpen && (
                         <Button onClick={() => setSidebarOpen(true)} className="mt-12 bg-white text-gray-600 hover:text-secondary border border-gray-200 hover:border-secondary hover:bg-gray-50 shadow-sm transition-all rounded-full px-8">
                             Abrir Menu Lateral
                         </Button>
                     )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
