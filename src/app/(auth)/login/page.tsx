"use client";
import { Input } from "@/components/ui/Input";
import { Lock, Mail } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Por favor, insira um email válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 dígitos"),
});

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    const validationResult = loginSchema.safeParse(formData);
    if (!validationResult.success) {
      validationResult.error.errors.forEach((error) =>
        toast.error(error.message),
      );
      return;
    }
    router.push("/");
  };

  return (
    <div className="flex h-full w-full flex-col-reverse items-center gap-4 bg-white p-4 lg:h-screen lg:flex-row">
      <Image
        src="/static/login.png"
        alt=""
        width={500}
        height={500}
        className="h-full w-auto max-w-1/3 rounded-2xl object-cover"
      />
      <div className="relative flex h-full w-full items-center justify-center">
        <button
          onClick={() => router.push("/register")}
          className="absolute top-4 right-4 hidden cursor-pointer lg:block"
        >
          <span>Ainda não tem conta?</span>
          <span className="text-primary ml-2 font-bold underline">
            Cadastre-se
          </span>
        </button>
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
            <Input
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="pl-8"
            />
          </div>
          <div className="relative w-full">
            <Lock className="text-dark absolute top-1/2 left-2 h-5 w-5 -translate-y-1/2" />
            <Input
              placeholder="Senha"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              className="pl-8"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="border-primary h-5 w-5 rounded-full border-2"></div>
            <span>Lembrar de mim</span>
          </div>
          <button
            onClick={handleSubmit}
            className="bg-primary h-12 rounded-3xl text-2xl font-semibold text-white"
          >
            Entrar
          </button>
          <span className="text-center md:hidden">Ainda não tem conta?</span>
          <button
            onClick={() => router.push("/register")}
            className="bg-primary h-8 w-[80%] self-center rounded-3xl text-lg font-semibold text-white md:hidden"
          >
            Cadastre se
          </button>
        </div>
      </div>
    </div>
  );
}
