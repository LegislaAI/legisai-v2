"use client";
import { ArrowRight, ChevronDown, ChevronRight, Info } from "lucide-react";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";

export function Ai() {
  return (
    <div className="relative flex h-96 w-full flex-col justify-between rounded-lg bg-white p-4 lg:w-1/2">
      <div className="flex flex-col items-center justify-between lg:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-dark font-semibold">Legis AI</span>
          <Info className="text-light-dark" />
        </div>
        <div className="text-light-dark flex items-center gap-2 rounded-lg border px-2 py-1 lg:px-4 lg:py-2">
          <span className="font-semibold">
            Escolha a Inteligência Artificial
          </span>
          <ChevronDown />
        </div>
      </div>
      <div className="w-full 2xl:w-[700px]">
        <Swiper
          slidesPerView={1.2}
          spaceBetween={10}
          centeredSlides
          breakpoints={{
            0: {
              slidesPerView: 1.2,
            },
            768: {
              slidesPerView: 2,
            },
          }}
        >
          <SwiperSlide>
            <div className="bg-primary/20 flex h-56 flex-col justify-between rounded-lg p-4">
              <span className="text-lg font-semibold">IA - Política</span>
              <span>
                Uma IA voltada à análise e suporte de temas políticos, ideal
                para quem busca compreender cenários, dados ou estratégias no
                campo público. Especialista em conteúdos de natureza política.
              </span>
              <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg text-white">
                <ChevronRight className="fill-white" />
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex h-56 flex-col justify-between rounded-lg bg-yellow-500/20 p-4">
              <span className="text-lg font-semibold">IA - Jurídica</span>
              <span>
                Assistente inteligente desenvolvida para apoiar consultas e
                análises jurídicas com agilidade. Perfeita para interpretar
                normas, decisões e aspectos legais de forma precisa.
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500 text-black">
                <ChevronRight className="fill-black" />
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
      <div className="bg-surface flex h-12 w-full items-center rounded-full">
        <input
          className="h-full flex-1 px-4 focus:outline-none"
          placeholder="Dê o primeiro passo escrevendo algo aqui"
        />
        <div className="bg-primary mr-1 flex h-11 w-11 items-center justify-center rounded-full text-white">
          <ArrowRight />
        </div>
      </div>
    </div>
  );
}
