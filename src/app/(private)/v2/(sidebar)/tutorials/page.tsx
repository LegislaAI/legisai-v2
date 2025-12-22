"use client";

import { TutorialsSection } from "@/components/v2/components/tutorials/TutorialsSection";
import { PlayCircle } from "lucide-react";

export default function TutorialsPage() {
  return (
    <div className="min-h-screen w-full bg-[#f4f4f4] p-6 font-sans text-[#1a1d1f]">
      <div className="w-full space-y-8">
        
        {/* HEADER */}
        <div>
             <h1 className="text-3xl font-bold text-[#1a1d1f] flex items-center gap-3 mb-2">
                 <div className="p-2 bg-[#749c5b] rounded-xl text-white shadow-lg shadow-[#749c5b]/20">
                     <PlayCircle size={24} />
                 </div>
                 Central de Tutoriais
             </h1>
             <p className="text-gray-600 max-w-2xl">
                 Aprenda a utilizar todos os recursos do LegisAI com nossos vídeos passo a passo.
             </p>
        </div>

        <TutorialsSection />
        
      </div>
    </div>
  );
}
