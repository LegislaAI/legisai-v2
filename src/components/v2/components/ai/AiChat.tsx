"use client";

import { useChatPage } from "@/components/v2/components/chat/chat-history-handler";
import { SectionGemini } from "@/components/v2/components/chat/SectionGemini";

export function AiChat() {
  const {
    activeChatId,
    selectedPrompt,
    // Other hooks if needed for sidebars within chat component
  } = useChatPage();


  return (
      <div className="flex-1 h-[800px]  p-0 min-h-0 w-full ">
          <SectionGemini 
            activeChatId={activeChatId} 
             selectedPrompt={selectedPrompt}
             onChatCreated={() => {
                 // Refresh chat list if we had one visible
             }}
          />
    </div>
  );
}
