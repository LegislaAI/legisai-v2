"use client";

import { staticNews } from "@/@staticData/news";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { NewsCard } from "./components/News";

export default function News() {
  const [selected, setSelected] = useState<
    "all" | "websites" | "others" | "legis"
  >("all");

  return (
    <div className="flex h-full w-full flex-col items-center gap-12 rounded-xl bg-white">
      <div className="flex w-full gap-6 px-8 pt-10">
        <button
          onClick={() => setSelected("all")}
          className={cn(
            "font-medium text-gray-600",
            selected === "all" &&
              "border-primary text-primary rounded-4xl border-2 px-2 py-1 font-bold",
          )}
        >
          Todos
        </button>
        <button
          onClick={() => setSelected("websites")}
          className={cn(
            "font-medium text-gray-600",
            selected === "websites" &&
              "border-primary text-primary rounded-4xl border-2 px-2 py-1 font-bold",
          )}
        >
          Websites
        </button>
        <button
          onClick={() => setSelected("legis")}
          className={cn(
            "font-medium text-gray-600",
            selected === "legis" &&
              "border-primary text-primary rounded-4xl border-2 px-2 py-1 font-bold",
          )}
        >
          Câmara Legislativa
        </button>
        <button
          onClick={() => setSelected("others")}
          className={cn(
            "font-medium text-gray-600",
            selected === "others" &&
              "border-primary text-primary rounded-4xl border-2 px-2 py-1 font-bold",
          )}
        >
          Outros
        </button>
      </div>
      <div className="flex w-full flex-col gap-6 px-8">
        <p className="text-sm font-medium text-gray-600">Hoje</p>
        <div className="flex flex-col gap-8">
          {staticNews.map((news, index) => (
            <NewsCard key={index} summary={news.summary} title={news.title} />
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col gap-8 px-8">
        <p className="text-sm font-medium text-gray-600">Anterior</p>
        <div className="flex flex-col gap-6">
          {staticNews.map((news, index) => (
            <NewsCard key={index} summary={news.summary} title={news.title} />
          ))}
        </div>
      </div>
    </div>
  );
}
