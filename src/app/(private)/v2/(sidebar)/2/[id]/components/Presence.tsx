"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

const mockPresence = [
    { id: 1, name: "Dep. João Silva", party: "PL", state: "SP", present: true, image: "" },
    { id: 2, name: "Dep. Maria Souza", party: "PT", state: "BA", present: true, image: "" },
    { id: 3, name: "Dep. Carlos Lima", party: "MDB", state: "RJ", present: false, image: "" },
    { id: 4, name: "Dep. Ana Pereira", party: "PP", state: "MG", present: true, image: "" },
    { id: 5, name: "Dep. Pedro Santos", party: "UNIÃO", state: "PE", present: true, image: "" },
    { id: 6, name: "Dep. Julia Costa", party: "PSOL", state: "SP", present: false, image: "" },
];

export function PresenceTab() {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1a1d1f]">Lista de Presença</h3>
            <span className="text-sm text-gray-500">{mockPresence.filter(p => p.present).length} Presentes / {mockPresence.length} Total</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
             {mockPresence.map((dep) => (
                 <div key={dep.id} className={`flex items-center gap-3 p-3 rounded-xl border ${dep.present ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                     <Avatar className="h-10 w-10 border border-gray-100">
                         <AvatarImage src={dep.image} />
                         <AvatarFallback><User size={16} className="text-gray-400" /></AvatarFallback>
                     </Avatar>
                     <div>
                         <div className="font-bold text-sm text-[#1a1d1f]">{dep.name}</div>
                         <div className="text-xs text-gray-500">{dep.party} - {dep.state}</div>
                     </div>
                     <div className={`ml-auto w-2 h-2 rounded-full ${dep.present ? 'bg-green-500' : 'bg-red-400'}`}></div>
                 </div>
             ))}
        </div>
    </div>
  );
}
