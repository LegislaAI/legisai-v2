"use client";

import { SignaturePlan, UserSignature } from "@/@types/signature";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useApiContext } from "./ApiContext";

interface SignatureContextProps {
  plans: SignaturePlan[];
  activeSignature: UserSignature | null;
  isSubscribed: boolean;
  isLoading: boolean;
  fetchPlans: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

const SignatureContext = createContext<SignatureContextProps | undefined>(
  undefined,
);

interface ProviderProps {
  children: ReactNode;
}

export const SignatureContextProvider = ({ children }: ProviderProps) => {
  const [plans, setPlans] = useState<SignaturePlan[]>([]);
  const [activeSignature, setActiveSignature] = useState<UserSignature | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const { GetAPI, token } = useApiContext();

  const fetchPlans = useCallback(async () => {
    try {
      const response = await GetAPI("/signature-plan", false);
      if (response.status === 200) {
        setPlans(response.body.plans);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  }, [GetAPI]);

  const checkSubscription = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await GetAPI("/signature/active", true);
      if (response.status === 200) {
        setActiveSignature(response.body.signature);
      } else {
        setActiveSignature(null);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setActiveSignature(null);
    } finally {
      setIsLoading(false);
    }
  }, [GetAPI, token]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const isSubscribed =
    activeSignature !== null && activeSignature.status === "active";

  return (
    <SignatureContext.Provider
      value={{
        plans,
        activeSignature,
        isSubscribed,
        isLoading,
        fetchPlans,
        checkSubscription,
      }}
    >
      {children}
    </SignatureContext.Provider>
  );
};

export function useSignatureContext() {
  const context = useContext(SignatureContext);
  if (!context) {
    throw new Error(
      "useSignatureContext deve ser usado dentro de um SignatureContextProvider",
    );
  }
  return context;
}
