"use client";

import { useChatPage } from "@/components/v2/components/chat/chat-history-handler";
import { SectionGemini } from "@/components/v2/components/chat/SectionGemini";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProceduresPage() {
    // Initialize hook with "proposition" type
    const { 
        chats, 
        prompts, 
        activeChatId, 
        handleSelectChat, 
        handleSelectPrompt,
        setActiveChatId,
        fetchChats,
        selectedPrompt
    } = useChatPage("proposition");

    const [isSidebarOpen, setSidebarOpen] = useState(true);

    // Auto-select first prompt if available and no chat active
    useEffect(() => {
        if (prompts.length > 0 && !selectedPrompt && !activeChatId) {
            handleSelectPrompt(prompts[0]);
        }
    }, [prompts, selectedPrompt, activeChatId]);

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

    const handleNewChat = () => {
        setActiveChatId(null);
        if (prompts.length > 0) handleSelectPrompt(prompts[0]);
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    return (
        <div className="flex h-[calc(100vh-120px)] overflow-hidden bg-[#f4f4f4] rounded-tl-2xl relative">
            



            {/* 2. CHAT AREA */}
            <div className="flex-1 flex flex-col relative w-full h-full  overflow-hidden">
                
              

                <div className="flex-1 h-full rounded-2xl overflow-hidden shadow-sm ring-1 ring-gray-100 bg-white">
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
                            <div className="flex items-center gap-3">
                               
                                <div className={cn("transition-all")}>
                                     <h3 className="font-bold text-dark flex items-center gap-2">
                                        <Bot size={40} className="text-secondary" />
                                        Inteligência artificial treinada com dados da Câmara legislativa
                                     </h3>
                                    
                                </div>
                            </div>
                        </div>

                        {/* Chat Section */}
                        <div className="flex-1 overflow-hidden">
                            <SectionGemini 
                                activeChatId={activeChatId}
                                selectedPrompt={selectedPrompt}
                                onChatCreated={fetchChats}
                                type="proposition" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
