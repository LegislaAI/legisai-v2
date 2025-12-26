"use client";

import { useSectionChat } from "@/hooks/useSectionChat";
import { Bot, ChevronLeft, History, Menu, Mic, Paperclip, Plus, Send, StopCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
 
import { Avatar, AvatarFallback } from "@/components/v2/components/ui/avatar";
import { Button } from "@/components/v2/components/ui/Button";
import { ScrollArea } from "@/components/v2/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/v2/components/ui/tooltip";
import { useApiContext } from "@/context/ApiContext";
import { cn } from "@/lib/utils";
import moment from "moment";
import remarkGfm from "remark-gfm";
import { Prompt } from "./chat-history-handler";
import { FileViewer } from "./FileViewer";


// Mock data strictly for the sidebar list if the API fails, though we will try to use real data via props
const MOCK_HISTORY_FALLBACK = [
    { id: "1", name: "Exemplo: Resumo PL 2630", createdAt: new Date().toISOString() },
];

interface SectionGeminiProps {
  activeChatId?: string | null;
  selectedPrompt?: Prompt | null;
  onChatCreated?: () => void;
  type: string; 
}

export function SectionProposition({ activeChatId, selectedPrompt, onChatCreated, type}: SectionGeminiProps) {
    const { GetAPI } = useApiContext();
    const [historyList, setHistoryList] = useState<{ id: string, name: string, createdAt: string }[]>([]);
    const [chatTotalPages, setChatTotalPages] = useState(1);
    const [currentLastPage, setCurrentLastPage] = useState(1);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    
    // Internal state to trigger hook reloads
    const [loadNewChat, setLoadNewChat] = useState(false);
    const [loadOldChat, setLoadOldChat] = useState<string | null>(null);
    const [loadHistory, setLoadHistory] = useState(false);

    const isInputDisabled = !activeChatId && !selectedPrompt; // Disable if new chat but no prompt selected
    // Initial load sync
    useEffect(() => {
        if (activeChatId) {
            setLoadOldChat(activeChatId);
        } else {
            setLoadNewChat(true);
        }
    }, [activeChatId]);

    const {
        messages,
        loading,
        inputMessage,
        setInputMessage,
        file,
        setFile,
        isRecording,
        elapsedTime,
        handleFileUpload,
        startRecording,
        stopRecording,
        handleSendMessage,
        chatId
    } = useSectionChat({
        loadNewChat,
        setLoadNewChat,
        loadOldChat,
        setLoadOldChat,
        setLoadHistory, 
        selectedPrompt,
        shouldCreateChat: true,
        shouldSaveMessage: true,
        shouldSaveFile: true,
        shouldUseFunctions: true,
        type: type,
    });

    // Notify parent if chat created (checking if chatId changed from empty to something)
    useEffect(() => {
        if (chatId && chatId !== activeChatId) {
            if (onChatCreated) onChatCreated();
        }
    }, [chatId]);

  const [showHistory, setShowHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
     if(scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Handle Resize for History Sidebar
  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 768) {
            setShowHistory(false);
        } else {
            setShowHistory(true);
        }
    };
    if (window.innerWidth < 768) setShowHistory(false);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchSidebarHistory = async (page: number = 1) => {
    let endpoint = "";
    if (type === "ai") endpoint = `/chat/ai?page=${page}`;
    if (type === "proposition") endpoint = `/chat/proposition?page=${page}`;
    if (type === "prediction") endpoint = `/chat/prediction?page=${page}`;
    
    setIsLoadingHistory(true);
      try {
          const res = await GetAPI(endpoint, true);
          if (res.status === 200) {
              if (page === 1) {
                  setHistoryList(res.body.chats || []);
              } else {
                  setHistoryList(prev => [...prev, ...res.body.chats]);
              }
              setChatTotalPages(res.body.pages || 1);
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
  }, [loadHistory, type]);


  // Preserving the exact UI structure from the previous file
  return (
    <div className="flex h-full w-full  shadow-lg border border-gray-100 overflow-hidden relative isolate">
      {showHistory && (
          <div 
            className="absolute inset-0 bg-black/40 z-20 md:hidden animate-in fade-in"
            onClick={() => setShowHistory(false)}
          />
      )}

      {/* Internal Sidebar for Chat History */}
      <div 
        className={cn(
            "bg-white border-r border-gray-200 transition-all duration-300 absolute md:relative inset-y-0 left-0 z-30 flex flex-col overflow-hidden shrink-0 shadow-xl md:shadow-none",
            showHistory ? 'w-[85%] md:w-80 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 md:w-0'
        )}
      >
        <div className="px-6 py-2" >

         <Button 
                onClick={() => { setLoadNewChat(true); if(window.innerWidth < 768) setShowHistory(false); }}
                className="w-full bg-secondary text-white hover:bg-secondary/90 shadow-sm border border-transparent"
                >
                 <Plus className="h-4 w-4 mr-2" /> Novo Chat
             </Button>
                 </div>
          <div className="px-6 py-4 pb-0 border-t border-gray-100 flex flex-col gap-3">
                        
             <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-secondary/20 to-green-100 rounded-lg">
                        <History size={16} className="text-secondary" />
                    </div>
                    <h3 className="font-bold text-gray-700">Histórico</h3>
                 </div>
                 <Button variant="ghost" className="h-8 w-8 text-gray-400 hover:text-dark md:hidden" onClick={() => setShowHistory(false)}>
                     <ChevronLeft size={18} />
                 </Button>
             </div>
             

          </div>

          <ScrollArea className="flex-1 px-4 py-4 min-w-[240px]">
              <div className="space-y-2 pb-4 p-1">
                  {(historyList.length > 0 ? historyList : MOCK_HISTORY_FALLBACK).map(chat => (
                      <button
                         key={chat.id}
                         onClick={() => { 
                             setLoadOldChat(chat.id); 
                             if(window.innerWidth < 768) setShowHistory(false);
                         }}
                         className={cn(
                            "w-full max-w-[280px] text-left p-3 rounded-xl transition-all duration-200 group relative overflow-hidden box-border",
                            loadOldChat === chat.id 
                                ? "bg-gradient-to-r from-secondary/10 to-green-50 border-2 border-secondary/40 shadow-md" 
                                : "bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm hover:scale-[1.01]"
                         )}
                      >
                          {loadOldChat === chat.id && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-secondary to-green-500 rounded-l-xl" />
                          )}

                          <div className="flex items-start gap-3 overflow-hidden">
                              <div className={cn(
                                  "p-2 rounded-lg shrink-0 transition-all",
                                  loadOldChat === chat.id 
                                      ? "bg-secondary text-white shadow-sm" 
                                      : "bg-gray-100 text-gray-500 group-hover:bg-secondary/10 group-hover:text-secondary"
                              )}>
                                  <Bot size={16} />
                              </div>

                              <div className="flex-1 min-w-0 w-full max-w-full overflow-hidden">
                                  <div className={cn(
                                      "font-semibold text-sm truncate mb-0.5",
                                      loadOldChat === chat.id ? "text-secondary" : "text-gray-700"
                                  )}>
                                      {chat?.name}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                      <span className="shrink-0">{moment(chat?.createdAt).format("DD/MM")}</span>
                                      <span className="shrink-0">{moment(chat?.createdAt).format("HH:mm")}</span>
                                  </div>
                              </div>
                          </div>
                      </button>
                  ))}

                  {currentLastPage < chatTotalPages && (
                        <Button 
                        variant="ghost" 
                        className="w-full text-xs text-gray-400 hover:text-secondary mt-2"
                        onClick={() => fetchSidebarHistory(currentLastPage + 1)}
                        disabled={isLoadingHistory}
                        >
                            {isLoadingHistory ? (
                                <div className="flex justify-center p-2">
                                <div className="h-4 w-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                            </div>
                            ) : "Carregar mais"}
                        </Button>
                )}
              </div>
          </ScrollArea>
      </div>

      {/* 2. MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        
        {/* Toggle Sidebar Button (Floating) */}
        {!showHistory && (
            <button 
                onClick={() => setShowHistory(true)}
                className="absolute left-4 top-4 z-20 p-2 bg-white border border-gray-200 shadow-md rounded-lg text-gray-500 hover:text-secondary transition-all md:hidden"
            >
                <Menu size={18} />
            </button>
        )}

        {/* HEADER */}
        {/* <div className="flex items-center justify-between p-4 py-2 border-b border-gray-100 bg-white/80 backdrop-blur-md z-10">
        
             <div className={cn("flex items-center gap-3 transition-all", !showHistory ? 'ml-12 md:ml-0' : '')}>
                 <Avatar className="h-10 w-10 ring-2 ring-white shadow-md bg-gradient-to-br from-secondary to-green-700">
                     <AvatarFallback className="bg-transparent text-white"><Bot size={20} /></AvatarFallback>
                 </Avatar>
                 <div className="">
                 </div>
             </div>
        </div> */}

        {/* MESSAGES */}
        <ScrollArea className="flex-1 p-4 bg-[#fcfcfc]">
            <div className=" space-y-6 pb-4">
                {messages.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-6 animate-in fade-in zoom-in duration-500">
                         <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                             <Bot size={40} className="text-secondary/80" />
                         </div>
                         <div>
                             <h3 className="text-lg font-bold text-gray-700">Olá! Eu sou o Legis AI.</h3>
                             <p className=" text-gray-500 max-w-sm mx-auto mt-2">
                                 {selectedPrompt ? `Estou operando no modo ${selectedPrompt.name}.` : "Selecione uma persona para começar."}
                             </p>
                         </div>
                       
                         {/* Quick Actions based on type could go here */}
                         <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
                              <button onClick={() => setInputMessage("O que você pode fazer?")} className="p-3 border border-gray-200 bg-white rounded-xl hover:border-secondary hover:shadow-md transition-all text-center text-gray-600 text-sm">
                                  "O que você pode fazer?"
                              </button>
                         </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                        
                         {msg.content === "..." ? (
                            
                    <div className="flex gap-4">
                        <Avatar className="h-8 w-8 bg-white border border-gray-100 shadow-sm mt-1">
                             <AvatarFallback><Bot size={14} className="text-secondary" /></AvatarFallback>
                        </Avatar>
                        <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-secondary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-secondary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"></div>
                        </div>
                    </div>
                         ) : (
                         
                             <div className={cn(
                                 "relative max-w-[85%] rounded-2xl p-4 shadow-sm leading-relaxed",
                             msg.role === "user" ? "bg-dark text-white rounded-tr-sm" : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm markdown-body"
                         )}>
                            
                             {msg.file && (
                                 <div className="mb-3 max-w-[280px]">
                                     <FileViewer file={msg.file} mimeType={msg.type} fileName={msg.name} className={msg.role === "user" ? "bg-white border-white/20 text-white" : ""} />
                                 </div>
                             )}
                             <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                 {msg.content}
                             </ReactMarkdown>
                         </div>
                            )}

                         </div>
                ))}

             
                <div ref={scrollRef} />
            </div>
        </ScrollArea>

        {/* INPUT AREA */}
        <div className="p-4 bg-white border-t border-gray-100 z-10 w-full max-w-full">
             <div className="max-w-3xl mx-auto">
                 {/* Files */}
                 {file && (
                     <div className="flex gap-2 mb-2 animate-in slide-in-from-bottom-2 fade-in">
                        <FileViewer file={file} onRemove={() => setFile(null)} isInput />
                     </div>
                 )}

                 {/* Recording */}
                 {isRecording && (
                     <div className="absolute bottom-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto bg-white shadow-xl border border-red-100 rounded-full p-2 px-4 flex items-center gap-4 z-20 animate-in slide-in-from-bottom-2">
                         <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                         <span className=" font-mono font-bold text-red-500">{elapsedTime}</span>
                         <Button  variant="ghost" onClick={stopRecording} className="h-6 text-red-500 hover:bg-red-50 hover:text-red-600"><StopCircle size={14} className="mr-1"/> Parar</Button>
                     </div>
                 )}
                 
                 <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:ring-0 focus-within:border-secondary transition-all shadow-inner">
                     <div className="flex gap-1">
                         <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                         <TooltipProvider>
                             <Tooltip>
                                 <TooltipTrigger asChild>
                                     <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-secondary hover:bg-white hover:shadow-sm rounded-xl transition-all"><Paperclip size={18} /></button>
                                 </TooltipTrigger>
                                 <TooltipContent>Anexar</TooltipContent>
                             </Tooltip>
                         </TooltipProvider>
                     </div>

                     <textarea 
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => { if(e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                        placeholder={isInputDisabled ? "Nenhum assistente disponível para este contexto." : (isRecording ? "Gravando..." : `Mensagem para ${selectedPrompt?.name || "LegisAI"}...`)}
                        className="flex-1 bg-transparent border-none focus:ring-0 outline-none  text-dark placeholder:text-gray-400 resize-none min-h-[44px] py-3 max-h-32"
                        rows={1}
                        disabled={isRecording || isInputDisabled}
                     />

                     <div className="flex gap-1">
                         <TooltipProvider>
                             <Tooltip>
                                 <TooltipTrigger asChild>
                                     <button onClick={isRecording ? stopRecording : startRecording} className={cn("p-2 rounded-xl transition-all", isRecording ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-secondary hover:bg-white hover:shadow-sm")}><Mic size={18} /></button>
                                 </TooltipTrigger>
                                 <TooltipContent>Gravar</TooltipContent>
                             </Tooltip>
                         </TooltipProvider>

                         <Button 
                            onClick={() => handleSendMessage()} 
                            disabled={!inputMessage.trim() && !file || isInputDisabled}
                            className="h-10 w-10 p-0 rounded-xl shadow-sm bg-secondary hover:bg-secondary/90 text-white shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                             <Send size={18} />
                         </Button>
                     </div>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
}
