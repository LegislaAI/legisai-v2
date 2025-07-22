"use client";
import { AuthFooter } from "@/components/ui/AuthFooter";
import { AuthHeader } from "@/components/ui/AuthHeader";
import { useApiContext } from "@/context/ApiContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const schemaRecover = z.object({
  email: z.string().email({ message: "Email inválido" }),
});

const schemaCode = z.object({
  code: z.string().min(6, "Código inválido"),
});

const schemaEdit = z
  .object({
    code: z.string(),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirmação de senha inválida"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas devem corresponder",
    path: ["confirmPassword"],
  });

interface RecoverFormData {
  email: string;
}

interface ValidateCodeFormData {
  code: string;
}

interface EditPasswordFormData {
  code: string;
  password: string;
  confirmPassword: string;
}

export default function RecoverPassword() {
  const router = useRouter();
  const { PostAPI, GetAPI } = useApiContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [isShowingPassword, setIsShowingPassword] = useState(false);
  const [isShowingConfirmPassword, setIsShowingConfirmPassword] =
    useState(false);
  const [recoverError, setRecoverError] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [timer, setTimer] = useState(10);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (currentStep === 2 && timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [currentStep, timer]);

  const {
    register: registerRecover,
    handleSubmit: handleSubmitRecover,
    formState: { errors: errorsRecover },
  } = useForm<RecoverFormData>({
    resolver: zodResolver(schemaRecover),
  });

  const {
    register: registerCode,
    handleSubmit: handleSubmitCode,
    formState: { errors: errorsCode },
  } = useForm<ValidateCodeFormData>({
    resolver: zodResolver(schemaCode),
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
  } = useForm<EditPasswordFormData>({
    resolver: zodResolver(schemaEdit),
  });

  async function HandleSendRecover(data: RecoverFormData) {
    setIsLogging(true);
    const response = await PostAPI(
      "/password-code",
      {
        email: data.email,
      },
      false,
    );
    setIsLogging(false);
    if (response.status === 200) {
      setEmail(data.email);
      setCurrentStep(2);
    } else {
      setRecoverError(response.body.message);
    }
  }

  async function HandleValidateCode(data: ValidateCodeFormData) {
    setIsLogging(true);
    const response = await GetAPI(`/password-code/${data.code}`, false);
    setIsLogging(false);
    if (response.status === 200) {
      setCurrentStep(3);
    }
    if (response.status === 201) {
      setCurrentStep(3);
    } else {
      toast.error("Código inválido ou expirado. Tente novamente.");
      setRecoverError("Código inválido ou expirado. Tente novamente.");
    }
  }

  async function handleResendCode() {
    setIsLogging(true);
    const response = await PostAPI("/password-code", { email }, false);
    setIsLogging(false);
    if (response.status === 200) {
      setTimer(120);
    } else {
      setRecoverError("Erro ao reenviar o código. Tente novamente.");
    }
  }

  async function HandleEditPassword(data: EditPasswordFormData) {
    setIsLogging(true);
    const response = await PostAPI(
      "/influencer/password",
      {
        code: data.code,
        password: data.password,
      },
      false,
    );
    setIsLogging(false);

    if (response.status === 200) {
      router.push("/login");
    } else {
      setRecoverError(response.body.message);
    }
  }

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
          <h1 className="text-xl font-bold md:text-3xl">
            {currentStep === 1
              ? "Recuperar Senha"
              : currentStep === 2
                ? "Validação de Código"
                : "Redefinir Senha"}
          </h1>
          <h2 className="text-lg text-[#8392AB]">
            {currentStep === 1
              ? "Digite seu e-mail para enviarmos um código de recuperação"
              : currentStep === 2
                ? "Insira o código de recuperação enviado para seu e-mail"
                : "Digite uma nova senha para sua conta"}
          </h2>

          {currentStep === 1 && (
            <form
              onSubmit={handleSubmitRecover(HandleSendRecover)}
              className="flex flex-col gap-2"
            >
              <label className="text-sm font-semibold text-[#252F40]">
                Email
              </label>
              <input
                placeholder="Digite seu email"
                {...registerRecover("email")}
                className="outline-secondary/50 focus:border-secondary/50 h-8 rounded-md border border-zinc-400 p-2 text-black"
                type="email"
                disabled={isLogging}
              />
              <div className="h-4">
                {errorsRecover.email && (
                  <span className="text-red-500">
                    {errorsRecover.email.message}
                  </span>
                )}
              </div>
              <div className="h-4 text-sm" />
              <span className="mt-2 h-6 text-red-500">
                {recoverError ? recoverError : ""}
              </span>

              <button
                type="submit"
                disabled={isLogging}
                className="bg-secondary mt-6 rounded-md border p-2 font-bold text-white"
              >
                {isLogging ? "Carregando..." : "Enviar Código"}
              </button>
            </form>
          )}

          {currentStep === 2 && (
            <form
              onSubmit={handleSubmitCode(HandleValidateCode)}
              className="flex flex-col gap-2"
            >
              <label className="text-sm font-semibold text-[#252F40]">
                Código de Recuperação
              </label>
              <input
                placeholder="Digite o código enviado para seu email"
                {...registerCode("code")}
                className="outline-secondary/50 focus:border-secondary/50 h-8 rounded-md border border-zinc-400 p-2 text-black"
                type="text"
                disabled={isLogging}
              />
              <div className="h-4">
                {errorsCode.code && (
                  <span className="text-red-500">
                    {errorsCode.code.message}
                  </span>
                )}
              </div>
              <div className="h-4 text-sm">
                {timer !== 0 ? (
                  <div className="text-sm text-gray-600">
                    Código expira em {Math.floor(timer / 60)}:
                    {timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
                  </div>
                ) : (
                  <button
                    onClick={handleResendCode}
                    className="text-sm text-blue-500 hover:underline"
                    disabled={isLogging}
                  >
                    Reenviar código
                  </button>
                )}
              </div>
              <span className="mt-2 h-6 text-red-500">
                {recoverError ? recoverError : ""}
              </span>
              <button
                type="submit"
                disabled={isLogging}
                className="bg-secondary mt-6 rounded-md border p-2 font-bold text-white"
              >
                {isLogging ? "Carregando..." : "Validar Código"}
              </button>
            </form>
          )}

          {currentStep === 3 && (
            <form
              onSubmit={handleSubmitEdit(HandleEditPassword)}
              className="flex flex-col gap-2"
            >
              <label className="text-md font-semibold text-[#252F40]">
                Nova Senha
              </label>
              <div className="outline-secondary/50 focus:border-secondary/50 flex flex-row items-center overflow-hidden rounded-md border border-zinc-400">
                <input
                  {...registerEdit("password")}
                  placeholder="Digite sua nova senha"
                  className="h-8 w-[90%] p-2 text-black outline-none"
                  type={isShowingPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setIsShowingPassword(!isShowingPassword)}
                  className="flex w-[10%] items-center justify-center"
                >
                  {isShowingPassword ? (
                    <EyeOff className="h-4 w-4 text-black" />
                  ) : (
                    <Eye className="h-4 w-4 text-black" />
                  )}
                </button>
              </div>
              {errorsEdit.password && (
                <span className="text-red-500">
                  {errorsEdit.password.message}
                </span>
              )}

              <label className="text-md font-semibold text-[#252F40]">
                Confirmar Nova Senha
              </label>
              <div className="outline-secondary/50 focus:border-secondary/50 flex flex-row items-center overflow-hidden rounded-md border border-zinc-400">
                <input
                  {...registerEdit("confirmPassword")}
                  placeholder="Confirme sua nova senha"
                  className="h-8 w-[90%] p-2 text-black outline-none"
                  type={isShowingConfirmPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() =>
                    setIsShowingConfirmPassword(!isShowingConfirmPassword)
                  }
                  className="flex w-[10%] items-center justify-center"
                >
                  {isShowingConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-black" />
                  ) : (
                    <Eye className="h-4 w-4 text-black" />
                  )}
                </button>
              </div>
              {errorsEdit.confirmPassword && (
                <span className="text-red-500">
                  {errorsEdit.confirmPassword.message}
                </span>
              )}
              {recoverError && (
                <span className="mt-2 text-red-500">{recoverError}</span>
              )}
              <button
                type="submit"
                disabled={isLogging}
                className="bg-secondary mt-6 rounded-md border p-2 font-bold text-white"
              >
                {isLogging ? "Carregando..." : "Redefinir Senha"}
              </button>
            </form>
          )}
          <button
            onClick={() => router.push("/login")}
            className="bg-secondary ml-1 cursor-pointer bg-clip-text text-sm font-bold text-transparent"
          >
            Voltar ao Login
          </button>
        </div>
        <AuthFooter />
      </div>
    </main>
  );
}
