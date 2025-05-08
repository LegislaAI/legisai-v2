"use client";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

export function Votes() {
  const positiveVotes = [
    { name: "Samuel Viana", party: "PT", state: "MG" },
    { name: "Ana Silva", party: "PSDB", state: "SP" },
    { name: "Carlos Souza", party: "MDB", state: "RJ" },
    { name: "Mariana Lima", party: "DEM", state: "BA" },
    { name: "Pedro Santos", party: "PSOL", state: "RS" },
    { name: "Lucas Oliveira", party: "Novo", state: "PR" },
    { name: "Fernanda Costa", party: "PT", state: "MG" },
    { name: "João Almeida", party: "PSDB", state: "SP" },
    { name: "Ricardo Pereira", party: "MDB", state: "RJ" },
    { name: "Patrícia Gomes", party: "DEM", state: "BA" },
    { name: "Roberto Nunes", party: "PSOL", state: "RS" },
    { name: "Gabriela Martins", party: "Novo", state: "PR" },
  ];

  const negativeVotes = [
    { name: "Samuel Viana", party: "PT", state: "MG" },
    { name: "Ana Silva", party: "PSDB", state: "SP" },
    { name: "Carlos Souza", party: "MDB", state: "RJ" },
    { name: "Mariana Lima", party: "DEM", state: "BA" },
    { name: "Pedro Santos", party: "PSOL", state: "RS" },
    { name: "Lucas Oliveira", party: "Novo", state: "PR" },
    { name: "Fernanda Costa", party: "PT", state: "MG" },
    { name: "João Almeida", party: "PSDB", state: "SP" },
    { name: "Ricardo Pereira", party: "MDB", state: "RJ" },
    { name: "Patrícia Gomes", party: "DEM", state: "BA" },
    { name: "Roberto Nunes", party: "PSOL", state: "RS" },
    { name: "Gabriela Martins", party: "Novo", state: "PR" },
  ];

  const getCurrentDate = () => {
    const today = new Date();
    return today;
  };

  const getDates = () => {
    const today = getCurrentDate();
    const dates = [];
    for (let i = -4; i <= 2; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = getDates();

  const formatTime = (time: number): string => {
    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const [timeLeft, setTimeLeft] = useState<number>(12 * 60 * 60 * 1000);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1000) {
          clearInterval(interval); // Limpar o intervalo quando chegar a zero
          return 0;
        }
        return prevTime - 1000; // Subtrair 1 segundo (1000 ms)
      });
    }, 1000);

    // Limpeza do intervalo ao desmontar o componente
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid w-full grid-cols-12 gap-8">
      <div className="relative col-span-4 flex h-full flex-col items-center justify-between rounded-xl bg-[url(/static/live-plenary.png)] bg-cover bg-no-repeat p-4">
        <div className="flex h-12 w-full flex-row justify-between">
          <div className="flex w-full justify-between">
            {dates.map((date, index) => {
              const isToday =
                date.toDateString() === getCurrentDate().toDateString();
              return (
                <div
                  key={index}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-lg p-2",
                    isToday
                      ? "bg-primary text-white"
                      : "bg-transparent text-black",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs",
                      isToday ? "text-white" : "text-[#0D5F3E]",
                    )}
                  >
                    {date.toLocaleDateString("pt-BR", { weekday: "short" })}
                  </span>
                  <span className="text-sm font-bold">
                    {date.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="text-6xl font-bold text-[#0D5F3E]">
          {formatTime(timeLeft)}
        </div>
        <div className="px-8 text-center text-lg font-bold text-[#0D5F3E] uppercase">
          {" "}
          LOGO VOCÊ ACESSARÁ O LINK PARA acompanhamento{" "}
          <span className="font-black">ao vivo</span> O PRÓXIMO PLENÁRIO
        </div>
        <button className="overflow-hidden rounded-full bg-black">
          <div className="h-full w-full bg-[#00A15D] p-2 opacity-40">
            EM BREVE DISPONÍVEL
          </div>
        </button>
      </div>
      <div className="col-span-12 flex flex-row gap-4 rounded-lg bg-white p-4">
        <div className="mt-4 flex w-full flex-col gap-4">
          <h2 className="text-secondary text-lg font-bold uppercase">
            Votação da Proposta Analisada
          </h2>
          <div className="border-secondary shadow-secondary col-span-1 flex flex-row justify-between rounded-lg border bg-white p-2 shadow-sm md:col-span-2">
            <div className="flex w-[45%] items-center justify-between gap-4 p-4">
              <div className="flex w-60 flex-col">
                <div className="flex items-center gap-2">
                  <div className="bg-secondary flex h-5 w-5 items-center justify-center rounded-full text-white">
                    <Check size={16} />
                  </div>
                  <h3 className="text-2xl font-bold">VOTOS PARA SIM:</h3>
                </div>
                <span>
                  Dos políticos que Votaram, veja aqueles que votaram{" "}
                  <span className="text-secondary font-bold">
                    &quot;Sim&quot;
                  </span>
                </span>
              </div>
              <div className="flex flex-1 flex-col">
                <div className="h-2 w-full rounded-full bg-[#4C4C4C]">
                  <div className="h-2 w-1/3 rounded-full bg-[#00A15D]" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-4xl font-bold">42</span>
                  <span className="text-xl">Dos deputados presentes</span>
                  <span className="text-2xl text-[#00a15d]">76</span>
                </div>
              </div>
            </div>
            <div className="bg-secondary h-[80%] w-0.5 self-center" />
            <div className="flex w-[45%] items-center justify-between gap-4 p-4">
              <div className="flex flex-1 flex-col">
                <div className="h-2 w-full rounded-full bg-[#4C4C4C]">
                  <div className="ml-auto h-2 w-1/3 rounded-full bg-rose-500" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-4xl font-bold">42</span>
                  <span className="text-xl">Dos deputados presentes</span>
                  <span className="text-2xl text-rose-500">76</span>
                </div>
              </div>
              <div className="flex w-64 flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">VOTOS PARA NÃO:</h3>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white">
                    <X size={16} />
                  </div>
                </div>
                <span>
                  Dos políticos que Votaram, veja aqueles que votaram{" "}
                  <span className="font-bold text-rose-500">
                    &quot;Não&quot;
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:gap-0">
            <div className="flex w-full flex-col gap-4 p-2 md:w-[48%]">
              <div className="flex h-8 w-[80%] flex-row self-center rounded-md border border-[#475569]">
                <input
                  className="flex-1 bg-transparent px-2 text-[#749C5B] placeholder:text-[#749C5B] placeholder:opacity-40 focus:outline-none"
                  placeholder="Buscar aqui por nome de Político ou Partido Político..."
                />
                <button className="flex h-full items-center justify-center rounded-r-md bg-[#749C5B] px-2 text-white">
                  <Search color="#222222" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {positiveVotes.map((item, index) => (
                  <div
                    key={index}
                    className="shadow-secondary border-secondary col-span-1 flex flex-col gap-4 rounded-lg border bg-white p-2 shadow-sm"
                  >
                    <div className="flex flex-row justify-between">
                      <h1 className="text lg font-bold">{item.name}</h1>
                      <div
                        className={`bg-secondary flex h-6 w-6 items-center justify-center rounded-full`}
                      >
                        <Check color="#161717" size={16} />
                      </div>
                    </div>
                    <div className="flex flex-row items-center justify-between">
                      <span className="text-[#828690]">
                        {item.party}-{item.state}
                      </span>
                      <span className="text-secondary font-bold">SIM</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-row justify-between">
                <div className="mt-2 text-xs text-[#828690]">
                  0 de 8 linha(s) selecionadas.
                </div>
                <div className="mt-2 flex justify-end">
                  <button className="text-secondary border-secondary mx-1 flex h-8 w-8 items-center justify-center rounded-md border">
                    <ChevronLeft />
                  </button>
                  <button className="bg-secondary mx-1 h-8 w-8 rounded-md border border-white px-2 py-1 text-[#222222]">
                    1
                  </button>
                  <button className="text-secondary border-secondary mx-1 h-8 w-8 rounded-md border px-2 py-1">
                    2
                  </button>
                  <button className="text-secondary border-secondary mx-1 h-8 w-8 rounded-md border px-2 py-1">
                    3
                  </button>
                  <button className="text-secondary border-secondary mx-1 h-8 w-8 rounded-md border px-2 py-1">
                    4
                  </button>
                  <button className="text-secondary border-secondary mx-1 flex h-8 w-8 items-center justify-center rounded-md border">
                    <ChevronRight />
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-secondary h-0.5 w-[80%] self-center md:block md:h-full md:w-0.5"></div>
            <div className="flex w-full flex-col gap-4 p-2 md:w-[48%]">
              <div className="flex h-8 w-[80%] flex-row self-center rounded-md border">
                <input
                  className="flex-1 bg-transparent px-2 text-rose-500 placeholder:text-rose-500 placeholder:opacity-40 focus:outline-none"
                  placeholder="Buscar aqui por nome de Político ou Partido Político..."
                />
                <button className="flex h-full items-center justify-center rounded-r-md bg-rose-500 px-2 text-white">
                  <Search color="#222222" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {negativeVotes.map((item, index) => (
                  <div
                    key={index}
                    className="col-span-1 flex flex-col gap-4 rounded-lg border border-rose-500 bg-white p-2 shadow-sm shadow-rose-500"
                  >
                    <div className="flex flex-row justify-between">
                      <h1 className="text lg font-bold">{item.name}</h1>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full bg-rose-500`}
                      >
                        <X color="#161717" size={16} />
                      </div>
                    </div>
                    <div className="flex flex-row items-center justify-between">
                      <span className="text-[#828690]">
                        {item.party}-{item.state}
                      </span>
                      <span className="font-bold text-rose-500">NÃO</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-row justify-between">
                <div className="mt-2 text-xs text-[#828690]">
                  0 de 8 linha(s) selecionadas.
                </div>
                <div className="mt-2 flex justify-end">
                  <button className="mx-1 flex h-8 w-8 items-center justify-center rounded-md border border-rose-500 text-rose-500">
                    <ChevronLeft />
                  </button>
                  <button className="mx-1 h-8 w-8 rounded-md border border-white bg-rose-500 px-2 py-1 text-[#222222]">
                    1
                  </button>
                  <button className="mx-1 h-8 w-8 rounded-md border border-rose-500 px-2 py-1 text-rose-500">
                    2
                  </button>
                  <button className="mx-1 h-8 w-8 rounded-md border border-rose-500 px-2 py-1 text-rose-500">
                    3
                  </button>
                  <button className="mx-1 h-8 w-8 rounded-md border border-rose-500 px-2 py-1 text-rose-500">
                    4
                  </button>
                  <button className="mx-1 flex h-8 w-8 items-center justify-center rounded-md border border-rose-500 text-rose-500">
                    <ChevronRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
