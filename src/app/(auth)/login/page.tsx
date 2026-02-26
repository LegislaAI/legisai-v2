"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { LoginPayload } from "@/@types/v2/auth";
import RegisterModal from "@/components/RegisterModal";
import { useApiContext } from "@/context/ApiContext";
import { useCookies } from "next-client-cookies";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface RegisterFormData {
  name: string;
  doc: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  profession: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
}

export default function Login2Page() {
  const { PostAPI, setToken } = useApiContext();
  const cookies = useCookies();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    name: "",
    doc: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    profession: "",
    cep: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
  });

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
      console.log(response);
      if (response.status === 200) {
        const token = response.body.accessToken;
        const cookieName =
          process.env.NEXT_PUBLIC_USER_TOKEN || "legisai-token";

        cookies.set(cookieName, token);
        setToken(token);

        toast.success("Login realizado com sucesso!");
        const returnUrl = searchParams.get("returnUrl");
        const redirect =
          returnUrl &&
          returnUrl.startsWith("/") &&
          !returnUrl.startsWith("//")
            ? returnUrl
            : "/";
        window.location.href = redirect;
      } else {
        toast.error(response.body.message || "Falha ao realizar login");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen overflow-hidden bg-white">
      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        formData={registerData}
        setFormData={setRegisterData}
      />

      {/* Left Side: Login Form */}
      <div className="relative z-10 flex w-full flex-col justify-center p-8 md:p-12 lg:w-1/2 lg:p-20">
        <div className="mx-auto w-full max-w-md">
          <Link href="#" className="mb-12 inline-block">
            <img
              src="/logos/logo.png"
              alt="LegisDados"
              className="h-32 w-max object-contain"
            />
          </Link>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mb-2 text-3xl font-bold text-slate-900 md:text-4xl">
              Bem-vindo de volta!
            </h1>
            <p className="mb-8 text-slate-500">
              Insira seus dados para acessar o painel.
            </p>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  E-mail
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className={`w-full rounded-xl border px-4 py-3.5 ${
                    errors.email
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 bg-slate-50"
                  } focus:border-legis-dark focus:ring-legis-dark/5 transition-all outline-none focus:bg-white focus:ring-4`}
                  placeholder="seu@email.com"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-semibold text-slate-700">
                    Senha
                  </label>
                  <Link
                    href="/recover-password"
                    className="text-legis-light hover:text-legis-dark text-sm font-medium transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...register("password")}
                    className={`w-full rounded-xl border px-4 py-3.5 ${
                      errors.password
                        ? "border-red-500 bg-red-50"
                        : "border-slate-200 bg-slate-50"
                    } focus:border-legis-dark focus:ring-legis-dark/5 pr-12 transition-all outline-none focus:bg-white focus:ring-4`}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-legis-dark hover:bg-legis-dark/90 group flex w-full items-center justify-center rounded-xl py-4 font-bold text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  "Entrando..."
                ) : (
                  <>
                    Entrar na Plataforma{" "}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 border-t border-slate-100 pt-6">
              <p className="mb-4 text-center text-slate-600">
                Ainda não tem uma conta?
              </p>
              <button
                onClick={() => setRegisterOpen(true)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                Criar Nova Conta
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Visuals */}
      <div className="bg-legis-dark relative hidden w-1/2 items-center justify-center overflow-hidden p-12 lg:flex">
        {/* Background Elements */}
        <div className="bg-legis-light/20 absolute top-0 right-0 h-[600px] w-[600px] translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />
        <div className="bg-legis-accent/10 absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/2 translate-y-1/2 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-lg text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-12"
          >
            <div className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
              Inteligência Legislativa
            </div>
            <h2 className="mb-6 text-5xl leading-tight font-bold">
              Dados complexos, <br />
              <span className="text-legis-light">decisões simples.</span>
            </h2>
            <p className="text-lg leading-relaxed text-slate-300">
              Monitore projetos de lei, analise riscos e antecipe tendências com
              a plataforma de RIG mais completa do Brasil.
            </p>
          </motion.div>

          {/* Stylized Floating Cards imitating Dashboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative h-64 w-full rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl"
          >
            {/* Fake Graph */}
            <div className="mb-6 flex h-32 items-end justify-between space-x-2">
              {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 1 }}
                  className={`w-full rounded-t-sm ${
                    i === 3 ? "bg-legis-accent" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-legis-light flex h-10 w-10 items-center justify-center rounded-full">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold">PL 490/2007 Aprovado</div>
                <div className="text-xs text-slate-400">Há 2 minutos</div>
              </div>
            </div>

            {/* Floating Element */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="text-legis-dark absolute -top-8 -right-4 rounded-xl border border-slate-100 bg-white p-4 font-bold shadow-xl"
            >
              Success rate <span className="text-legis-light">98%</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
