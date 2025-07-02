"use client";
import SingleDonutChart from "@/components/SingleItemDonnutChart";
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
  Search,
  Tv,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import "swiper/css";

import { Chat } from "./Chat";
import { Tutorials } from "./Tutorials";
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
      key: "subject",
      label: "Assunto",
    },
    {
      key: "yes",
      label: "Sim",
    },
    {
      key: "no",
      label: "Não",
    },
    {
      key: "votes",
      label: "Votos",
    },
    {
      key: "result",
      label: "Resultado",
    },
  ];

  const tableData = [
    {
      author: "Felipe Carreras (PSB-PE)",
      proposal: "REQ 1884/2023",
      subject: "Outro Dado",
      yes: 43,
      no: 3,
      votes: 48,
      result: "aprovado",
      id: 1,
    },
    {
      author: "Felipe Carreras (PSB-PE)",
      proposal: "PL 8035/2014",
      subject: "Outro Dado",
      yes: 43,
      no: 3,
      votes: 48,
      result: "aprovada com alterações",
      id: 2,
    },
    {
      author: "Felipe Carreras (PSB-PE)",
      proposal: "PL 8035/2014",
      subject: "Outro Dado",
      yes: 43,
      no: 3,
      votes: 48,
      result: "não analisada",
      id: 3,
    },
    {
      author: "Felipe Carreras (PSB-PE)",
      proposal: "PL 8035/2014",
      subject: "Outro Dado",
      yes: 43,
      no: 3,
      votes: 48,
      result: "não analisada",
      id: 4,
    },
    {
      author: "Felipe Carreras (PSB-PE)",
      proposal: "PL 8035/2014",
      subject: "Outro Dado",
      yes: 43,
      no: 3,
      votes: 48,
      result: "não analisada",
      id: 5,
    },
    {
      author: "Felipe Carreras (PSB-PE)",
      proposal: "PL 8035/2014",
      subject: "Outro Dado",
      yes: 43,
      no: 3,
      votes: 48,
      result: "não analisada",
      id: 6,
    },
  ];

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
        <div className="flex w-full items-center justify-between border-b border-b-zinc-200 p-2">
          <div className="flex items-center gap-4">
            <Image
              src="/static/plenary-logo.png"
              alt=""
              width={500}
              height={500}
              className="border-primary/40 h-10 w-10 rounded-lg border object-contain lg:h-10 lg:w-10"
            />
            <span className="text-primary text-lg font-bold">
              SESSÃO DELIBERATIVA EXTRAORDINÁRIA (SEMIPRESENCIAL)
            </span>
          </div>
          <div className="text-primary flex items-center gap-2">20/02/2024</div>
        </div>
        <div className="text-primary flex flex-1 items-center justify-evenly gap-2 p-2">
          <div className="border-primary flex flex-col rounded-md border p-2">
            <span className="text-black">Início:</span>
            <span className="">
              {new Date().toLocaleTimeString("pt-BR")} às{" "}
              {new Date().toLocaleTimeString("pt-BR")}
            </span>
          </div>
          <div className="border-primary flex flex-col rounded-md border p-2">
            <span className="text-black">Término:</span>
            <span className="">
              {new Date().toLocaleTimeString("pt-BR")} às{" "}
              {new Date().toLocaleTimeString("pt-BR")}
            </span>
          </div>
          <div className="border-primary flex flex-col rounded-md border p-2">
            <span className="text-black">Situação:</span>
            <span className="">Encerrado</span>
          </div>
        </div>
        <div className="flex h-12 w-full items-center gap-8 overflow-x-scroll overflow-y-hidden border-t border-t-zinc-200 p-2 lg:overflow-x-auto lg:p-4">
          <span
            className={cn(
              "hover:text-primary cursor-pointer",
              selectedStep === 0 ? "text-primary font-bold" : "text-zinc-400",
            )}
            onClick={() => setSelectedStep(0)}
          >
            VISÃO GERAL
            <div
              className={cn(
                "h-px w-full bg-transparent",
                selectedStep === 0 && "bg-primary",
              )}
            />
          </span>
          <span
            className={cn(
              "hover:text-primary cursor-pointer",
              selectedStep === 1 ? "text-primary font-bold" : "text-zinc-400",
            )}
            onClick={() => setSelectedStep(1)}
          >
            VOTAÇÃO
            <div
              className={cn(
                "h-px w-full bg-transparent",
                selectedStep === 1 && "bg-primary",
              )}
            />
          </span>
          <span
            className={cn(
              "hover:text-primary cursor-pointer",
              selectedStep === 2 ? "text-primary font-bold" : "text-zinc-400",
            )}
            onClick={() => setSelectedStep(2)}
          >
            DOCUMENTOS
            <div
              className={cn(
                "h-px w-full bg-transparent",
                selectedStep === 2 && "bg-primary",
              )}
            />
          </span>
          <span
            className={cn(
              "hover:text-primary cursor-pointer",
              selectedStep === 3 ? "text-primary font-bold" : "text-zinc-400",
            )}
            onClick={() => setSelectedStep(3)}
          >
            PRESENÇAS
            <div
              className={cn(
                "h-px w-full bg-transparent",
                selectedStep === 3 && "bg-primary",
              )}
            />
          </span>
          <span
            className={cn(
              "hover:text-primary cursor-pointer",
              selectedStep === 4 ? "text-primary font-bold" : "text-zinc-400",
            )}
            onClick={() => setSelectedStep(4)}
          >
            ORDEM DO DIA
            <div
              className={cn(
                "h-px w-full bg-transparent",
                selectedStep === 4 && "bg-primary",
              )}
            />
          </span>
        </div>
      </div>
      <div className="relative col-span-12 flex h-full flex-col items-center justify-between overflow-hidden rounded-xl bg-[url('/static/livePlenary2.png')] bg-cover bg-no-repeat xl:col-span-4">
        <div className="bg-primary flex h-full w-full flex-col items-center justify-between gap-4 p-4">
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
      </div>
      <div className="col-span-12 flex flex-col overflow-hidden rounded-lg bg-white xl:col-span-12">
        <div className="flex h-full w-full flex-col">
          <span className="text-primary p-4 text-xl font-bold">
            Propostas a Serem Analisadas
          </span>
          <div className="flex h-80 w-full flex-row justify-evenly p-4 xl:h-full">
            <div className="text-primary border-primary flex flex-col gap-8 rounded-lg border p-8">
              <div className="flex flex-row items-center gap-2">
                <User />
                <span className="text-xl font-bold">Quórum votação</span>
              </div>
              <div className="flex flex-row items-center justify-evenly gap-4">
                <Image
                  src="/logos/small-logo.png"
                  alt="quorum"
                  width={100}
                  height={100}
                  className="h-12 w-max"
                />
                <span className="text-4xl font-bold">287</span>
              </div>
            </div>
            <div className="text-primary border-primary flex flex-col gap-8 rounded-lg border p-8">
              <div className="flex flex-row items-center gap-2">
                <User />
                <span className="text-xl font-bold">Total de Presentes</span>
              </div>
              <div className="flex flex-row items-center justify-evenly gap-4">
                <div className="flex h-16 max-h-16 items-center justify-center">
                  <SingleDonutChart total={340} current={320} height={120} />
                </div>
                <span className="text-4xl font-bold">320</span>
              </div>
            </div>
            <div className="text-primary border-primary flex flex-col gap-8 rounded-lg border p-8">
              <div className="flex flex-row items-center gap-2">
                <User />
                <span className="text-xl font-bold">Total de Propostas</span>
              </div>
              <div className="flex flex-row items-center justify-evenly gap-4">
                <div className="flex h-16 max-h-16 items-center justify-center">
                  <SingleDonutChart total={3} current={3} height={120} />
                </div>
                <span className="text-4xl font-bold">3</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-primary/20 flex h-full w-full flex-col gap-4 p-4">
          <span className="text-primary text-xl font-bold">
            Propostas a Serem Analisadas e seus Votos
          </span>
          <div className="px-4">
            <div className="border-primary flex w-full flex-col overflow-hidden rounded-lg border bg-white px-4 py-2 md:px-8">
              <div className="flex h-full w-full flex-col justify-between md:flex-row">
                <div className="flex flex-col justify-between gap-8 md:max-w-[60%]">
                  <div className="flex flex-col">
                    <span className="font-semibold">PL 1847/2024</span>
                    <div className="flex flex-wrap gap-2">
                      <div className="border-primary rounded-full border p-1 text-sm">
                        <span className="font-semibold">AUTOR:</span>
                        <span>DE SENADO FEDERAL - EFRAIM FILHO</span>
                      </div>
                      <div className="border-primary rounded-full border p-1 text-sm">
                        <span className="font-semibold">RELATOR:</span>
                        <span>JOSÉ GUIMARÃES (PT-CE)</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-justify text-sm">
                    <span className="font-semibold underline">
                      PL 1847/2024 {""}
                    </span>
                    <span>
                      - Estabelece regime de transição para a contribuição
                      substitutiva prevista nos arts. 7º e 8º da Lei nº 12.546,
                      de 14 de dezembro de 2011, e para o adicional sobre a
                      Cofins-Importação previsto no § 21 do art. 8º da Lei nº
                      10.865, de 30 de abril de 2004; altera as Leis nºs 8.212,
                      de 24 de julho de 1991, 8.742, de 7 de dezembro de 1993,
                      10.522, de 19 de julho de 2002, 10.779, de 25 de novembro
                      de 2003, 10.865, de 30 de abril de 2004 (...) {""}
                    </span>
                    <span className="text-primary font-semibold underline">
                      Clique aqui para Continuar lendo
                    </span>
                  </div>
                  <span className="text-xs text-[#828690]">
                    Última Atualização do LegisAI: às 14:55
                  </span>
                </div>
                <div className="flex flex-row gap-2">
                  <div className="border-primary shadow-primary col-span-1 flex flex-col justify-between rounded-lg">
                    <div className="flex w-full flex-col items-center justify-between gap-4 p-4">
                      <div className="flex flex-col">
                        <div className="flex w-full items-center justify-center gap-2">
                          <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full text-white">
                            <Check size={16} />
                          </div>
                          <h3 className="text-xl font-bold">VOTOS PARA SIM:</h3>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="h-2 w-full rounded-full bg-[#4C4C4C]">
                          <div className="h-2 w-1/3 rounded-full bg-[#00A15D]" />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-4xl font-bold">42</span>
                          <span className="text-center text-xl">
                            Dos deputados presentes
                          </span>
                          <span className="text-2xl text-[#00a15d]">76</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full flex-col-reverse items-center justify-between gap-4 p-4">
                      <div className="flex flex-1 flex-col">
                        <div className="h-2 w-full rounded-full bg-[#4C4C4C]">
                          <div className="ml-auto h-2 w-1/3 rounded-full bg-rose-500" />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-4xl font-bold">42</span>
                          <span className="text-center text-xl">
                            Dos deputados presentes
                          </span>
                          <span className="text-2xl text-rose-500">76</span>
                        </div>
                      </div>
                      <div className="flex w-64 flex-col">
                        <div className="flex w-full items-center justify-center gap-2">
                          <h3 className="text-xl font-bold">VOTOS PARA NÃO:</h3>
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white">
                            <X size={16} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-12 flex flex-col overflow-hidden rounded-lg bg-white xl:col-span-12">
        <div className="flex h-full w-full flex-col">
          <span className="text-primary p-4 text-xl font-bold">
            Propostas a Serem Analisadas
          </span>
          <div className="h-80 overflow-auto xl:h-full">
            <Table>
              <TableHeader className="bg-primary">
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className="h-12 justify-end text-center text-sm font-semibold text-white"
                    >
                      <div
                        className={cn(
                          "flex items-center gap-2",
                          column.key === "authors" && "items-start",
                          column.key !== "authors" && "w-full justify-center",
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
                  <TableRow className="hover:bg-primary/20 h-12 transition-all duration-300">
                    <TableCell className="h-4 py-1 text-sm font-medium whitespace-nowrap">
                      {row.author}{" "}
                      <span className="text-primary font-semibold italic">
                        Ver Todos *
                      </span>
                    </TableCell>
                    <TableCell className="h-4 py-1 text-center text-sm font-semibold whitespace-nowrap">
                      {row.proposal}
                    </TableCell>
                    <TableCell className="h-4 py-1 text-center text-sm">
                      {row.subject}
                    </TableCell>
                    <TableCell className="h-4 py-1 text-center text-sm">
                      {row.yes}
                    </TableCell>
                    <TableCell className="h-4 py-1 text-center text-sm">
                      {row.no}
                    </TableCell>
                    <TableCell className="h-4 py-1 text-center text-sm">
                      {row.votes}
                    </TableCell>
                    <TableCell className="h-4 w-10 py-1 text-sm font-medium">
                      <div className="flex items-end justify-end">
                        <div className="flex h-full w-40 max-w-40 min-w-40 items-center justify-center text-center">
                          <span
                            className={cn(
                              "w-full rounded-lg px-2 py-1",
                              row.result.toLowerCase() === "aprovado"
                                ? "bg-primary/20 text-primary"
                                : row.result.toLowerCase() ===
                                    "aprovada com alterações"
                                  ? "bg-sky-500/20 text-sky-500"
                                  : "bg-rose-500/20 text-rose-500",
                            )}
                          >
                            {row.result.toLowerCase() === "aprovado"
                              ? "Aprovado"
                              : row.result.toLowerCase() ===
                                  "aprovada com alterações"
                                ? "Aprovado com alterações"
                                : "Não Analisada"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ))}
            </Table>
          </div>
        </div>
      </div>
      {/* <div className="col-span-12 flex flex-col justify-between gap-4 rounded-lg bg-white p-4 xl:col-span-4">
        <div className="flex flex-col gap-4">
          <span className="text-primary text-xl font-bold">
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
          <button className="bg-primary mx-auto w-max rounded-md px-2 py-1 text-white">
            Clique acima e Acesse
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-primary text-xl font-bold">
            Sessão em Texto e Vídeo
          </span>
          <button className="bg-primary/20 border-primary text-primary w-full rounded-md border p-2 text-xs underline">
            <span className="font-bold">CLIQUE AQUI</span>
            <span>PARA VER A SESSÃO PLENÁRIA EM FORMATO DE TEXTO</span>
          </button>
          <button className="bg-primary/20 border-primary text-primary w-full rounded-md border p-2 text-xs underline">
            <span className="font-bold">CLIQUE AQUI</span>
            <span>PARA VER A SESSÃO PLENÁRIA EM FORMATO DE TEXTO</span>
          </button>
        </div>
      </div> */}
      <div className="col-span-12 flex flex-row gap-4 rounded-lg bg-white p-4">
        <div className="mt-4 flex w-full flex-col gap-4">
          <h2 className="text-primary text-lg font-bold uppercase">
            Votação da Proposta Analisada
          </h2>
          <div className="col-span-1 flex flex-col justify-between rounded-lg bg-white p-2 shadow-lg md:col-span-2 xl:flex-row">
            <div className="flex w-full flex-col items-center justify-between gap-4 p-4 xl:w-[45%] xl:flex-row">
              <div className="flex w-full flex-col">
                <div className="flex items-center gap-2">
                  <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full text-white">
                    <Check size={16} />
                  </div>
                  <h3 className="text-2xl font-bold">VOTOS PARA SIM:</h3>
                </div>
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
            <div className="bg-primary h-0.5 w-[80%] self-center xl:h-[80%] xl:w-0.5" />
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
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:gap-0">
            <div className="flex w-full flex-col gap-4 p-2 md:w-[48%]">
              <div className="flex h-8 w-[250px] flex-row self-start rounded-md border border-[#749C5B] text-[#749C5B]">
                <input
                  className="flex-1 bg-transparent px-2 placeholder:text-[#749C5B] placeholder:opacity-60 focus:outline-none"
                  placeholder="Buscar aqui por nome "
                />
                <button className="flex h-full items-center justify-center rounded-r-md px-2 text-white">
                  <Search color="#749C5B" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
                {positiveVotes.map((item, index) => (
                  <div
                    key={index}
                    className="shadow-primary border-primary col-span-1 flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-row justify-between">
                      <div className="flex flex-col justify-between">
                        <h1 className="text lg font-bold">{item.name}</h1>
                        <span className="text-[#828690]">
                          {item.party}-{item.state}
                        </span>
                      </div>
                      <div
                        className={`bg-primary flex h-6 w-6 items-center justify-center rounded-full`}
                      >
                        <Check color="#161717" size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-row items-center justify-between">
                <span>0 de 10 linhas (s) selecionadas.</span>
                <div className="mt-2 flex justify-end">
                  <button className="text-primary border-primary mx-1 flex h-8 w-8 items-center justify-center rounded-md border">
                    <ChevronLeft />
                  </button>
                  <button className="bg-primary mx-1 h-8 w-8 rounded-md border border-white px-2 py-1 text-[#222222]">
                    1
                  </button>
                  <button className="text-primary border-primary mx-1 h-8 w-8 rounded-md border px-2 py-1">
                    2
                  </button>
                  <button className="text-primary border-primary mx-1 h-8 w-8 rounded-md border px-2 py-1">
                    3
                  </button>
                  <button className="text-primary border-primary mx-1 h-8 w-8 rounded-md border px-2 py-1">
                    4
                  </button>
                  <button className="text-primary border-primary mx-1 flex h-8 w-8 items-center justify-center rounded-md border">
                    <ChevronRight />
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-primary h-0.5 w-[80%] self-center md:block md:h-full md:w-0.5"></div>
            <div className="flex w-full flex-col gap-4 p-2 md:w-[48%]">
              <div className="flex h-8 w-[250px] flex-row-reverse self-end rounded-md border border-[#749C5B] text-[#749C5B]">
                <input
                  className="flex-1 bg-transparent px-2 placeholder:text-[#749C5B] placeholder:opacity-60 focus:outline-none"
                  placeholder="Buscar aqui por nome "
                />
                <button className="flex h-full items-center justify-center rounded-r-md px-2 text-white">
                  <Search color="#749C5B" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
                {negativeVotes.map((item, index) => (
                  <div
                    key={index}
                    className="col-span-1 flex flex-col gap-4 rounded-lg border border-[#EF4444] bg-white p-4 shadow-sm shadow-[#EF4444]"
                  >
                    <div className="flex flex-row justify-between">
                      <div className="flex flex-col justify-between">
                        <h1 className="text lg font-bold">{item.name}</h1>
                        <span className="text-[#828690]">
                          {item.party}-{item.state}
                        </span>
                      </div>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full bg-[#EF4444]`}
                      >
                        <X color="#161717" size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-row items-center justify-between">
                <span>0 de 10 linhas (s) selecionadas.</span>
                <div className="mt-2 flex justify-end">
                  <button className="text-primary border-primary mx-1 flex h-8 w-8 items-center justify-center rounded-md border">
                    <ChevronLeft />
                  </button>
                  <button className="bg-primary mx-1 h-8 w-8 rounded-md border border-white px-2 py-1 text-[#222222]">
                    1
                  </button>
                  <button className="text-primary border-primary mx-1 h-8 w-8 rounded-md border px-2 py-1">
                    2
                  </button>
                  <button className="text-primary border-primary mx-1 h-8 w-8 rounded-md border px-2 py-1">
                    3
                  </button>
                  <button className="text-primary border-primary mx-1 h-8 w-8 rounded-md border px-2 py-1">
                    4
                  </button>
                  <button className="text-primary border-primary mx-1 flex h-8 w-8 items-center justify-center rounded-md border">
                    <ChevronRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 flex flex-col overflow-hidden rounded-lg bg-white xl:col-span-12">
        <div className="flex h-full w-full flex-col">
          <span className="text-primary p-4 text-xl font-bold">
            Propostas a Serem Analisadas
          </span>
          <div className="grid w-full grid-cols-5 flex-row justify-evenly gap-8 p-4 xl:h-full">
            <div className="flex flex-col gap-4">
              <div className="text-primary bg-primary/20 border-primary p-x8 flex h-40 w-full flex-col gap-8 rounded-lg border p-4 shadow-lg">
                <div className="flex h-full flex-1 flex-col items-center justify-between gap-2">
                  <div className="flex w-full flex-1 items-center justify-center">
                    <User size={40} />
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="h-12 text-center text-lg font-bold uppercase">
                      Pauta da <br />
                      Plenária
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-primary text-primary bg-primary/20 flex w-full items-center justify-center rounded-lg border p-1 font-bold underline">
                Clique aqui para Acessar
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-primary bg-primary/20 border-primary p-x8 flex h-40 w-full flex-col gap-8 rounded-lg border p-4 shadow-lg">
                <div className="flex h-full flex-1 flex-col items-center justify-between gap-2">
                  <div className="flex w-full flex-1 items-center justify-center">
                    <User size={40} />
                  </div>
                  <span className="h-12 text-center text-lg font-bold uppercase">
                    Oradores inscritos <br />
                    para discursar
                  </span>
                </div>
              </div>
              <div className="border-primary text-primary bg-primary/20 flex w-full items-center justify-center rounded-lg border p-1 font-bold underline">
                Clique aqui para Acessar
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-primary bg-primary/20 border-primary p-x8 flex h-40 w-full flex-col gap-8 rounded-lg border p-4 shadow-lg">
                <div className="flex h-full flex-1 flex-col items-center justify-between gap-2">
                  <div className="flex w-full flex-1 items-center justify-center">
                    <User size={40} />
                  </div>
                  <span className="h-12 text-center text-lg font-bold uppercase">
                    Atas da <br />
                    Reunião Plenária
                  </span>
                </div>
              </div>
              <div className="border-primary text-primary bg-primary/20 flex w-full items-center justify-center rounded-lg border p-1 font-bold underline">
                Clique aqui para Acessar
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-primary bg-primary/20 border-primary p-x8 flex h-40 w-full flex-col gap-8 rounded-lg border p-4 shadow-lg">
                <div className="flex h-full flex-1 flex-col items-center justify-between gap-2">
                  <div className="flex w-full flex-1 items-center justify-center">
                    <User size={40} />
                  </div>
                  <span className="h-12 text-center text-lg font-bold uppercase">
                    SESSÃO PLENÁRIA <br />
                    EM TEXTO
                  </span>
                </div>
              </div>
              <div className="border-primary text-primary bg-primary/20 flex w-full items-center justify-center rounded-lg border p-1 font-bold underline">
                Clique aqui para Acessar
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-primary bg-primary/20 border-primary p-x8 flex h-40 w-full flex-col gap-8 rounded-lg border p-4 shadow-lg">
                <div className="flex h-full flex-1 flex-col items-center justify-between gap-2">
                  <div className="flex w-full flex-1 items-center justify-center">
                    <User size={40} />
                  </div>
                  <span className="h-12 text-center text-lg font-bold uppercase">
                    SESSÃO PLENÁRIA <br />
                    EM Vídeo
                  </span>
                </div>
              </div>
              <div className="border-primary text-primary bg-primary/20 flex w-full items-center justify-center rounded-lg border p-1 font-bold underline">
                Clique aqui para Acessar
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-12 flex min-h-80 w-full flex-col gap-4 rounded-xl bg-white p-4 text-black shadow-md">
        <Chat title="IA de Plenário" />
      </div>
      <Tutorials />
    </div>
  );
}
