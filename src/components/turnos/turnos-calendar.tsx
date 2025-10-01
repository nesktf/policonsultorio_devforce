"use client"

import { useEffect, useMemo, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TurnosCalendarProps {
  selectedDate: Date
  selectedProfesional: string
  selectedEspecialidad: string
  reloadKey: number
}

interface ApiTurno {
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

const estadoConfig: Record<string, { label: string; color: string }> = {
  PROGRAMADO: { label: "Programado", color: "bg-blue-100 text-blue-800" },
  ASISTIO: { label: "Asistió", color: "bg-green-100 text-green-800" },
  NO_ASISTIO: { label: "No asistió", color: "bg-orange-100 text-orange-800" },
  CANCELADO: { label: "Cancelado", color: "bg-red-100 text-red-800" },
}

const fallbackEstado = { label: "Programado", color: "bg-blue-100 text-blue-800" }

function formatHour(dateIso: string) {
  const date = new Date(dateIso)
  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export function TurnosCalendar({
  selectedDate,
  selectedProfesional,
  selectedEspecialidad,
  reloadKey,
}: TurnosCalendarProps) {
  const [turnos, setTurnos] = useState<ApiTurno[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formattedDate = useMemo(() => {
    return selectedDate.toISOString().slice(0, 10)
  }, [selectedDate])

  useEffect(() => {
    let cancelado = false

    async function cargarTurnos() {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.set("from", formattedDate)
      params.set("to", formattedDate)

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
          const { error: message } = await response
            .json()
            .catch(() => ({ error: "No se pudieron obtener los turnos" }))
          throw new Error(message)
        }

        const data: { turnos: ApiTurno[] } = await response.json()
        if (!cancelado) {
          setTurnos(data.turnos)
        }
      } catch (error) {
        console.error("Error al cargar turnos:", error)
        if (!cancelado) {
          setError(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los turnos. Intenta nuevamente.",
          )
          setTurnos([])
        }
      } finally {
        if (!cancelado) {
          setLoading(false)
        }
      }
    }

    cargarTurnos()

    return () => {
      cancelado = true
    }
  }, [formattedDate, selectedProfesional, selectedEspecialidad, reloadKey])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          Turnos del {selectedDate.toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando turnos...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : turnos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay turnos asignados para esta fecha.</p>
        ) : (
          <div className="space-y-3">
            {turnos.map((turno) => {
              const estado = estadoConfig[turno.estado] ?? fallbackEstado
              const profesionalNombre = `${turno.profesional.apellido}, ${turno.profesional.nombre}`
              const pacienteNombre = `${turno.paciente.apellido}, ${turno.paciente.nombre}`

              return (
                <div
                  key={turno.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold text-primary">
                      {formatHour(turno.fecha)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{pacienteNombre}</p>
                      <p className="text-xs text-muted-foreground">DNI {turno.paciente.dni}</p>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center gap-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{profesionalNombre}</p>
                      <p className="text-muted-foreground text-xs">
                        {turno.profesional.especialidad}
                      </p>
                    </div>
                    <Badge className={cn("w-fit", estado.color)}>{estado.label}</Badge>
                    <span className="text-muted-foreground text-xs">
                      Duración: {turno.duracion} minutos
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
