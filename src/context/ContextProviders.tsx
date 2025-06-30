import { CookiesProvider } from "next-client-cookies/server";
import { ApiContextProvider } from "./ApiContext";
import { SampleContextProvider } from "./SampleContext";
import { SidebarContextProvider } from "./SidebarContext";

export function ContextProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CookiesProvider>
        <ApiContextProvider>
          <SidebarContextProvider>
            <SampleContextProvider>
              {/* Any other Context Providers */}
              {children}
              {/* Any other Context Providers */}
            </SampleContextProvider>
          </SidebarContextProvider>
        </ApiContextProvider>
      </CookiesProvider>
    </>
  );
}
