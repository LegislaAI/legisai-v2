"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import { useCookies } from "next-client-cookies";
import Link from "next/link";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

import { LoginPayload } from "@/@types/v2/auth";
import { Button } from "@/components/v2/components/ui/Button";
import { Card } from "@/components/v2/components/ui/Card";
import { Input } from "@/components/v2/components/ui/Input";
import { useApiContext } from "@/context/ApiContext";
import { useLoadingContext } from "@/context/LoadingContext";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login2Page() {
  const { PostAPI, setToken } = useApiContext();
  const { handleNavigation } = useLoadingContext();
  const cookies = useCookies();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const payload: LoginPayload = {
        email: data.email,
        password: data.password,
      };

      const response = await PostAPI("/user/signin", payload, false);
      if (response.status === 200) {
        const token = response.body.accessToken;
        const cookieName =
          process.env.NEXT_PUBLIC_USER_TOKEN || "legisai-token";

        cookies.set(cookieName, token);
        setToken(token);

        toast.success("Login realizado com sucesso!");
        handleNavigation("/"); // Assuming dashboard is the target
      } else {
        toast.error(response.body.message || "Falha ao realizar login");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    }
  };

  return (
    <Card className="animate-fade-in w-full max-w-md">
      <div className="mb-6 text-center">
        <h2 className="text-dark text-2xl font-bold">Bem-vindo de volta!</h2>
        <p className="mt-2 text-sm text-gray-500">
          Insira suas credenciais para acessar sua conta.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email}
          {...register("email")}
        />

        <div className="space-y-1">
          <Input
            label="Senha"
            type="password"
            placeholder="********"
            icon={<Lock className="h-4 w-4" />}
            error={errors.password}
            {...register("password")}
          />
          <div className="flex justify-end">
            <Link
              href="/recover-password"
              className="text-secondary text-xs hover:underline"
            >
              Esqueceu a senha?
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Entrar
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-500">Não tem uma conta? </span>
        <Link
          href="/register"
          className="text-secondary font-medium hover:underline"
        >
          Cadastre-se
        </Link>
      </div>
    </Card>
  );
}
