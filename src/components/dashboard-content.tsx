"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, Calendar, TrendingUp, Clock, Plus, Eye } from "lucide-react"
import { useAuth } from "@/context/auth-context"

const stats = [
  {
    title: "Pacientes Registrados",
    value: "1,247",
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "text-blue-600",
  },
  {
    title: "Profesionales Activos",
    value: "24",
    change: "+2",
    trend: "up",
    icon: UserCheck,
    color: "text-green-600",
  },
  {
    title: "Turnos Hoy",
    value: "89",
    change: "15 pendientes",
    trend: "neutral",
    icon: Calendar,
    color: "text-orange-600",
  },
  {
    title: "Consultas del Mes",
    value: "2,341",
    change: "+8%",
    trend: "up",
    icon: TrendingUp,
    color: "text-purple-600",
  },
]

const recentPatients = [
  { id: 1, name: "María González", dni: "12.345.678", lastVisit: "2024-01-15", status: "Activo" },
  { id: 2, name: "Carlos Rodríguez", dni: "23.456.789", lastVisit: "2024-01-14", status: "Pendiente" },
  { id: 3, name: "Ana Martínez", dni: "34.567.890", lastVisit: "2024-01-13", status: "Activo" },
  { id: 4, name: "Luis Fernández", dni: "45.678.901", lastVisit: "2024-01-12", status: "Activo" },
]

const upcomingAppointments = [
  { id: 1, patient: "María González", doctor: "Dr. Pérez", time: "09:00", specialty: "Cardiología" },
  { id: 2, patient: "Carlos Rodríguez", doctor: "Dra. López", time: "09:30", specialty: "Dermatología" },
  { id: 3, patient: "Ana Martínez", doctor: "Dr. García", time: "10:00", specialty: "Pediatría" },
  { id: 4, patient: "Luis Fernández", doctor: "Dra. Ruiz", time: "10:30", specialty: "Neurología" },
]

export function DashboardContent() {
  const { user } = useAuth()

  const renderRoleSpecificContent = () => {
    if (user?.role === "mesa-entrada") {
      return (
        <div className="space-y-6">
          {/* Upcoming appointments for mesa de entrada */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Próximos Turnos</CardTitle>
                  <CardDescription>Turnos programados para hoy</CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Ver Calendario
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-secondary/20 rounded-lg">
                        <Clock className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{appointment.patient}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.doctor} • {appointment.specialty}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{appointment.time}</p>
                      <Badge variant="outline" className="text-xs">
                        Confirmado
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (user?.role === "profesional") {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Mi Agenda de Hoy</CardTitle>
              <CardDescription>Pacientes programados para {user.especialidad}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments
                  .filter((apt) => apt.specialty === user.especialidad)
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-secondary/20 rounded-lg">
                          <Clock className="h-5 w-5 text-secondary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{appointment.patient}</p>
                          <p className="text-sm text-muted-foreground">Consulta de {appointment.specialty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{appointment.time}</p>
                        <Badge variant="outline" className="text-xs">
                          Confirmado
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    // Default content for gerente and others
    return null
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change} desde el mes pasado</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {renderRoleSpecificContent()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Pacientes Recientes</CardTitle>
                <CardDescription>Últimos pacientes registrados</CardDescription>
              </div>
              {(user?.role === "mesa-entrada" || user?.role === "gerente") && (
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Paciente
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">DNI: {patient.dni}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={patient.status === "Activo" ? "secondary" : "outline"}>{patient.status}</Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments - only show if not already shown in role-specific content */}
        {user?.role !== "mesa-entrada" && user?.role !== "profesional" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Próximos Turnos</CardTitle>
                  <CardDescription>Turnos programados para hoy</CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Ver Calendario
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-secondary/20 rounded-lg">
                        <Clock className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{appointment.patient}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.doctor} • {appointment.specialty}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{appointment.time}</p>
                      <Badge variant="outline" className="text-xs">
                        Confirmado
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
          <CardDescription>Funciones más utilizadas del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(user?.role === "mesa-entrada" || user?.role === "gerente") && (
              <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                <Users className="h-6 w-6" />
                <span>Registrar Paciente</span>
              </Button>
            )}
            <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
              <Calendar className="h-6 w-6" />
              <span>Agendar Turno</span>
            </Button>
            {user?.role === "gerente" && (
              <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                <UserCheck className="h-6 w-6" />
                <span>Registrar Profesional</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
