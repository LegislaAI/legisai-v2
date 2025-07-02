"use client";
import {
  Menu,
  MessageCircleQuestion,
  Plus,
  StarIcon,
  Trash,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Section } from "../../../../../../components/chat/SectionGemini";
import { useChatPage } from "../../../../../../components/chat/chat-history-handler";

interface ChatProps {
  title: string;
}
export function Chat({ title }: ChatProps) {
  const [showMenu, setShowMenu] = useState(false);
  const {
    prompts,
    chats,
    setLoadHistory,
    loadChat,
    setLoadChat,
    newChat,
    setNewChat,
    handleChangeChat,
  } = useChatPage();
  return (
    <div className={`-10 flex w-full flex-col gap-8 self-center`}>
      <div
        className={`shadow-primary relative flex w-full flex-col items-center justify-center gap-4 rounded-xl bg-white p-2 shadow-sm transition-opacity duration-300 md:p-4`}
      >
        <Image
          src="/logos/half-logo.png"
          alt="logo"
          width={1000}
          height={1000}
          className="absolute -right-0 h-80 w-auto"
        />
        <div
          className={`relative flex h-[90vh] w-full flex-row overflow-hidden rounded-lg transition-opacity duration-300`}
        >
          <div className="hidden rounded-r-lg bg-black/20 pr-2 md:block">
            <div className="bg-primary flex h-full w-60 flex-col justify-between rounded-r-lg border-r border-r-[#E5E5E5]/5 p-4 text-white">
              <div className="flex flex-1 flex-col gap-4 border-b border-b-[#E5E5E5]/5">
                <button className="flx-row flex w-full gap-2 rounded-md bg-[#E5E5E5]/5 p-4">
                  <div className="flex h-10 min-h-10 w-10 min-w-10 items-center justify-center rounded-full bg-[#019A5A]">
                    <StarIcon size={14} fill="white" />
                  </div>
                  <div className="flex h-full w-full flex-col justify-between text-start">
                    <h3 className="text-[12px]">Leonardo Cavalcanti</h3>
                    <p className="text-[10px] text-[#E5E5E5]/40">
                      Master LegisAIt
                    </p>
                  </div>
                </button>
                <div className="flex w-full flex-col justify-between gap-4 px-2 py-4">
                  {chats.map((ai, index) => (
                    <div
                      key={index}
                      className="flex w-full flex-row justify-between gap-2 px-2"
                    >
                      <button
                        className="flex max-w-[85%]"
                        onClick={() => {
                          handleChangeChat(ai);
                        }}
                      >
                        <h3 className="w-full truncate text-[12px]">
                          {ai.name}
                        </h3>
                      </button>
                      {/* <button onClick={() => handleRemoveThread(index)}>
                      <Trash size={16} />
                    </button> */}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setNewChat(true)}
                  className="flx-row flex w-full items-center gap-2 rounded-md bg-gradient-to-br from-[#019A5A]/70 to-[#019A5A]/80 px-2 py-1"
                >
                  <Plus />
                  <h3 className="text-[12px]">Iniciar Novo Chat</h3>
                </button>
              </div>
              <div className="mt-4 flex w-full flex-col justify-between gap-4 px-2 py-4">
                <button className="flex flex-row gap-2">
                  <Trash size={16} />
                  <h3 className="text-[12px]">Limpar conversa</h3>
                </button>
                <button className="flex flex-row gap-2">
                  <MessageCircleQuestion size={16} />
                  <h3 className="text-[12px]">Ajudas para utilizar IA</h3>
                </button>
              </div>
            </div>
          </div>

          <div className="md:py flex flex-1 items-center justify-center md:px-4">
            <div className="relative flex h-full w-full flex-col items-center justify-evenly">
              <button
                onClick={() => setShowMenu(true)}
                className="bg-primary flex h-10 w-10 items-center justify-center self-start rounded-md text-white md:hidden"
              >
                <Menu />
              </button>
              {showMenu && (
                <div className="absolute left-0 z-[50] flex h-full w-full flex-row md:hidden">
                  <div className="flex h-full w-60 flex-col justify-between rounded-r-md border-r border-r-[#E5E5E5]/5 bg-[#222222] p-4 md:hidden">
                    <div className="flex flex-1 flex-col gap-4 border-b border-b-[#E5E5E5]/5">
                      <button className="flx-row flex w-full gap-2 rounded-md bg-[#E5E5E5]/5 p-4">
                        <div className="flex h-10 min-h-10 w-10 min-w-10 items-center justify-center rounded-full bg-[#019A5A]">
                          <StarIcon size={14} fill="white" />
                        </div>
                        <div className="flex h-full w-full flex-col justify-between text-start">
                          <h3 className="text-[12px]">Leonardo Cavalcanti</h3>
                          <p className="text-[10px] text-[#E5E5E5]/40">
                            Master LegisAIt
                          </p>
                        </div>
                      </button>
                      <div className="flex w-full flex-col justify-between gap-4 px-2 py-4">
                        {chats.map((ai, index) => (
                          <div
                            key={index}
                            className="flex w-full flex-row justify-between gap-2 px-2"
                          >
                            <button
                              className="flex max-w-[85%]"
                              onClick={() => {
                                handleChangeChat(ai);
                              }}
                            >
                              <h3 className="w-full truncate text-[12px]">
                                {ai.name}
                              </h3>
                            </button>
                            {/* <button onClick={() => handleRemoveThread(index)}>
                              <Trash size={16} />
                            </button> */}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setNewChat(true)}
                        className="flx-row flex w-full items-center gap-2 rounded-md bg-gradient-to-br from-[#019A5A]/70 to-[#019A5A]/80 px-2 py-1"
                      >
                        <Plus />
                        <h3 className="text-[12px]">Iniciar Novo Chat</h3>
                      </button>
                    </div>
                    <div className="mt-4 flex w-full flex-col justify-between gap-4 px-2 py-4">
                      <button className="flex flex-row gap-2">
                        <Trash size={16} />
                        <h3 className="text-[12px]">Limpar conversa</h3>
                      </button>
                      <button className="flex flex-row gap-2">
                        <MessageCircleQuestion size={16} />
                        <h3 className="text-[12px]">Ajudas para utilizar IA</h3>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="flex-1 bg-black opacity-40"
                  ></button>
                </div>
              )}

              <div className="flex flex-col items-center gap-2">
                <h1 className="self-center text-center text-3xl md:text-5xl">
                  Você está em {""}
                  <br className="md:hidden" />
                  <span className="bg-gradient-to-r from-[#097F4D] to-[#097F4D]/0">
                    {title}
                  </span>
                </h1>
                <h2 className="text-center">
                  O poder da IA ao seu serviço - Domine o conhecimento
                  Legislativo
                </h2>
              </div>

              <div className="border-t-primary mt-1 flex h-full w-full flex-col items-center justify-between gap-1 overflow-y-auto border-t md:mt-0 md:border-t-0">
                <Section
                  loadNewChat={newChat}
                  setLoadNewChat={setNewChat}
                  setLoadHistory={setLoadHistory}
                  loadOldChat={loadChat}
                  setLoadOldChat={setLoadChat}
                  prompts={prompts}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
