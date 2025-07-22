"use client";

// Importando a fonte Nunito

import { useEffect, useState } from "react";

import { TutorialsSection } from "./components/TutorialsSection";
import { VideoProps } from "./video";

export default function Tutorials() {
  const [animateSection, setAnimateSection] = useState(false);
  useEffect(() => {
    setTimeout(() => setAnimateSection(true), 100);
  }, []);
  const [isOpenVideoModal, setIsOpenVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoProps | null>(null);
  return (
    <>
      <div className="relative flex h-full w-full flex-col overflow-hidden p-4 pb-4">
        <section
          className={`z-20 flex w-full grid-cols-12 gap-2 px-1 pb-20 transition-all duration-300 ${
            animateSection
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          } `}
        >
          <div className="mt-6 flex w-full max-w-full flex-grow flex-col items-center rounded-lg bg-white px-2 py-4 shadow-lg transition-all duration-300">
            <TutorialsSection
              isOpenVideoModal={isOpenVideoModal}
              setIsOpenVideoModal={setIsOpenVideoModal}
              setSelectedVideo={setSelectedVideo}
            />
          </div>
        </section>
      </div>
      {isOpenVideoModal && selectedVideo && (
        <div className="fixed top-0 left-0 z-[1050] flex h-screen w-full items-center justify-center p-4">
          <button
            className="fixed z-[1050] h-full w-full bg-black/80"
            onClick={() => setIsOpenVideoModal(false)}
          />
          <div className="z-[1070] flex w-full flex-col items-center justify-center gap-4 rounded-md bg-white p-4 lg:w-2/3 xl:w-[1000px]">
            <span className="text-lg font-bold">{selectedVideo.title}</span>
            <iframe
              src={selectedVideo?.link}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              className="aspect-video w-full rounded-md"
            ></iframe>

            <button
              onClick={() => {
                setSelectedVideo(null);
                setIsOpenVideoModal(false);
              }}
              className="border-secondary bg-secondary rounded-md border p-2 px-8 text-white transition-all duration-300 hover:scale-[1.005]"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
