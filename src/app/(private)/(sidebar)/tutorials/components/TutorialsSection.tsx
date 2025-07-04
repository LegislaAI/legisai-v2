"use client";
import { CustomPagination } from "@/components/CustomPagination";
import { Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { TutorialsVideos, VideoProps } from "../video";
interface Activity {
  DontShowButton?: boolean;
  isOpen?: boolean;
  ShowToggle?: boolean;
  setSelectedVideo: React.Dispatch<React.SetStateAction<VideoProps | null>>;
  isOpenVideoModal?: boolean;
  setIsOpenVideoModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export function TutorialsSection({
  setIsOpenVideoModal,
  setSelectedVideo,
}: Activity) {
  const [currentPage, setCurrentPage] = useState(1);
  const [inputText, setInputText] = useState("");

  const [pages, setPages] = useState(0);

  const [selectedTutorial] = useState("Todos");

  const filteredTutorials =
    selectedTutorial === "Todos"
      ? TutorialsVideos.filter((value) => value.title.includes(inputText))
      : TutorialsVideos.filter((video) =>
          video.tags.some((value) =>
            value.includes(selectedTutorial.toLowerCase()),
          ),
        )
          .filter((value) => value.title.includes(inputText))
          .slice((currentPage - 1) * 12, currentPage * 12);

  useEffect(() => {
    setPages(Math.ceil(filteredTutorials.length / 12));
  }, [filteredTutorials]);
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTutorial]);
  return (
    <div className="flex w-full flex-col gap-4 pb-40 lg:p-4">
      <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
        <div className="flex w-full flex-col">
          <h1 className="text-2xl font-bold text-[#252F40]">Tutoriais</h1>
          <span className="text-md text-[#67748E]">
            Loren ipsum dolor sit amet, consectetur adipiscing elit
          </span>
          <div className="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
            {/* <div className="flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="text-light-dark flex items-center gap-2 rounded-lg border px-2 py-1 lg:px-4 lg:py-2">
                    <span className="font-semibold">{selectedTutorial}</span>
                    <ChevronDown />
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="center"
                  className="max-h-[20vh] w-full gap-2 overflow-auto p-2"
                >
                  {activities.map((item, index) => (
                    <DropdownMenuItem
                      key={index}
                      className="group rounded-none border-b border-b-zinc-400 hover:bg-transparent"
                    >
                      <div
                        onClick={() => setSelectedTutorial(item?.name || "")}
                        className="w-full cursor-pointer rounded-md p-2 text-lg group-hover:bg-zinc-400"
                      >
                        {item?.name}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div> */}
            <div className="xs:w-[300px] border-secondary text-secondary ml-auto flex w-full flex-row justify-between gap-1 rounded-md border p-1 md:w-[300px]">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="text-secondary placeholder:text-secondary/50 w-[90%] font-semibold focus:outline-none"
                placeholder="Como podemos te ajudar ?"
              />
              <Search />
            </div>
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 gap-y-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filteredTutorials.length !== 0 ? (
          filteredTutorials.map((tutorial) => (
            <div
              key={tutorial.id}
              className="relative col-span-1 flex h-96 flex-col gap-2 overflow-y-hidden rounded-md p-2 shadow-md"
            >
              <Image
                alt=""
                width={400}
                height={400}
                src={"/camera.png"}
                className="h-auto w-full rounded-md object-cover"
              />
              <div className="flex flex-col">
                <h2 className="text-sm font-semibold text-[#252F40] lg:text-base xl:text-lg">
                  {tutorial.title}
                </h2>
                <span className="text-xs text-[#8C8C8C] lg:text-sm xl:text-base">
                  {tutorial.subtitle}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedVideo(tutorial);
                  setIsOpenVideoModal(true);
                }}
                className="border-secondary text-secondary mt-auto mb-2 rounded-md border font-bold transition-all duration-300 hover:scale-[1.005]"
              >
                Assistir Agora
              </button>
            </div>
          ))
        ) : (
          <div className="relative col-span-1 flex h-96 w-full flex-col items-center justify-center gap-2 overflow-y-hidden rounded-md p-2 md:col-span-2 xl:col-span-3 2xl:col-span-4">
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-semibold text-[#252F40]">
                Nenhum tutorial encontrado
              </h2>
              <span className="text-lg text-[#8C8C8C]">
                Tente novamente com outra palavra chave
              </span>
            </div>
          </div>
        )}
      </div>
      {pages !== 0 && (
        <CustomPagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pages={pages}
        />
      )}
    </div>
  );
}
