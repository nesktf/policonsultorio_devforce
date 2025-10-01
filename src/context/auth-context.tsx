"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type UserRole = "mesa-entrada" | "profesional" | "gerente"

export interface User {
  id: string
  name: string
  role: UserRole
  especialidad?: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demonstration
const mockUsers: User[] = [
  { id: "1", name: "Ana García", role: "mesa-entrada", email: "mesa@policonsultorio.com" },
  {
    id: "2",
    name: "Dr. Carlos Mendez",
    role: "profesional",
    especialidad: "Cardiología",
    email: "carlos@policonsultorio.com",
  },
  {
    id: "3",
    name: "Dra. María López",
    role: "profesional",
    especialidad: "Pediatría",
    email: "maria@policonsultorio.com",
  },
  { id: "4", name: "Roberto Silva", role: "gerente", email: "gerente@policonsultorio.com" },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("mediadmin-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Mock authentication - in real app, this would be an API call
    const foundUser = mockUsers.find((u) => u.email === email)

    if (foundUser && password === "123456") {
      // Mock password
      setUser(foundUser)
      localStorage.setItem("mediadmin-user", JSON.stringify(foundUser))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("mediadmin-user")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
