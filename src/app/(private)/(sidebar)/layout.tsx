import { NavigationProgress } from "@/components/GlobalLoading";
import { Header } from "@/components/Header";
import { MobileSidebar } from "@/components/MobileSidebar";
import { Sidebar } from "../../../components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <Sidebar />
      <MobileSidebar />
      <div className="flex w-full flex-col p-2 pt-0 xl:p-8">
        <Header />
        <NavigationProgress />
        {children}
      </div>
    </div>
  );
}
