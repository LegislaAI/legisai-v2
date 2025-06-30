import { ContextProviders } from "@/context/ContextProviders";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Legis AI",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={"bg-surface"}>
        <Toaster position="top-center" />
        <ContextProviders>{children}</ContextProviders>
      </body>
    </html>
  );
}
