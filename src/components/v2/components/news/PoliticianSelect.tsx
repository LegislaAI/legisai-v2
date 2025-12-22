"use client";

import { PoliticianProps } from "@/@types/politician";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/v2/components/ui/avatar";
import { Button } from "@/components/v2/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/v2/components/ui/dropdown-menu";
import { useApiContext } from "@/context/ApiContext";
import { useDebounce } from "@/hooks/useDebounce";
import { ChevronDown, Loader2, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PoliticianSelectProps {
  onSelect: (politician: PoliticianProps) => void;
  selectedPolitician?: PoliticianProps | null;
}

export function PoliticianSelect({ onSelect, selectedPolitician }: PoliticianSelectProps) {
  const [open, setOpen] = useState(false);
  const [politicians, setPoliticians] = useState<PoliticianProps[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { GetAPI } = useApiContext();
  const observerTarget = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Reset list when search changes
  useEffect(() => {
    setPoliticians([]);
    setPage(1);
    setHasMore(true);
    fetchPoliticians(1, debouncedSearch, true);
  }, [debouncedSearch]);

  const fetchPoliticians = async (currentPage: number, search: string, isNewSearch: boolean) => {
    if (isLoading && !isNewSearch) return; // Prevent double fetching unless it's a new search
    
    setIsLoading(true);
    try {
      const queryParam = search ? `&query=${search}` : "";
      const response = await GetAPI(`/politician?page=${currentPage}${queryParam}`, true);

      if (response.status === 200 && response.body) {
        const newPoliticians = response.body.politicians || [];
        const totalPages = response.body.pages || 1;

        setPoliticians(prev => isNewSearch ? newPoliticians : [...prev, ...newPoliticians]);
        setHasMore(currentPage < totalPages);
      } else {
          setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch politicians", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage(prev => {
            const nextPage = prev + 1;
            fetchPoliticians(nextPage, debouncedSearch, false);
            return nextPage;
          });
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoading, debouncedSearch]);


  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full md:w-[300px] text-secondary border-secondary justify-between bg-white hover:bg-gray-50 text-left font-normal">
          <span className="truncate">
            {selectedPolitician ? selectedPolitician.name : "Selecione um Político"}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px] p-2" align="start">
        <div className="flex items-center border border-gray-200 rounded-md px-2 mb-2 bg-gray-50">
          <Search className="h-4 w-4 text-gray-400 mr-2" />
          <input
            className="flex-1 py-2 text-sm outline-none bg-transparent"
            placeholder="Buscar político..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // Prevent auto-focus issues
            autoFocus
          />
        </div>
        
        <div className="max-h-[300px] w-full overflow-y-auto space-y-1">
          {politicians.map((pol) => (
            <DropdownMenuItem
              key={pol.id}
              onClick={() => {
                onSelect(pol);
                setOpen(false);
              }}
              className="cursor-pointer w-full flex flex-row items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Avatar className="h-8 w-8 mr-3 border border-gray-100">
                <AvatarImage src={pol.url || pol.imageUrl} />
                <AvatarFallback className="bg-[#749c5b] text-white text-xs">
                  {pol.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="font-medium text-sm text-gray-900 truncate">{pol.name}</span>
                <span className="text-xs text-gray-500 truncate">{pol.politicalParty} - {pol.state}</span>
              </div>
            </DropdownMenuItem>
          ))}
          
          {isLoading && (
              <div className="py-2 flex justify-center text-[#749c5b]">
                  <Loader2 className="h-5 w-5 animate-spin" />
              </div>
          )}
          
          {!hasMore && politicians.length > 0 && (
               <div className="py-2 text-center text-xs text-gray-400">
                   Fim da lista
               </div>
          )}

          {!isLoading && politicians.length === 0 && (
               <div className="py-4 text-center text-sm text-gray-500">
                   Nenhum político encontrado
               </div>
          )}
          
          <div ref={observerTarget} className="h-2 w-full" />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
