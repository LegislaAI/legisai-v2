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

export function DayOrder() {
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
  return (
    <div className="grid w-full grid-cols-12 gap-8">
      <div className="col-span-12 flex flex-col overflow-hidden rounded-lg bg-white p-4 xl:col-span-12">
        <div className="flex h-full w-full flex-col gap-4">
          <span className="text-primary text-xl font-bold">
            Presença de Parlamentares na Sessão Deliberativa
          </span>

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
        </div>
      </div>
    </div>
  );
}
