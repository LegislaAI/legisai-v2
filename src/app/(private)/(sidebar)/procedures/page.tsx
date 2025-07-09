"use client";
import { useChatPage } from "@/components/chat/chat-history-handler";
import { Section } from "@/components/chat/SectionGemini";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { Minus, Search } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function BranchesList() {
  const [loadNewChat, setLoadNewChat] = useState(false);
  const {
    chats,
    setLoadHistory,
    loadChat,
    setLoadChat,
    handleChangeChat,
    setTypes,
    prompts,

    setSelectedPrompt,
  } = useChatPage();
  const [openInfo, setOpenInfo] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleOpen = () => {
    setVisible(true);
    setOpenInfo(true);
  };

  const handleClose = () => {
    setOpenInfo(false);
    setTimeout(() => setVisible(false), 300); // Tempo da animação
  };

  useEffect(() => {
    if (window.innerWidth > 768) {
      handleOpen();
    }
    setTypes("proposition");
  }, []);

  return (
    <div className="flex w-full items-center justify-center gap-2 overflow-x-hidden">
      <div className="flex h-[calc(100vh-100px)] w-full flex-1 flex-col justify-between rounded-2xl bg-white p-2 transition-all duration-300 lg:h-[calc(100vh-150px)] xl:p-4">
        <div className="relative">
          <Image
            src="/logos/camara.png"
            alt="logo"
            width={500}
            height={500}
            className="h-14 w-auto"
          />
          <br />
          <h2 className="text-sm font-medium text-zinc-400 xl:text-base">
            Inteligência artificial treinada com dados da Câmara legislativa.
          </h2>
          <h2 className="text-lg font-medium xl:text-2xl">
            Acesse informações diretas da Câmara dos Deputados
          </h2>
          {/* <div className="top-2 right-2 mt-2 flex items-center justify-between gap-2 lg:absolute lg:mt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="bg-secondary flex items-center gap-2 rounded-full px-2 py-1 text-base font-medium text-white focus:outline-none xl:top-4 xl:right-4 xl:px-4 xl:py-2 xl:text-xl">
                  {selectedDocument.label || "Selecione um documento"}
                  <ChevronDown />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="max-h-[60vh] w-full gap-2 overflow-auto p-2"
              >
                {items.map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => setSelectedDocument(item)}
                    className="group rounded-none border-b border-b-zinc-400 hover:bg-transparent"
                  >
                    <div className="w-full rounded-md p-2 text-lg group-hover:bg-zinc-400">
                      {item.label}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={() => handleOpen()}
              className={`bg-secondary flex items-center justify-center rounded-full p-1 text-white ${visible ? "invisible" : ""}`}
            >
              <Plus />
            </button>
          </div> */}
        </div>
        <div className="mt-4 flex h-[calc(100vh-300px)] flex-1 flex-col">
          <Section
            loadNewChat={loadNewChat}
            setLoadHistory={setLoadHistory}
            loadOldChat={loadChat}
            setLoadOldChat={setLoadChat}
            selectedPrompt={prompts[0]}
            setSelectedPrompt={setSelectedPrompt}
            actualScreenType="proposition"
            setLoadNewChat={setLoadNewChat}
          />
        </div>
      </div>
      {visible && (
        <div
          className={cn(
            "absolute right-0 flex h-[calc(100vh-150px)] w-3/4 flex-col justify-between rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 md:static lg:w-1/2 xl:flex xl:w-3/12",
            openInfo ? "animate-slide-in" : "animate-slide-out",
          )}
        >
          <button
            onClick={handleClose}
            className="bg-secondary absolute top-4 right-[22px] z-10 flex items-center justify-center rounded-full p-1 text-white"
          >
            <Minus />
          </button>
          <div className="flex h-full flex-col justify-between gap-4 pb-8">
            <div className="flex h-full flex-col">
              <div className="relative w-full border-b border-gray-400 p-2">
                <Search className="text-dark absolute top-1/2 left-6 h-5 w-5 -translate-y-1/2" />
                <Input
                  className="w-full border-none bg-transparent pl-10 focus:outline-none"
                  placeholder="Pesquisar"
                />
              </div>
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
                {chats.length === 0 ? (
                  <label className="mt-10 text-center text-lg font-bold text-black">
                    Sem histórico
                  </label>
                ) : (
                  <>
                    {chats.map((ai, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleChangeChat(ai);
                        }}
                        className="flex flex-col items-start justify-start rounded-lg transition-all duration-300 hover:scale-[1.005] hover:bg-gray-100"
                      >
                        <h4 className="font-semibold">{ai.name}</h4>
                        <h4 className="text-secondary text-sm font-semibold">
                          {moment(ai.createdAt).format("DD/MM/YY, HH:mm")}
                        </h4>
                        {/* <p className="text-sm text-gray-600">
                      {historic.description}
                    </p> */}
                      </button>
                    ))}
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  setLoadNewChat(true);
                }}
                className="bg-secondary mt-4 h-12 w-2/3 cursor-pointer self-center rounded-3xl text-lg font-semibold text-white"
              >
                Novo Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
