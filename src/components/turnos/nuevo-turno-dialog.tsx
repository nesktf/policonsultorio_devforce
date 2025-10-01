"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Clock, User, Stethoscope, AlertCircle, CheckCircle, Search } from "lucide-react"

interface NuevoTurnoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate?: Date
  defaultProfesional?: string // Agregando prop para pre-seleccionar profesional
}

// Mock data - Actualizando nombres para coincidir con el contexto de auth
const especialidades = [
  { id: "cardiologia", nombre: "Cardiología" },
  { id: "dermatologia", nombre: "Dermatología" },
  { id: "traumatologia", nombre: "Traumatología" },
  { id: "pediatria", nombre: "Pediatría" },
  { id: "ginecologia", nombre: "Ginecología" },
]

const profesionales = [
  {
    id: "1",
    nombre: "Dr. Carlos Mendez",
    especialidad: "cardiologia",
    horarios: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  },
  {
    id: "2",
    nombre: "Dra. María López",
    especialidad: "pediatria",
    horarios: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30"],
  },
  {
    id: "3",
    nombre: "Dr. Martínez",
    especialidad: "traumatologia",
    horarios: ["10:00", "10:30", "11:00", "11:30", "15:00", "15:30", "16:00", "16:30"],
  },
  {
    id: "4",
    nombre: "Dra. Rodríguez",
    especialidad: "dermatologia",
    horarios: ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30"],
  },
]

const pacientesMock = [
  { id: "1", nombre: "María González", dni: "12345678", telefono: "11-1234-5678", email: "maria@email.com" },
  { id: "2", nombre: "Juan Pérez", dni: "87654321", telefono: "11-8765-4321", email: "juan@email.com" },
  { id: "3", nombre: "Ana Martín", dni: "11223344", telefono: "11-1122-3344", email: "ana@email.com" },
  { id: "4", nombre: "Pedro Sánchez", dni: "55667788", telefono: "11-5566-7788", email: "pedro@email.com" },
  { id: "5", nombre: "Laura Fernández", dni: "99887766", telefono: "11-9988-7766", email: "laura@email.com" },
  { id: "6", nombre: "Carlos Ruiz", dni: "44332211", telefono: "11-4433-2211", email: "carlos@email.com" },
  { id: "7", nombre: "Sofia Morales", dni: "33445566", telefono: "11-3344-5566", email: "sofia@email.com" },
  { id: "8", nombre: "Roberto Díaz", dni: "77889900", telefono: "11-7788-9900", email: "roberto@email.com" },
]

export function NuevoTurnoDialog({ open, onOpenChange, defaultDate, defaultProfesional }: NuevoTurnoDialogProps) {
  const [fecha, setFecha] = useState<Date>(defaultDate || new Date())
  const [especialidad, setEspecialidad] = useState<string>("")
  const [profesional, setProfesional] = useState<string>("")
  const [hora, setHora] = useState<string>("")
  const [paciente, setPaciente] = useState<string>("")
  const [motivo, setMotivo] = useState<string>("")
  const [notas, setNotas] = useState<string>("")
  const [duracion, setDuracion] = useState<string>("30")
  const [busquedaPaciente, setBusquedaPaciente] = useState<string>("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (defaultProfesional && open) {
      const prof = profesionales.find((p) => p.nombre === defaultProfesional)
      if (prof) {
        setProfesional(prof.id)
        setEspecialidad(prof.especialidad)
      }
    }
  }, [defaultProfesional, open])

  useEffect(() => {
    if (defaultDate) {
      setFecha(defaultDate)
    }
  }, [defaultDate])

  // Filtrar profesionales por especialidad
  const profesionalesFiltrados = profesionales.filter((prof) => !especialidad || prof.especialidad === especialidad)

  // Filtrar pacientes por búsqueda
  const pacientesFiltrados = pacientesMock.filter(
    (pac) => pac.nombre.toLowerCase().includes(busquedaPaciente.toLowerCase()) || pac.dni.includes(busquedaPaciente),
  )

  // Obtener horarios disponibles del profesional seleccionado
  const horariosDisponibles = profesionales.find((prof) => prof.id === profesional)?.horarios || []

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!fecha) newErrors.fecha = "La fecha es obligatoria"
    if (!especialidad) newErrors.especialidad = "La especialidad es obligatoria"
    if (!profesional) newErrors.profesional = "El profesional es obligatorio"
    if (!hora) newErrors.hora = "La hora es obligatoria"
    if (!paciente) newErrors.paciente = "El paciente es obligatorio"
    if (!motivo.trim()) newErrors.motivo = "El motivo de consulta es obligatorio"
    if (!duracion) newErrors.duracion = "La duración es obligatoria"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Aquí iría la lógica para crear el turno
      console.log("Nuevo turno:", {
        fecha,
        especialidad,
        profesional,
        hora,
        paciente,
        motivo,
        notas,
        duracion,
      })

      // Resetear formulario
      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error("Error al crear turno:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFecha(defaultDate || new Date())
    if (!defaultProfesional) {
      setEspecialidad("")
      setProfesional("")
    }
    setHora("")
    setPaciente("")
    setMotivo("")
    setNotas("")
    setDuracion("30")
    setBusquedaPaciente("")
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Agendar Nuevo Turno
            {defaultProfesional && (
              <span className="text-sm font-normal text-muted-foreground">- {defaultProfesional}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fecha */}
          <div className="space-y-2">
            <Label htmlFor="fecha" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Fecha *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fecha && "text-muted-foreground",
                    errors.fecha && "border-destructive",
                  )}
                >
                  {fecha ? format(fecha, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fecha}
                  onSelect={(date) => date && setFecha(date)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.fecha && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.fecha}
              </p>
            )}
          </div>

          {/* Especialidad y Profesional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="especialidad" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Especialidad *
              </Label>
              <Select value={especialidad} onValueChange={setEspecialidad} disabled={!!defaultProfesional}>
                <SelectTrigger className={errors.especialidad ? "border-destructive" : ""}>
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
              {errors.especialidad && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.especialidad}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profesional" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profesional *
              </Label>
              <Select
                value={profesional}
                onValueChange={setProfesional}
                disabled={!especialidad || !!defaultProfesional}
              >
                <SelectTrigger className={errors.profesional ? "border-destructive" : ""}>
                  <SelectValue placeholder="Seleccionar profesional" />
                </SelectTrigger>
                <SelectContent>
                  {profesionalesFiltrados.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.profesional && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.profesional}
                </p>
              )}
              {defaultProfesional && (
                <p className="text-xs text-muted-foreground">Profesional pre-seleccionado desde Mi Agenda</p>
              )}
            </div>
          </div>

          {/* Hora y Duración */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hora" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hora *
              </Label>
              <Select value={hora} onValueChange={setHora} disabled={!profesional}>
                <SelectTrigger className={errors.hora ? "border-destructive" : ""}>
                  <SelectValue placeholder="Seleccionar hora" />
                </SelectTrigger>
                <SelectContent>
                  {horariosDisponibles.map((horario) => (
                    <SelectItem key={horario} value={horario}>
                      {horario}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.hora && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.hora}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracion">Duración (minutos) *</Label>
              <Select value={duracion} onValueChange={setDuracion}>
                <SelectTrigger className={errors.duracion ? "border-destructive" : ""}>
                  <SelectValue placeholder="Duración" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                </SelectContent>
              </Select>
              {errors.duracion && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.duracion}
                </p>
              )}
            </div>
          </div>

          {/* Búsqueda de Paciente */}
          <div className="space-y-2">
            <Label htmlFor="paciente" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Paciente *
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o DNI..."
                value={busquedaPaciente}
                onChange={(e) => setBusquedaPaciente(e.target.value)}
                className="pl-10"
              />
            </div>
            {busquedaPaciente && (
              <div className="border rounded-md max-h-32 overflow-y-auto">
                {pacientesFiltrados.length > 0 ? (
                  pacientesFiltrados.map((pac) => (
                    <button
                      key={pac.id}
                      type="button"
                      onClick={() => {
                        setPaciente(pac.id)
                        setBusquedaPaciente(pac.nombre)
                      }}
                      className="w-full text-left p-3 hover:bg-muted border-b last:border-b-0 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{pac.nombre}</p>
                        <p className="text-sm text-muted-foreground">DNI: {pac.dni}</p>
                      </div>
                      {paciente === pac.id && <CheckCircle className="h-4 w-4 text-green-600" />}
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-muted-foreground">No se encontraron pacientes</div>
                )}
              </div>
            )}
            {errors.paciente && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.paciente}
              </p>
            )}
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo de consulta *</Label>
            <Input
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Control rutinario, dolor de cabeza..."
              className={errors.motivo ? "border-destructive" : ""}
            />
            {errors.motivo && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.motivo}
              </p>
            )}
          </div>

          {/* Notas adicionales */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas adicionales</Label>
            <Textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Información adicional sobre el turno..."
              rows={3}
            />
          </div>

          {/* Resumen del turno */}
          {fecha && especialidad && profesional && hora && paciente && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Resumen del turno:</strong>
                <br />
                {format(fecha, "PPP", { locale: es })} a las {hora} - {duracion} min
                <br />
                {profesionalesFiltrados.find((p) => p.id === profesional)?.nombre} (
                {especialidades.find((e) => e.id === especialidad)?.nombre})<br />
                Paciente: {pacientesFiltrados.find((p) => p.id === paciente)?.nombre || busquedaPaciente}
              </AlertDescription>
            </Alert>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Agendando..." : "Agendar Turno"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
