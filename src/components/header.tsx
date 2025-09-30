"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Moon, Sun, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";

interface User {
  nombre: string;
  apellido: string;
  rol: "MESA_ENTRADA" | "PROFESIONAL" | "GERENTE";
}

export function Header() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  // Obtener usuario desde localStorage (similar a headerOficial)

  const [users, setUsers] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUsers(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error al parsear el usuario:", err);
      }
    }
  }, []);

  if (!users) return null; // Esperamos a que user exista

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "MESA_ENTRADA":
        return "Mesa de Entrada";
      case "PROFESIONAL":
        return "Profesional";
      case "GERENTE":
        return "Gerente";
      default:
        return role;
    }
  };

  const getUserInitials = (user: User) => {
    const nombreInicial = user.nombre?.[0] || "";
    const apellidoInicial = user.apellido?.[0] || "";
    return `${nombreInicial}${apellidoInicial}`.toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-indigo-600 to-indigo-700 z-50 shadow-lg px-6 flex items-center justify-between">
      {/* Título y fecha */}
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          DevForce
        </h1>
        <div className="hidden md:block text-sm text-indigo-200 capitalize">
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Panel derecho: notificaciones, dark mode, avatar y logout */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-white"
          onClick={toggleDarkMode}
        >
          {darkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full p-0"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-white/20 text-white">
                  {users ? getUserInitials(users) : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-gray-900">
                  {users?.nombre}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {getRoleDisplayName(users.rol || "")}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
