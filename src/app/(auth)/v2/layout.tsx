import { AuthFooter } from "@/components/v2/components/auth/AuthFooter";
import { AuthHeader } from "@/components/v2/components/auth/AuthHeader";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col justify-between">
       <div className="flex-1 flex flex-col items-center">
        <AuthHeader />
        <main className="w-full h-full flex items-center justify-center px-4 flex-1">
          {children}
        </main>
      </div>
      <AuthFooter />
    </div>
  );
}
