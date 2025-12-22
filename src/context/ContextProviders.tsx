import { CookiesProvider } from "next-client-cookies/server";
import { ApiContextProvider } from "./ApiContext";
import { LoadingContextProvider } from "./LoadingContext";
import { SidebarContextProvider } from "./SidebarContext";
import { UserContextProvider } from "./UserContext";

export function ContextProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LoadingContextProvider>
        <CookiesProvider>
          <ApiContextProvider>
            <SidebarContextProvider>
              <UserContextProvider>
                {/* Any other Context Providers */}
                {children}
                {/* Any other Context Providers */}
              </UserContextProvider>
            </SidebarContextProvider>
          </ApiContextProvider>
        </CookiesProvider>
      </LoadingContextProvider>
    </>
  );
}
