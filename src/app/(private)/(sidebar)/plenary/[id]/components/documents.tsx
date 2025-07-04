"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Image from "next/image";
import "swiper/css";

import { Check, Type, User2, Video, X } from "lucide-react";
import { Chat } from "./Chat";
import { Tutorials } from "./Tutorials";
export function Documents() {
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

  return (
    <div className="grid w-full grid-cols-12 gap-8">
      <div className="col-span-12 flex flex-col overflow-hidden rounded-lg bg-white xl:col-span-12">
        <div className="flex h-full w-full flex-col">
          <span className="text-secondary p-4 text-xl font-bold">
            Propostas a Serem Analisadas
          </span>
          <div className="grid w-full grid-cols-1 flex-row justify-evenly gap-8 p-4 lg:grid-cols-5 xl:h-full">
            <button
              className="flex flex-col gap-4"
              onClick={() => window.open("https://www.google.com/", "_blank")}
            >
              <div className="text-secondary bg-secondary/20 border-secondary p-x8 flex h-40 w-full flex-col gap-8 rounded-lg border p-4 shadow-lg">
                <div className="flex h-full flex-1 flex-col items-center justify-between gap-2">
                  <div className="flex w-full flex-1 items-center justify-center">
                    <Image
                      src="/icons/plenary/paper.svg"
                      alt=""
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="h-12 text-center text-lg font-bold uppercase">
                      Pauta da <br />
                      Plenária
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-secondary text-secondary bg-secondary/20 flex w-full items-center justify-center rounded-lg border p-1 font-bold underline">
                Clique aqui para Acessar
              </div>
            </button>
            <button
              onClick={() => window.open("https://www.google.com/", "_blank")}
              className="flex flex-col gap-4"
            >
              <div className="text-secondary bg-secondary/20 border-secondary p-x8 flex h-40 w-full flex-col gap-8 rounded-lg border p-4 shadow-lg">
                <div className="flex h-full flex-1 flex-col items-center justify-between gap-2">
                  <div className="flex w-full flex-1 items-center justify-center">
                    <User2 size={40} />
                  </div>
                  <span className="h-12 text-center text-lg font-bold uppercase">
                    Oradores inscritos <br />
                    para discursar
                  </span>
                </div>
              </div>
              <div className="border-secondary text-secondary bg-secondary/20 flex w-full items-center justify-center rounded-lg border p-1 font-bold underline">
                Clique aqui para Acessar
              </div>
            </button>
            <button
              onClick={() => window.open("https://www.google.com/", "_blank")}
              className="flex flex-col gap-4"
            >
              <div className="text-secondary bg-secondary/20 border-secondary p-x8 flex h-40 w-full flex-col gap-8 rounded-lg border p-4 shadow-lg">
                <div className="flex h-full flex-1 flex-col items-center justify-between gap-2">
                  <div className="flex w-full flex-1 items-center justify-center">
                    <Image
                      src="/icons/plenary/folder-green.svg"
                      alt=""
                      width={40}
                      height={40}
                    />
                  </div>
                  <span className="h-12 text-center text-lg font-bold uppercase">
                    Atas da <br />
                    Reunião Plenária
                  </span>
                </div>
              </div>
              <div className="border-secondary text-secondary bg-secondary/20 flex w-full items-center justify-center rounded-lg border p-1 font-bold underline">
                Clique aqui para Acessar
              </div>
            </button>
            <button
              onClick={() => window.open("https://www.google.com/", "_blank")}
              className="flex flex-col gap-4"
            >
              <div className="text-secondary bg-secondary/20 border-secondary p-x8 flex h-40 w-full flex-col gap-8 rounded-lg border p-4 shadow-lg">
                <div className="flex h-full flex-1 flex-col items-center justify-between gap-2">
                  <div className="flex w-full flex-1 items-center justify-center">
                    <Type size={40} />
                  </div>
                  <span className="h-12 text-center text-lg font-bold uppercase">
                    SESSÃO PLENÁRIA <br />
                    EM TEXTO
                  </span>
                </div>
              </div>
              <div className="border-secondary text-secondary bg-secondary/20 flex w-full items-center justify-center rounded-lg border p-1 font-bold underline">
                Clique aqui para Acessar
              </div>
            </button>
            <button
              onClick={() => window.open("https://www.google.com/", "_blank")}
              className="flex flex-col gap-4"
            >
              <div className="text-secondary bg-secondary/20 border-secondary p-x8 flex h-40 w-full flex-col gap-8 rounded-lg border p-4 shadow-lg">
                <div className="flex h-full flex-1 flex-col items-center justify-between gap-2">
                  <div className="flex w-full flex-1 items-center justify-center">
                    <Video size={40} />
                  </div>
                  <span className="h-12 text-center text-lg font-bold uppercase">
                    SESSÃO PLENÁRIA <br />
                    EM Vídeo
                  </span>
                </div>
              </div>
              <div className="border-secondary text-secondary bg-secondary/20 flex w-full items-center justify-center rounded-lg border p-1 font-bold underline">
                Clique aqui para Acessar
              </div>
            </button>
          </div>
        </div>
      </div>
      <div className="col-span-12 flex flex-col overflow-hidden rounded-lg bg-white xl:col-span-12">
        <div className="flex h-full w-full flex-col">
          <span className="text-secondary p-4 text-xl font-bold">
            Propostas a Serem Analisadas
          </span>
          <div className="h-80 overflow-auto xl:h-full">
            <Table>
              <TableHeader className="bg-secondary">
                <TableRow>
                  {[
                    {
                      key: "authors",
                      label: "Autores",
                      image: "/icons/plenary/user.svg",
                    },
                    {
                      key: "proposal",
                      label: "Proposta",
                      image: "/icons/plenary/folder.svg",
                    },
                    {
                      key: "subject",
                      label: "Assunto",
                      image: "/icons/plenary/clipboard.svg",
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
                      image: "/icons/plenary/circles.png",
                    },
                    {
                      key: "result",
                      label: "Resultado",
                      image: "/icons/plenary/circles.png",
                    },
                  ].map((column) => (
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
                        {column.image ? (
                          <Image
                            src={column.image}
                            alt=""
                            width={250}
                            height={250}
                            className="h-6 w-6 object-contain"
                          />
                        ) : (
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full ${column.key === "yes" ? "text-secondary bg-white" : "bg-[#DC2626]"}`}
                          >
                            {column.key === "yes" ? <Check /> : <X />}
                          </div>
                        )}

                        {column.label}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              {tableData.map((row) => (
                <TableBody key={row.id}>
                  <TableRow
                    className={cn(
                      "hover:bg-secondary/20 h-12 cursor-pointer transition-all duration-300",
                    )}
                  >
                    <TableCell className="h-4 py-1 text-sm font-medium whitespace-nowrap">
                      {row.author}{" "}
                      <span className="text-secondary font-semibold italic">
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
                                ? "bg-secondary/20 text-secondary"
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

      <div className="col-span-12 flex min-h-80 w-full flex-col gap-4 rounded-xl bg-white p-4 text-black shadow-md">
        <Chat title="IA de Plenário" />
      </div>
      <Tutorials />
    </div>
  );
}
