"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import {
  Users,
  CalendarDays,
  UserCheck,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  Stethoscope,
} from "lucide-react"

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  const getMenuItems = () => {
    const baseItems = [{ icon: BarChart3, label: "Dashboard", href: "/" }]

    if (user?.rol === "MESA_ENTRADA") {
      return [
        ...baseItems,
        { icon: Users, label: "Pacientes", href: "/pacientes" },
        { icon: Calendar, label: "Turnos", href: "/turnos" },
        { icon: CalendarDays, label: "Calendario", href: "/calendario-mesa" },
      ]
    }

    if (user?.rol === "PROFESIONAL") {
      return [
        ...baseItems,
        { icon: Calendar, label: "Mi Agenda", href: "/calendario-profesional" },
        { icon: Users, label: "Pacientes", href: "/pacientes" },
        { icon: FileText, label: "Historias Clínicas", href: "/historias-clinicas" },
      ]
    }

    if (user?.rol === "GERENTE") {
      return [
        ...baseItems,
        { icon: Users, label: "Pacientes", href: "/pacientes" },
        { icon: UserCheck, label: "Profesionales", href: "/profesionales" },
        { icon: CalendarDays, label: "Calendario", href: "/calendario-mesa" },
        { icon: Activity, label: "Reportes", href: "/reportes" },
      ]
    }

    return baseItems
  }

  const menuItems = getMenuItems()

  // Obtener iniciales del nombre
  const getUserInitials = () => {
    if (!user?.nombre) return "U"
    return user.nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Obtener label del rol
  const getRoleLabel = () => {
    switch (user?.rol) {
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

  return (
    <div
      className={cn(
        "bg-card border-r border-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-foreground">MediAdmin</h2>
                <p className="text-xs text-muted-foreground">Policonsultorio</p>
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn("w-full justify-start gap-3 h-10", collapsed && "justify-center px-2")}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </Button>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {getUserInitials()}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.nombre}</p>
              <p className="text-xs text-muted-foreground truncate">
                {getRoleLabel()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}