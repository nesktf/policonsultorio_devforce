"use client"

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
}

// Mock data - en producción vendría de la API
const profesionales = [
  { id: "todos", nombre: "Todos los profesionales" },
  { id: "2", nombre: "Dr. Carlos Mendez - Cardiología" },
  { id: "3", nombre: "Dra. María López - Pediatría" },
  { id: "4", nombre: "Dr. Martínez - Traumatología" },
  { id: "5", nombre: "Dra. Rodríguez - Dermatología" },
]

const especialidades = [
  { id: "todas", nombre: "Todas las especialidades" },
  { id: "cardiologia", nombre: "Cardiología" },
  { id: "pediatria", nombre: "Pediatría" },
  { id: "traumatologia", nombre: "Traumatología" },
  { id: "dermatologia", nombre: "Dermatología" },
  { id: "ginecologia", nombre: "Ginecología" },
]

export function TurnosFilters({
  selectedDate,
  onDateChange,
  selectedProfesional,
  onProfesionalChange,
  selectedEspecialidad,
  onEspecialidadChange,
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

  const getProfesionalesDisponibles = () => {
    if (user?.role === "profesional") {
      // Los profesionales solo ven su propia opción (esto no debería ejecutarse en /turnos)
      return profesionales.filter((p) => p.id === user.id)
    }

    if (user?.role === "mesa-entrada") {
      // Mesa de entrada ve todos los profesionales
      return profesionales
    }

    if (user?.role === "gerente") {
      // Gerente ve todos los profesionales
      return profesionales
    }

    return profesionales
  }

  const profesionalesDisponibles = getProfesionalesDisponibles()

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
          <Select value={selectedProfesional} onValueChange={onProfesionalChange}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Seleccionar profesional" />
            </SelectTrigger>
            <SelectContent>
              {profesionalesDisponibles.map((prof) => (
                <SelectItem key={prof.id} value={prof.id}>
                  {prof.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedEspecialidad} onValueChange={onEspecialidadChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar especialidad" />
            </SelectTrigger>
            <SelectContent>
              {especialidades.map((esp) => (
                <SelectItem key={esp.id} value={esp.id}>
                  {esp.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  )
}
