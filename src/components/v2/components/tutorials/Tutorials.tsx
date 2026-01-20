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
import Link from "next/link";
import { videos } from "@/data/video";

export function Tutorials() {
  // Pegar os 3 primeiros tutoriais
  const tutorials = videos.slice(0, 3);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-dark">Tutoriais em Vídeo</h2>
        <Link href="/tutorials" className="text-sm text-secondary hover:underline">
            Ver todos
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {tutorials.map((tutorial) => (
          <Dialog key={tutorial.id}>
            <DialogTrigger asChild>
              <Card className="group cursor-pointer overflow-hidden border-0 shadow-sm hover:shadow-md transition-all">
                <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                  {tutorial.image ? (
                    <img
                      src={tutorial.image}
                      alt={tutorial.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200"></div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                        <PlayCircle className="h-8 w-8 text-white" />
                    </div>
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
                        src={tutorial.link} 
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
