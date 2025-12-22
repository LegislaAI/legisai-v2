"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Key, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

import { Button } from "@/components/v2/components/ui/Button";
import { Card } from "@/components/v2/components/ui/Card";
import { Input } from "@/components/v2/components/ui/Input";
import { useApiContext } from "@/context/ApiContext";

// Schemas
const emailSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

const codeSchema = z.object({
  code: z.string().min(4, "Código inválido"),
});

const passwordSchema = z.object({
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function RecoverPassword2Page() {
  const { PostAPI, GetAPI } = useApiContext();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  // Forms
  const emailForm = useForm<z.infer<typeof emailSchema>>({ resolver: zodResolver(emailSchema) });
  const codeForm = useForm<z.infer<typeof codeSchema>>({ resolver: zodResolver(codeSchema) });
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });

  // Handlers
  const onEmailSubmit = async (data: z.infer<typeof emailSchema>) => {
    try {
      const response = await PostAPI("/password-code", { email: data.email }, false);
      if (response.status === 200 || response.status === 201) {
        setEmail(data.email);
        setStep(2);
        toast.success("Código enviado para seu e-mail!");
      } else {
        toast.error(response.body.message || "Erro ao enviar código");
      }
    } catch (error) {
      toast.error("Erro inesperado");
    }
  };

  const onCodeSubmit = async (data: z.infer<typeof codeSchema>) => {
    try {
        // Validate code first via GET as per specs
        const response = await GetAPI(`/password-code/${data.code}`, false);
        
        if (response.status === 200) {
            setCode(data.code);
            setStep(3);
            toast.success("Código validado!");
        } else {
             toast.error(response.body.message || "Código inválido");
        }
    } catch (error) {
      toast.error("Erro ao validar código");
    }
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      const response = await PostAPI("/influencer/password", {
        code: code,
        password: data.password,
      }, false);

      if (response.status === 200 || response.status === 201) {
        toast.success("Senha alterada com sucesso!");
        router.push("/v2/login");
      } else {
        toast.error(response.body.message || "Erro ao alterar senha");
      }
    } catch (error) {
      toast.error("Erro inesperado");
    }
  };

  return (
    <Card className="w-full max-w-md animate-fade-in relative">
      <div className="absolute top-6 left-6">
        {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="text-gray-400 hover:text-dark">
                <ArrowLeft className="h-5 w-5" />
            </button>
        )}
      </div>

      <div className="mb-6 text-center pt-2">
        <h2 className="text-2xl font-bold text-dark">Recuperar Senha</h2>
        <p className="mt-2 text-sm text-gray-500">
            {step === 1 && "Informe seu e-mail para receber o código."}
            {step === 2 && "Informe o código enviado para seu e-mail."}
            {step === 3 && "Crie sua nova senha."}
        </p>
      </div>

      {step === 1 && (
        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            icon={<Mail className="h-4 w-4" />}
            error={emailForm.formState.errors.email}
            {...emailForm.register("email")}
          />
          <Button type="submit" className="w-full" isLoading={emailForm.formState.isSubmitting}>
            Enviar Código
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-4">
          <Input
            label="Código de Verificação"
            placeholder="Digite o código"
            icon={<Key className="h-4 w-4" />}
            error={codeForm.formState.errors.code}
            {...codeForm.register("code")}
          />
          <Button type="submit" className="w-full" isLoading={codeForm.formState.isSubmitting}>
            Validar Código
          </Button>
           <div className="text-center mt-2">
            <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-xs text-secondary hover:underline"
            >
                Reenviar código?
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <Input
            label="Nova Senha"
            type="password"
            placeholder="********"
            icon={<Lock className="h-4 w-4" />}
            error={passwordForm.formState.errors.password}
            {...passwordForm.register("password")}
          />
          <Input
            label="Confirmar Senha"
            type="password"
            placeholder="********"
            icon={<CheckCircle2 className="h-4 w-4" />}
            error={passwordForm.formState.errors.confirmPassword}
            {...passwordForm.register("confirmPassword")}
          />
          <Button type="submit" className="w-full" isLoading={passwordForm.formState.isSubmitting}>
            Redefinir Senha
          </Button>
        </form>
      )}

      <div className="mt-6 text-center text-sm">
        <Link
          href="/v2/login"
          className="font-medium text-secondary hover:underline"
        >
          Voltar para Login
        </Link>
      </div>
    </Card>
  );
}
