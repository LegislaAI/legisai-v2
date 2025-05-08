import { Input } from "@/components/ui/Input";
import { Lock, Mail } from "lucide-react";
import Image from "next/image";

export default function Login() {
  return (
    <div className="flex h-screen w-full items-center bg-white p-4">
      <div className="] bg-light-dark h-full w-1/3 rounded-xl"></div>
      <div className="relative flex h-full w-full items-center justify-center">
        <div className="absolute top-4 right-4">
          <span>Ainda não tem conta?</span>
          <span className="text-primary ml-2 font-bold underline">
            Cadastre-se
          </span>
        </div>
        <div className="flex flex-col gap-4">
          <Image
            src="/logos/logo.png"
            alt=""
            width={500}
            height={500}
            className=""
          />
          <h1 className="text-4xl font-semibold">Entrar Agora</h1>
          <h4 className="text-base font-medium">
            Insira os dados abaixo para entrar no LegisDados
          </h4>
          <div className="relative w-full">
            <Mail className="text-dark absolute top-1/2 left-2 h-5 w-5 -translate-y-1/2" />
            <Input placeholder="Email" className="pl-8" />
          </div>
          <div className="relative w-full">
            <Lock className="text-dark absolute top-1/2 left-2 h-5 w-5 -translate-y-1/2" />
            <Input placeholder="Senha" className="pl-8" />
          </div>
          <div className="flex items-center gap-2">
            <div className="border-primary h-5 w-5 rounded-full border-2"></div>
            <span>Lembrar de mim</span>
          </div>
          <button className="bg-primary h-12 rounded-3xl text-2xl font-semibold text-white">
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}
