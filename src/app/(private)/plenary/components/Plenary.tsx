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
    <div className="flex w-full flex-col items-center justify-between lg:flex-row">
      <div className="flex items-center gap-2">
        <div className="h-max w-max rounded-full border-2 border-blue-700 bg-blue-700/10 px-3 py-3">
          <Image
            src="./icons/plenary.svg"
            alt=""
            width={20}
            height={20}
            className="h-5 max-h-5 min-h-5 w-5 max-w-5 min-w-5"
          />
        </div>
        <div>
          <h2 className="text-dark text-lg font-medium">{title}</h2>
          <p className="w-full text-gray-600 lg:hidden lg:w-[700px] lg:truncate">
            {summary.length > 100 ? summary.slice(0, 100) + "..." : summary}
          </p>
          <p className="hidden w-full text-gray-600 lg:block lg:w-[700px] lg:truncate">
            {summary}
          </p>
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
