"use client";

import { Card } from "@/components/v2/components/ui/Card";
import { Search } from "lucide-react";

interface FilterCardProps {
  title?: string;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  filters?: React.ReactNode;
  children: React.ReactNode; // The content (table, list, etc.)
  className?: string;
}

export function FilterCard({ 
    title, 
    searchPlaceholder = "Buscar...", 
    onSearch, 
    filters, 
    children, 
    className 
}: FilterCardProps) {
  return (
    <Card className={`overflow-hidden border-gray-100 shadow-sm ${className}`}>
        {(title || onSearch || filters) && (
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-white">
                {title && <h3 className="font-semibold text-lg text-dark mr-auto">{title}</h3>}
                
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    {onSearch && (
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder={searchPlaceholder}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all"
                                onChange={(e) => onSearch(e.target.value)}
                            />
                        </div>
                    )}
                    {filters}
                </div>
            </div>
        )}
        <div className="p-0">
            {children}
        </div>
    </Card>
  );
}
