"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { User } from "../@types/user";
import { useApiContext } from "./ApiContext";

interface UserContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
}

export const UserContextProvider = ({ children }: ProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const { GetAPI } = useApiContext();
  const { token } = useApiContext();
  async function getUser() {
    if (!token) {
      return;
    }
    try {
      const response = await GetAPI(`/user`, true);
      if (response.status === 200) {
        setUser(response.body.user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }

  useEffect(() => {
    getUser();
  }, [token]);
  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error(
      "useUserContext deve ser usado dentro de um UserContextProvider",
    );
  }
  return context;
}
