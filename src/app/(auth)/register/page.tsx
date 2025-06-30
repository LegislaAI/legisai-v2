"use client";
import { Input } from "@/components/ui/Input";
import { CreditCard, Lock, Mail, Phone, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  return (
    <div className="flex h-full w-full flex-col-reverse items-center gap-4 bg-white p-4 lg:h-screen lg:flex-row">
      <Image
        src="/static/login.png"
        alt=""
        width={500}
        height={500}
        className="h-full w-1/2 max-w-1/2 rounded-2xl object-cover"
      />
      <div className="relative flex h-full w-1/2 items-center justify-center">
        <button
          onClick={() => router.push("/login")}
          className="absolute top-4 right-4 hidden cursor-pointer lg:block"
        >
          <span> Ja possui conta?</span>
          <span className="text-primary ml-2 font-bold underline">Entrar</span>
        </button>
        <div className="flex flex-col gap-4">
          <Image
            src="/logos/logo.png"
            alt=""
            width={500}
            height={500}
            className=""
          />
          <h1 className="text-4xl font-semibold">Criar minha Conta</h1>
          <h4 className="text-base font-medium">
            Insira os dados abaixo para criar sua conta no LegisDados
          </h4>
          <div className="relative w-full">
            <User className="text-dark absolute top-1/2 left-2 h-5 w-5 -translate-y-1/2" />
            <Input placeholder="Nome" className="pl-8" />
          </div>
          <div className="relative w-full">
            <CreditCard className="text-dark absolute top-1/2 left-2 h-5 w-5 -translate-y-1/2" />
            <Input placeholder="CPF/CNPJ" className="pl-8" />
          </div>
          <div className="relative w-full">
            <Phone className="text-dark absolute top-1/2 left-2 h-5 w-5 -translate-y-1/2" />
            <Input placeholder="Telefone" className="pl-8" />
          </div>
          <div className="relative w-full">
            <Mail className="text-dark absolute top-1/2 left-2 h-5 w-5 -translate-y-1/2" />
            <Input placeholder="Email" className="pl-8" />
          </div>
          <div className="relative w-full">
            <Lock className="text-dark absolute top-1/2 left-2 h-5 w-5 -translate-y-1/2" />
            <Input placeholder="Senha" className="pl-8" />
          </div>
          <div className="relative w-full">
            <Lock className="text-dark absolute top-1/2 left-2 h-5 w-5 -translate-y-1/2" />
            <Input placeholder="Confirmar Senha" className="pl-8" />
          </div>
          <div className="flex items-center gap-2">
            <div className="border-primary h-5 w-5 rounded-full border-2"></div>
            <span>Salvar Senha</span>
          </div>
          <button
            onClick={() => router.push("/register/mail-code")}
            className="bg-primary h-12 rounded-3xl text-2xl font-semibold text-white"
          >
            Criar conta
          </button>
          <span className="text-center md:hidden">Ja possui conta?</span>
          <button
            onClick={() => router.push("/login")}
            className="bg-primary h-8 w-[80%] self-center rounded-3xl text-lg font-semibold text-white md:hidden"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}
