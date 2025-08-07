import { Calendar, CircleUserRound, Copy, LayoutPanelLeft } from "lucide-react";
import Image from "next/image";

export function AuthFooter() {
  return (
    <footer className="absolute bottom-4 z-20 flex h-8 w-[90%] flex-row items-center justify-between gap-4 self-center rounded-full border-zinc-200 bg-white px-8 py-1 shadow-lg md:w-auto md:gap-16 lg:h-16">
      <div className="flex flex-col">
        <span
          onClick={() =>
            window.open(
              "https://docs.google.com/document/d/1qq5tUWY9g3j0zj1g1fhcp_xwvK1cJN4SsGUnlRWer84/edit?tab=t.0#heading=h.19g25mwtxn88",
              "_blank",
            )
          }
          className="cursor-pointer text-xs text-gray-600 transition duration-200 hover:text-gray-700"
        >
          Termos de Uso
        </span>
        <span
          onClick={() =>
            window.open(
              "https://docs.google.com/document/d/1Kgh0fDCaFO0WYc6rhHoYdP36pLUGO9MEu2W0ZY4usRw/edit?tab=t.0#heading=h.alfhhowg17b1",
              "_blank",
            )
          }
          className="cursor-pointer text-xs text-gray-600 transition duration-200 hover:text-gray-700"
        >
          Política de Privacidade
        </span>
      </div>

      <div className="invisible hidden flex-row gap-16 xl:flex">
        <a className="flex flex-row items-center gap-1 text-[#8392AB]">
          <LayoutPanelLeft className="h-4 w-4 text-[#8C8C8C]" />
          <span>Funcionalidades</span>
        </a>
        <a className="flex flex-row items-center gap-1 text-[#8392AB]">
          <CircleUserRound className="h-4 w-4 text-[#8C8C8C]" />
          <span>FAQ</span>
        </a>
        <a className="flex flex-row items-center gap-1 text-[#8392AB]">
          <Copy className="h-4 w-4 text-[#8C8C8C]" />
          <span>Tutoriais</span>
        </a>
        <a className="flex flex-row items-center gap-1 text-[#8392AB]">
          <Calendar className="h-4 w-4 text-[#8C8C8C]" />
          <span>Planos</span>
        </a>
      </div>
      <Image
        className="h-full w-max object-contain"
        alt=" "
        width={1000}
        height={1000}
        src={"/logoEx.png"}
      />
    </footer>
  );
}
