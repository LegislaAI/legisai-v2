import Link from "next/link";

export const AuthHeader = () => {
  return (
    <header className="flex w-full items-center justify-center py-8">
      <Link href="/" className="relative h-12 w-40 transition-transform hover:scale-105">
        {/* Placeholder for logo if path is incorrect, but standard structure usually implies assets are there */}
         <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-dark">Legis<span className="text-secondary">Ai</span></h1>
         </div>
      </Link>
    </header>
  );
};
