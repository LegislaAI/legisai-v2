"use client";

import { SignatureCard } from "@/app/(private)/(sidebar)/prediction-ai/components/signatureCard";
import { AuthHeader } from "@/components/ui/AuthHeader";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Login() {
  const router = useRouter();

  // Teclas especiais: Backspace e Enter

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
        <div className="z-20 mt-32 flex w-full flex-col gap-2 md:mt-40 md:w-[45%] xl:ml-[10%] xl:w-[40%] xl:gap-4">
          <h1 className="text-xl font-bold md:text-3xl">Escolha seu plano</h1>
          <h2 className="text-lg text-[#8392AB]">
            Selecione o plano que melhor se adequá ao seu perfil
          </h2>
          <div
            className={`flex w-full flex-col-reverse items-center justify-center gap-4 rounded-lg p-2 md:flex-row`}
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
      {/* <footer className="mt-auto flex h-24 w-full flex-col-reverse items-center justify-center pb-1 md:flex-col-reverse md:px-20 md:pb-0">
        <div className="md:text-md -mt-2 flex flex-row items-center gap-2 text-[10px] text-[#8392AB] md:mt-0 md:items-end md:text-sm">
          <span> Copyright © 2025 Software Criado por</span>
          <Image
            className="h-10 w-auto"
            alt=" "
            width={200}
            height={200}
            src={"/logoEx.png"}
          />
        </div>
        <div className="invisible flex w-full flex-col justify-center gap-2 p-4 text-[12px] text-[#8392AB] md:flex-row md:gap-4 md:px-20 md:text-sm">
          <div className="flex w-full flex-row justify-between gap-2 text-xs text-[#8392AB] md:w-auto md:gap-4 md:text-sm">
            <a className="w-1/3 md:w-auto">Empresa</a>
            <a className="w-1/3 md:w-auto">Sobre nós</a>
            <a className="w-1/3 md:w-auto">Preços</a>
          </div>
          <div className="flex w-full flex-row justify-between gap-2 text-xs text-[#8392AB] md:w-auto md:gap-4 md:text-sm">
            <a className="w-1/3 md:w-auto">Produtos</a>
            <a className="w-1/3 md:w-auto">Blog</a>
            <a className="w-1/3 md:w-auto">Redes Sociais</a>
          </div>
        </div>
      </footer> */}
    </main>
  );
}
