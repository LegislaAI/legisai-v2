"use client";

import { useCookies } from "next-client-cookies";
import { createContext, useContext } from "react";

interface SampleContextProps {
  token: string | undefined;
}

const SampleContext = createContext<SampleContextProps | undefined>(undefined);

interface ProviderProps {
  children: React.ReactNode;
}

export const SampleContextProvider = ({ children }: ProviderProps) => {
  const cookies = useCookies();

  const token = cookies.get("token");

  console.log("cookies: ", cookies);

  return (
    <SampleContext.Provider
      value={{
        token,
      }}
    >
      {children}
    </SampleContext.Provider>
  );
};

export function useSampleContext() {
  const context = useContext(SampleContext);
  if (!context) {
    throw new Error(
      "useSampleContext deve ser usado dentro de um SampleContextProvider",
    );
  }
  return context;
}
