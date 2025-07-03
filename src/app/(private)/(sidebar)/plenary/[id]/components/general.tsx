"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Check, FileText, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import "swiper/css";

/**
 * Componente "General" ‑ acrescenta interatividade à tabela principal.
 * ‑ Cada linha é clicável; ao clicar, os cards/accordions/tabelas
 *   abaixo são preenchidos com os dados correspondentes.
 * ‑ Mantém todo o visual/tailwind original.
 */
export function General() {
  /* ───────────────────────────────────────────────────────── TABLE DATA */
  /**
   * Estrutura:
   * {
   *   id: number,
   *   author: string,
   *   proposal: string,
   *   subject: string,
   *   yes: number,
   *   no: number,
   *   votes: number,
   *   result: string,
   *   billMeta: { author: string; code: string },
   *   statusBoxes: { label: string; value: string }[],
   *   tramitation: { date: string; status: string; doc?: string }[],
   * }
   */
  const tableData = [
    {
      id: 1,
      author: "Felipe Carreras (PSB‑PE)",
      proposal: "REQ 1884/2023",
      subject: "Audiência Pública sobre Esporte Inclusivo",
      yes: 43,
      no: 3,
      votes: 48,
      result: "aprovado",
      billMeta: {
        author: "Felipe Carreras (PSB‑PE)",
        code: "REQ 1884/2023",
      },
      statusBoxes: [
        {
          label: "Apresentação:",
          value: "21/ago/2023",
        },
        {
          label: "Última Ação Legislativa:",
          value: "Aprovado ✅",
        },
        {
          label: "Despacho Atual:",
          value: "À publicação",
        },
      ],
      tramitation: [
        {
          date: "21/08/2023",
          status: "Protocolo na Mesa Diretora",
          doc: "Req1884‑2023.pdf",
        },
        {
          date: "10/10/2023",
          status: "Incluso na pauta da Comissão de Esportes",
        },
        {
          date: "25/10/2023",
          status: "Aprovado na CEsp",
          doc: "Parecer_CEsp.pdf",
        },
      ],
    },
    {
      id: 2,
      author: "Maria Silva (PT‑SP)",
      proposal: "PL 2564/2020",
      subject: "Piso Nacional da Enfermagem",
      yes: 378,
      no: 2,
      votes: 380,
      result: "aprovada com alterações",
      billMeta: {
        author: "Maria Silva (PT‑SP)",
        code: "PL 2564/2020",
      },
      statusBoxes: [
        {
          label: "Apresentação:",
          value: "04/mai/2020",
        },
        {
          label: "Última Ação Legislativa:",
          value: "Sancionada ☑️",
        },
        {
          label: "Despacho Atual:",
          value: "Lei 14.434/2022",
        },
      ],
      tramitation: [
        {
          date: "04/05/2020",
          status: "Protocolo na Câmara dos Deputados",
        },
        {
          date: "24/11/2021",
          status: "Aprovado no Senado",
          doc: "Substitutivo_Senado.pdf",
        },
        {
          date: "04/05/2022",
          status: "Aprovado na Câmara com alterações",
        },
        {
          date: "04/08/2022",
          status: "Sanção Presidencial",
          doc: "Lei_14434_2022.pdf",
        },
      ],
    },
    {
      id: 3,
      author: "João Souza (MDB‑MG)",
      proposal: "PLP 18/2022",
      subject: "ICMS sobre Combustíveis",
      yes: 403,
      no: 10,
      votes: 413,
      result: "não analisada",
      billMeta: {
        author: "João Souza (MDB‑MG)",
        code: "PLP 18/2022",
      },
      statusBoxes: [
        {
          label: "Apresentação:",
          value: "11/jun/2022",
        },
        {
          label: "Última Ação Legislativa:",
          value: "Aguardando Designação de Relator",
        },
        {
          label: "Despacho Atual:",
          value: "CFT ➡️ CCJC",
        },
      ],
      tramitation: [
        {
          date: "11/06/2022",
          status: "Distribuído à CFT",
        },
      ],
    },
  ];

  /* ───────────────────────────────────────────────────────── STATE */
  const [selected, setSelected] = useState<(typeof tableData)[0] | null>(null);

  const defaultBillMeta = {
    author: "Não Selecionado",
    code: "—",
  };

  const defaultStatusBoxes = [
    {
      label: "Apresentação:",
      value: "Não Selecionado",
    },
    {
      label: "Última Ação Legislativa:",
      value: "Não Selecionado",
    },
    {
      label: "Despacho Atual:",
      value: "Não Selecionado",
    },
  ];

  const billMeta = selected ? selected.billMeta : defaultBillMeta;
  const statusBoxes = selected ? selected.statusBoxes : defaultStatusBoxes;
  const tramitation = selected ? selected.tramitation : [];
  return (
    <div className="grid w-full grid-cols-12 gap-8">
      {/* ────────────────────────────── TABLE */}
      <div className="col-span-12 flex flex-col overflow-hidden rounded-lg bg-white p-4 xl:col-span-12">
        <div className="flex h-full w-full flex-col gap-4">
          <span className="text-primary text-xl font-bold">
            Propostas a Serem Analisadas
          </span>

          <div className="overflow-auto xl:h-full">
            <Table>
              <TableHeader className="bg-primary">
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
                            className="h-4 w-4 object-contain"
                          />
                        ) : (
                          <div
                            className={`flex h-4 w-4 items-center justify-center rounded-full ${column.key === "yes" ? "text-primary bg-white" : "bg-[#DC2626]"}`}
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
                    onClick={() => setSelected(row)}
                    className={cn(
                      "hover:bg-primary/20 h-12 cursor-pointer transition-all duration-300",
                      selected?.id === row.id && "bg-primary/10",
                    )}
                  >
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

      {/* ────────────────────────────── HINT BANNER */}
      {!selected && (
        <div className="bg-primary col-span-12 flex w-full items-center justify-center rounded-lg p-4">
          <span className="text-xl text-white uppercase">
            Clique em uma proposta acima para visualizar os{" "}
            <span className="font-bold">detalhes da tramitação </span>
          </span>
        </div>
      )}

      {/* ────────────────────────────── INFO & DOCS */}
      <section className="col-span-12 grid grid-cols-12 gap-6">
        {/* LEFT: GENERAL INFO CARD */}
        <div className="col-span-12 flex flex-col rounded-lg bg-white shadow-sm ring-1 ring-gray-200 lg:col-span-8 xl:col-span-9">
          {/* first line */}
          <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-3">
            {/* author chip */}
            <div className="flex items-center gap-3 rounded-sm px-3 py-1.5">
              <div className="rounded-lg bg-gray-100 p-2">
                <Image
                  src={"/icons/plenary/user-green.svg"}
                  alt=""
                  width={250}
                  height={250}
                  className="h-6 w-6 object-contain"
                />
              </div>
              <div className="leading-tight">
                <p className="text-[13px] font-semibold text-gray-900">
                  {billMeta.author.split(" (")[0]}
                </p>
                <p className="text-[11px] text-gray-500">
                  ({billMeta.author.split(" (")[1]?.replace(/\)$/, "") || ""})
                </p>
              </div>
            </div>

            {/* bill code */}
            <h1 className="text-primary text-lg font-extrabold tracking-tight uppercase">
              {billMeta.code}
            </h1>

            {/* inteiro teor button */}
            <button
              disabled={!selected}
              className="bg-primary flex flex-col items-center rounded-md px-4 py-2 text-xs font-semibold text-white uppercase shadow hover:opacity-90 disabled:opacity-50"
            >
              <div className="flex flex-row items-center justify-center gap-1">
                <FileText size={24} className="text-white" />
                <div className="flex flex-col items-center text-center">
                  <span>Clique Aqui Para:</span>
                  <span className="ml-1">Inteiro Teor</span>
                </div>
              </div>
            </button>
          </div>

          {/* dotted divider */}
          <div className="h-px w-full bg-gray-200" />

          {/* status boxes */}
          <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-3">
            {statusBoxes.map((box) => (
              <div
                key={box.label}
                className="flex flex-col gap-1 rounded border border-dashed border-gray-300 px-4 py-3 text-center"
              >
                <span className="text-xs font-semibold text-gray-900">
                  {box.label}
                </span>
                <span className="text-primary text-xs font-medium">
                  {box.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: DOCUMENTOS CARD */}
        <div className="col-span-12 flex flex-col rounded-lg bg-white shadow-sm ring-1 ring-gray-200 lg:col-span-4 xl:col-span-3">
          <div className="flex items-start justify-between px-6 pt-5">
            <h2 className="text-primary flex items-center gap-2 text-lg font-semibold">
              <Image
                src={"/icons/plenary/documents.svg"}
                alt=""
                width={250}
                height={250}
                className="h-6 w-6 object-contain"
              />{" "}
              Documentos
            </h2>
            <Image
              src={"/icons/plenary/settings.svg"}
              alt=""
              width={250}
              height={250}
              className="h-6 w-6 object-contain"
            />
          </div>

          <div className="flex flex-1 items-center justify-center px-6 py-8">
            <button
              disabled={!selected}
              className="bg-primary/80 flex items-center gap-2 rounded-md px-5 py-2 text-sm font-semibold text-white shadow hover:opacity-90 disabled:opacity-50"
            >
              <FileText size={24} className="text-white" /> Acessar Todos
            </button>
          </div>
        </div>
      </section>

      {/* ────────────────────────────── ACCORDION: RESUMO GERAL */}
      <Accordion
        type="single"
        collapsible
        className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down col-span-12 mt-6 flex w-full flex-col gap-4 rounded-lg bg-white shadow-sm ring-1 ring-gray-200"
      >
        <AccordionItem
          value="item-1"
          className="group group peer w-full rounded-lg px-4 transition-colors duration-300"
        >
          <AccordionTrigger className="w-full text-start text-lg outline-none focus:border-0 focus:outline-none">
            <div className="flex items-center justify-between px-6 py-4 hover:scale-[1.00]">
              <h3 className="text-primary flex items-center gap-2 text-xl font-semibold">
                <Image
                  src={"/icons/plenary/documents.svg"}
                  alt=""
                  width={250}
                  height={250}
                  className="h-6 w-6 object-contain"
                />{" "}
                Resumo Geral
              </h3>
            </div>
          </AccordionTrigger>

          <AccordionContent className="flex w-full flex-col p-2 text-black">
            <div className="flex w-full flex-row items-center rounded-md p-2 text-start text-base">
              <div className="border-primary w-full border-l px-2 text-lg">
                {selected ? `Tramitação resumida de ${billMeta.code}` : "xxxxx"}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* ────────────────────────────── FILTER BY DATE (placeholder) */}
      <section className="col-span-12 mt-6 rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
        <Accordion
          type="single"
          collapsible
          className="flex w-full flex-col gap-4"
        >
          <AccordionItem
            value="item-1"
            className="group group peer w-full rounded-lg shadow-none shadow-transparent transition-colors duration-300"
          >
            <AccordionTrigger className="w-full text-start text-lg outline-none focus:border-0 focus:outline-none">
              <div className="flex items-center justify-between px-6 py-4">
                <h3 className="text-primary flex items-center gap-2 text-xl font-semibold">
                  <Image
                    src={"/icons/plenary/calendar.svg"}
                    alt=""
                    width={250}
                    height={250}
                    className="h-6 w-6 object-contain"
                  />{" "}
                  Filtro por Data das Tramitações:
                </h3>
              </div>
            </AccordionTrigger>
            <AccordionContent className="flex w-full flex-col p-2 text-black">
              <div className="flex w-full flex-row items-center rounded-md p-2 text-start text-base">
                <div className="border-primary w-full border-l px-2 text-lg">
                  xxxxx
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* ────────────────────────────── TRAMITAÇÃO TABLE */}
      <section className="col-span-12 mt-6 rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
        {/* Title */}
        <div className="flex items-center justify-between px-6 py-4">
          <h3 className="text-primary flex items-center gap-2 text-xl font-semibold">
            <Image
              src={"/icons/plenary/documents.svg"}
              alt=""
              width={250}
              height={250}
              className="h-6 w-6 object-contain"
            />{" "}
            Tramitação
          </h3>
        </div>

        {/* Table header */}
        <div className="overflow-x-auto">
          <Table className="min-w-[640px]">
            <TableHeader className="bg-primary">
              <TableRow>
                {[
                  { key: "date", label: "Data" },
                  { key: "status", label: "Andamento" },
                  { key: "doc", label: "Documento" },
                ].map((col) => (
                  <TableHead
                    key={col.key}
                    className="h-12 text-center text-sm font-semibold tracking-wide whitespace-nowrap text-white uppercase"
                  >
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            {tramitation.length > 0 && (
              <TableBody>
                {tramitation.map((t, idx) => (
                  <TableRow
                    key={idx}
                    className="hover:bg-primary/20 h-12 transition-all duration-300"
                  >
                    <TableCell className="h-4 py-1 text-center text-sm whitespace-nowrap">
                      {t.date}
                    </TableCell>
                    <TableCell className="h-4 py-1 text-sm">
                      {t.status}
                    </TableCell>
                    <TableCell className="h-4 py-1 text-center text-sm">
                      {t.doc ? (
                        <a
                          href={`#${t.doc}`}
                          className="text-primary underline-offset-2 hover:underline"
                        >
                          {t.doc}
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </div>

        {/* Empty state */}
        {tramitation.length === 0 && (
          <div className="flex items-center justify-center px-6 py-12">
            <p className="max-w-xl text-center text-lg leading-relaxed text-gray-700">
              <span className="text-primary font-extrabold">
                Não Selecionado!!
              </span>{" "}
              Favor clicar em alguma das <br />
              <span className="text-primary font-extrabold">
                “Propostas a serem Analisadas”
              </span>
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
