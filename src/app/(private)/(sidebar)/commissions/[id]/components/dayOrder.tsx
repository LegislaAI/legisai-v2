"use client";
import { EventPropositionProps } from "@/@types/proposition";
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
import { Loader2 } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "swiper/css";

export function DayOrder() {
  const { GetAPI } = useApiContext();
  const pathname = usePathname();
  const [eventPropositions, setEventPropositions] = useState<
    EventPropositionProps[]
  >([]);
  const [isGettingPropositions, setIsGettingPropositions] = useState(true);

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

  async function GetEventDayOrder() {
    const eventId = pathname.split("/")[2];
    const dayOrder = await GetAPI(`/event-proposition/${eventId}`, true);
    if (dayOrder.status === 200) {
      setEventPropositions(dayOrder.body.propositions);
      return setIsGettingPropositions(false);
    }
  }

  useEffect(() => {
    GetEventDayOrder();
  }, []);

  return (
    <div className="grid w-full grid-cols-12 gap-8">
      <div className="col-span-12 flex flex-col overflow-hidden rounded-lg bg-white p-4 xl:col-span-12">
        <div className="flex h-full w-full flex-col gap-4">
          <span className="text-secondary text-xl font-bold">Ordem do Dia</span>

          <div className="overflow-auto xl:h-full">
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
                      <TableCell className="h-4 min-w-40 py-1 text-center text-sm">
                        {row.regime}
                      </TableCell>
                      <TableCell className="h-4 min-w-40 py-1 text-center text-sm">
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
    </div>
  );
}
