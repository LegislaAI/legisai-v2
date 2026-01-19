import { CookiesProvider } from "next-client-cookies/server";
import { ApiContextProvider } from "./ApiContext";
import { LoadingContextProvider } from "./LoadingContext";
import { SidebarContextProvider } from "./SidebarContext";
import { SignatureContextProvider } from "./SignatureContext";
import { UserContextProvider } from "./UserContext";

export function ContextProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LoadingContextProvider>
        <CookiesProvider>
          <ApiContextProvider>
            <SidebarContextProvider>
              <UserContextProvider>
                <SignatureContextProvider>{children}</SignatureContextProvider>
              </UserContextProvider>
            </SidebarContextProvider>
          </ApiContextProvider>
        </CookiesProvider>
      </LoadingContextProvider>
    </>
  );
}
