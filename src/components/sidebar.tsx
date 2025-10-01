"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarRail,
} from "@/components/ui/sidebar"; // Ajustá path si es necesario

import {
  Users,
  Calendar,
  FileText,
  BarChart3,
  UserCheck,
  Settings,
  Activity,
  Stethoscope,
} from "lucide-react";

import { useSidebar } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { useState, useEffect } from "react";

// Simulamos user hasta que uses tu contexto real

interface User {
  nombre: string;
  apellido: string;
  rol: "MESA_ENTRADA" | "PROFESIONAL" | "GERENTE";
}

export function SidebarOficial() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const { state } = useSidebar();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error al parsear el usuario:", err);
      }
    }
  }, []);

  if (!user) return null; // Esperamos a que user exista

  const roleLabel = {
    MESA_ENTRADA: "Mesa de Entrada",
    PROFESIONAL: "Profesional",
    GERENTE: "Gerente",
  }[user.rol];

  const menuItems = [
    ...(user.rol === "MESA_ENTRADA"
      ? [
          { icon: Users, label: "Pacientes", href: "/sist/pacientes" },
          { icon: Calendar, label: "Turnos", href: "/sist/turnos" },
        ]
      : []),
    ...(user.rol === "PROFESIONAL"
      ? [
          { icon: Calendar, label: "Turnos", href: "/sist/turnos" },
          { icon: Users, label: "Pacientes", href: "/sist/pacientes" },
          { icon: Users, label: "Mi agenda", href: "/sist/mi-agenda" },
          { icon: Users, label: "Mis pacientes", href: "/sist/mis_pacientes" },
          {
            icon: FileText,
            label: "Historias Clínicas",
            href: "/sist/historias-clinicas",
          },
        ]
      : []),
    ...(user.rol === "GERENTE"
      ? [
          { icon: Users, label: "Pacientes", href: "/sist/pacientes" },
          {
            icon: UserCheck,
            label: "Profesionales",
            href: "/sist/profesionales",
          },
          { icon: Calendar, label: "Turnos", href: "/sist/turnos" },
          {
            icon: Calendar,
            label: "Obras sociales",
            href: "/sist/obra_social",
          },

          {
            icon: FileText,
            label: "Historias Clínicas",
            href: "/sist/historias-clinicas",
          },
        ]
      : []),
  ];

  return (
    <Sidebar className="pt-16">
      <SidebarRail />
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary-foreground" />
          </div>
          {state === "expanded" && (
            <div>
              <h2 className="font-semibold text-sm text-foreground">
                MediAdmin
              </h2>
              <p className="text-xs text-muted-foreground">Policonsultorio</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map(({ icon: Icon, label, href }) => {
              const isActive = pathname === href;

              return (
                <SidebarMenuItem key={href}>
                  <Link href={href}>
                    <SidebarMenuButton isActive={isActive}>
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator />

      <SidebarFooter>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {user.nombre
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </span>
          </div>
          {state === "expanded" && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.nombre}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.rol === "MESA_ENTRADA"
                  ? "Mesa de Entrada"
                  : user.rol === "PROFESIONAL"
                  ? "Profesional"
                  : user.rol === "GERENTE"
                  ? "Gerente"
                  : "Usuario"}
              </p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
