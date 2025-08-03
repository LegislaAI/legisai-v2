"use client";
import { useRouter } from "next/navigation";
import { SignatureCard } from "./components/signatureCard";

export default function PredictionAi() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center">
      <h1 className="mb-4 text-3xl font-bold">IA Preditiva</h1>
      <p className="mb-12 w-full text-center text-lg xl:w-1/2">
        Uma tecnologia revolucionária que permite prever votações em Projetos de
        Lei, analisar as intenções dos parlamentares, entender seus votos,
        identificar os setores beneficiados e muito mais — tudo isso com o poder
        da Inteligência Artificial preditiva do LegisDados
      </p>
      <div className="flex flex-col items-center justify-center gap-4 xl:flex-row">
        <SignatureCard
          benefits={[
            "Verificar Notícias",
            "Uso de LegisAI",
            "Busca de Tramitações",
            "Dados e Insights de Politicos",
          ]}
          description="Acesso as principais funcionalidades do LegisAi para analise de dados e coleta de informações"
          isActive={true}
          name="Plano Inicial"
          price={0}
        />
        <SignatureCard
          benefits={[
            "Tudo do Plano Gratuito",
            "Análise Profunda de Politicos",
            "Geração de Documentos Avançados",
            "Análise Preditiva de Votações",
          ]}
          description="Uma tecnologia revolucionária que permite prever votações em Projetos de Lei, analisar as intenções dos parlamentares, entender seus votos."
          isActive={false}
          name="Preditivo"
          price={997}
          onClick={() => router.push("/checkout")}
        />
      </div>
    </div>
  );
}
