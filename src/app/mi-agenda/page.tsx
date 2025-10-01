"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { TurnosCalendar } from "@/components/turnos/turnos-calendar"
import { NuevoTurnoDialog } from "@/components/turnos/nuevo-turno-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { hasPermission, getAccessDeniedMessage } from "@/lib/permissions"
import { Plus, Calendar, Clock, Users, AlertCircle } from "lucide-react"

type TurnoApi = {
  id: number
  fecha: string
  duracion: number
  estado: string
  paciente: {
    id: number
    nombre: string
    apellido: string
    dni: string
    telefono: string
  }
  profesional: {
    id: number
    nombre: string
    apellido: string
    especialidad: string
  }
}

export default function MiAgendaPage() {
  const { user } = useAuth()
  const [showNuevoTurno, setShowNuevoTurno] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [turnos, setTurnos] = useState<TurnoApi[]>([])
  const [turnosLoading, setTurnosLoading] = useState(false)
  const [turnosError, setTurnosError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const profesionalId = user?.id ?? null

  useEffect(() => {
    if (!profesionalId) {
      setTurnos([])
      setTurnosError(null)
      setTurnosLoading(false)
      return
    }

    let cancelado = false
    const targetProfesionalId = profesionalId

    async function cargarTurnos() {
      setTurnosLoading(true)
      setTurnosError(null)

      const params = new URLSearchParams()
      const fechaIso = selectedDate.toISOString().slice(0, 10)
      params.set("from", fechaIso)
      params.set("to", fechaIso)
      params.set("profesionalId", targetProfesionalId)

      try {
        const response = await fetch(`/api/v1/turnos?${params.toString()}`, {
          cache: "no-store",
        })

        if (!response.ok) {
          const { error } = await response
            .json()
            .catch(() => ({ error: "No se pudieron obtener los turnos" }))
          throw new Error(error)
        }

        const data: { turnos: TurnoApi[] } = await response.json()
        if (!cancelado) {
          setTurnos(data.turnos)
        }
      } catch (error) {
        console.error("Error al cargar turnos:", error)
        if (!cancelado) {
          setTurnos([])
          setTurnosError(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los turnos. Intenta nuevamente.",
          )
        }
      } finally {
        if (!cancelado) {
          setTurnosLoading(false)
        }
      }
    }

    cargarTurnos()

    return () => {
      cancelado = true
    }
  }, [selectedDate, profesionalId, reloadKey])

  const proximoTurno = turnos.length > 0
    ? [...turnos].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())[0]
    : null

  const proximoTurnoHora = proximoTurno
    ? new Date(proximoTurno.fecha).toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : null

  const handleTurnoCreado = () => {
    setReloadKey((prev) => prev + 1)
    setShowNuevoTurno(false)
  }

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

  if (!hasPermission(user.role, "canViewOwnTurnos")) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-32 space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground text-center">{getAccessDeniedMessage(user.role, "default")}</p>
              <p className="text-sm text-muted-foreground">Esta página es exclusiva para profesionales médicos.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  const especialidadNombre = user.especialidad?.trim() || "General"

  const especialidades = [
    {
      id: especialidadNombre,
      nombre: especialidadNombre,
    },
  ]

  const profesionales = [
    {
      id: user.id,
      nombre: user.name,
      especialidad: especialidadNombre,
    },
  ]

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mi Agenda</h1>
            <p className="text-muted-foreground">Gestiona tus citas médicas - {user.especialidad || "Profesional"}</p>
          </div>
          {hasPermission(user.role, "canCreateTurnos") && (
            <Button onClick={() => setShowNuevoTurno(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Turno
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hoy</p>
                <p className="text-2xl font-bold text-foreground">
                  {new Date().toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Próximo Turno</p>
                <p className="text-lg font-bold text-foreground">
                  {proximoTurnoHora ?? "Sin turnos"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Especialidad</p>
                <p className="text-lg font-bold text-foreground">{user.especialidad || "N/A"}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Turnos Hoy</p>
                <p className="text-2xl font-bold text-foreground">{turnos.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Date Filter - Solo fecha, sin filtros de profesional */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Fecha:</span>
            </div>
            <input
              type="date"
              value={selectedDate.toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-3 py-2 border border-border rounded-md text-sm"
            />
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">
                Mostrando turnos de: <strong>{user.name}</strong>
              </span>
            </div>
          </div>
        </Card>

        {/* Calendar - Filtrado automáticamente para el profesional actual */}
        <TurnosCalendar
          selectedDate={selectedDate}
          turnos={turnos}
          loading={turnosLoading}
          error={turnosError}
        />

        {/* Nuevo Turno Dialog - Solo si tiene permisos */}
        {hasPermission(user.role, "canCreateTurnos") && (
          <NuevoTurnoDialog
            open={showNuevoTurno}
            onOpenChange={setShowNuevoTurno}
            defaultDate={selectedDate}
            especialidades={especialidades}
            profesionales={profesionales}
            onTurnoCreado={handleTurnoCreado}
          />
        )}
      </div>
    </MainLayout>
  )
}
