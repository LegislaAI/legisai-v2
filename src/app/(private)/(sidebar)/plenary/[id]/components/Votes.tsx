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
import { Check, Loader2, Search, X } from "lucide-react";
import Image from "next/image";
import "swiper/css";

import { VoteDetailsProps, VotesProps } from "@/@types/proposition";
import { CustomPagination } from "@/components/CustomPagination";
import { useApiContext } from "@/context/ApiContext";
import debounce from "lodash.debounce";
import moment from "moment";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function Votes() {
  const pathname = usePathname();
  const { GetAPI } = useApiContext();

  const voteColumns = [
    { key: "title", label: "Proposição" },
    { key: "positive", label: "Positivos" },
    { key: "negative", label: "Negativos" },
    { key: "Total", label: "Total" },
    { key: "result", label: "Resultado" },
  ];

  const [selectedVote, setSelectedVote] = useState<VotesProps | null>(null);
  const [votesList, setVotesList] = useState<VotesProps[]>([]);
  const [isGettingVotes, setIsGettingVotes] = useState(true);
  const [positiveVotesList, setPositiveVotesList] = useState<
    VoteDetailsProps[]
  >([]);
  const [negativeVotesList, setNegativeVotesList] = useState<
    VoteDetailsProps[]
  >([]);
  const [positiveVotesCurrentPage, setPositiveVotesCurrentPage] = useState(1);
  const [negativeVotesCurrentPage, setNegativeVotesCurrentPage] = useState(1);
  const [positiveVotesTotalPages, setPositiveVotesTotalPages] = useState(1);
  const [negativeVotesTotalPages, setNegativeVotesTotalPages] = useState(1);
  const [positiveVotesQuery, setPositiveVotesQuery] = useState("");
  const [negativeVotesQuery, setNegativeVotesQuery] = useState("");

  async function GetVotes() {
    const eventId = pathname.split("/")[2];
    const votes = await GetAPI(`/voting/${eventId}`, true);
    if (votes.status === 200) {
      setVotesList(votes.body.voting);
      return setIsGettingVotes(false);
    }
  }

  async function GetPositiveVotes() {
    const positiveVotes = await GetAPI(
      `/voting-politician/positive/${selectedVote?.id}?page=${positiveVotesCurrentPage}&query=${positiveVotesQuery}`,
      true,
    );
    if (positiveVotes.status === 200) {
      setPositiveVotesList(positiveVotes.body.votes);
      setPositiveVotesTotalPages(positiveVotes.body.pages);
    }
  }

  async function GetNegativeVotes() {
    const negativeVotes = await GetAPI(
      `/voting-politician/negative/${selectedVote?.id}?page=${negativeVotesCurrentPage}&query=${negativeVotesQuery}`,
      true,
    );
    if (negativeVotes.status === 200) {
      setNegativeVotesList(negativeVotes.body.votes);
      setNegativeVotesTotalPages(negativeVotes.body.pages);
    }
  }

  const ProposalName = (vote: VotesProps) => {
    if (vote.mainProposition) {
      return (
        vote.mainProposition.typeAcronym +
        " " +
        vote.mainProposition.number +
        "/" +
        vote.mainProposition.year +
        " (" +
        vote.proposition.typeAcronym +
        ")"
      );
    } else {
      return (
        vote.proposition.typeAcronym +
        " " +
        vote.proposition.number +
        "/" +
        vote.proposition.year
      );
    }
  };

  const handleStopTypingPositive = (value: string) => {
    setPositiveVotesQuery(value);
  };

  const debouncedHandleStopTypingPositive = useCallback(
    debounce(handleStopTypingPositive, 500),
    [],
  );

  const handleStopTypingNegative = (value: string) => {
    setNegativeVotesQuery(value);
  };

  const debouncedHandleStopTypingNegative = useCallback(
    debounce(handleStopTypingNegative, 500),
    [],
  );

  const isSymbolicVote = (positive: number, negative: number) => {
    if (positive === 0 && negative === 0) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    GetVotes();
  }, []);

  useEffect(() => {
    if (selectedVote) {
      async function GetVotes() {
        await Promise.all([GetPositiveVotes(), GetNegativeVotes()]);
      }
      GetVotes();
    }
  }, [selectedVote]);

  useEffect(() => {
    if (selectedVote) {
      GetPositiveVotes();
    }
  }, [selectedVote, positiveVotesCurrentPage, positiveVotesQuery]);

  useEffect(() => {
    if (selectedVote) {
      GetNegativeVotes();
    }
  }, [selectedVote, negativeVotesCurrentPage, negativeVotesQuery]);

  return (
    <div className="grid w-full grid-cols-12 gap-8 pb-20 xl:pb-10">
      <div className="col-span-12 flex flex-col overflow-hidden rounded-lg bg-white xl:col-span-12">
        <div className="flex h-full w-full flex-col">
          <span className="text-secondary p-4 text-xl font-bold">
            Votações do Plenário
          </span>
          <div className="h-80 overflow-auto xl:h-full">
            <Table>
              <TableHeader className="bg-secondary">
                <TableRow>
                  {voteColumns.map((column) => (
                    <TableHead
                      key={column.key}
                      className="justify-end text-center text-sm font-semibold text-white"
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

              {isGettingVotes ? (
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
              ) : votesList.length !== 0 ? (
                votesList.map((row) => (
                  <TableBody key={row.id}>
                    <TableRow
                      key={row.id}
                      onClick={() => setSelectedVote(row)}
                      className={cn(
                        "hover:bg-secondary/20 h-12 cursor-pointer transition-all duration-300",
                        selectedVote?.id === row.id && "bg-secondary/20",
                      )}
                    >
                      <TableCell className="h-4 max-w-80 truncate py-1 text-sm font-medium whitespace-nowrap">
                        {row.title ||
                          `Votação ${row.proposition.typeAcronym} ${row.proposition.number}/${row.proposition.year}`}
                      </TableCell>
                      <TableCell className="h-4 w-80 py-1 text-center text-sm">
                        {row.totalVotes === 0
                          ? "Votação Simbólica"
                          : row.positiveVotes}
                      </TableCell>
                      <TableCell className="h-4 py-1 text-center text-sm">
                        {row.totalVotes === 0
                          ? "Votação Simbólica"
                          : row.negativeVotes}
                      </TableCell>
                      <TableCell className="h-4 py-1 text-center text-sm">
                        {row.totalVotes === 0
                          ? "Votação Simbólica"
                          : row.totalVotes}
                      </TableCell>
                      <TableCell className="h-4 w-10 py-1 text-sm font-medium">
                        <div className="flex items-end justify-end">
                          <div className="flex h-full w-40 max-w-40 min-w-40 items-center justify-center text-center">
                            <span
                              className={cn(
                                "w-full rounded-lg px-2 py-1",
                                row.result
                                  ? "bg-secondary/20 text-secondary"
                                  : "bg-rose-500/20 text-rose-500",
                              )}
                            >
                              {row.result ? "Aprovado" : "Não Aprovada"}
                            </span>
                          </div>
                        </div>
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
                        Nenhuma votação encontrada
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "col-span-12 flex flex-col overflow-hidden rounded-lg bg-white xl:col-span-12",
          votesList.length === 0 && "hidden",
        )}
      >
        <div className="bg-secondary/20 flex h-full w-full flex-col gap-4 p-4">
          <span className="text-secondary text-xl font-bold">
            {selectedVote
              ? "Detalhes da Votação"
              : "Escolha uma votação acima para ver detalhes"}
          </span>
          {selectedVote && (
            <div className="xl:px-4">
              <div className="border-secondary flex w-full flex-col overflow-hidden rounded-lg border bg-white px-4 py-2 md:px-8">
                <div className="flex h-full w-full flex-col justify-between md:flex-row">
                  <div
                    className={cn(
                      "flex flex-col justify-between gap-8 md:max-w-[60%]",
                      isSymbolicVote(
                        selectedVote.positiveVotes,
                        selectedVote.negativeVotes,
                      ) && "md:max-w-full",
                    )}
                  >
                    <span className="font-semibold">
                      {ProposalName(selectedVote)}
                    </span>

                    <div className="flex flex-col gap-2 text-justify text-sm">
                      <div className="flex flex-col items-start gap-1 xl:flex-row xl:items-center">
                        <span className="font-semibold underline">
                          {ProposalName(selectedVote)}
                        </span>
                        <span>
                          {" "}
                          -{" "}
                          {selectedVote.mainProposition
                            ? selectedVote.mainProposition.description
                            : selectedVote.proposition.description}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold underline">
                          Resultado
                          {""}
                        </span>
                        <span className="no-underline">:</span>{" "}
                        <span className="ml-1">{selectedVote.description}</span>
                      </div>
                    </div>
                    <span className="text-xs text-[#828690]">
                      Última Atualização do LegisAI:{" "}
                      {moment(selectedVote.date).format("DD/MM/YYYY HH:mm")}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "flex flex-row gap-2",
                      isSymbolicVote(
                        selectedVote.positiveVotes,
                        selectedVote.negativeVotes,
                      ) && "hidden",
                    )}
                  >
                    <div className="border-secondary shadow-secondary col-span-1 flex flex-col justify-between rounded-lg">
                      <div className="flex w-full flex-col items-center justify-between gap-4 p-4">
                        <div className="flex flex-col">
                          <div className="flex w-full items-center justify-center gap-2">
                            <div className="bg-secondary flex h-5 w-5 items-center justify-center rounded-full text-white">
                              <Check size={16} />
                            </div>
                            <h3 className="text-xl font-bold">
                              VOTOS PARA SIM:
                            </h3>
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="h-2 w-full rounded-full bg-[#4C4C4C]">
                            <div
                              className="h-2 rounded-full bg-[#00A15D] transition duration-300"
                              style={{
                                width: `${(selectedVote.positiveVotes / selectedVote.totalVotes) * 100}%`,
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-4xl font-bold">
                              {selectedVote.positiveVotes}
                            </span>
                            <span className="text-center text-xl">
                              Dos deputados presentes
                            </span>
                            <span className="text-2xl text-[#00a15d]">
                              {selectedVote.totalVotes}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex w-full flex-col-reverse items-center justify-between gap-4 p-4">
                        <div className="flex flex-1 flex-col">
                          <div className="h-2 w-full rounded-full bg-[#4C4C4C]">
                            <div
                              className="ml-auto h-2 rounded-full bg-rose-500 transition duration-300"
                              style={{
                                width: `${(selectedVote.negativeVotes / selectedVote.totalVotes) * 100}%`,
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-4xl font-bold">
                              {selectedVote.negativeVotes}
                            </span>
                            <span className="text-center text-xl">
                              Dos deputados presentes
                            </span>
                            <span className="text-2xl text-rose-500">
                              {selectedVote.totalVotes}
                            </span>
                          </div>
                        </div>
                        <div className="flex w-64 flex-col">
                          <div className="flex w-full items-center justify-center gap-2">
                            <h3 className="text-xl font-bold">
                              VOTOS PARA NÃO:
                            </h3>
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
          )}
        </div>
      </div>

      {selectedVote && (
        <>
          <div
            className={cn(
              "col-span-12 flex flex-row gap-4 rounded-lg p-4",
              isSymbolicVote(
                selectedVote.positiveVotes,
                selectedVote.negativeVotes,
              ) && "hidden",
            )}
          >
            <div className="mt-4 flex w-full flex-col gap-4">
              <h2 className="text-secondary text-lg font-bold uppercase">
                Votação da Proposta Analisada
              </h2>
              <div className="col-span-1 flex flex-col justify-between rounded-lg bg-white p-2 shadow-lg md:col-span-2 xl:flex-row">
                <div className="flex w-full flex-col items-center justify-between gap-4 p-4 xl:w-[45%] xl:flex-row">
                  <div className="flex w-full flex-col">
                    <div className="flex items-center gap-2">
                      <div className="bg-secondary flex h-5 w-5 items-center justify-center rounded-full text-white">
                        <Check size={16} />
                      </div>
                      <h3 className="text-2xl font-bold">VOTOS PARA SIM:</h3>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="h-2 w-full rounded-full bg-[#4C4C4C]">
                      <div
                        className="h-2 rounded-full bg-[#00A15D] transition duration-300"
                        style={{
                          width: `${(selectedVote.positiveVotes / selectedVote.totalVotes) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-4xl font-bold">
                        {selectedVote.positiveVotes}
                      </span>
                      <span className="text-center text-xl">
                        Dos deputados presentes
                      </span>
                      <span className="text-2xl text-[#00a15d]">
                        {selectedVote.totalVotes}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary h-0.5 w-[80%] self-center xl:h-[80%] xl:w-0.5" />
                <div className="flex w-full flex-col items-center justify-between gap-4 p-4 xl:w-[45%] xl:flex-row">
                  <div className="flex flex-1 flex-col">
                    <div className="h-2 w-full rounded-full bg-[#4C4C4C]">
                      <div
                        className="ml-auto h-2 rounded-full bg-rose-500 transition duration-300"
                        style={{
                          width: `${(selectedVote.negativeVotes / selectedVote.totalVotes) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-4xl font-bold">
                        {selectedVote.negativeVotes}
                      </span>
                      <span className="text-center text-xl">
                        Dos deputados presentes
                      </span>
                      <span className="text-2xl text-rose-500">
                        {selectedVote.totalVotes}
                      </span>
                    </div>
                  </div>
                  <div className="flex w-full flex-col items-end">
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
                  <div className="flex h-8 w-[250px] flex-row self-start rounded-md border border-[#749c5b] text-[#749c5b]">
                    <input
                      className="flex-1 bg-transparent px-2 placeholder:text-[#749c5b] placeholder:opacity-60 focus:outline-none"
                      placeholder="Buscar aqui por nome "
                      onChange={(e) =>
                        debouncedHandleStopTypingPositive(e.target.value)
                      }
                    />
                    <button className="flex h-full items-center justify-center rounded-r-md px-2 text-white">
                      <Search color="#749c5b" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
                    {positiveVotesList.length !== 0 ? (
                      positiveVotesList.map((item, index) => (
                        <div
                          key={index}
                          className="border-secondary col-span-1 flex h-20 flex-col gap-4 rounded-lg border bg-white p-2"
                        >
                          <div className="flex flex-row justify-between">
                            <div className="flex flex-col justify-between">
                              <h1 className="text lg font-bold">
                                {item.politician.name}
                              </h1>
                            </div>
                            <div
                              className={`bg-secondary flex h-6 w-6 items-center justify-center rounded-full`}
                            >
                              <Check color="#161717" size={16} />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        {Array.from({ length: 12 }).map((_, index) => (
                          <div
                            key={index}
                            className="col-span-1 flex h-20 animate-pulse flex-col gap-4 rounded-lg bg-zinc-200 p-2"
                          ></div>
                        ))}
                      </>
                    )}
                  </div>
                  {positiveVotesTotalPages !== 1 && (
                    <div className="mt-4 flex flex-row items-center justify-between">
                      <CustomPagination
                        currentPage={positiveVotesCurrentPage}
                        pages={positiveVotesTotalPages}
                        setCurrentPage={setPositiveVotesCurrentPage}
                      />
                    </div>
                  )}
                </div>
                <div className="bg-secondary h-0.5 w-[80%] self-center md:block md:h-full md:w-0.5"></div>
                <div className="flex w-full flex-col gap-4 p-2 md:w-[48%]">
                  <div className="flex h-8 w-[250px] flex-row-reverse self-end rounded-md border border-[#EF4444] text-[#EF4444]">
                    <input
                      className="flex-1 bg-transparent px-2 placeholder:text-[#EF4444] placeholder:opacity-60 focus:outline-none"
                      placeholder="Buscar aqui por nome "
                      onChange={(e) =>
                        debouncedHandleStopTypingNegative(e.target.value)
                      }
                    />
                    <button className="flex h-full items-center justify-center rounded-r-md px-2 text-white">
                      <Search color="#EF4444" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
                    {negativeVotesList.length !== 0 ? (
                      negativeVotesList.map((item, index) => (
                        <div
                          key={index}
                          className="col-span-1 flex h-20 flex-col gap-4 rounded-lg border border-[#EF4444] bg-white p-2"
                        >
                          <div className="flex flex-row justify-between">
                            <div className="flex flex-col justify-between">
                              <h1 className="text lg font-bold">
                                {item.politician.name}
                              </h1>
                            </div>
                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-full bg-[#EF4444]`}
                            >
                              <X color="#161717" size={16} />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        {Array.from({ length: 12 }).map((_, index) => (
                          <div
                            key={index}
                            className="col-span-1 flex h-20 animate-pulse flex-col gap-4 rounded-lg bg-zinc-200 p-2"
                          ></div>
                        ))}
                      </>
                    )}
                  </div>
                  {negativeVotesTotalPages !== 1 && (
                    <div className="mt-4 flex flex-row items-center justify-between">
                      <CustomPagination
                        currentPage={negativeVotesCurrentPage}
                        pages={negativeVotesTotalPages}
                        setCurrentPage={setNegativeVotesCurrentPage}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
