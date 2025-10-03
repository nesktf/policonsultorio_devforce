"use client"

import { useEffect, useMemo } from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { Calendar, ChevronLeft, ChevronRight, Filter } from "lucide-react"

interface TurnosFiltersProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  selectedProfesional: string
  onProfesionalChange: (profesional: string) => void
  selectedEspecialidad: string
  onEspecialidadChange: (especialidad: string) => void
  profesionales: Array<{ id: string; nombre: string; especialidad?: string }>
  especialidades: Array<{ id: string; nombre: string }>
  loading?: boolean
}

export function TurnosFilters({
  selectedDate,
  onDateChange,
  selectedProfesional,
  onProfesionalChange,
  selectedEspecialidad,
  onEspecialidadChange,
  profesionales,
  especialidades,
  loading = false,
}: TurnosFiltersProps) {
  const { user } = useAuth()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    onDateChange(newDate)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  const profesionalesDisponibles = useMemo(() => {
    if (user?.role === "profesional") {
      return profesionales.filter((p) => p.id === user.id)
    }
    return profesionales
  }, [profesionales, user])

  useEffect(() => {
    if (loading) return

    if (
      profesionalesDisponibles.length > 0 &&
      !profesionalesDisponibles.some((prof) => prof.id === selectedProfesional)
    ) {
      onProfesionalChange(profesionalesDisponibles[0].id)
    }

    if (
      especialidades.length > 0 &&
      !especialidades.some((esp) => esp.id === selectedEspecialidad)
    ) {
      onEspecialidadChange(especialidades[0].id)
    }
  }, [
    loading,
    profesionalesDisponibles,
    especialidades,
    selectedProfesional,
    selectedEspecialidad,
    onProfesionalChange,
    onEspecialidadChange,
  ])

  return (
    <Card className="p-4">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => changeDate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground capitalize">{formatDate(selectedDate)}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => changeDate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Hoy
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-1">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedProfesional} onValueChange={onProfesionalChange} disabled={loading}>
            <SelectTrigger
              className="w-[250px]"
              disabled={loading || profesionalesDisponibles.length === 0}
            >
              <SelectValue
                placeholder={loading ? "Cargando..." : "Seleccionar profesional"}
              />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>
                  Cargando profesionales...
                </SelectItem>
              ) : profesionalesDisponibles.length === 0 ? (
                <SelectItem value="none" disabled>
                  No hay profesionales disponibles
                </SelectItem>
              ) : (
                profesionalesDisponibles.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id}>
                    {prof.nombre}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Select value={selectedEspecialidad} onValueChange={onEspecialidadChange} disabled={loading}>
            <SelectTrigger
              className="w-[200px]"
              disabled={loading || especialidades.length === 0}
            >
              <SelectValue
                placeholder={loading ? "Cargando..." : "Seleccionar especialidad"}
              />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>
                  Cargando especialidades...
                </SelectItem>
              ) : especialidades.length === 0 ? (
                <SelectItem value="none" disabled>
                  No hay especialidades disponibles
                </SelectItem>
              ) : (
                especialidades.map((esp) => (
                  <SelectItem key={esp.id} value={esp.id}>
                    {esp.nombre}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  )
}
