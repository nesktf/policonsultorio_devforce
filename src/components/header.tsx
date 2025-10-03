"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Moon, Sun, LogOut } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Role } from "@/generated/prisma"

export function Header() {
  const [darkMode, setDarkMode] = useState(false)
  const { user, logout } = useAuth()

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  const getRoleDisplayName = (rol: Role) => {
    switch (rol) {
      case "MESA_ENTRADA":
        return "Mesa de Entrada"
      case "PROFESIONAL":
        return "Profesional"
      case "GERENTE":
        return "Gerente"
      default:
        return "Usuario"
    }
  }

  const getHeaderTitle = () => {
    if (!user) return "Dashboard"
    
    switch (user.rol) {
      case "MESA_ENTRADA":
        return "Mesa de Entrada"
      case "PROFESIONAL":
        return "Panel Profesional"
      case "GERENTE":
        return "Panel de Gestión"
      default:
        return "Dashboard"
    }
  }

  const getUserInitials = (nombre: string) => {
    return nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-foreground">
            {getHeaderTitle()}
          </h1>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={toggleDarkMode}>
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user ? getUserInitials(user.nombre) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.nombre}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.rol ? getRoleDisplayName(user.rol) : "Usuario"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}