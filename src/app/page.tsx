// app/page.tsx
"use client"

import { useAuth } from "@/context/auth-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  Users,
  CalendarDays,
  Calendar,
  FileText,
  UserCheck,
  Activity,
  ArrowRight,
  Clock,
  Stethoscope,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Module {
  icon: any
  title: string
  description: string
  href: string
  color: string
  iconColor: string
}

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()

  const getModules = (): Module[] => {
    if (!user) return []

    if (user.rol === "MESA_ENTRADA") {
      return [
        {
          icon: Users,
          title: "Pacientes",
          description: "Gestionar información de pacientes",
          href: "/pacientes",
          color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
          iconColor: "text-blue-600",
        },
        {
          icon: Shield,
          title: "Obras Sociales",
          description: "Gestionar obras sociales admitidas",
          href: "/obra-social",
          color: "bg-pink-50 border-pink-200 hover:bg-pink-100",
          iconColor: "text-pink-600",
        },
        {
          icon: Calendar,
          title: "Turnos",
          description: "Administrar turnos y citas",
          href: "/turnos",
          color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
          iconColor: "text-purple-600",
        },
        {
          icon: CalendarDays,
          title: "Calendario",
          description: "Vista de calendario de turnos",
          href: "/calendario-mesa",
          color: "bg-green-50 border-green-200 hover:bg-green-100",
          iconColor: "text-green-600",
        },
        {
          icon: Activity,
          title: "Reportes",
          description: "Acceder a estadísticas y reportes del consultorio",
          href: "/reportes",
          color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
          iconColor: "text-orange-600",
        },
      ]
    }

    if (user.rol === "PROFESIONAL") {
      return [
        {
          icon: Calendar,
          title: "Mi Agenda",
          description: "Gestionar mi calendario de consultas",
          href: "/calendario-profesional",
          color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
          iconColor: "text-purple-600",
        },
        {
          icon: FileText,
          title: "Historias Clínicas",
          description: "Acceder a historias clínicas",
          href: "/historias-clinicas",
          color: "bg-amber-50 border-amber-200 hover:bg-amber-100",
          iconColor: "text-amber-600",
        },
        {
          icon: Activity,
          title: "Reportes",
          description: "Ver estadísticas de pacientes y turnos",
          href: "/reportes",
          color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
          iconColor: "text-orange-600",
        },
      ]
    }

    if (user.rol === "GERENTE") {
      return [
        {
          icon: Users,
          title: "Pacientes",
          description: "Gestionar base de datos de pacientes",
          href: "/pacientes",
          color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
          iconColor: "text-blue-600",
        },
        {
          icon: UserCheck,
          title: "Profesionales",
          description: "Administrar profesionales y especialidades",
          href: "/profesionales",
          color: "bg-teal-50 border-teal-200 hover:bg-teal-100",
          iconColor: "text-teal-600",
        },
        {
          icon: Shield,
          title: "Obras Sociales",
          description: "Gestionar obras sociales admitidas",
          href: "/obra-social",
          color: "bg-pink-50 border-pink-200 hover:bg-pink-100",
          iconColor: "text-pink-600",
        },
        {
          icon: Calendar,
          title: "Turnos",
          description: "Administrar turnos y citas",
          href: "/turnos",
          color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
          iconColor: "text-purple-600",
        },
        {
          icon: CalendarDays,
          title: "Calendario",
          description: "Vista general de turnos y agendas",
          href: "/calendario-mesa",
          color: "bg-green-50 border-green-200 hover:bg-green-100",
          iconColor: "text-green-600",
        },
        {
          icon: Activity,
          title: "Reportes",
          description: "Análisis y estadísticas del consultorio",
          href: "/reportes",
          color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
          iconColor: "text-orange-600",
        },
      ]
    }

    return []
  }

  const modules = getModules()

  const getRoleTitle = () => {
    switch (user?.rol) {
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

  const getRoleDescription = () => {
    switch (user?.rol) {
      case "MESA_ENTRADA":
        return "Gestiona pacientes, turnos y el calendario del consultorio"
      case "PROFESIONAL":
        return "Accede a tu agenda, pacientes e historias clínicas"
      case "GERENTE":
        return "Supervisa operaciones, profesionales y reportes del consultorio"
      default:
        return "Selecciona un módulo para comenzar"
    }
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {getRoleTitle()}
              </h1>
              <p className="text-muted-foreground">
                {getRoleDescription()}
              </p>
            </div>
          </div>
        </div>

        {/* Welcome Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">
                Bienvenido, {user?.nombre}
              </h2>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <Clock className="h-8 w-8 text-primary/40" />
          </div>
        </Card>

        {/* Modules Grid */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Módulos Disponibles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => {
              const Icon = module.icon
              return (
                <Card
                  key={module.href}
                  className={cn(
                    "p-6 cursor-pointer transition-all duration-200 border-2 group",
                    module.color,
                    "hover:shadow-lg hover:scale-[1.02]"
                  )}
                  onClick={() => router.push(module.href)}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={cn("p-3 rounded-lg bg-white/50", module.iconColor)}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground">
                        {module.title}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {module.description}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-center gap-2 mt-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(module.href)
                      }}
                    >
                      Acceder
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Quick Stats - Solo para Gerente */}
        {user?.rol === "GERENTE" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pacientes Activos</p>
                  <p className="text-2xl font-bold text-foreground">245</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </Card>
            
            <Card className="p-4 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Turnos Hoy</p>
                  <p className="text-2xl font-bold text-foreground">32</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </Card>
            
            <Card className="p-4 border-teal-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profesionales</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
                </div>
                <UserCheck className="h-8 w-8 text-teal-600" />
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
