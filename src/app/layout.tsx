import { ContextProviders } from "@/context/ContextProviders";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "LegisDados",
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
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <Script id="ms_clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "sr58x88ir8");`}
        </Script>
        <GoogleAnalytics gaId="G-7PH70SBW1X" />
      </head>
      <body className={"bg-surface"}>
        <Toaster position="top-center" />
        <ContextProviders>{children}</ContextProviders>
      </body>
    </html>
  );
}
