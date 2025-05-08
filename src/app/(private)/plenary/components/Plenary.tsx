import Image from "next/image";
import { useRouter } from "next/navigation";

interface PlenaryCardProps {
  id: string;
  title: string;
  summary: string;
}

export function PlenaryCard({ title, summary, id }: PlenaryCardProps) {
  const router = useRouter();

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-max w-max rounded-full border-2 border-blue-700 bg-blue-700/10 px-3 py-3">
          <Image
            src="./icons/plenary.svg"
            alt=""
            width={20}
            height={20}
            className="h-5 w-5"
          />
        </div>
        <div>
          <h2 className="text-dark text-lg font-medium">{title}</h2>
          <p className="w-[750px] truncate text-gray-600">{summary}</p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-gray-600">2m atrás</span>
        <button
          onClick={() => router.push(`/plenary/${id}`)}
          className="rounded-xl border border-blue-700 bg-blue-700/10 px-4 py-1 font-bold text-blue-700"
        >
          Acessar
        </button>
      </div>
    </div>
  );
}
