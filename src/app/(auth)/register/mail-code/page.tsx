"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function VerifyCode() {
  const router = useRouter();
  const length = 6;
  const [code, setCode] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<HTMLInputElement[]>([]);

  // Quando mudar um dígito, foca o próximo
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
  const handleSubmit = () => {
    toast.success(`Estamos quase la, agora escolha seu plano!`);
    router.push("/register/chose-plan");
  };
  const [timer, setTimer] = useState(10);
  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);
  return (
    <div className="flex h-full min-h-screen w-full flex-col-reverse items-center justify-center gap-20 bg-white p-4 md:gap-4 lg:h-screen lg:flex-row">
      <Image
        src="/static/login.png"
        alt=""
        width={500}
        height={500}
        className="h-full w-full rounded-2xl object-cover md:w-auto md:max-w-1/3"
      />
      <div className="relative flex h-full w-full items-center justify-center">
        <button
          onClick={() => router.push("/login")}
          className="absolute top-4 right-4 hidden cursor-pointer lg:block"
        >
          <span> Já possui conta?</span>
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
          <h1 className="text-4xl font-semibold">
            Enviamos um Código no seu WhatsApp
          </h1>
          <h4 className="text-base font-medium">
            Verifique a mensagem em seu WhatsApp para confirmar seu cadastro
          </h4>

          {/* Container dos 6 inputs */}
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
            disabled={code.some((d) => d === "")}
            onClick={handleSubmit}
            className="bg-primary h-12 rounded-3xl text-2xl font-semibold text-white disabled:opacity-60"
          >
            Entrar agora
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
