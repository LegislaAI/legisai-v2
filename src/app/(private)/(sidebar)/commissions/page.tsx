"use client";
import Image from "next/image";
import { useEffect } from "react";

export default function Commissions() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("navigationComplete"));
  }, []);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Image
        src="/static/soon.png"
        alt=""
        width={1000}
        height={1000}
        className="h-max w-80 object-contain"
      />
    </div>
  );
}
