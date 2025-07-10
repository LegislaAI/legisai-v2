"use client";
import { EventPropositionProps } from "@/@types/proposition";
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
import { useApiContext } from "@/context/ApiContext";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "swiper/css";

interface GeneralProps {
  setSelectedStep: React.Dispatch<React.SetStateAction<number>>;
}
export function General({ setSelectedStep }: GeneralProps) {
  const pathname = usePathname();
  const { GetAPI } = useApiContext();
  const [selected, setSelected] = useState<EventPropositionProps | null>(null);
  const [eventPropositions, setEventPropositions] = useState<
    EventPropositionProps[]
  >([]);
  const [selectedYear, setSelectedYear] = useState(2025);
  const years = new Array(125).fill(0).map((_, i) => 2025 - i);

  console.log("years: ", years);

  const columns = [
    {
      key: "title",
      label: "Proposição",
    },
    {
      key: "topic",
      label: "Tópico",
    },
    {
      key: "presentation",
      label: "Data de Apresentação",
    },
    {
      key: "regime",
      label: "Regime",
    },
    {
      key: "reporter",
      label: "Relator",
    },
    {
      key: "actions",
      label: "",
    },
  ];

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

  const billMeta = defaultBillMeta;
  const statusBoxes = defaultStatusBoxes;
  const tramitation = [];

  async function GetEventPropositions() {
    const eventId = pathname.split("/")[2];
    const dayOrder = await GetAPI(`/event-proposition/${eventId}`, true);
    console.log("dayOrder", dayOrder);
    if (dayOrder.status === 200) {
      setEventPropositions(dayOrder.body.propositions);
    }
  }

  useEffect(() => {
    GetEventPropositions();
  }, []);

  return (
    <div className="grid w-full grid-cols-12 gap-8">
      {/* ────────────────────────────── TABLE */}
      <div className="col-span-12 flex flex-col overflow-hidden rounded-lg bg-white p-4 xl:col-span-12">
        <div className="flex h-full w-full flex-col gap-4">
          <span className="text-secondary text-xl font-bold">
            Propostas a Serem Analisadas
          </span>

          <div className="overflow-auto xl:h-[600px]">
            <Table>
              <TableHeader className="bg-secondary">
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className="h-12 justify-end text-center text-sm font-semibold text-white"
                    >
                      <div className="mx-auto flex w-max items-center gap-2">
                        <Image
                          src="/icons/plenary/circles.png"
                          alt=""
                          width={50}
                          height={50}
                          className={cn(
                            "h-max w-4 object-contain",
                            column.key === "actions" && "hidden",
                          )}
                        />
                        {column.label}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              {eventPropositions.map((row) => (
                <TableBody key={row.id}>
                  <TableRow
                    onClick={() => setSelected(row)}
                    className={cn(
                      "hover:bg-secondary/20 h-12 cursor-pointer transition-all duration-300",
                    )}
                  >
                    <TableCell className="h-4 py-1 text-sm font-medium whitespace-nowrap">
                      {row.title}{" "}
                    </TableCell>
                    <TableCell className="h-4 py-1 text-center text-sm font-semibold whitespace-nowrap">
                      {row.topic}
                    </TableCell>
                    <TableCell className="h-4 w-80 py-1 text-center text-sm">
                      {moment(row.proposition.presentationDate).format(
                        "DD/MM/YYYY HH:mm",
                      )}
                    </TableCell>
                    <TableCell className="h-4 py-1 text-center text-sm">
                      {row.regime}
                    </TableCell>
                    <TableCell className="h-4 py-1 text-center text-sm">
                      {row.reporter ? row.reporter.name : "N/A"}
                    </TableCell>
                    <TableCell className="h-4 py-1 text-center text-sm">
                      <a
                        href={row.proposition.url}
                        target="_blank"
                        className="bg-secondary/20 text-secondary rounded-lg px-2 py-1 text-sm font-semibold"
                      >
                        Acessar
                      </a>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ))}
            </Table>
          </div>
        </div>
      </div>

      {!selected && (
        <div className="bg-secondary col-span-12 flex w-full items-center justify-center rounded-lg p-4">
          <span className="text-xl text-white uppercase">
            Clique em uma proposta acima para visualizar os{" "}
            <span className="font-bold">detalhes da tramitação </span>
          </span>
        </div>
      )}

      {selected && (
        <>
          {/* ────────────────────────────── INFO & DOCS */}
          <section className="col-span-12 grid grid-cols-12 gap-6">
            {/* LEFT: GENERAL INFO CARD */}
            <div className="col-span-12 flex flex-col rounded-lg bg-white shadow-sm ring-1 ring-gray-200 lg:col-span-8 xl:col-span-9">
              {/* first line */}
              <div className="flex flex-col items-center justify-between gap-4 px-6 pt-5 pb-3 md:flex-row lg:flex-col xl:flex-row">
                {/* author chip */}
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3 rounded-sm px-3 py-1.5">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <Image
                        src={"/icons/plenary/user-green.svg"}
                        alt=""
                        width={250}
                        height={250}
                        className="h-6 max-h-6 min-h-6 w-6 max-w-6 min-w-6 object-contain"
                      />
                    </div>
                    <div className="leading-tight">
                      <p className="text-[13px] font-semibold text-gray-900">
                        {billMeta.author.split(" (")[0]}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        (
                        {billMeta.author.split(" (")[1]?.replace(/\)$/, "") ||
                          ""}
                        )
                      </p>
                    </div>
                  </div>

                  {/* bill code */}
                  <h1 className="text-secondary text-lg font-extrabold tracking-tight uppercase">
                    {billMeta.code}
                  </h1>
                </div>

                {/* inteiro teor button */}
                <button
                  disabled={!selected}
                  className="bg-secondary flex flex-col items-center rounded-md px-4 py-2 text-xs font-semibold text-white uppercase shadow hover:opacity-90 disabled:opacity-50"
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
                    <span className="text-secondary text-xs font-medium">
                      {box.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: DOCUMENTOS CARD */}
            <div className="col-span-12 flex flex-col rounded-lg bg-white shadow-sm ring-1 ring-gray-200 lg:col-span-4 xl:col-span-3">
              <div className="flex items-start justify-between px-6 pt-5">
                <h2 className="text-secondary flex items-center gap-2 text-lg font-semibold">
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
                  onClick={() => setSelectedStep(2)}
                  className="bg-secondary/80 flex items-center gap-2 rounded-md px-5 py-2 text-sm font-semibold text-white shadow hover:opacity-90 disabled:opacity-50"
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
                <div className="flex items-center justify-between px-6 py-4 hover:scale-[1.005]">
                  <h3 className="text-secondary flex items-center gap-2 text-xl font-semibold">
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
                  <div className="border-secondary w-full border-l px-2 text-lg">
                    {selected
                      ? `Tramitação resumida de ${billMeta.code}`
                      : "xxxxx"}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* ────────────────────────────── FILTER BY DATE (placeholder) */}
          {/* <section className="col-span-12 mt-6 rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
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
                    <h3 className="text-secondary flex items-center gap-2 text-xl font-semibold">
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
                    <div className="border-secondary w-full border-l px-2 text-lg">
                      03/07/2025
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section> */}

          {/* ────────────────────────────── TRAMITAÇÃO TABLE */}
          <section className="col-span-12 mt-6 rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
            {/* Title */}
            <div className="flex h-14 items-center justify-between gap-4 px-6 py-4">
              <h3 className="text-secondary flex items-center gap-2 text-xl font-semibold">
                <Image
                  src={"/icons/plenary/documents.svg"}
                  alt=""
                  width={250}
                  height={250}
                  className="h-6 w-6 object-contain"
                />{" "}
                Filtro por Data das Tramitações:
              </h3>
              <div className="scrollbar-hide flex h-10 w-full gap-4 overflow-x-scroll p-2">
                {years.map((y) => (
                  <div
                    key={y}
                    onClick={() => setSelectedYear(y)}
                    className={cn(
                      "relative h-max w-max cursor-pointer px-1 py-0.5 text-sm font-semibold transition duration-300",
                      y === selectedYear && "text-secondary",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0 left-0 h-0.5 w-full bg-transparent transition duration-300",
                        y === selectedYear && "bg-secondary",
                      )}
                    />
                    <span>{y}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Table header */}
            <div className="overflow-x-auto">
              <Table className="min-w-[640px]">
                <TableHeader className="bg-secondary">
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
                        className="hover:bg-secondary/20 h-12 transition-all duration-300"
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
                              className="text-secondary underline-offset-2 hover:underline"
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
                  <span className="text-secondary font-extrabold">
                    Não Selecionado!!
                  </span>{" "}
                  Favor clicar em alguma das <br />
                  <span className="text-secondary font-extrabold">
                    “Propostas a serem Analisadas”
                  </span>
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
