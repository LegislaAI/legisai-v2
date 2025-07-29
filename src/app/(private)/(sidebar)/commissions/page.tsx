import Image from "next/image";

export default function Commissions() {
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
