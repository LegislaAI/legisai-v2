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
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import "swiper/css";

export function Presence() {
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
  const [search, setSearch] = useState("");
  return (
    <div className="grid w-full grid-cols-12 gap-8">
      <div className="col-span-12 flex flex-col overflow-hidden rounded-lg bg-white p-4 xl:col-span-12">
        <div className="flex h-full w-full flex-col gap-4">
          <span className="text-primary text-xl font-bold">
            Presença de Parlamentares na Sessão Deliberativa
          </span>
          <div className="border-primary flex w-full flex-col items-center justify-between gap-4 rounded-lg border p-4 lg:flex-row lg:gap-0">
            <div className="flex flex-1 flex-col gap-2">
              <h2 className="text-lg font-bold text-black uppercase">
                deputados presentes:
              </h2>
              <span className="text-black">
                Verifique todos aqueles que estavam de faot presente na Sessão
                Deliberativa
              </span>
            </div>
            <div className="group flex h-8 w-full flex-row rounded-md border border-[#475569] md:w-1/3">
              <button className="flex h-full items-center justify-center rounded-l-md bg-[#749C5B] px-2 text-[#222222] transition-opacity duration-300">
                Buscar
              </button>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent px-2 text-[#749C5B] transition-opacity duration-300 outline-none placeholder:text-[#749C5B] placeholder:opacity-40"
                placeholder="Buscar aqui por nome de Político ou Partido Político..."
              />
              <button className="flex h-full items-center justify-center rounded-r-md bg-[#749C5B] px-2 text-white transition-opacity duration-300">
                <Search color="#222222" size={14} />
              </button>
            </div>
          </div>
          <div className="overflow-auto xl:h-full">
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
  );
}
