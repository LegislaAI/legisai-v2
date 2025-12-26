import { AiChat } from "@/components/v2/components/ai/AiChat";
import { Section1 } from "@/components/v2/components/home/Section1";
import { Tutorials } from "@/components/v2/components/tutorials/Tutorials";
import { Card } from "@/components/v2/components/ui/Card";

export default function HomePage() {

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-dark">Bem-vindo ao Legis AI</h1>
        <p className="text-gray-500 mt-2">
          Acompanhe mandatos, analise dados e obtenha insights com inteligência artificial.
        </p>
      </div>

      {/* Section 1: Politician Dashboard */}
      <section className="">
        <Section1 />
      </section>
      <div className="section"/>
 <div className="">
                <AiChat />
        </div>
<div className="section"/>

      {/* Section 2: AI Chat & Tutorials */}
      <div className="grid grid-cols-1 section  lg:grid-cols-3 w-full p-0  gap-6">
       
        {/* Tutorials - Takes 1 col */}
        <div className="col-span-2 lg:col-span-3 space-y-6">
           <Tutorials />
           
           {/* Placeholder for future widgets like Notifications or Calendar */}
           <Card className="p-4 bg-gradient-to-br from-secondary/10 to-transparent border-dashed border-2 border-secondary/20">
               <h3 className="font-semibold text-secondary mb-2">Novidades em Breve</h3>
               <p className="text-sm text-gray-500">
                 Estamos preparando novas ferramentas de análise preditiva para você.
               </p>
           </Card>
        </div>
      </div>
    </div>
  );
}
