"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/v2/components/ui/Card";
import { PlayCircle } from "lucide-react";

// Mock Tutorials Data
const tutorials = [
  {
    id: 1,
    title: "Como usar o Dashboard",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Rick Roll standard placeholder
    duration: "2:30"
  },
  {
      id: 2,
      title: "Analisando Gastos",
      thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2626&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: "5:00"
  },
  {
      id: 3,
      title: "Exportando Relatórios",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: "3:45"
  }
];

import Link from "next/link";
// ... imports

// ... inside Tutorials component
export function Tutorials() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-dark">Tutoriais em Vídeo</h2>
        <Link href="/v2/tutorials" className="text-sm text-secondary hover:underline">
            Ver todos
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {tutorials.map((tutorial) => (
          <Dialog key={tutorial.id}>
            <DialogTrigger asChild>
              <Card className="group cursor-pointer overflow-hidden border-0 shadow-sm hover:shadow-md transition-all">
                <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                  <img
                    src={tutorial.thumbnail}
                    alt={tutorial.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                        <PlayCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">
                    {tutorial.duration}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-dark group-hover:text-secondary transition-colors">
                    {tutorial.title}
                  </h3>
                </div>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none">
                <DialogHeader className="p-4 absolute top-0 left-0 z-10 w-full bg-gradient-to-b from-black/80 to-transparent">
                  <DialogTitle className="text-white text-shadow-sm">{tutorial.title}</DialogTitle>
                </DialogHeader>
                <div className="relative w-full pt-[56.25%]">
                     <iframe 
                        className="absolute top-0 left-0 w-full h-full"
                        src={tutorial.videoUrl} 
                        title={tutorial.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                     ></iframe>
                </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}
