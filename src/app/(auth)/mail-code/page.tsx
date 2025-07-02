"use client";

import { AuthHeader } from "@/components/ui/AuthHeader";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function Login() {
  const router = useRouter();
  const length = 6;
  const [code, setCode] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<HTMLInputElement[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const val = e.target.value.replace(/\D/, ""); // só número
    if (!val) return;
    const newCode = [...code];
    newCode[idx] = val[0];
    setCode(newCode);

    // focar próximo
    if (idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  // Teclas especiais: Backspace e Enter
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number,
  ) => {
    if (e.key === "Backspace") {
      if (code[idx]) {
        // limpa este campo
        const newCode = [...code];
        newCode[idx] = "";
        setCode(newCode);
      } else if (idx > 0) {
        // volta ao anterior
        inputsRef.current[idx - 1]?.focus();
        const newCode = [...code];
        newCode[idx - 1] = "";
        setCode(newCode);
      }
    }

    if (e.key === "Enter" && idx === length - 1) {
      const finalCode = code.join("");
      if (finalCode.length === length) {
        console.log("Código completo:", finalCode);
        // aqui você pode chamar sua API ou fazer router.push
      }
    }
  };

  // Quando clicar em "Entrar agora"
  // const handleSubmit = () => {
  //   toast.success(`Estamos quase la, agora escolha seu plano!`);
  //   router.push("/register/chose-plan");
  // };
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
        src={"/static/login.png"}
        className="absolute right-0 z-10 hidden h-[95%] w-[40%] rounded-tl-lg rounded-bl-lg object-cover md:block"
        alt=""
        width={1000}
        height={2500}
      />
      <div className="relative z-10 flex h-[100vh] w-full flex-col overflow-hidden px-8 xl:px-20">
        <AuthHeader />
        <button
          onClick={() => router.back()}
          className="text-primary static top-4 left-4 flex flex-row items-center justify-center gap-2 self-start text-xs underline md:absolute md:text-base"
        >
          <ChevronLeft size={16} /> Voltar
        </button>
        <div className="z-20 mt-32 flex w-full flex-col gap-2 md:mt-40 md:w-[45%] xl:ml-[10%] xl:w-[40%] xl:gap-4">
          <h1 className="text-xl font-bold md:text-3xl">
            Enviamos um Código no seu WhatsApp
          </h1>
          <h2 className="text-lg text-[#8392AB]">
            Verifique a mensagem em seu WhatsApp
            <br /> para confirmar seu cadastro
          </h2>

          <div
            className={`flex w-full flex-row items-center justify-center gap-4 rounded-lg border ${code.length === 6 ? "border-primary" : "border-black"} p-2`}
          >
            {Array.from({ length }).map((_, idx) => (
              <input
                key={idx}
                type="text"
                inputMode="numeric"
                maxLength={1}
                placeholder="0"
                ref={(el: HTMLInputElement | null) => {
                  if (el) {
                    inputsRef.current[idx] = el;
                  }
                }}
                value={code[idx]}
                onChange={(e) => handleChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`w-10 text-center text-xl focus:border-b-1 focus:border-black focus:outline-none`}
              />
            ))}
          </div>
          <div className="h-4 text-sm">
            {timer !== 0 ? (
              <div className="text-sm text-gray-600">
                Não recebeu o código? Reenviar em {Math.floor(timer / 60)}:
                {timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
              </div>
            ) : (
              <button
                onClick={() => {
                  toast.success("Um novo código foi enviado");
                  setTimer(120);
                }}
                className="text-primary text-sm hover:underline"
              >
                Reenviar código
              </button>
            )}
          </div>
          <button
            // type="submit"
            type="button"
            onClick={() => router.push("/chose-plan")}
            className="bg-primary rounded-md border p-2 font-bold text-white"
          >
            Confirmar código
          </button>
          <span className="text-md mt-4 text-[#8392AB]">
            Ja tem conta ainda?
            <button
              onClick={() => router.push("/login")}
              className="bg-primary ml-1 cursor-pointer bg-clip-text font-bold text-transparent"
            >
              Entrar agora
            </button>
          </span>
        </div>
      </div>
    </main>
  );
}
