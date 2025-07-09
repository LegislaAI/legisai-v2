import moment from "moment";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface PlenaryCardProps {
  id: string;
  title: string;
  summary: string;
  date?: string;
}

export function PlenaryCard({ title, summary, id, date }: PlenaryCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/plenary/${id}`)}
      className="relative flex w-full cursor-pointer flex-col items-center justify-between rounded-lg p-1 pb-2 transition-all duration-300 hover:scale-[1.005] hover:shadow lg:flex-row"
    >
      <div className="absolute bottom-0 left-1/2 h-px w-full -translate-x-1/2 bg-zinc-200 md:w-2/3 xl:w-3/4" />
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
          <h2 className="text-dark text-lg font-medium">
            {title} - {moment(date).format("DD/MM/YY")}
          </h2>
          <p className="w-full text-gray-600 lg:hidden lg:w-[650px] lg:truncate">
            {summary && summary.length > 100
              ? summary.slice(0, 100) + "..."
              : summary}
          </p>
          <p className="hidden w-full text-gray-600 lg:block lg:w-[650px] lg:truncate">
            {summary}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-gray-600">
          {moment(date).format("DD/MM/YY")}
        </span>
        <button
          onClick={() => router.push(`/plenary/${id}`)}
          className="rounded-xl border border-blue-700 bg-blue-700/10 px-4 py-1 font-bold text-blue-700 hover:scale-[1.005]"
        >
          Acessar
        </button>
      </div>
    </div>
  );
}
