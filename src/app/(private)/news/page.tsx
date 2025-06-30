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
    <div className="flex h-full w-full flex-col items-center gap-4 rounded-xl bg-white lg:gap-12">
      <div className="flex w-full gap-6 p-2 lg:px-8 lg:pt-10">
        <button
          onClick={() => setSelected("all")}
          className={cn(
            "cursor-pointer text-sm font-medium text-gray-600 focus:outline-none lg:text-base",
            selected === "all" &&
              "border-primary text-primary rounded-4xl border-2 px-2 py-1 font-bold",
          )}
        >
          Todos
        </button>
        <button
          onClick={() => setSelected("websites")}
          className={cn(
            "cursor-pointer text-sm font-medium text-gray-600 focus:outline-none lg:text-base",
            selected === "websites" &&
              "border-primary text-primary rounded-4xl border-2 px-2 py-1 font-bold",
          )}
        >
          Websites
        </button>
        <button
          onClick={() => setSelected("legis")}
          className={cn(
            "cursor-pointer text-sm font-medium text-gray-600 focus:outline-none lg:text-base",
            selected === "legis" &&
              "border-primary text-primary rounded-4xl border-2 px-2 py-1 font-bold",
          )}
        >
          Câmara Legislativa
        </button>
        <button
          onClick={() => setSelected("others")}
          className={cn(
            "cursor-pointer text-sm font-medium text-gray-600 focus:outline-none lg:text-base",
            selected === "others" &&
              "border-primary text-primary rounded-4xl border-2 px-2 py-1 font-bold",
          )}
        >
          Outros
        </button>
      </div>
      <div className="flex w-full flex-col gap-2 px-2 lg:gap-6 lg:px-8">
        <p className="text-sm font-medium text-gray-600">Hoje</p>
        <div className="flex flex-col gap-4 overflow-hidden p-1 lg:gap-8">
          {staticNews.map((news, index) => (
            <NewsCard key={index} summary={news.summary} title={news.title} />
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 px-2 lg:gap-6 lg:px-8">
        <p className="text-sm font-medium text-gray-600">Anterior</p>
        <div className="flex flex-col gap-4 overflow-hidden p-1 lg:gap-8">
          {staticNews.map((news, index) => (
            <NewsCard key={index} summary={news.summary} title={news.title} />
          ))}
        </div>
      </div>
    </div>
  );
}
