import { SignatureCard } from "./components/signatureCard";

export default function PredictionAi() {
  return (
    <div className="flex flex-col items-center">
      <h1 className="mb-4 text-3xl font-bold">IA Preditiva</h1>
      <p className="mb-8 w-1/2 text-center text-lg">
        Uma tecnologia revolucionária que permite prever votações em Projetos de
        Lei, analisar as intenções dos parlamentares, entender seus votos,
        identificar os setores beneficiados e muito mais — tudo isso com o poder
        da Inteligência Artificial preditiva do LegisDados
      </p>

      <div className="flex gap-4">
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
            "Analise Profunda de Politicos",
            "Geração de Documentos Avançados",
            "Análise Preditiva de Votações e Outros",
          ]}
          description="Uma tecnologia revolucionária que permite prever votações em Projetos de Lei, analisar as intenções dos parlamentares, entender seus votos."
          isActive={false}
          name="Preditivo"
          price={997}
        />
      </div>
    </div>
  );
}
