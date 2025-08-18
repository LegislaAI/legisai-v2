"use client";
import Image from "next/image";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { TutorialsVideos } from "../video";
export function Tutorials() {
  const [searchTerm] = useState("");
  return (
    <>
      <div className="col-span-12 flex min-h-72 w-full flex-col gap-4 rounded-xl bg-white p-4 text-black shadow-md xl:min-h-80">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="flex flex-1 flex-col">
            <span className="text-xl font-semibold text-[#252F40]">
              Tutorial Avançado de Como usar o LegisDados para Plenários
            </span>
          </div>
        </div>

        <div className="min-h-72 pb-20 md:pb-0">
          <Swiper
            slidesPerView={1.3}
            spaceBetween={10}
            breakpoints={{
              640: {
                slidesPerView: 1.7,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 1.8,
                spaceBetween: 10,
                centeredSlides: false,
              },
              1024: {
                slidesPerView: 2.4,
                spaceBetween: 10,
                centeredSlides: false,
              },
              1440: {
                slidesPerView: 3.4,
                spaceBetween: 10,
                centeredSlides: false,
              },
            }}
          >
            {TutorialsVideos.filter((tutorial) => {
              const searchLower = searchTerm.toLowerCase();
              return (
                tutorial.title?.toLowerCase().includes(searchLower) ||
                tutorial.tags?.some((tag) =>
                  tag.toLowerCase().includes(searchLower),
                )
              );
            }).map((tutorial, index) => (
              <SwiperSlide key={index} className="p-2">
                <div className="relative col-span-1 flex min-h-72 flex-col gap-2 overflow-y-hidden rounded-md p-2 shadow-md">
                  <Image
                    alt=""
                    width={400}
                    height={400}
                    src={"/camera.png"}
                    className="h-auto w-full rounded-md object-cover"
                  />
                  <div className="flex flex-col">
                    <h2 className="text-sm font-semibold text-[#252F40]">
                      {tutorial.title}
                    </h2>
                    <span className="text-xs text-[#8C8C8C]">
                      {tutorial.subtitle}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      // setSelectedVideo(tutorial);
                      // setIsOpenVideoModal(true);
                    }}
                    className="border-secondary text-secondary mt-auto mb-2 rounded-md border font-bold transition-all duration-300 hover:scale-[1.005]"
                  >
                    Assistir Agora
                  </button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </>
  );
}
