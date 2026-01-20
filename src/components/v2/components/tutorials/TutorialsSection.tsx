"use client";

import { Button } from "@/components/v2/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/v2/components/ui/dialog";
import { Input } from "@/components/v2/components/ui/Input";
import { VideoProps, videos } from "@/data/video";
import { PlayCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";

export function TutorialsSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoProps | null>(null);

  const filteredVideos = useMemo(() => {
     return videos.filter(video => 
         video.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
         video.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
     );
  }, [searchTerm]);

  return (
    <div className="space-y-8">
        
        {/* Search Bar */}
        <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
                placeholder="Buscar tutoriais..." 
                className="pl-10 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
                <div key={video.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                    <div 
                        className="relative aspect-video bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => setSelectedVideo(video)}
                    >
                        {video.image && (
                            <img 
                                src={video.image} 
                                alt={video.title}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                        <PlayCircle size={48} className="text-white relative z-20 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all"/>
                        
                        <div className="absolute bottom-2 left-2 z-20 flex gap-2">
                            {video.tags.map(tag => (
                                <span key={tag} className="text-[10px] font-bold uppercase bg-[#749c5b] text-white px-2 py-0.5 rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="p-5">
                        <h3 className="font-bold text-[#1a1d1f] mb-2 group-hover:text-[#749c5b] transition-colors line-clamp-1">{video.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{video.subtitle}</p>
                        
                        <Button 
                            className="w-full bg-gray-50 text-[#1a1d1f] hover:bg-[#749c5b] hover:text-white border-0 transition-colors"
                            onClick={() => setSelectedVideo(video)}
                        >
                            Assistir Agora
                        </Button>
                    </div>
                </div>
            ))}
        </div>

        {filteredVideos.length === 0 && (
            <div className="text-center py-20 text-gray-400">
                <p>Nenhum vídeo encontrado para sua busca.</p>
            </div>
        )}

        {/* Video Modal */}
        <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black text-white border-0">
                <DialogHeader className="p-4 absolute top-0 left-0 w-full z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                     <DialogTitle className="text-white text-lg drop-shadow-md">{selectedVideo?.title}</DialogTitle>
                </DialogHeader>
                
                {selectedVideo && (
                    <div className="aspect-video w-full">
                        <iframe 
                            src={selectedVideo.link} 
                            title={selectedVideo.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}
