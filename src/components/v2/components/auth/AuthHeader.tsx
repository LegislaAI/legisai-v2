import Image from "next/image";
import Link from "next/link";

export const AuthHeader = () => {
  return (
    <header className="flex w-full items-center justify-center py-8">
      <Link
        href="/"
        className="relative h-12 w-40 transition-transform hover:scale-105"
      >
        <Image
          src="/logos/logo.png"
          alt=""
          width={1000}
          height={250}
          className="h-32 w-max object-contain"
        />
      </Link>
    </header>
  );
};
