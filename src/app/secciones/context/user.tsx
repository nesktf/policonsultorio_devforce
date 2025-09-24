"use client";

import { Role } from "@/generated/prisma";
import { createContext, useContext } from "react";

interface UserContextType {
  nombre: string;
  apellido: string;
  role: Role;
}

const UserContext = createContext<UserContextType | null>(null);

// Usuario hardcodeado para desarrollo
const mockUser: UserContextType = {
  nombre: "María",
  apellido: "González",
  role: "MESA_ENTRADA", // Usuario de mesa de entrada
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  return (
    <UserContext.Provider value={mockUser}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
