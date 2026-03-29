"use client";

import { useChatPage } from "@/components/v2/components/chat/chat-history-handler";
import { SectionAi } from "@/components/v2/components/chat/SectionAi";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/v2/components/ui/accordion";
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
  X,
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
};
interface Category {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  description: string;
}

// Category definition (static config for styling/labels)
const CATEGORY_CONFIG: Record<string, Category> = {
  general: {
    id: "general",
    label: "IA de Proposições Legislativas",
    icon: Sparkles,
    color: "text-yellow-600 bg-yellow-100",
    description: "Assistente geral para tarefas diversas.",
  },
  politician: {
    id: "politician",
    label: "IA de Tramitação, Comissões e Estratégia Legislativa",
    icon: BrainCircuit,
    color: "text-green-600 bg-green-100",
    description: "Processo legislativo e regimento interno.",
  },
  juridic: {
    id: "juridic",
    label: "IA de Admissibilidade, Regimento e Técnica Legislativa",
    icon: Scale,
    color: "text-blue-600 bg-blue-100",
    description: "Análise de leis, constitucionalidade e regimentos.",
  },
  accounting: {
    id: "accounting",
    label: "IA de Sessões, Pauta e Votação",
    icon: BrainCircuit,
    color: "text-purple-600 bg-purple-100",
    description: "Orçamento, dados e impacto fiscal.",
  },
  doc: {
    id: "doc",
    label: "IA de Pareceres, Emendas e Relatoria",
    icon: BrainCircuit,
    color: "text-green-600 bg-green-100",
    description: "Processo legislativo e regimento interno.",
  },
};

export default function AiPage() {
  const apiContext = useApiContext();
  const { GetAPI } = apiContext;

  // State for Selection/Navigation
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState<
    { id: string; name: string; promptId: string; createdAt: string }[]
  >([]);

  const [loadOldChat, setLoadOldChat] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const {
    prompts,
    activeChatId,
    handleSelectPrompt,
    setActiveChatId,
    loadingPrompts,
    selectedPrompt,
    setSelectedPrompt,
  } = useChatPage("ai");

  // Helper to find prompt by ID
  const getPromptById = (promptId: string | undefined) => {
    if (!promptId) return null;
    return prompts.find((p) => p.id === promptId) || null;
  };

  // Helper to get category config by prompt type
  const getCategoryByType = (type: string | undefined) => {
    if (!type) return null;
    return CATEGORY_CONFIG[type] || CATEGORY_CONFIG["general"] || null;
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
  const [chatTotalPages, setChatTotalPages] = useState(1);
  const [currentLastPage, setCurrentLastPage] = useState(1);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchSidebarHistory = async (page: number = 1) => {
    const historyEndpoint = `/chat/ai?page=${page}`;
    setIsLoadingHistory(true);
    try {
      const res = await GetAPI(historyEndpoint, true);
      if (res.status === 200) {
        if (page === 1) {
          setHistoryList(res.body.chats || []);
        } else {
          setHistoryList((prev) => [...prev, ...res.body.chats]);
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
  }, []);

  // Handlers
  const handleNewChat = () => {
    setShowHistory(false);
    setSelectedPrompt(null);
    setActiveChatId(null);
    if (window.innerWidth < 768) setSidebarOpen(true);
  };

  // Group prompts by category
  const getPromptsByCategory = (catId: string) => {
    return prompts.filter(
      (p) =>
        p.type === catId ||
        (catId === "general" &&
          !["juridic", "politician", "accounting", "doc"].includes(p.type)),
    );
  };

  // Derived categories list based on available prompts + config
  const availableCategories = Object.keys(CATEGORY_CONFIG).map((key) => ({
    ...CATEGORY_CONFIG[key],
  }));

  return (
    <div
      className={cn(
        "relative flex h-[calc(100vh-90px)] w-full gap-2 overflow-hidden",
      )}
    >
      {/* 1. SELECTION SIDEBAR (Left) */}

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="animate-in fade-in absolute inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={cn(
          "z-30 flex flex-col rounded-l-2xl border-r border-gray-200 bg-white transition-all duration-300 ease-in-out",
          "absolute inset-y-0 left-0 h-full md:relative",
          isSidebarOpen
            ? "w-[95%] translate-x-0 shadow-2xl md:w-80 md:shadow-none"
            : "w-0 -translate-x-full overflow-hidden opacity-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div>
            <h2 className="text-dark flex items-center gap-2 text-xl font-bold">
              <Sparkles className="text-secondary fill-secondary/20" />
              Legis AI
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Selecione uma especialidade
            </p>
          </div>
          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} className="text-gray-400" />
          </Button>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <div className="flex w-full flex-row gap-1.5 rounded-xl bg-gray-100/80 p-1.5 shadow-inner backdrop-blur-sm">
            <button
              onClick={() => {
                setShowHistory(false);
              }}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 ease-out",
                !showHistory
                  ? "from-secondary shadow-secondary/30 scale-[1.02] bg-gradient-to-r to-green-600 text-white shadow-lg"
                  : "bg-transparent text-gray-500 hover:bg-white/60 hover:text-gray-700",
              )}
            >
              <Sparkles
                size={16}
                className={cn(
                  "transition-all",
                  !showHistory ? "fill-white/30" : "",
                )}
              />
              Categorias
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 ease-out",
                showHistory
                  ? "from-secondary shadow-secondary/30 scale-[1.02] bg-gradient-to-r to-green-600 text-white shadow-lg"
                  : "bg-transparent text-gray-500 hover:bg-white/60 hover:text-gray-700",
              )}
            >
              <History size={16} />
              Histórico
            </button>
          </div>
        </div>
        <ScrollArea className="flex w-full flex-1 p-4">
          {showHistory ? (
            // HISTORY VIEW
            <div className="flex w-full flex-col gap-4 overflow-hidden">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="from-secondary/20 rounded-lg bg-gradient-to-br to-green-100 p-1.5">
                    <History size={14} className="text-secondary" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600">
                    Conversas Recentes
                  </h3>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                  {historyList.length}
                </span>
              </div>

              <div className="flex w-full max-w-[calc(100%-8px)] flex-col space-y-2 overflow-hidden px-2">
                {isLoadingHistory && historyList.length === 0 ? (
                  <div className="flex flex-col gap-2 p-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-16 w-full animate-pulse rounded-xl bg-gray-100"
                      />
                    ))}
                  </div>
                ) : historyList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-3 rounded-full bg-gray-100 p-3">
                      <History size={24} className="text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">
                      Nenhuma conversa ainda
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Inicie um novo chat para começar
                    </p>
                  </div>
                ) : (
                  historyList.map((chat) => {
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
                          if (window.innerWidth < 768) setSidebarOpen(false);
                        }}
                        className={cn(
                          "group relative box-border w-full max-w-full overflow-hidden rounded-xl p-3 text-left transition-all duration-200",
                          loadOldChat === chat.id
                            ? "from-secondary/10 border-secondary/40 border-2 bg-gradient-to-r to-green-50 shadow-md"
                            : "border border-gray-100 bg-white hover:scale-[1.01] hover:border-gray-200 hover:shadow-sm",
                        )}
                      >
                        {/* Active indicator bar */}
                        {loadOldChat === chat.id && (
                          <div className="from-secondary absolute top-0 bottom-0 left-0 w-1 rounded-l-xl bg-gradient-to-b to-green-500" />
                        )}

                        <div className="flex items-start gap-3 overflow-hidden">
                          {/* Icon */}
                          <div
                            className={cn(
                              "shrink-0 rounded-lg p-2 transition-all",
                              loadOldChat === chat.id
                                ? "bg-secondary text-white shadow-sm"
                                : "group-hover:bg-secondary/10 group-hover:text-secondary bg-gray-100 text-gray-500",
                            )}
                          >
                            <CategoryIcon size={16} />
                          </div>

                          {/* Content */}
                          <div
                            className="w-full max-w-full min-w-0 flex-1 overflow-hidden"
                            style={{ maxWidth: "190px" }}
                          >
                            <div
                              className={cn(
                                "mb-0.5 truncate text-sm font-semibold",
                                loadOldChat === chat.id
                                  ? "text-secondary"
                                  : "text-gray-700",
                              )}
                            >
                              {chat?.name || "Nova conversa"}
                            </div>

                            {prompt?.name && (
                              <div className="mb-1 block w-full max-w-full overflow-hidden text-[11px] text-ellipsis whitespace-nowrap text-gray-400">
                                {prompt.name}
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-[11px] text-gray-400">
                              {category && (
                                <>
                                  <span
                                    className={cn(
                                      "max-w-[80px] truncate rounded px-1.5 py-0.5 text-[10px] font-medium",
                                      category.color,
                                    )}
                                  >
                                    {category.label.replace("IA ", "")}
                                  </span>
                                  <span className="h-1 w-1 shrink-0 rounded-full bg-gray-300" />
                                </>
                              )}
                              <span className="shrink-0">
                                {moment(chat?.createdAt).format("DD/MM")}
                              </span>
                              <span className="shrink-0">
                                {moment(chat?.createdAt).format("HH:mm")}
                              </span>
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
                    className="hover:text-secondary mt-2 w-full text-xs text-gray-400"
                    onClick={() => fetchSidebarHistory(currentLastPage + 1)}
                  >
                    Carregar mais
                  </Button>
                )}
                {isLoadingHistory && historyList.length > 0 && (
                  <div className="flex justify-center p-2">
                    <div className="border-secondary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <Accordion
                type="single"
                collapsible
                className="space-y-4"
                defaultValue="general"
              >
                {availableCategories.map((category) => (
                  <AccordionItem
                    key={category.id}
                    value={category.id}
                    className="border-none"
                  >
                    <AccordionTrigger className="rounded-lg px-2 py-2 transition-all hover:bg-gray-50 hover:no-underline [&[data-state=open]]:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={cn("rounded-lg p-2", category.color)}>
                          <category.icon size={18} />
                        </div>
                        <div className="w-full text-left">
                          <div className="text-sm font-bold text-gray-700">
                            {category.label}
                          </div>
                          <div className="max-w-[160px] truncate text-[10px] font-normal text-gray-400">
                            {category.description}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pt-2 pb-0">
                      <div className="ml-9 space-y-1 border-l-2 border-gray-100 pl-2">
                        {loadingPrompts ? (
                          <div className="flex flex-col gap-2 py-2">
                            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                          </div>
                        ) : (
                          getPromptsByCategory(category.id).map((prompt) => (
                            <button
                              key={prompt.id}
                              onClick={() => handleSelectPrompt(prompt)}
                              className={cn(
                                "flex w-full items-center gap-2 rounded-md p-2 text-left text-xs font-medium transition-all",
                                selectedPrompt?.id === prompt.id
                                  ? "bg-secondary text-white shadow-md"
                                  : "hover:text-dark text-gray-600 hover:bg-gray-100",
                              )}
                            >
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  selectedPrompt?.id === prompt.id
                                    ? "bg-white"
                                    : "bg-gray-300",
                                )}
                              ></span>
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
            className="bg-secondary hover:bg-secondary/90 w-full border border-transparent text-white shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Chat
          </Button>
        </div>
      </div>

      {/* 2. CHAT AREA (Main) */}
      <div
        className={cn(
          "relative flex h-full w-full flex-1 flex-col overflow-hidden rounded-r-2xl bg-white",
          !isSidebarOpen ? "rounded-l-2xl" : "rounded-l-none",
        )}
      >
        <div className="h-full flex-1 overflow-hidden shadow-sm ring-1 ring-gray-100">
          {selectedPrompt ? (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-gray-100 bg-white p-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setSidebarOpen(!isSidebarOpen)}
                    className="hover:text-dark -ml-2 hidden text-gray-400 md:flex"
                  >
                    <ChevronRight
                      className={cn(
                        "rotate-180 transition-all duration-300 ease-in-out",
                        !isSidebarOpen && "rotate-0",
                      )}
                      size={20}
                    />
                  </Button>
                  <div className={cn("hidden transition-all md:block")}>
                    <div className="flex items-center gap-2">
                      <div className="from-secondary flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br to-green-700 text-white shadow-md ring-2 ring-white">
                        <Bot size={20} />
                      </div>
                      <h3 className="text-dark font-bold">
                        {selectedPrompt?.name || "Legis AI"}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(!isSidebarOpen)}
                    className={cn("block transition-all md:hidden")}
                  >
                    <div className="flex items-center gap-2">
                      <div className="from-secondary flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br to-green-700 text-white shadow-md ring-2 ring-white">
                        <Menu size={20} />
                      </div>
                      <h3 className="text-dark font-bold">
                        {selectedPrompt?.name || "Legis AI"}
                      </h3>
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
            <div className="relative flex h-full flex-col items-center justify-center bg-gradient-to-b from-gray-50/50 to-white p-4 px-2 text-center md:px-8">
              <div className="group relative mb-4">
                <div className="from-secondary absolute inset-0 rounded-full bg-gradient-to-r to-green-400 opacity-20 blur-xl transition-all duration-700 group-hover:opacity-30"></div>
                <div className="relative flex h-20 w-20 transform items-center justify-center rounded-full bg-white shadow-xl ring-8 ring-white/50 transition-transform duration-500 group-hover:scale-105">
                  <Bot size={52} className="text-secondary drop-shadow-sm" />
                </div>
              </div>

              <h2 className="mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
                Bem-vindo ao Legis AI
              </h2>
              <p className="mb-4 max-w-lg text-base leading-relaxed text-gray-500">
                Sua central de inteligência legislativa. Selecione uma{" "}
                <strong className="text-secondary font-semibold">
                  persona especializada
                </strong>{" "}
                abaixo para iniciar.
              </p>

              {/* Navigation Header (Back Button) */}
              {selectedCategory && (
                <div className="animate-in fade-in slide-in-from-bottom-2 mb-6 flex w-full max-w-2xl flex-row items-center gap-4">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="group hover:border-secondary hover:text-secondary rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 transition-all duration-300 hover:shadow-md"
                  >
                    <ChevronLeft
                      size={20}
                      className="transition-transform group-hover:-translate-x-0.5"
                    />
                  </button>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "rounded-lg bg-gray-50 p-2",
                        selectedCategory.color,
                      )}
                    >
                      <selectedCategory.icon size={20} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-gray-800">
                        {selectedCategory.label}
                      </h3>
                      <p className="text-xs text-gray-400">
                        Selecione um prompt para começar
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="h-max overflow-y-auto p-4">
                <div className="animate-in fade-in slide-in-from-bottom-4 grid w-full max-w-2xl grid-cols-1 gap-4 duration-500 md:grid-cols-2">
                  {selectedCategory ? (
                    <>
                      {getPromptsByCategory(selectedCategory.id).map(
                        (item, i) => (
                          <button
                            key={i}
                            onClick={() => handleSelectPrompt(item)}
                            className="group hover:border-secondary/30 relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 text-left shadow-sm transition-all duration-300 hover:shadow-xl"
                          >
                            <div className="from-secondary/0 via-secondary/0 to-secondary/0 group-hover:via-secondary/5 group-hover:to-secondary/10 absolute inset-0 bg-gradient-to-r transition-all duration-500" />
                            <div>
                              <div className="text-secondary flex h-10 w-10 shrink-0 flex-row items-center justify-center rounded-xl bg-gray-50 transition-all group-hover:bg-white group-hover:shadow-sm md:flex-col">
                                <Sparkles
                                  size={20}
                                  className="absolute opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                />
                                <div className="bg-secondary/40 h-2 w-2 rounded-full transition-opacity group-hover:opacity-0" />
                              </div>

                              <div className="relative z-10 text-left">
                                <div className="group-hover:text-secondary text-sm font-bold text-gray-700 transition-colors">
                                  {item.name}
                                </div>
                              </div>
                              <p className="mt-0.5 line-clamp-2 hidden text-xs text-gray-400 group-hover:text-gray-500 md:block">
                                Clique para iniciar esta conversa
                              </p>
                            </div>

                            <ChevronRight
                              size={16}
                              className="group-hover:text-secondary ml-auto text-gray-300 transition-all group-hover:translate-x-1"
                            />
                          </button>
                        ),
                      )}
                    </>
                  ) : (
                    <>
                      {Object.values(CATEGORY_CONFIG).map((item, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSelectedCategory(item);
                          }}
                          className="group hover:border-secondary/30 flex cursor-pointer flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-2 text-center shadow-sm transition-all duration-300 hover:shadow-lg sm:items-start sm:text-left md:flex-row md:items-center md:gap-4 md:p-5"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "shrink-0 rounded-xl p-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md",
                                item.color,
                              )}
                            >
                              <item.icon size={24} />
                            </div>
                            <div className="md:flex-1">
                              <div className="group-hover:text-secondary mb-1 text-base font-bold text-gray-800 transition-colors">
                                {item.label}
                              </div>
                              <div className="hidden text-xs leading-relaxed font-medium text-gray-500 md:block">
                                {item.description}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs leading-relaxed font-medium text-gray-500 md:hidden">
                            {item.description}
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
              {!isSidebarOpen && (
                <Button
                  onClick={() => setSidebarOpen(true)}
                  className="hover:text-secondary hover:border-secondary mt-12 rounded-full border border-gray-200 bg-white px-8 text-gray-600 shadow-sm transition-all hover:bg-gray-50"
                >
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
