"use client";
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
import debounce from "lodash.debounce";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Estrutura recebida da API.
 * Cada registro representa um político vinculado ao evento, e vem
 * embrulhado em um objeto que inclui `eventId` e (opcionalmente)
 * a informação de presença.
 */
interface PoliticianApi {
  id: string;
  eventId: string;
  presence?: "Sim" | "Não" | boolean;
  politician: {
    id: string;
    name: string;
    politicalParty?: string; // ex.: "PT"

    politicalPartyAcronym?: string; // fallback
    siglaPartido?: string; // outro fallback
    state?: string; // ex.: "SP"
    uf?: string; // fallback
    siglaUf?: string; // outro fallback
    // ...demais campos ignorados aqui
  };
}

export function Presence() {
  const { id: eventId } = useParams() as { id?: string };
  const { GetAPI } = useApiContext();

  /* ---------------------------- state & helpers --------------------------- */
  const [input, setInput] = useState(""),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1),
    [politicians, setPoliticians] = useState<PoliticianApi[]>([]),
    [totalPages, setTotalPages] = useState(1),
    [loading, setLoading] = useState(false);

  /* ------------------------------ debounce ------------------------------ */
  const debouncedSearchRef = useRef<ReturnType<typeof debounce> | null>(null);
  if (!debouncedSearchRef.current) {
    debouncedSearchRef.current = debounce((value: string) => {
      setQuery(value.trim());
      setPage(1);
    }, 2000);
  }
  const debouncedSearch = debouncedSearchRef.current;

  /* ------------------------------ fetcher ------------------------------- */
  useEffect(() => {
    if (!eventId) return; // aguardar rota

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const q = query ? `&query=${encodeURIComponent(query)}` : "";
        console.log(
          "chamando api no evento",
          eventId,
          "com a pagina",
          page,
          "e o query",
          query,
        );
        const res = await GetAPI(
          `/event-politician/${eventId}?page=${page}${q}`,
          true,
        );
        console.log("res", res);
        if (cancelled || !res || res.status !== 200) return;

        // API devolve: { pages: number, politicians: PoliticianApi[] }
        setPoliticians(res.body?.politicians ?? []);
        setTotalPages(res.body?.pages ?? 1);
      } catch (err) {
        console.error("Erro ao buscar presença:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true; // evita race em setState
    };
  }, [eventId, page, query, GetAPI]);

  /* --------------------------- search handlers --------------------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    debouncedSearch(value);
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    debouncedSearch.cancel();
    setQuery(input.trim());
    setPage(1);
    setInput("");
  };

  const triggerSearch = () => {
    debouncedSearch.cancel();
    setQuery(input.trim());
    setPage(1);
  };

  /* ---------------------------- pagination ------------------------------ */
  const prev = () => setPage((p) => Math.max(p - 1, 1));
  const next = () => setPage((p) => Math.min(p + 1, totalPages));
  const goto = (p: number) => setPage(p);

  const isEmpty = !loading && politicians.length === 0;

  /* ------------------------------ helpers ------------------------------- */
  const extractParty = (p: PoliticianApi["politician"]) =>
    p.politicalParty ?? // ← novo
    p.politicalPartyAcronym ?? // ← novo
    p.siglaPartido ??
    "-";
  const extractState = (p: PoliticianApi["politician"]) =>
    p.state ?? p.uf ?? p.siglaUf ?? "-";

  /* -------------------------------- UI --------------------------------- */
  return (
    <div className="grid w-full grid-cols-12 gap-8">
      <div className="col-span-12 flex flex-col overflow-hidden rounded-lg bg-white p-4 xl:col-span-12">
        <div className="flex h-full w-full flex-col gap-4">
          <span className="text-primary text-xl font-bold">
            Presença de Parlamentares na Sessão Deliberativa
          </span>

          {/* Filtros */}
          <div className="border-primary flex w-full flex-col items-center justify-between gap-4 rounded-lg border p-4 lg:flex-row lg:gap-0">
            <div className="flex flex-1 flex-col gap-2">
              <h2 className="text-lg font-bold text-black uppercase">
                deputados presentes:
              </h2>
              <span className="text-black">
                Verifique todos aqueles que estavam de fato presentes na Sessão
                Deliberativa
              </span>
            </div>
            <div className="group flex h-8 w-full flex-row rounded-md border border-[#475569] md:w-1/3">
              <button
                onClick={triggerSearch}
                className="flex h-full items-center justify-center rounded-l-md bg-[#749C5B] px-2 text-[#222222] transition-opacity duration-300"
              >
                Buscar
              </button>
              <input
                value={input}
                onChange={handleChange}
                onKeyDown={handleEnter}
                className="flex-1 bg-transparent px-2 text-[#749C5B] transition-opacity duration-300 outline-none placeholder:text-[#749C5B] placeholder:opacity-40"
                placeholder="Buscar aqui por nome ou partido..."
              />
              <button
                onClick={triggerSearch}
                className="flex h-full items-center justify-center rounded-r-md bg-[#749C5B] px-2 text-white transition-opacity duration-300"
              >
                <Search color="#222222" size={14} />
              </button>
            </div>
          </div>

          {/* Tabela */}
          <div className="relative min-h-32">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                <span className="text-primary animate-pulse text-lg font-semibold">
                  Carregando...
                </span>
              </div>
            )}

            <div className="overflow-auto xl:h-full">
              <Table>
                <TableHeader className="bg-primary">
                  <TableRow>
                    {[
                      {
                        key: "name",
                        label: "Deputados",
                        icon: "/icons/plenary/user.svg",
                      },
                      {
                        key: "party",
                        label: "Partido",
                        icon: "/icons/plenary/shield.svg",
                      },
                      {
                        key: "state",
                        label: "Estado",
                        icon: "/icons/plenary/flag.svg",
                      },
                      {
                        key: "presence",
                        label: "Presença",
                        icon: "/icons/plenary/chair.svg",
                      },
                    ].map((col) => (
                      <TableHead
                        key={col.key}
                        className="h-12 text-center text-sm font-semibold text-white"
                      >
                        <div className="flex w-full items-center justify-center gap-2">
                          <Image
                            src={col.icon}
                            alt=""
                            width={250}
                            height={250}
                            className="h-6 w-6 object-contain"
                          />
                          {col.label}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                {isEmpty ? (
                  <tbody>
                    <tr>
                      <td
                        colSpan={4}
                        className="py-6 text-center text-gray-500"
                      >
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  politicians.map((wrapper) => {
                    const p = wrapper.politician;
                    const party = extractParty(p);
                    const state = extractState(p);
                    const isPresent = true;
                    return (
                      <TableBody key={wrapper.id}>
                        <TableRow className="hover:bg-primary/20 h-12 cursor-pointer transition-all duration-300">
                          <TableCell className="h-4 py-1 text-sm font-medium whitespace-nowrap">
                            {p.name}
                          </TableCell>
                          <TableCell className="h-4 py-1 text-center text-sm font-semibold whitespace-nowrap">
                            {party}
                          </TableCell>
                          <TableCell className="h-4 py-1 text-center text-sm whitespace-nowrap">
                            {state}
                          </TableCell>
                          <TableCell className="h-4 w-10 py-1 text-sm font-medium">
                            <div className="flex items-end justify-end">
                              <div className="flex h-full w-40 max-w-40 min-w-40 items-center justify-center text-center">
                                <span
                                  className={cn(
                                    "w-full rounded-lg px-2 py-1 uppercase",
                                    isPresent
                                      ? "bg-primary/20 text-primary"
                                      : "bg-[#EF4444]/20 text-[#EF4444]",
                                  )}
                                >
                                  {isPresent ? "Sim" : "Não"}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    );
                  })
                )}
              </Table>
            </div>
          </div>

          {/* Paginação */}
          <div className="mt-4 flex flex-row items-center justify-between">
            <span>
              {politicians.length} registro(s) exibido(s) • página {page} de{" "}
              {totalPages}
            </span>
            <div className="mt-2 flex justify-end">
              <button
                onClick={prev}
                disabled={page === 1 || loading}
                className={cn(
                  "text-primary mx-1 flex h-8 w-8 items-center justify-center rounded-md border",
                  page === 1 || loading
                    ? "cursor-not-allowed border opacity-50"
                    : "border-primary",
                )}
              >
                <ChevronLeft />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pIdx = idx + 1;
                return (
                  <button
                    key={pIdx}
                    onClick={() => goto(pIdx)}
                    disabled={loading}
                    className={cn(
                      "mx-1 h-8 w-8 rounded-md border px-2 py-1 text-sm font-medium",
                      pIdx === page
                        ? "bg-primary border-white text-[#222222]"
                        : "border-primary text-primary",
                      loading && "cursor-not-allowed opacity-50",
                    )}
                  >
                    {pIdx}
                  </button>
                );
              })}

              <button
                onClick={next}
                disabled={page === totalPages || loading}
                className={cn(
                  "text-primary mx-1 flex h-8 w-8 items-center justify-center rounded-md border",
                  page === totalPages || loading
                    ? "cursor-not-allowed border opacity-50"
                    : "border-primary",
                )}
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
