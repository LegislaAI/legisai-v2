import Image from "next/image";

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="m-auto flex flex-col items-center justify-center rounded-lg bg-white p-10 shadow-lg">
        <Image
          src="/logos/small-logo.png"
          alt=""
          width={500}
          height={500}
          className="animate-spring-spin h-20 w-20 object-contain"
        />
        <p className="mt-2 text-gray-700">Carregando...</p>
      </div>
    </div>
  );
}
