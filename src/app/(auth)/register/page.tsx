"use client";
import { AuthFooter } from "@/components/ui/AuthFooter";
import { AuthHeader } from "@/components/ui/AuthHeader";
import { useApiContext } from "@/context/ApiContext";
import { maskCpfCnpj, maskPhone } from "@/lib/masks";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Eye, EyeOff } from "lucide-react";
import { useCookies } from "next-client-cookies";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const schema = z
  .object({
    email: z.string().email({ message: "Email inválido" }),
    name: z.string().min(1, "Nome é obrigatório"),
    phone: z.string().min(14, "Telefone inválido"),
    cpfCnpj: z.string().min(14, "CPF/CNPJ inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "A confirmação de senha deve ter pelo menos 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas devem corresponder",
    path: ["confirmPassword"],
  });
interface RegisterFormData {
  email: string;
  name: string;
  phone: string;
  cpfCnpj: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const [isShowingPassword, setIsShowingPassword] = useState(false);
  const [isShowingConfirmPassword, setIsShowingConfirmPassword] =
    useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [checkedTerms, setCheckedTerms] = useState(false);
  const [checkedPrivacy, setCheckedPrivacy] = useState(false);
  const [openTermsModal, setOpenTermsModal] = useState(false);
  const [openPrivacyModal, setOpenPrivacyModal] = useState(false);
  const { PostAPI, token, setToken } = useApiContext();
  const cookies = useCookies();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
    mode: "all",
  });

  async function handleRegister(data: RegisterFormData) {
    if (!checkedTerms || !checkedPrivacy) {
      toast.error("Aceite os termos e a politica de privacidade");
      return;
    }
    setIsRegistering(true);
    const response = await PostAPI(
      "/user/signup",
      {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpfCnpj: data.cpfCnpj,
        password: data.password,
      },
      false,
    );
    if (response.status === 200) {
      cookies.set(token, response.body.accessToken);
      setToken(response.body.accessToken);
      router.push("/plans");
    } else {
      toast.error("Erro ao registrar, tente novamente");
      if (response.body.message === "Resource already exists") {
        toast.error("Cpf, email ou telefone ja cadastrados");
        setRegisterError("Cpf, email ou telefone ja cadastrados");
      } else {
        setRegisterError(response.body.message!);
      }
      setIsRegistering(false);
    }
  }

  interface PhoneChangeEvent {
    target: {
      value: string;
    };
  }

  const handlePhoneChange = (event: PhoneChangeEvent): void => {
    const maskedValue: string = maskPhone(event.target.value);
    setValue("phone", maskedValue);
  };

  const handleCpfCnpjChange = (event: PhoneChangeEvent): void => {
    const maskedValue: string = maskCpfCnpj(event.target.value);
    setValue("cpfCnpj", maskedValue);
  };

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
        <div className="z-20 mt-32 flex w-full flex-col gap-2 pb-20 md:mt-20 md:w-[45%] xl:ml-[10%] xl:w-[40%] xl:gap-4">
          <h1 className="bg-clip-text text-2xl font-bold md:text-3xl">
            Cadastrar-se
          </h1>
          <h2 className="text-sm text-[#8392AB] md:text-lg">
            Preencha os dados abaixo para criar sua conta
          </h2>
          <form
            onSubmit={handleSubmit(handleRegister, (errors) =>
              console.error("Erros de validação:", errors),
            )}
            className="flex flex-col gap-2"
          >
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-[#252F40] 2xl:text-sm">
                Nome
              </label>
              <input
                {...register("name")}
                placeholder="Digite seu nome"
                className="outline-secondary/50 focus:border-secondary/50 h-8 rounded-md border border-zinc-400 p-2 text-black 2xl:h-8"
                type="text"
              />
              {errors.name && (
                <span className="text-red-500">{errors.name.message}</span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-[#252F40] 2xl:text-sm">
                CPF/CNPJ
              </label>
              <input
                {...register("cpfCnpj")}
                onChange={handleCpfCnpjChange}
                placeholder="Digite seu CPF ou CNPJ"
                className="outline-secondary/50 focus:border-secondary/50 h-8 rounded-md border border-zinc-400 p-2 text-black 2xl:h-8"
                type="text"
              />
              {errors.cpfCnpj && (
                <span className="text-red-500">{errors.cpfCnpj.message}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-[#252F40] 2xl:text-sm">
                Telefone
              </label>
              <input
                {...register("phone")}
                onChange={handlePhoneChange}
                placeholder="Digite seu telefone"
                className="outline-secondary/50 focus:border-secondary/50 h-8 rounded-md border border-zinc-400 p-2 text-black 2xl:h-8"
                type="text"
                maxLength={15}
              />
              {errors.phone && (
                <span className="text-red-500">{errors.phone.message}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-[#252F40] 2xl:text-sm">
                Email
              </label>
              <input
                {...register("email")}
                placeholder="Digite seu melhor email"
                className="outline-secondary/50 focus:border-secondary/50 h-8 rounded-md border border-zinc-400 p-2 text-black 2xl:h-8"
                type="email"
              />
              {errors.email && (
                <span className="text-red-500">{errors.email.message}</span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-[#252F40] 2xl:text-sm">
                Senha
              </label>
              <div className="outline-secondary/50 focus:border-secondary/50 flex flex-row items-center overflow-hidden rounded-md border border-zinc-400 bg-white">
                <input
                  {...register("password")}
                  placeholder="Digite sua senha"
                  className="h-8 w-[90%] bg-white p-2 text-black outline-none 2xl:h-8"
                  type={isShowingPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setIsShowingPassword(!isShowingPassword)}
                  className="flex w-[10%] items-center justify-center"
                >
                  {isShowingPassword ? (
                    <EyeOff className="text-secondary h-4 w-4" />
                  ) : (
                    <Eye className="text-secondary h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-500">{errors.password.message}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-[#252F40] 2xl:text-sm">
                Confirmar Senha
              </label>
              <div className="outline-secondary/50 focus:border-secondary/50 flex flex-row items-center overflow-hidden rounded-md border border-zinc-400 bg-white">
                <input
                  {...register("confirmPassword")}
                  placeholder="Confirme sua senha"
                  className="h-8 w-[90%] bg-white p-2 text-black outline-none 2xl:h-8"
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
                    <EyeOff className="text-secondary h-4 w-4" />
                  ) : (
                    <Eye className="text-secondary h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-red-500">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
            <div className="mt-2 mb-0 flex flex-col gap-2">
              <div className="flex w-full items-center gap-2">
                <div
                  onClick={() => setCheckedTerms(!checkedTerms)}
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border p-1",
                    checkedTerms && "bg-secondary",
                  )}
                >
                  {checkedTerms && <Check className="h-4 w-4 text-white" />}
                </div>
                <span
                  onClick={() => setCheckedTerms(!checkedTerms)}
                  className="cursor-pointer text-sm text-black"
                >
                  Li e concordo com os {""}
                  <a
                    className="hover:underline"
                    // onClick={() => setOpenTermsModal(true)}
                  >
                    Termos de Uso
                  </a>
                </span>
              </div>
              <div className="flex w-full items-center gap-2">
                <div
                  onClick={() => setCheckedPrivacy(!checkedPrivacy)}
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border p-1",
                    checkedPrivacy && "bg-secondary",
                  )}
                >
                  {checkedPrivacy && <Check className="h-4 w-4 text-white" />}
                </div>
                <span
                  onClick={() => setCheckedPrivacy(!checkedPrivacy)}
                  className="cursor-pointer text-sm text-black"
                >
                  Li e concordo com os {""}
                  <a
                    className="hover:underline"
                    // onClick={() => setOpenPrivacyModal(true)}
                  >
                    Política de Privacidade
                  </a>
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="bg-secondary rounded-md border p-2 font-bold text-white"
              disabled={isRegistering}
            >
              {isRegistering ? "Carregando..." : "Cadastrar"}
            </button>
            {registerError && (
              <span className="mt-2 text-red-500">{registerError}</span>
            )}
          </form>
          <span className="text-md text-[#8392AB]">
            Já possui uma conta?
            <button
              onClick={() => router.push("/login")}
              className="bg-secondary ml-1 cursor-pointer bg-clip-text font-bold text-transparent"
            >
              Entrar Agora
            </button>
          </span>
        </div>
        <AuthFooter />
      </div>

      {openTermsModal && (
        <>
          <div
            onClick={() => setOpenTermsModal(false)}
            className="bg-opacity-50 fixed top-0 right-0 bottom-0 left-0 z-20 flex items-center justify-center bg-white/20"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-1/2 left-1/2 z-[999999] flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-lg bg-white p-2 text-black shadow-lg md:w-[60%]"
            >
              <button
                onClick={() => setOpenTermsModal(false)}
                className="absolute top-0 left-0 p-1 text-[#FF0080]"
              >
                <ArrowLeft />{" "}
              </button>
              <Image
                alt=""
                width={1000}
                height={300}
                quality={100}
                src={"/logo.png"}
                className="mx-auto h-auto w-5/6 object-contain md:w-80"
              />
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry&apos;s standard dummy
              text ever since the 1500s, when an unknown printer took a galley
              of type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. It was
              popularised in the 1960s with the release of Letraset sheets
              containing Lorem Ipsum passages, and more recently with desktop
              publishing software like Aldus PageMaker including versions of
              Lorem Ipsum.
            </div>
          </div>
        </>
      )}
      {openPrivacyModal && (
        <>
          <div
            onClick={() => setOpenPrivacyModal(false)}
            className="bg-opacity-50 fixed top-0 right-0 bottom-0 left-0 z-20 flex items-center justify-center bg-black"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-1/2 left-1/2 z-[999999] flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-lg bg-white p-2 text-black shadow-lg md:w-[60%]"
            >
              <button
                onClick={() => setOpenPrivacyModal(false)}
                className="absolute top-0 left-0 p-1 text-[#FF0080]"
              >
                <ArrowLeft />{" "}
              </button>
              <Image
                alt=""
                width={1000}
                height={300}
                quality={100}
                src={"/logo.png"}
                className="mx-auto h-auto w-5/6 object-contain md:w-80"
              />
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry&apos;s standard dummy
              text ever since the 1500s, when an unknown printer took a galley
              of type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. It was
              popularised in the 1960s with the release of Letraset sheets
              containing Lorem Ipsum passages, and more recently with desktop
              publishing software like Aldus PageMaker including versions of
              Lorem Ipsum.
            </div>
          </div>
        </>
      )}
    </main>
  );
}
