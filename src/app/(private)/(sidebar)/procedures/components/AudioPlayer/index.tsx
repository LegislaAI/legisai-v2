// c:\Users\Gabriel\Desktop\AdvSpace\adv-space\src\app\(dashboard)\(apps)\chat\AudioPlayer\index.tsx
import { cn } from "@/lib/utils";
import "./styles/audio.css";

export function AudioPlayer({
  audioUrl,
  className, // Keep existing className prop
  size, // Add optional size prop
  isAI, // Add optional prop to control the .ai class
}: {
  audioUrl: string;
  className?: string;
  size?: "sm" | "lg" | "default"; // Define possible sizes
  isAI?: boolean; // Flag for AI styling
}) {
  const sizeClass =
    size === "sm"
      ? "audio-sm-scale" // Or use 'audio-sm-height'
      : size === "lg"
        ? "audio-lg-scale" // Or use 'audio-lg-height'
        : ""; // Default size

  const aiClass = isAI ? "ai" : "";

  return (
    <>
      {/* Use cn to merge base classes, AI class, size class, and any passed className */}
      <audio
        className={cn(
          aiClass, // Add 'ai' class if isAI is true
          sizeClass, // Add the calculated size class
          className, // Add any custom classes passed via props
        )}
        src={audioUrl}
        controls
      />
    </>
  );
}

// --- Example Usage ---
/*
// Default size, AI style
<AudioPlayer audioUrl="..." isAI={true} />

// Small size, AI style
<AudioPlayer audioUrl="..." isAI={true} size="sm" />

// Large size, default style (no inversion)
<AudioPlayer audioUrl="..." size="lg" />

// Default size, AI style, with an extra custom class
<AudioPlayer audioUrl="..." isAI={true} className="my-custom-styles" />
*/
