"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { TurnosCalendar } from "@/components/turnos/turnos-calendar"
import { NuevoTurnoDialog } from "@/components/turnos/nuevo-turno-dialog"
import { TurnosFilters } from "@/components/turnos/turnos-filters"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { hasPermission, getAccessDeniedMessage } from "@/lib/permissions"
import { AlertCircle, Plus } from "lucide-react"

type TurnoApi = {
  id: number
  fecha: string
  duracion: number
  estado: string
  paciente: { id: number; nombre: string; apellido: string; dni: string; telefono: string }
  profesional: { id: number; nombre: string; apellido: string; especialidad: string }
}

export default function TurnosPage() {
  const { user } = useAuth()
  const [showNuevoTurno, setShowNuevoTurno] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedProfesional, setSelectedProfesional] = useState<string>("todos")
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string>("todas")
  const [especialidades, setEspecialidades] = useState<Array<{ id: string; nombre: string }>>([
    { id: "todas", nombre: "Todas las especialidades" },
  ])
  const [profesionales, setProfesionales] = useState<Array<{ id: string; nombre: string; especialidad: string }>>([
    { id: "todos", nombre: "Todos los profesionales", especialidad: "" },
  ])
  const [filtersLoading, setFiltersLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const [turnos, setTurnos] = useState<TurnoApi[]>([])
  const [turnosLoading, setTurnosLoading] = useState(false)
  const [turnosError, setTurnosError] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    async function cargarFiltros() {
      setFiltersLoading(true)
      try {
        const [especialidadesRes, profesionalesRes] = await Promise.all([
          fetch("/api/v1/profesionales/especialidades", { cache: "no-store" }),
          fetch("/api/v1/profesionales", { cache: "no-store" }),
        ])

        if (!especialidadesRes.ok) {
          throw new Error("No se pudieron obtener las especialidades")
        }
        if (!profesionalesRes.ok) {
          throw new Error("No se pudieron obtener los profesionales")
        }

        const especialidadesData = await especialidadesRes.json()
        const profesionalesData = await profesionalesRes.json()

        if (cancelado) return

        // Verificar que especialidadesData sea un array
        const especialidadesArray = Array.isArray(especialidadesData) 
          ? especialidadesData 
          : []

        // Verificar que profesionalesData sea un array
        const profesionalesArray = Array.isArray(profesionalesData) 
          ? profesionalesData 
          : []

        setEspecialidades([
          { id: "todas", nombre: "Todas las especialidades" },
          ...especialidadesArray.map((esp: any) => ({
            id: esp.especialidad || esp.id || esp.nombre,
            nombre: esp.nombre || esp.especialidad || "Sin nombre"
          })),
        ])

        setProfesionales([
          { id: "todos", nombre: "Todos los profesionales", especialidad: "" },
          ...profesionalesArray.map((prof: any) => ({
            id: String(prof.id),
            nombre: `${prof.apellido}, ${prof.nombre}`,
            especialidad: prof.especialidad,
          })),
        ])
      } catch (error) {
        console.error("Error al cargar filtros de turnos:", error)
        if (!cancelado) {
          // Establecer valores por defecto en caso de error
          setEspecialidades([{ id: "todas", nombre: "Todas las especialidades" }])
          setProfesionales([{ id: "todos", nombre: "Todos los profesionales", especialidad: "" }])
        }
      } finally {
        if (!cancelado) {
          setFiltersLoading(false)
        }
      }
    }

    cargarFiltros()

    return () => {
      cancelado = true
    }
  }, [])

  async function cargarTurnos() {
    let cancelado = false
    setTurnosLoading(true)
    setTurnosError(null)

    const params = new URLSearchParams()
    const fechaIso = selectedDate.toISOString().slice(0, 10)
    params.set("from", fechaIso)
    params.set("to", fechaIso)

    if (selectedProfesional !== "todos") {
      params.set("profesionalId", selectedProfesional)
    }

    if (selectedEspecialidad !== "todas") {
      params.set("especialidad", selectedEspecialidad)
    }

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

      const data = await response.json()
      
      if (!cancelado) {
        // Verificar que data.turnos sea un array
        setTurnos(Array.isArray(data.turnos) ? data.turnos : [])
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
    return cancelado
  }

  useEffect(() => {
    cargarTurnos()
  }, [selectedDate, selectedProfesional, selectedEspecialidad, reloadKey])

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

  if (user.rol === "PROFESIONAL") {
    return (
      <MainLayout>
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-32 space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground text-center">{getAccessDeniedMessage(user.rol, "turnos-todos")}</p>
              <p className="text-sm text-muted-foreground">
                Puedes acceder a tu agenda personal desde el menú &quot;Mi Agenda&quot;.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  const handleTurnoCreado = () => {
    setReloadKey((prev) => prev + 1)
    setShowNuevoTurno(false)
  }

  const canCreateTurnos = hasPermission(user.rol, "canCreateTurnos")

  const resumenCounts = turnos.reduce(
    (acc, turno) => {
      if (turno.estado in acc) {
        acc[turno.estado as keyof typeof acc] += 1
      }
      return acc
    },
    {
      PROGRAMADO: 0,
      EN_SALA_ESPERA: 0,
      ASISTIO: 0,
      NO_ASISTIO: 0,
      CANCELADO: 0,
    },
  )

  const resumenCards = [
    {
      key: 'PROGRAMADO',
      label: 'Programados',
      color: 'bg-blue-50 text-blue-700',
      count: resumenCounts.PROGRAMADO,
    },
    {
      key: 'EN_SALA_ESPERA',
      label: 'En sala de espera',
      color: 'bg-cyan-50 text-cyan-700',
      count: resumenCounts.EN_SALA_ESPERA,
    },
    {
      key: 'ASISTIO',
      label: 'Asistieron',
      color: 'bg-green-50 text-green-700',
      count: resumenCounts.ASISTIO,
    },
    {
      key: 'NO_ASISTIO',
      label: 'No asistieron',
      color: 'bg-orange-50 text-orange-700',
      count: resumenCounts.NO_ASISTIO,
    },
    {
      key: 'CANCELADO',
      label: 'Cancelados',
      color: 'bg-red-50 text-red-700',
      count: resumenCounts.CANCELADO,
    },
  ]

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {user.rol === "GERENTE" ? "Gestión de Turnos" : "Turnos del Policonsultorio"}
            </h1>
            <p className="text-muted-foreground">
              {user.rol === "GERENTE"
                ? "Administra y programa citas médicas de manera eficiente"
                : "Visualiza y gestiona los turnos de todos los profesionales"}
            </p>
          </div>
          {canCreateTurnos && (
            <Button onClick={() => setShowNuevoTurno(true)} className="gap-2 self-start lg:self-auto">
              <Plus className="h-4 w-4" />
              Agendar turno
            </Button>
          )}
        </div>

        {/* Filters */}
        <TurnosFilters
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedProfesional={selectedProfesional}
          onProfesionalChange={setSelectedProfesional}
          selectedEspecialidad={selectedEspecialidad}
          onEspecialidadChange={setSelectedEspecialidad}
          profesionales={profesionales}
          especialidades={especialidades}
          loading={filtersLoading}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {resumenCards.map((card) => (
            <Card key={card.key}>
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className={`text-2xl font-semibold ${card.color}`}>{card.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Calendar */}
        <TurnosCalendar
          selectedDate={selectedDate}
          turnos={turnos}
          loading={turnosLoading}
          error={turnosError}
          rol={user.rol}
          onTurnoUpdate={cargarTurnos}
        />

        {/* Nuevo Turno Dialog */}
        {canCreateTurnos && (
          <NuevoTurnoDialog
            open={showNuevoTurno}
            onOpenChange={setShowNuevoTurno}
            defaultDate={selectedDate}
            especialidades={especialidades.filter((esp) => esp.id !== "todas")}
            profesionales={profesionales.filter((prof) => prof.id !== "todos")}
            onTurnoCreado={handleTurnoCreado}
          />
        )}
      </div>
    </MainLayout>
  )
}