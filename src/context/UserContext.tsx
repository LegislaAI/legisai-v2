"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
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
      console.log("Token not found, skipping user fetch");
      return;
    }
    console.log("Fetching user with token:", token);
    try {
      const response = await GetAPI(`/user`, true);
      console.log("User response:", response);
      if (response.status === 200) {
        setUser(response.body.user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }

  useEffect(() => {
    console.log("UserContext useEffect triggered");
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
      "useUserContext deve ser usado dentro de um UserContextProvider"
    );
  }
  return context;
}
