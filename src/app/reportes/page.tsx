"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { 
  BarChart3, 
  Users,
  Stethoscope,
  XCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Activity,
  TrendingUp,
  Calendar,
  UserPlus,
  CalendarRange,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ReportesPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Control de permisos
  if (!user) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Debes iniciar sesión para acceder a esta sección.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  const rolesConAcceso = new Set(["GERENTE", "MESA_ENTRADA", "PROFESIONAL"])

  if (!rolesConAcceso.has(user.rol)) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-32 space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No tienes permisos para acceder a los reportes.</p>
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver al Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  const reportes = [
    {
      id: "turnos-especialidad",
      titulo: "Turnos por Especialidad",
      descripcion: "Análisis estadístico de turnos médicos agrupados por especialidad",
      icon: Stethoscope,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      disponible: true,
      href: "/reportes/turnos-especialidad",
      stats: ["Programados", "Asistidos", "Cancelados"]
    },
    {
      id: "nuevos-pacientes",
      titulo: "Nuevos Pacientes",
      descripcion: "Registro de pacientes nuevos por período y análisis de crecimiento",
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      disponible: true,
      href: "/reportes/pacientes-nuevos",
      stats: ["Por mes", "Por año", "Tendencias"]
    },
    {
      id: "turnos-profesional",
      titulo: "Detalles por obra social",
      descripcion: "Algunas estadisticas y datos asociados a profesionales, pacientes y obras sociales",
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      disponible: true,
      href: "/reportes/obras-sociales",
      stats: ["", "Tasas", "Comparativas"]
    },
    {
      id: "turnos-cancelados",
      titulo: "Turnos Cancelados",
      descripcion: "Análisis de turnos cancelados y solicitantes de la cancelación",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      disponible: true,
      href: "/reportes/turnos-cancelados",
      stats: ["Por solicitante", "Tasa cancelación", "Profesional"]
    },
    {
      id: "pacientes-atendidos",
      titulo: "Pacientes Atendidos",
      descripcion: "Seguimiento de pacientes asistidos vs. no asistidos en el período",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      disponible: true,
      href: "/reportes/pacientes-atendidos",
      stats: ["Asistidos", "No asistidos", "Cancelados"]
    },
    {
      id: "paciente-por-periodo",
      titulo: "Pacientes Atendidos por Período",
      descripcion: "Volumen de pacientes atendidos comparado por períodos seleccionados",
      icon: CalendarRange,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      disponible: true,
      href: "/reportes/paciente-por-periodo",
      stats: ["Por semana", "Por mes", "Tendencias"]
    },
  ]

  const reportesPorRol: Record<"GERENTE" | "MESA_ENTRADA" | "PROFESIONAL", string[]> = {
    GERENTE: reportes.map((reporte) => reporte.id),
    MESA_ENTRADA: ["pacientes-atendidos", "turnos-cancelados"],
    PROFESIONAL: ["paciente-por-periodo"],
  }

  const reportesDisponiblesIds = reportesPorRol[user.rol] ?? []
  const reportesVisibles = reportes.filter((reporte) => reportesDisponiblesIds.includes(reporte.id))
  const cantidadReportesDisponibles = reportesVisibles.filter((reporte) => reporte.disponible).length
  const cantidadReportesProximamente = reportesVisibles.filter((reporte) => !reporte.disponible).length

  if (reportesVisibles.length === 0) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-32 space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground text-center">
                No hay reportes habilitados para tu rol en este momento.
              </p>
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver al Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes y Estadísticas</h1>
          <p className="text-muted-foreground">
            Análisis detallados para la toma de decisiones
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reportes Disponibles</p>
                  <p className="text-3xl font-bold text-primary">
                    {cantidadReportesDisponibles}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Próximamente</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {cantidadReportesProximamente}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reportes Totales</p>
                  <p className="text-3xl font-bold text-blue-600">{reportesVisibles.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid de Reportes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportesVisibles.map((reporte) => {
            const Icon = reporte.icon
            
            return (
              <Card 
                key={reporte.id}
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  reporte.disponible ? 'cursor-pointer' : 'opacity-75'
                }`}
                onClick={() => reporte.disponible && router.push(reporte.href)}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${reporte.bgColor} opacity-30 rounded-bl-full`} />
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-lg ${reporte.bgColor} border ${reporte.borderColor}`}>
                        <Icon className={`h-6 w-6 ${reporte.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{reporte.titulo}</CardTitle>
                        <CardDescription className="mt-1">
                          {reporte.descripcion}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Stats preview */}
                    <div className="flex gap-2 flex-wrap">
                      {reporte.stats.map((stat, idx) => (
                        <div key={idx} className="px-2 py-1 bg-muted rounded text-xs font-medium">
                          {stat}
                        </div>
                      ))}
                    </div>

                    {/* Action button */}
                    <div className="flex items-center justify-between pt-2">
                      {reporte.disponible ? (
                        <Button 
                          className="gap-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(reporte.href)
                          }}
                        >
                          Ver Reporte
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Próximamente</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Info adicional */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Mas reportes en desarrollo</p>
                <p className="text-sm text-blue-700">
                  Estamos trabajando en nuevos reportes.
                  Los reportes marcados como "Próximamente" estarán disponibles en futuras actualizaciones.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
