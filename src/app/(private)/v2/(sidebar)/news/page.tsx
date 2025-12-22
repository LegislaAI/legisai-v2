"use client";

import { PoliticianProps } from "@/@types/politician";
import { CustomPagination } from "@/components/ui/CustomPagination";
import { NewsCard, NewsItem } from "@/components/v2/components/news/NewsCard";
import { PoliticianSelect } from "@/components/v2/components/news/PoliticianSelect";
import { useApiContext } from "@/context/ApiContext";
import { useDebounce } from "@/hooks/useDebounce";
import { BellDot, Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "PARLIAMENT" | "POLITICIAN">("ALL");
  const [selectedPolitician, setSelectedPolitician] = useState<PoliticianProps | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { GetAPI } = useApiContext();

  async function fetchNews() {
    setIsLoading(true);
    try {
      let endpoint = "";
      
      if (activeTab === "POLITICIAN") {
        if (!selectedPolitician) {
            setNews([]);
            setTotalPages(1);
            setIsLoading(false);
            return;
        }
        endpoint = `/news/${selectedPolitician.id}?page=${currentPage}`;
      } else {
        const typeFilter = activeTab === "PARLIAMENT" ? "&type=PARLIAMENT" : "&type=WEBSITE";
        const searchFilter = debouncedSearch ? `&query=${debouncedSearch}` : "";
        endpoint = `/news?page=${currentPage}${typeFilter}${searchFilter}`;
      }

      console.log("iniciando busca em ", endpoint);
      const response = await GetAPI(endpoint, false);
      console.log("resposta news",response);
      
      if (response.status === 200 && response.body) {
         // Flexible handler for different API response structures
         const data = response.body.news || response.body.data || response.body.items || (Array.isArray(response.body) ? response.body : []);
         const meta = response.body.pages || response.body.meta?.totalPages || response.body.totalPages || 1;
         
         if(Array.isArray(data)){
             setNews(data);
         }
         
         setTotalPages(meta);

      } else {
          setNews([]);
      }
    } catch (error) {
      console.error("Failed to fetch news", error);
      setNews([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // Determine if we should fetch immediately
    if (activeTab !== "POLITICIAN") {
        fetchNews();
    } else if (activeTab === "POLITICIAN" && selectedPolitician) {
         fetchNews();
    }
  }, [currentPage, debouncedSearch, activeTab, selectedPolitician]);

  // Reset page when search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab]);


  return (
    <div className="min-h-screen w-full bg-[#f4f4f4] font-sans text-[#1a1d1f]">
      <div className="w-full  space-y-8">
        
        {/* HEADER */}
        <div className="flex w-full flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                 <h1 className="text-3xl font-bold text-[#1a1d1f] flex items-center gap-3">
                     <div className="p-2 bg-[#749c5b] rounded-xl text-white shadow-lg shadow-[#749c5b]/20">
                         <BellDot size={24} />
                     </div>
                     Novidades e Notícias
                 </h1>
                 <p className="text-gray-600 mt-2 max-w-2xl">
                     Fique por dentro das atualizações legislativas, pautas importantes e novidades da plataforma.
                 </p>
            </div>
            
            {/* Search - Hide when Politician tab is active as it has its own search in dropdown, or keep global search if backend supports searching within politician news */}
            {activeTab !== "POLITICIAN" && (
                <div className="relative w-full md:w-auto min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar notícias..." 
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#749c5b]/20 focus:border-[#749c5b] transition-all bg-white shadow-sm text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            )}
            
            {/* Politician Select - Only visible on Politician Tab */}
            {activeTab === "POLITICIAN" && (
                <div className="w-full md:w-auto">
                    <PoliticianSelect 
                        selectedPolitician={selectedPolitician}
                        onSelect={(pol) => {
                            setSelectedPolitician(pol);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            )}
        </div>

        {/* TABS & FILTERS */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
             <button 
                onClick={() => setActiveTab("ALL")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${activeTab === "ALL" ? "border-[#749c5b] text-[#749c5b]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
             >
                 Todas
             </button>
             <button 
                onClick={() => setActiveTab("PARLIAMENT")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${activeTab === "PARLIAMENT" ? "border-[#749c5b] text-[#749c5b]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
             >
                 Câmara Legislativa
             </button>
             <button 
                onClick={() => setActiveTab("POLITICIAN")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${activeTab === "POLITICIAN" ? "border-[#749c5b] text-[#749c5b]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
             >
                 Político
             </button>
        </div>

        {/* LIST */}
        <div className="space-y-4">
             {isLoading ? (
                 <div className="py-20 text-center text-gray-400">
                     <p>Carregando notícias...</p>
                 </div>
             ) : activeTab === "POLITICIAN" && !selectedPolitician ? (
                 <div className="py-20 text-center text-gray-400 bg-white rounded-xl border border-gray-100 border-dashed">
                     <BellDot size={48} className="mx-auto mb-4 opacity-20" />
                     <p>Selecione um político para ver as notícias.</p>
                      <PoliticianSelect 
                        selectedPolitician={selectedPolitician}
                        onSelect={(pol) => {
                            setSelectedPolitician(pol);
                            setCurrentPage(1);
                        }}
                    />
                 </div>
             ) : news.length > 0 ? (
                 news.map((newsItem) => (
                     <NewsCard key={newsItem.id} news={newsItem} />
                 ))
             ) : (
                 <div className="py-20 text-center text-gray-400 bg-white rounded-xl border border-gray-100 border-dashed">
                     <BellDot size={48} className="mx-auto mb-4 opacity-20" />
                     <p>Nenhuma notícia encontrada para os filtros selecionados.</p>
                 </div>
             )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
            <div className="flex justify-center mt-8">
                 <CustomPagination 
                    pages={totalPages} 
                    currentPage={currentPage} 
                    setCurrentPage={setCurrentPage} 
                 />
            </div>
        )}

      </div>
    </div>
  );
}
