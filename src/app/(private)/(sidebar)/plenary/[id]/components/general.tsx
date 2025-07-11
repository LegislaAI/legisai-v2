"use client";
import {
  EventPropositionProps,
  PropositionDetailsProps,
  PropositionProcessDetailsProps,
} from "@/@types/proposition";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useApiContext } from "@/context/ApiContext";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, FileText, Loader2 } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "swiper/css";

export function General() {
  const pathname = usePathname();
  const { GetAPI } = useApiContext();
  const [selected, setSelected] = useState<EventPropositionProps | null>(null);
  const [eventPropositions, setEventPropositions] = useState<
    EventPropositionProps[]
  >([]);
  const [isGettingPropositions, setIsGettingPropositions] = useState(true);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedDetails, setSelectedDetails] =
    useState<PropositionDetailsProps | null>(null);
  const [propositionProcessList, setPropositionProcessList] = useState<
    PropositionProcessDetailsProps[]
  >([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const years = new Array(125).fill(0).map((_, i) => 2025 - i);
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

  const processColumns = [
    { key: "icon", label: "" },
    { key: "date", label: "Data" },
    { key: "update", label: "Andamento" },
    { key: "document", label: "Documento" },
  ];

  const calculateTimeDifference = (date1: string, date2: string) => {
    const monthsDiff = moment(date1).diff(moment(date2), "months");
    const daysDiff = moment(date1).diff(moment(date2), "days");

    const absMonths = Math.abs(monthsDiff);
    const absDays = Math.abs(daysDiff);

    if (absDays < 30) {
      return `${absDays} DIA${absDays !== 1 ? "S" : ""}`;
    } else {
      return `${absMonths} MES${absMonths !== 1 ? "ES" : ""}`;
    }
  };

  async function GetEventPropositions() {
    const eventId = pathname.split("/")[2];
    const dayOrder = await GetAPI(`/event-proposition/${eventId}`, true);
    if (dayOrder.status === 200) {
      setEventPropositions(dayOrder.body.propositions);
      return setIsGettingPropositions(false);
    }
  }

  async function GetPropositionDetails() {
    const details = await GetAPI(
      `/proposition/details/${selected?.proposition.id}`,
      true,
    );
    if (details.status === 200) {
      setSelectedDetails(details.body.proposition);
    }
  }

  async function GetPropositionProcess() {
    const processList = await GetAPI(
      `/proposition-process/${selected?.proposition.id}?year=${selectedYear}`,
      true,
    );
    if (processList.status === 200) {
      setPropositionProcessList(processList.body.processes);
    }
  }

  useEffect(() => {
    if (selected) {
      GetPropositionProcess();
    }
  }, [selected, selectedYear]);

  useEffect(() => {
    if (selected) {
      GetPropositionDetails();
    }
  }, [selected]);

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

              {isGettingPropositions ? (
                <TableBody>
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="relative h-40 items-center text-center text-lg font-bold"
                    >
                      <span className="absolute top-1/2 left-1/2 mx-auto w-max -translate-x-1/2 -translate-y-1/2">
                        <Loader2 className="animate-spin" />
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : eventPropositions.length > 0 ? (
                eventPropositions.map((row) => (
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
                ))
              ) : (
                <TableBody>
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="relative h-40 items-center text-center text-lg font-bold"
                    >
                      <span className="absolute top-1/2 left-1/2 mx-auto w-max -translate-x-1/2 -translate-y-1/2">
                        Nenhuma proposta encontrada
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
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

      {selected && selectedDetails && (
        <>
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
                <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-4">
                  <div className="flex flex-col gap-1 rounded border border-dashed border-gray-300 px-4 py-3 text-center">
                    <span className="text-xs font-semibold text-gray-900">
                      Apresentação:
                    </span>
                    <span className="text-secondary text-xs font-medium">
                      {moment(selected.proposition.presentationDate).format(
                        "DD/MM/YYYY HH:mm",
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 rounded border border-dashed border-gray-300 px-4 py-3 text-center">
                    <span className="text-xs font-semibold text-gray-900">
                      Última Ação Legislativa:
                    </span>
                    <span className="text-secondary text-xs font-medium">
                      {moment(selected.proposition.lastMovementDate).format(
                        "DD/MM/YYYY HH:mm",
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 rounded border border-dashed border-gray-300 px-4 py-3 text-center">
                    <span className="text-xs font-semibold text-gray-900">
                      Despacho Atual:
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className={cn(
                              "text-secondary text-xs font-medium",
                              selected.report &&
                                selected.report.length > 80 &&
                                "cursor-pointer",
                            )}
                          >
                            {selected.report
                              ? selected.report.length > 80
                                ? selected.report.slice(0, 80) + "..."
                                : selected.report
                              : "N/A"}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent
                          className={cn(
                            "scrollbar-hide max-h-40 w-80 overflow-y-scroll p-0.5 text-justify text-sm text-white",
                            selected.report &&
                              selected.report.length <= 80 &&
                              "hidden",
                          )}
                        >
                          <p>{selected.report}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <button
                    onClick={() =>
                      window.open(
                        selected.proposition.fullPropositionUrl,
                        "_blank",
                      )
                    }
                    disabled={!selected}
                    className="bg-secondary flex flex-col items-center justify-center rounded-md px-4 py-2 text-xs font-semibold text-white uppercase shadow hover:opacity-90 disabled:opacity-50"
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
                <div className="flex w-full flex-col gap-4">
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold">Ementa</span>
                    <span>{selectedDetails.description}</span>
                  </div>
                  {selectedDetails.keywords !== "" && (
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold">Indexação</span>
                      <span>{selectedDetails.keywords}</span>
                    </div>
                  )}
                  {selectedDetails.lastProcess && (
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold">
                        Despacho Atual
                      </span>
                      <span>{selectedDetails.lastProcess.agencyAcronym}</span>
                      <span>{selectedDetails.lastProcess.dispatch}</span>
                      <span>{selectedDetails.lastProcess.scope}</span>
                      <span>
                        {moment(selectedDetails.lastProcess.date).format(
                          "DD/MM/YYYY",
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <section className="col-span-12 mt-6 rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
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

            <div className="overflow-x-auto">
              <Table className="min-w-[640px]">
                <TableHeader className="bg-secondary">
                  <TableRow>
                    {processColumns.map((col) => (
                      <TableHead
                        key={col.key}
                        className="h-12 text-center text-sm font-semibold tracking-wide whitespace-nowrap text-white uppercase"
                      >
                        {col.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                {propositionProcessList.length > 0 ? (
                  <TableBody>
                    {propositionProcessList.map((t, idx) => (
                      <TableRow
                        key={idx}
                        className={`hover:bg-secondary/20 cursor-pointer transition-all duration-300 ${
                          selectedRowIndex === idx
                            ? "h-auto bg-blue-50"
                            : "h-12"
                        }`}
                        onClick={() =>
                          setSelectedRowIndex(
                            selectedRowIndex === idx ? null : idx,
                          )
                        }
                      >
                        <TableCell className="py-1 text-center text-sm whitespace-nowrap">
                          <Image
                            src="/icons/plenary-process.png"
                            alt=""
                            width={100}
                            height={100}
                            className="h-max w-4 object-contain"
                          />
                        </TableCell>
                        <TableCell className="py-1 text-center text-sm whitespace-nowrap">
                          {selectedRowIndex === idx && (
                            <>
                              {idx > 0 && (
                                <div className="text-secondary flex flex-col items-center">
                                  <div className="bg-secondary/20 rounded-md px-2 py-1 text-xs font-semibold">
                                    {calculateTimeDifference(
                                      t.date,
                                      propositionProcessList[idx - 1].date,
                                    )}{" "}
                                  </div>
                                  <ArrowUp />
                                </div>
                              )}
                            </>
                          )}
                          {moment(t.date).format("DD/MM/YYYY")}
                          {selectedRowIndex === idx && (
                            <>
                              {idx < propositionProcessList.length - 1 && (
                                <div className="text-secondary flex flex-col items-center">
                                  <ArrowDown />
                                  <div className="bg-secondary/20 rounded-md px-2 py-1 text-xs font-semibold">
                                    {calculateTimeDifference(
                                      propositionProcessList[idx + 1].date,
                                      t.date,
                                    )}{" "}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </TableCell>
                        <TableCell className="py-1 text-sm">
                          <div>
                            {t.dispatch}
                            {/* Enhanced content when selected */}
                            {selectedRowIndex === idx && (
                              <div className="mt-2 space-y-2">
                                <div className="text-xs text-gray-600">
                                  Additional details about this process...
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-1 text-center text-sm">
                          <a
                            href={selected.proposition.fullPropositionUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-secondary/20 text-secondary rounded-md px-2 py-1 text-sm font-semibold"
                          >
                            Inteiro Teor
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                ) : (
                  <TableBody>
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="relative h-40 items-center text-center text-lg font-bold"
                      >
                        <span className="absolute top-1/2 left-1/2 mx-auto w-max -translate-x-1/2 -translate-y-1/2">
                          Nenhuma tramitação encontrada
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
