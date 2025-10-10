"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import Image from "next/image"
import {
  Users,
  CalendarDays,
  UserCheck,
  Calendar,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Activity,
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
        { icon: Calendar, label: "Turnos", href: "/turnos" },
        { icon: CalendarDays, label: "Calendario", href: "/calendario-mesa" },
        { icon: Activity, label: "Reportes", href: "/reportes" },
      ]
    }

    return baseItems
  }

  const menuItems = getMenuItems()

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
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                {/* Opción 1: Usando Next.js Image */}
                <Image 
                  src="/logo.png" 
                  alt="DevForce Logo" 
                  width={32} 
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-foreground">DevForce</h2>
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
    </div>
  )
}