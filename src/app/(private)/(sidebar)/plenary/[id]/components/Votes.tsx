"use client";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  MessageCircle,
  Search,
  Tv,
  X,
} from "lucide-react";
import Image from "next/image";
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

  const columns = [
    {
      key: "authors",
      label: "Autores",
    },
    {
      key: "proposal",
      label: "Proposta",
    },
    {
      key: "other",
      label: "Outro Dado",
    },
    {
      key: "result",
      label: "Resultado",
    },
  ];

  const tableData = [
    {
      author: "Samuel Viana",
      proposal: "Proposta 1",
      other: "Outro dado",
      result: "approved",
      id: 1,
    },
    {
      author: "Ana Silva",
      proposal: "Proposta 2",
      other: "Outro dado",
      result: "rejected",
      id: 2,
    },
    {
      author: "Carlos Souza",
      proposal: "Proposta 3",
      other: "Outro dado",
      result: "changed",
      id: 3,
    },
    {
      author: "Mariana Lima",
      proposal: "Proposta 4",
      other: "Outro dado",
      result: "rejected",
      id: 4,
    },
    {
      author: "Pedro Santos",
      proposal: "Proposta 5",
      other: "Outro dado",
      result: "changed",
      id: 5,
    },
    {
      author: "Lucas Oliveira",
      proposal: "Proposta 6",
      other: "Outro dado",
      result: "approved",
      id: 6,
    },
    {
      author: "Fernanda Costa",
      proposal: "Proposta 7",
      other: "Outro dado",
      result: "approved",
      id: 7,
    },
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

  const [selectedStep, setSelectedStep] = useState(0);

  return (
    <div className="grid w-full grid-cols-12 gap-8">
      <div className="col-span-12 flex flex-col rounded-lg bg-white xl:col-span-8">
        <div className="flex w-full items-center justify-between border-b border-b-zinc-200 p-4">
          <span className="text-secondary text-lg font-bold">
            SESSÃO DELIBERATIVA EXTRAORDINÁRIA (SEMIPRESENCIAL)
          </span>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-200">
              <MessageCircle className="fill-secondary text-secondary" />
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-200">
              <Ellipsis className="fill-secondary text-secondary" />
            </div>
          </div>
        </div>
        <div className="flex w-full items-start justify-between p-4">
          <div className="flex items-center gap-2">
            <Image
              src="/static/plenary-details.png"
              alt=""
              width={500}
              height={500}
              className="h-20 w-20 rounded-lg object-contain lg:h-40 lg:w-40"
            />
            <div className="text-secondary flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {new Date().toLocaleDateString("pt-BR")}
                </span>
                -<span className="text-lg font-bold">PLENÁRIO</span>
              </div>
              <span>Sessão para a votação de propostas legislativas</span>
              <div className="flex items-center gap-2">
                <div className="border-secondary flex flex-col rounded-md border border-dashed p-2">
                  <span className="text-sm text-black">Início:</span>
                  <span className="text-sm">
                    {new Date().toLocaleTimeString("pt-BR")} às{" "}
                    {new Date().toLocaleTimeString("pt-BR")}
                  </span>
                </div>
                <div className="border-secondary flex flex-col rounded-md border border-dashed p-2">
                  <span className="text-sm text-black">Término:</span>
                  <span className="text-sm">
                    {new Date().toLocaleTimeString("pt-BR")} às{" "}
                    {new Date().toLocaleTimeString("pt-BR")}
                  </span>
                </div>
                <div className="border-secondary flex flex-col rounded-md border border-dashed p-2">
                  <span className="text-sm text-black">Situação:</span>
                  <span className="text-sm">Encerrado</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-black">Local:</span>
                <span>Plenário da Câmara de Deputados</span>
              </div>
            </div>
          </div>
          <AvatarGroup max={4} total={0}>
            <Avatar className="ring-primary-500 ring-offset-primary-500 ring-1 ring-offset-[1px]">
              <div className="h-full w-full bg-zinc-700"></div>
            </Avatar>
            <Avatar className="ring-primary-500 ring-offset-primary-500 ring-1 ring-offset-[1px]">
              <div className="h-full w-full bg-zinc-700"></div>
            </Avatar>
            <Avatar className="ring-primary-500 ring-offset-primary-500 ring-1 ring-offset-[1px]">
              <div className="h-full w-full bg-zinc-700"></div>
            </Avatar>
            <Avatar className="ring-primary-500 ring-offset-primary-500 ring-1 ring-offset-[1px]">
              <div className="h-full w-full bg-zinc-700"></div>
            </Avatar>
          </AvatarGroup>
        </div>
        <div className="flex h-12 w-full items-center gap-8 overflow-x-scroll overflow-y-hidden border-t border-t-zinc-200 p-2 lg:overflow-x-auto lg:p-4">
          <span
            className={cn(
              "hover:text-secondary cursor-pointer",
              selectedStep === 0 ? "text-secondary font-bold" : "text-zinc-400",
            )}
            onClick={() => setSelectedStep(0)}
          >
            VISÃO GERAL
            <div
              className={cn(
                "h-px w-full bg-transparent",
                selectedStep === 0 && "bg-secondary",
              )}
            />
          </span>
          <span
            className={cn(
              "hover:text-secondary cursor-pointer",
              selectedStep === 1 ? "text-secondary font-bold" : "text-zinc-400",
            )}
            onClick={() => setSelectedStep(1)}
          >
            VOTAÇÃO
            <div
              className={cn(
                "h-px w-full bg-transparent",
                selectedStep === 1 && "bg-secondary",
              )}
            />
          </span>
          <span
            className={cn(
              "hover:text-secondary cursor-pointer",
              selectedStep === 2 ? "text-secondary font-bold" : "text-zinc-400",
            )}
            onClick={() => setSelectedStep(2)}
          >
            DOCUMENTOS
            <div
              className={cn(
                "h-px w-full bg-transparent",
                selectedStep === 2 && "bg-secondary",
              )}
            />
          </span>
          <span
            className={cn(
              "hover:text-secondary cursor-pointer",
              selectedStep === 3 ? "text-secondary font-bold" : "text-zinc-400",
            )}
            onClick={() => setSelectedStep(3)}
          >
            PRESENÇAS
            <div
              className={cn(
                "h-px w-full bg-transparent",
                selectedStep === 3 && "bg-secondary",
              )}
            />
          </span>
          <span
            className={cn(
              "hover:text-secondary cursor-pointer",
              selectedStep === 4 ? "text-secondary font-bold" : "text-zinc-400",
            )}
            onClick={() => setSelectedStep(4)}
          >
            ORDEM DO DIA
            <div
              className={cn(
                "h-px w-full bg-transparent",
                selectedStep === 4 && "bg-secondary",
              )}
            />
          </span>
        </div>
      </div>
      <div className="relative col-span-12 flex h-full flex-col items-center justify-between gap-8 rounded-xl bg-[url('/static/livePlenary.png')] bg-cover bg-no-repeat p-4 xl:col-span-4">
        <div className="flex h-12 w-full flex-row justify-between">
          <div className="flex h-full w-full justify-between overflow-x-scroll overflow-y-hidden lg:overflow-x-auto">
            {dates.map((date, index) => {
              const isToday =
                date.toDateString() === getCurrentDate().toDateString();
              return (
                <div
                  key={index}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-lg p-2",
                    isToday
                      ? "bg-secondary text-white"
                      : "bg-transparent text-white",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs",
                      isToday ? "text-white" : "text-white",
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
        <div className="text-6xl font-bold text-white">
          {formatTime(timeLeft)}
        </div>
        <div className="px-8 text-center text-sm font-bold text-white uppercase">
          {" "}
          LOGO VOCÊ ACESSARÁ O LINK PARA acompanhamento{" "}
          <span className="font-black">ao vivo</span> O PRÓXIMO PLENÁRIO
        </div>
        <button className="overflow-hidden rounded-full">
          <div className="bg-primary flex h-full w-full items-center gap-2 p-2 text-white opacity-40">
            <Tv />
            <span>EM BREVE DISPONÍVEL</span>
          </div>
        </button>
      </div>
      <div className="col-span-12 flex flex-col overflow-hidden rounded-lg bg-white xl:col-span-8">
        <span className="text-secondary p-4 text-xl font-bold">
          Propostas a Serem Analisadas
        </span>
        <div className="h-80 overflow-scroll xl:h-full">
          <Table>
            <TableHeader className="bg-secondary">
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className="h-12 justify-end text-center text-sm font-semibold text-white"
                  >
                    <div
                      className={cn(
                        "flex w-max items-center gap-2",
                        column.key === "result" && "ml-auto w-48",
                      )}
                    >
                      <Image
                        src="/icons/circles.png"
                        alt=""
                        width={250}
                        height={250}
                        className="h-4 w-4 object-contain"
                      />
                      {column.label}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            {tableData.map((row) => (
              <TableBody key={row.id}>
                <TableRow className="h-12">
                  <TableCell className="h-4 py-1 text-sm font-medium whitespace-nowrap">
                    {row.author}{" "}
                    <span className="text-secondary font-semibold italic">
                      Ver Todos *
                    </span>
                  </TableCell>
                  <TableCell className="h-4 py-1 text-sm font-semibold whitespace-nowrap">
                    {row.proposal}
                  </TableCell>
                  <TableCell className="h-4 py-1 text-sm">
                    {row.other}
                  </TableCell>
                  <TableCell className="h-4 py-1 text-sm font-medium">
                    <span
                      className={cn(
                        "rounded-lg px-2 py-1",
                        row.result === "approved"
                          ? "bg-secondary/20 text-secondary"
                          : row.result === "changed"
                            ? "bg-sky-500/20 text-sky-500"
                            : "bg-rose-500/20 text-rose-500",
                      )}
                    >
                      {row.result === "approved"
                        ? "Aprovado"
                        : row.result === "changed"
                          ? "Aprovado com alterações"
                          : "Não Analisada"}
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            ))}
          </Table>
        </div>
      </div>
      <div className="col-span-12 flex flex-col justify-between gap-4 rounded-lg bg-white p-4 xl:col-span-4">
        <div className="flex flex-col gap-4">
          <span className="text-secondary text-xl font-bold">
            Resumo da Proposta
          </span>
          <div className="flex w-full flex-col items-center justify-between gap-4 md:flex-row xl:flex-col 2xl:flex-row">
            <div className="relative flex h-28 w-full overflow-hidden rounded-xl md:w-1/3 xl:w-full 2xl:w-1/3">
              <Image
                src="/static/parallax-card.png"
                alt=""
                width={500}
                height={500}
                className="absolute top-0 left-0 h-full w-full object-cover"
              />
              <div className="from-primary/20 to-primary/80 absolute top-0 left-0 z-10 flex h-full w-full flex-col justify-end gap-2 bg-gradient-to-b p-2 text-white">
                <span className="w-max rounded-sm bg-[#27AE60] px-2 py-1 text-xs">
                  sessão deliberativa
                </span>
                <span className="w-40 text-xs font-bold">
                  Pauta da <br /> Sessão plenária
                </span>
              </div>
            </div>
            <div className="relative flex h-28 w-full overflow-hidden rounded-xl md:w-1/3 xl:w-full 2xl:w-1/3">
              <Image
                src="/static/parallax-card.png"
                alt=""
                width={500}
                height={500}
                className="absolute top-0 left-0 h-full w-full object-cover"
              />
              <div className="from-primary/20 to-primary/80 absolute top-0 left-0 z-10 flex h-full w-full flex-col justify-end gap-2 bg-gradient-to-b p-2 text-white">
                <span className="w-max rounded-sm bg-[#27AE60] px-2 py-1 text-xs">
                  sessão deliberativa
                </span>
                <span className="w-40 text-xs font-bold">
                  Oradores inscritos <br /> para discursar
                </span>
              </div>
            </div>
            <div className="relative flex h-28 w-full overflow-hidden rounded-xl md:w-1/3 xl:w-full 2xl:w-1/3">
              <Image
                src="/static/parallax-card.png"
                alt=""
                width={500}
                height={500}
                className="absolute top-0 left-0 h-full w-full object-cover"
              />
              <div className="from-primary/20 to-primary/80 absolute top-0 left-0 z-10 flex h-full w-full flex-col justify-end gap-2 bg-gradient-to-b p-2 text-white">
                <span className="w-max rounded-sm bg-[#27AE60] px-2 py-1 text-xs">
                  sessão deliberativa
                </span>
                <span className="w-40 text-xs font-bold">
                  Atas da Reunião <br /> Plenária
                </span>
              </div>
            </div>
          </div>
          <button className="bg-secondary mx-auto w-max rounded-md px-2 py-1 text-white">
            Clique acima e Acesse
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-secondary text-xl font-bold">
            Sessão em Texto e Vídeo
          </span>
          <button className="bg-secondary/20 border-secondary text-secondary w-full rounded-md border p-2 text-xs underline">
            <span className="font-bold">CLIQUE AQUI</span>
            <span>PARA VER A SESSÃO PLENÁRIA EM FORMATO DE TEXTO</span>
          </button>
          <button className="bg-secondary/20 border-secondary text-secondary w-full rounded-md border p-2 text-xs underline">
            <span className="font-bold">CLIQUE AQUI</span>
            <span>PARA VER A SESSÃO PLENÁRIA EM FORMATO DE TEXTO</span>
          </button>
        </div>
      </div>
      <div className="col-span-12 flex flex-row gap-4 rounded-lg bg-white p-4">
        <div className="mt-4 flex w-full flex-col gap-4">
          <h2 className="text-secondary text-lg font-bold uppercase">
            Votação da Proposta Analisada
          </h2>
          <div className="border-secondary shadow-secondary col-span-1 flex flex-col justify-between rounded-lg border bg-white p-2 shadow-sm md:col-span-2 xl:flex-row">
            <div className="flex w-full flex-col items-center justify-between gap-4 p-4 xl:w-[45%] xl:flex-row">
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
            <div className="bg-secondary h-0.5 w-[80%] self-center xl:h-[80%] xl:w-0.5" />
            <div className="flex w-full flex-col items-center justify-between gap-4 p-4 xl:w-[45%] xl:flex-row">
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
              <div className="flex h-8 w-full flex-row self-center rounded-md border border-[#749C5B]">
                <input
                  className="flex-1 bg-transparent px-2 text-[#749C5B] placeholder:text-[#749C5B] placeholder:opacity-40 focus:outline-none"
                  placeholder="Buscar aqui por nome de Político ou Partido Político..."
                />
                <button className="flex h-full items-center justify-center rounded-r-md bg-[#749C5B] px-2 text-white">
                  <Search color="#222222" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
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
              <div className="flex h-8 w-full flex-row self-center rounded-md border border-rose-500">
                <input
                  className="flex-1 bg-transparent px-2 text-rose-500 placeholder:text-rose-500 placeholder:opacity-40 focus:outline-none"
                  placeholder="Buscar aqui por nome de Político ou Partido Político..."
                />
                <button className="flex h-full items-center justify-center rounded-r-md bg-rose-500 px-2 text-white">
                  <Search color="#222222" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
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
