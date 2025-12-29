"use client";

import { BackButton } from "@/components/v2/components/ui/BackButton";
import { Calendar, Clock, MapPin, PlayCircle, Users } from "lucide-react";
import { useState } from "react";
import { GeneralTab } from "./components/General";
import { PresenceTab } from "./components/Presence";
import { VotesTab } from "./components/Votes";

// Mock Session Data
const mockSession = {
  id: "1",
  title: "Comissão de Constituição e Justiça e de Cidadania - CCJC",
  subtitle:
    "Reunião Deliberativa Extraordinária destinada a debate da Reforma Tributária.",
  date: "2023-10-25",
  startTime: "09:00",
  endTime: "13:30",
  location: "Plenário 1, Anexo II",
  status: "realizada",
  quorum: 45,
  videoUrl: "https://youtube.com",
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    agendada: "bg-blue-100 text-blue-800",
    realizada: "bg-gray-200 text-gray-600",
    em_andamento: "bg-green-100 text-green-800 animate-pulse",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${styles[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
};

export default function CommissionDetailScreen() {
  const [activeTab, setActiveTab] = useState<"general" | "votes" | "presence">(
    "general",
  );

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-2 font-sans text-[#1a1d1f]">
      <div className="w-full space-y-6">
        <BackButton />
        {/* HEADER */}
        <header className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#749c5b] uppercase">
                <Users size={16} /> Comissão Permanente
              </div>
              <StatusBadge status={mockSession.status} />
            </div>

            <h1 className="mb-2 text-2xl font-bold text-[#1a1d1f] md:text-3xl">
              {mockSession.title}
            </h1>
            <p className="mb-6 text-gray-600 italic">{mockSession.subtitle}</p>

            <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 text-sm md:grid-cols-4">
              <div className="flex flex-col">
                <span className="mb-1 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                  <Calendar size={12} /> Data
                </span>
                <span className="font-medium">
                  {new Date(mockSession.date).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="mb-1 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                  <Clock size={12} /> Horário
                </span>
                <span className="font-medium">
                  {mockSession.startTime} - {mockSession.endTime}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="mb-1 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                  <MapPin size={12} /> Local
                </span>
                <span className="font-medium">{mockSession.location}</span>
              </div>
              <div className="flex flex-col">
                <span className="mb-1 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                  <Users size={12} /> Quórum
                </span>
                <span className="font-medium">
                  {mockSession.quorum} Deputados
                </span>
              </div>
            </div>
          </div>

          {/* Transmissão */}
          <div className="flex items-center justify-between bg-[#1a1d1f] p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="animate-pulse rounded-full bg-red-600 p-2">
                <PlayCircle size={20} className="fill-white text-red-600" />
              </div>
              <div>
                <div className="text-sm font-bold">Transmissão Disponível</div>
                <div className="text-xs text-gray-400">
                  Assista à gravação completa da reunião
                </div>
              </div>
            </div>
            <button
              onClick={() => window.open(mockSession.videoUrl)}
              className="text-dark rounded-lg bg-white px-4 py-2 text-xs font-bold transition-colors hover:bg-gray-200"
            >
              Assistir Agora
            </button>
          </div>
        </header>

        {/* TABS NAVIGATION */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: "general", label: "Visão Geral / Pauta" },
            { id: "votes", label: "Votações" },
            { id: "presence", label: "Lista de Presença" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-[#749c5b] text-white shadow-md"
                  : "border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <main className="min-h-[400px] rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          {activeTab === "general" && <GeneralTab />}
          {activeTab === "votes" && <VotesTab />}
          {activeTab === "presence" && <PresenceTab />}
        </main>
      </div>
    </div>
  );
}
