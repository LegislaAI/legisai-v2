"use client";
import { SignatureCard } from "@/app/(private)/v0/(sidebar)/prediction-ai/components/signatureCard";
import { AuthFooter } from "@/components/ui/AuthFooter";
import { AuthHeader } from "@/components/ui/AuthHeader";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Plans() {
  const router = useRouter();
  const [timer, setTimer] = useState(10);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white">
      <Image
        src={"/static/register2.png"}
        className="absolute top-0 right-0 z-10 hidden h-[95%] w-[40%] rounded-bl-lg object-cover md:block"
        alt=""
        width={1000}
        height={2500}
      />
      <div className="relative z-10 flex min-h-[100vh] w-full flex-col overflow-hidden px-8 xl:px-20">
        <AuthHeader />
        <div className="z-20 mt-32 flex w-full flex-col gap-2 pb-20 md:mt-20 md:w-[45%] xl:ml-[10%] xl:w-[40%] xl:gap-4">
          <h1 className="text-xl font-bold md:text-3xl">Escolha seu plano</h1>
          <h2 className="text-sm text-[#8392AB] lg:text-lg">
            Selecione o plano que melhor se adequá ao seu perfil
          </h2>
          <div
            className={`flex w-full flex-col-reverse items-center justify-center gap-4 rounded-lg p-2 lg:flex-row`}
          >
            <SignatureCard
              benefits={[
                "Verificar Notícias",
                "Uso de LegisAI",
                "Busca de Tramitações",
                "Dados e Insights de Politicos",
              ]}
              description="Acesso as principais funcionalidades do LegisAi para analise de dados e coleta de informações"
              isActive={false}
              onClick={() => router.push("/")}
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
              onClick={() => router.push("/checkout")}
              name="Preditivo"
              price={997}
            />
          </div>
        </div>
        <AuthFooter />
      </div>
    </main>
  );
}
