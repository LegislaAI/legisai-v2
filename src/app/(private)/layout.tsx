import { Header } from "@/components/Header";
import { Sidebar } from "../../components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex w-full flex-col p-8 pt-0">
        <Header />
        {children}
      </div>
    </div>
  );
}
