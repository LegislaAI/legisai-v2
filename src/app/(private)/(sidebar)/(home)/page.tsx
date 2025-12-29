import { AiChat } from "@/components/v2/components/ai/AiChat";
import { Section1 } from "@/components/v2/components/home/Section1";
import { Tutorials } from "@/components/v2/components/tutorials/Tutorials";

export default function HomePage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 pb-20 duration-500">
      {/* Welcome Section */}
      <div>
        <h1 className="text-dark text-3xl font-bold">Bem-vindo ao Legis AI</h1>
        <p className="mt-2 text-gray-500">
          Acompanhe mandatos, analise dados e obtenha insights com inteligência
          artificial.
        </p>
      </div>

      {/* Section 1: Politician Dashboard */}
      <section className="">
        <Section1 />
      </section>
      <div className="section" />
      <div className="">
        <AiChat />
      </div>
      <div className="section" />

      {/* Section 2: AI Chat & Tutorials */}
      <div className="section grid w-full grid-cols-1 gap-6 p-0 lg:grid-cols-3">
        {/* Tutorials - Takes 1 col */}
        <div className="col-span-2 space-y-6 lg:col-span-3">
          <Tutorials />
        </div>
      </div>
    </div>
  );
}
