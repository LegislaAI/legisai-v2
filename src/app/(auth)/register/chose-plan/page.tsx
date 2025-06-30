"use client";
import { SignatureCard } from "@/app/(private)/(sidebar)/prediction-ai/components/signatureCard";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyCode() {
  const router = useRouter();

  const [timer, setTimer] = useState(10);
  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);
  return (
    <div className="flex h-full min-h-screen w-full flex-col-reverse items-center justify-center gap-20 bg-white p-4 md:gap-4 lg:h-screen lg:flex-row">
      <Image
        src="/static/login.png"
        alt=""
        width={500}
        height={500}
        className="h-full w-full rounded-2xl object-cover md:w-auto md:max-w-1/3"
      />
      <div className="relative flex h-full w-full items-center justify-center">
        <div className="flex flex-col gap-4">
          <Image
            src="/logos/logo.png"
            alt=""
            width={500}
            height={500}
            className=""
          />
          <h1 className="text-4xl font-semibold">Escolha seu plano:</h1>

          {/* Container dos 6 inputs */}
          <div
            className={`flex w-full flex-row items-center justify-center gap-4 rounded-lg p-2`}
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
                "Analise Profunda de Politicos",
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
      </div>
    </div>
  );
}
