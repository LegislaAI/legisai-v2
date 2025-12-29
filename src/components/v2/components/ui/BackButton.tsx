"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  label?: string;
  className?: string;
}

export function BackButton({
  label = "Voltar",
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`mb-4 flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-[#749c5b] ${className}`}
    >
      <ArrowLeft size={18} />
      {label}
    </button>
  );
}
