"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
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
      if (response.status === 200) {
        const token = response.body.accessToken;
        const cookieName =
          process.env.NEXT_PUBLIC_USER_TOKEN || "legisai-token";

        cookies.set(cookieName, token);
        setToken(token);

        toast.success("Login realizado com sucesso!");
        // Use full page navigation to ensure the cookie is sent to middleware
        window.location.href = "/";
      } else {
        toast.error(response.body.message || "Falha ao realizar login");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen bg-white flex overflow-hidden z-50">
      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        formData={registerData}
        setFormData={setRegisterData}
      />

      {/* Left Side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-20 relative z-10">
        <div className="max-w-md w-full mx-auto">
          <Link href="#" className="inline-block mb-12">
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
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Bem-vindo de volta!
            </h1>
            <p className="text-slate-500 mb-8">
              Insira seus dados para acessar o painel.
            </p>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className={`w-full px-4 py-3.5 rounded-xl border ${
                    errors.email
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 bg-slate-50"
                  } focus:bg-white focus:border-legis-dark focus:ring-4 focus:ring-legis-dark/5 outline-none transition-all`}
                  placeholder="seu@email.com"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Senha
                  </label>
                  <Link
                    href="/recover-password"
                    className="text-sm font-medium text-legis-light hover:text-legis-dark transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...register("password")}
                    className={`w-full px-4 py-3.5 rounded-xl border ${
                      errors.password
                        ? "border-red-500 bg-red-50"
                        : "border-slate-200 bg-slate-50"
                    } focus:bg-white focus:border-legis-dark focus:ring-4 focus:ring-legis-dark/5 outline-none transition-all pr-12`}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-legis-dark text-white font-bold rounded-xl shadow-lg hover:bg-legis-dark/90 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  "Entrando..."
                ) : (
                  <>
                    Entrar na Plataforma{" "}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-6 border-t border-slate-100">
              <p className="text-center text-slate-600 mb-4">
                Ainda não tem uma conta?
              </p>
              <button
                onClick={() => setRegisterOpen(true)}
                className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                Criar Nova Conta
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Visuals */}
      <div className="hidden lg:flex w-1/2 bg-legis-dark relative overflow-hidden items-center justify-center p-12">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-legis-light/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-legis-accent/10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 max-w-lg text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-12"
          >
            <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-semibold tracking-wider uppercase mb-6">
              Inteligência Legislativa
            </div>
            <h2 className="text-5xl font-bold leading-tight mb-6">
              Dados complexos, <br />
              <span className="text-legis-light">decisões simples.</span>
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              Monitore projetos de lei, analise riscos e antecipe tendências
              com a plataforma de RIG mais completa do Brasil.
            </p>
          </motion.div>

          {/* Stylized Floating Cards imitating Dashboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative h-64 w-full bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl"
          >
            {/* Fake Graph */}
            <div className="flex items-end justify-between h-32 mb-6 space-x-2">
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
              <div className="w-10 h-10 rounded-full bg-legis-light flex items-center justify-center">
                <CheckCircle className="text-white w-6 h-6" />
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
              className="absolute -right-4 -top-8 bg-white text-legis-dark p-4 rounded-xl shadow-xl font-bold border border-slate-100"
            >
              Success rate <span className="text-legis-light">98%</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
