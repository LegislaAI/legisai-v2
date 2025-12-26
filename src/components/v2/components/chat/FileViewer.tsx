import { cn } from "@/lib/utils";
import { FileIcon, Music, Pause, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface FileViewerProps {
    file: File | string | null;
    mimeType?: string;
    fileName?: string;
    onRemove?: () => void;
    className?: string;
    isInput?: boolean;
}

export function FileViewer({ file, mimeType, fileName: propFileName, onRemove, className, isInput = false }: FileViewerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string>(mimeType || "");
    const [fileName, setFileName] = useState<string>("");

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }

        if (file instanceof File) {
            setFileName(propFileName || file.name);
            setFileType(file.type);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else if (typeof file === "string") {
            // Check if it's a URL (http, data, or blob)
            if (file.startsWith("http") || file.startsWith("data:") || file.startsWith("blob:")) {
                setPreviewUrl(file);
                
                // Use provided mimeType if available, otherwise try to infer
                if (!mimeType) {
                    if (file.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i)) {
                        setFileType("image");
                    } else if (file.match(/\.(mp3|wav|ogg|m4a)($|\?)/i)) {
                        setFileType("audio");
                    } else {
                        setFileType("unknown");
                    }
                } else {
                    setFileType(mimeType);
                }

                // Use propFileName if available, otherwise try to extract or default
                if (propFileName) {
                    setFileName(propFileName);
                } else {
                    const nameMatch = file.match(/\/([^\/?#]+)[^\/]*$/);
                    // For blob URLs, the "filename" is a UUID, which isn't pretty, but better than nothing if no name provided
                    setFileName(nameMatch ? nameMatch[1] : "Arquivo");
                }
            } else {
                // Should not happen for URLs, but maybe it's just a raw filename string?
                setFileName(propFileName || file); 
                setFileType(mimeType || "unknown");
            }
        }
    }, [file, mimeType, propFileName]);

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    if (!file) return null;

    const isImage = fileType.startsWith("image");
    const isAudio = fileType.startsWith("audio");

    return (
        <div className={cn(
            "relative group flex items-center gap-3 p-2 rounded-xl border transition-all duration-300",
            isInput ? "bg-white border-gray-200 shadow-sm" : "bg-gray-50/50 border-gray-100",
            className
        )}>
            {/* Image Preview */}
            {isImage && previewUrl ? (
                 <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                    <img src={previewUrl} alt={fileName} className="h-full w-full object-cover" />
                 </div>
            ) : isAudio ? (
                // Audio Player
                <div className="flex items-center gap-2 h-12 shrink-0">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary/10 text-secondary">
                        <Music size={20} />
                    </div>
                    {previewUrl && (
                        <>
                            <audio 
                                ref={audioRef} 
                                src={previewUrl} 
                                onEnded={() => setIsPlaying(false)} 
                                onPause={() => setIsPlaying(false)}
                                onPlay={() => setIsPlaying(true)}
                                className="hidden" 
                            />
                            <button 
                                onClick={handlePlayPause}
                                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
                            >
                                {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current" />}
                            </button>
                        </>
                    )}
                </div>
            ) : (
                // Generic File Icon
                <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                    <FileIcon size={20} />
                </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]" title={fileName}>
                    {fileName}
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    {isImage ? "Imagem" : isAudio ? "Áudio" : "Arquivo"}
                </p>
            </div>

            {/* Remove Button (only if callback provided) */}
            {onRemove && (
                <button 
                    onClick={onRemove}
                    className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
}
