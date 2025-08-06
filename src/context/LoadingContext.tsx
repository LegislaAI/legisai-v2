"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

interface LoadingContextProps {
  isNavigating: boolean;
  handleNavigation: (path: string) => void;
}

const LoadingContext = createContext<LoadingContextProps | undefined>(
  undefined,
);

interface ProviderProps {
  children: React.ReactNode;
}

export const LoadingContextProvider = ({ children }: ProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationStartTime = useRef<number>(0);
  const minLoadingTime = 1000;

  const handleNavigation = (path: string) => {
    if (pathname === path) return;
    setIsNavigating(true);
    navigationStartTime.current = Date.now();
    router.push(path);
  };

  useEffect(() => {
    const handleNavigationComplete = () => {
      const elapsedTime = Date.now() - navigationStartTime.current;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      if (remainingTime > 0) {
        // Wait for the remaining time to meet minimum threshold
        setTimeout(() => {
          setIsNavigating(false);
        }, remainingTime);
      } else {
        // Already past minimum time, hide immediately
        setIsNavigating(false);
      }
    };

    window.addEventListener("navigationComplete", handleNavigationComplete);

    return () => {
      window.removeEventListener(
        "navigationComplete",
        handleNavigationComplete,
      );
    };
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        isNavigating,
        handleNavigation,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export function useLoadingContext() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error(
      "useLoadingContext deve ser usado dentro de um LoadingContextProvider",
    );
  }
  return context;
}
