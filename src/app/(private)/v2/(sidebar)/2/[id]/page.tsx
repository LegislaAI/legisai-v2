"use client";

import { Calendar, Clock, MapPin, PlayCircle, Users } from "lucide-react";
import { useState } from "react";
import { GeneralTab } from "./components/General";
import { PresenceTab } from "./components/Presence";
import { VotesTab } from "./components/Votes";

// Mock Session Data
const mockSession = {
  id: "1",
  title: "Comissão de Constituição e Justiça e de Cidadania - CCJC",
  subtitle: "Reunião Deliberativa Extraordinária destinada a debate da Reforma Tributária.",
  date: "2023-10-25",
  startTime: "09:00",
  endTime: "13:30",
  location: "Plenário 1, Anexo II",
  status: "realizada",
  quorum: 45,
  videoUrl: "https://youtube.com"
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    agendada: "bg-blue-100 text-blue-800",
    realizada: "bg-gray-200 text-gray-600",
    em_andamento: "bg-green-100 text-green-800 animate-pulse",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${styles[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
};

export default function CommissionDetailScreen() {
  const [activeTab, setActiveTab] = useState<"general" | "votes" | "presence">("general");

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-2 font-sans text-[#1a1d1f]">
      <div className="w-full space-y-6 ">
        
        {/* HEADER */}
        <header className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
           <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-[#749c5b] font-semibold uppercase text-xs tracking-wider">
                      <Users size={16} /> Comissão Permanente
                  </div>
                  <StatusBadge status={mockSession.status} />
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-[#1a1d1f] mb-2">{mockSession.title}</h1>
              <p className="text-gray-600 italic mb-6">{mockSession.subtitle}</p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm border-t border-gray-100 pt-4">
                  <div className="flex flex-col">
                      <span className="text-gray-400 text-xs font-bold uppercase mb-1 flex items-center gap-2"><Calendar size={12}/> Data</span>
                      <span className="font-medium">{new Date(mockSession.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex flex-col">
                      <span className="text-gray-400 text-xs font-bold uppercase mb-1 flex items-center gap-2"><Clock size={12}/> Horário</span>
                      <span className="font-medium">{mockSession.startTime} - {mockSession.endTime}</span>
                  </div>
                  <div className="flex flex-col">
                      <span className="text-gray-400 text-xs font-bold uppercase mb-1 flex items-center gap-2"><MapPin size={12}/> Local</span>
                      <span className="font-medium">{mockSession.location}</span>
                  </div>
                  <div className="flex flex-col">
                      <span className="text-gray-400 text-xs font-bold uppercase mb-1 flex items-center gap-2"><Users size={12}/> Quórum</span>
                      <span className="font-medium">{mockSession.quorum} Deputados</span>
                  </div>
              </div>
           </div>
           
           {/* Transmissão */}
           <div className="bg-[#1a1d1f] text-white p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                   <div className="p-2 bg-red-600 rounded-full animate-pulse"><PlayCircle size={20} className="fill-white text-red-600" /></div>
                   <div>
                       <div className="font-bold text-sm">Transmissão Disponível</div>
                       <div className="text-xs text-gray-400">Assista à gravação completa da reunião</div>
                   </div>
               </div>
               <button onClick={() => window.open(mockSession.videoUrl)} className="px-4 py-2 bg-white text-dark text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">
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
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        activeTab === tab.id 
                        ? "bg-[#749c5b] text-white shadow-md" 
                        : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>

        {/* CONTENT */}
        <main className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 min-h-[400px]">
            {activeTab === "general" && <GeneralTab />}
            {activeTab === "votes" && <VotesTab />}
            {activeTab === "presence" && <PresenceTab />}
        </main>

      </div>
    </div>
  );
}
