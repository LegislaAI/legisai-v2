"use client";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  UsersRound
} from "lucide-react";
import { useEffect, useState } from "react";

import { useApiContext } from "@/context/ApiContext";
import { useRouter } from "next/navigation";

// --- TIPOS ---
type CommissionType = "PERMANENT" | "TEMPORARY" | "MIXED";

interface Commission {
  id: string;
  name: string;
  acronym: string;
  surname: string;
  type: string;
  uri: string;
  category?: CommissionType | null;
}

export default function CommissionsPage() {
  const router = useRouter();
  const { GetAPI } = useApiContext();
  const [activeTab, setActiveTab] = useState<CommissionType>("PERMANENT");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch commissions from API
  useEffect(() => {
    async function fetchCommissions() {
      setLoading(true);
      const queryParams = `?page=${currentPage}&type=${activeTab}`;
      const response = await GetAPI(`/department${queryParams}`, true);
      if (response.status === 200) {
        setCommissions(response.body.departments || []);
        setTotalPages(response.body.pages || 0);
      }
      setLoading(false);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchCommissions();
  }, [currentPage, activeTab, GetAPI]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [activeTab]);

  const handleTabChange = (tab: CommissionType) => {
    setActiveTab(tab);
  };

  const handleCommissionClick = (commission: Commission) => {
    // Navigate to commission details page
    router.push(`/commissions/${commission.id}`);
  };

  const getTabLabel = (type: CommissionType): string => {
    switch (type) {
      case "PERMANENT":
        return "Permanentes";
      case "TEMPORARY":
        return "Temporárias";
      case "MIXED":
        return "Mistas";
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-6 font-sans text-[#1a1d1f]">
      <div className="mx-auto space-y-8">
        {/* --- CABEÇALHO --- */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold text-[#1a1d1f]">
            Comissões da Câmara
          </h1>
          <p className="text-gray-700">
            Explore as comissões da Câmara dos Deputados. Selecione o tipo de
            comissão para visualizar a lista correspondente.
          </p>
          <div className="mt-4 flex w-fit flex-col gap-2 rounded-lg border border-gray-300 bg-white p-1 sm:flex-row">
            {(
              [
                "PERMANENT",
                "TEMPORARY",
                "MIXED",
              ] as CommissionType[]
            ).map((type) => (
              <button
                key={type}
                onClick={() => handleTabChange(type)}
                className={`rounded-md px-6 py-2 text-sm font-medium capitalize transition-all duration-200 ${
                  activeTab === type
                    ? "bg-[#749c5b] text-white shadow-sm"
                    : "text-[#6f767e] hover:bg-gray-50 hover:text-[#749c5b]"
                }`}
              >
                Comissões {getTabLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* --- LISTA DE COMISSÕES --- */}
        <div className="flex flex-col gap-6">
          {loading ? (
            <div className="min-h-[400px] space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 w-full animate-pulse rounded-xl bg-gray-200"
                />
              ))}
            </div>
          ) : commissions.length > 0 ? (
            <div className="min-h-[400px] space-y-4">
              {commissions.map((commission) => (
                <div
                  key={commission.id}
                  className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-[#749c5b]/30 hover:shadow-md"
                >
                  {/* Barra decorativa lateral */}
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#749c5b] opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="flex flex-col justify-between gap-4 pl-2 sm:flex-row">
                    <div className="flex-1">
                      <div className="mb-3 flex items-center gap-2">
                        {commission.acronym && (
                          <span className="rounded border border-gray-200 bg-[#f4f4f4] px-2 py-1 text-xs font-bold text-[#1a1d1f] uppercase">
                            {commission.acronym}
                          </span>
                        )}
                        <span className="rounded bg-[#749c5b]/10 px-2 py-1 text-xs font-medium text-[#749c5b]">
                          {commission.type}
                        </span>
                      </div>

                      <h3 className="mb-2 text-xl leading-tight font-bold text-[#1a1d1f]">
                        {commission.name}
                      </h3>
                      {commission.surname && commission.surname !== commission.name && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-[#6f767e]">
                          {commission.surname}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center sm:self-center">
                      <button
                        onClick={() => handleCommissionClick(commission)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-[#1a1d1f] shadow-sm transition-all hover:bg-[#749c5b] hover:text-white sm:h-auto sm:w-auto sm:rounded-lg sm:border-transparent sm:bg-[#1a1d1f] sm:px-4 sm:py-2 sm:text-white"
                      >
                        <ArrowRight size={18} className="sm:mr-2" />
                        <span className="hidden text-sm font-medium sm:inline">
                          Ver Detalhes
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <UsersRound className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-bold text-[#1a1d1f]">
                Nenhuma comissão encontrada
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-[#6f767e]">
                Não encontramos comissões do tipo selecionado. Tente selecionar
                outro filtro.
              </p>
            </div>
          )}

          {/* --- COMPONENTE DE PAGINAÇÃO --- */}
          {commissions.length > 0 && totalPages > 1 && !loading && (
            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="hidden text-sm text-[#6f767e] sm:block">
                Página{" "}
                <span className="font-bold text-[#1a1d1f]">{currentPage}</span>{" "}
                de{" "}
                <span className="font-bold text-[#1a1d1f]">{totalPages}</span>
              </div>

              <div className="mx-auto flex items-center gap-2 sm:mx-0">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                {/* Números de página */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // Smart pagination: show first, last, current and surrounding pages
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-all ${
                          currentPage === pageNum
                            ? "bg-[#749c5b] text-white shadow-md shadow-[#749c5b]/20"
                            : "text-[#6f767e] hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#1a1d1f] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="hidden sm:inline">Próxima</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
