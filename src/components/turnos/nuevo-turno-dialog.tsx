"use client"

import { useEffect, useMemo, useState } from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

interface EspecialidadOption {
  id: string
  nombre: string
}

interface ProfesionalOption {
  id: string
  nombre: string
  especialidad: string
}

interface PacienteOption {
  id: number
  nombre: string
  apellido: string
  dni: string
  telefono: string
}

interface NuevoTurnoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate?: Date
  especialidades: EspecialidadOption[]
  profesionales: ProfesionalOption[]
  onTurnoCreado?: () => void
}

const DURACIONES_MINUTOS = [15, 30, 45, 60]

export function NuevoTurnoDialog({
  open,
  onOpenChange,
  defaultDate,
  especialidades,
  profesionales,
  onTurnoCreado,
}: NuevoTurnoDialogProps) {
  const [fecha, setFecha] = useState<Date>(defaultDate || new Date())
  const [especialidad, setEspecialidad] = useState<string>('none')
  const [profesionalId, setProfesionalId] = useState<string>('none')
  const [duracion, setDuracion] = useState<string>("30")
  const [hora, setHora] = useState<string>('none')
  const [motivo, setMotivo] = useState<string>("")
  const [notas, setNotas] = useState<string>("")
  const [busquedaPaciente, setBusquedaPaciente] = useState<string>("")
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteOption | null>(null)
  const [pacientesResultados, setPacientesResultados] = useState<PacienteOption[]>([])

  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([])
  const [cargandoHorarios, setCargandoHorarios] = useState(false)
  const [cargandoPacientes, setCargandoPacientes] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fechaIso = useMemo(() => format(fecha, "yyyy-MM-dd"), [fecha])

  useEffect(() => {
    setFecha(defaultDate || new Date())
  }, [defaultDate])

  useEffect(() => {
    // Reset selection when dialog reabre
    if (!open) {
      setEspecialidad('none')
      setProfesionalId('none')
      setDuracion("30")
      setHora('none')
      setMotivo('')
      setNotas('')
      setBusquedaPaciente("")
      setPacienteSeleccionado(null)
      setPacientesResultados([])
      setHorariosDisponibles([])
      setSubmitError(null)
      setSubmitSuccess(null)
    }
  }, [open])

  useEffect(() => {
    if (especialidad) {
      const profesionalesEspecialidad = profesionales.filter(
        (prof) => prof.especialidad === especialidad,
      )
      if (profesionalesEspecialidad.length > 0) {
        if (!profesionalesEspecialidad.some((prof) => prof.id === profesionalId)) {
          setProfesionalId(profesionalesEspecialidad[0].id)
        }
      } else {
        setProfesionalId('none')
      }
    }
  }, [especialidad, profesionales, profesionalId])

  useEffect(() => {
    if (!profesionalId || profesionalId === 'none') return
    const prof = profesionales.find((p) => p.id === profesionalId)
    if (prof && prof.especialidad && prof.especialidad !== especialidad) {
      setEspecialidad(prof.especialidad)
    }
  }, [profesionales, profesionalId, especialidad])

  useEffect(() => {
    if (profesionalId === 'none' || !fechaIso || !duracion) {
      setHorariosDisponibles([])
      setHora('none')
      return
    }

    let cancelado = false

    async function cargarHorarios() {
      setCargandoHorarios(true)
      try {
        const params = new URLSearchParams({
          profesionalId,
          fecha: fechaIso,
          timezoneOffset: String(new Date().getTimezoneOffset()),
          durationMinutes: duracion,
        })
        const response = await fetch(`/api/v1/turnos/disponibles?${params.toString()}`, {
          cache: "no-store",
        })
        if (!response.ok) {
          const { error } = await response.json().catch(() => ({ error: "No se pudieron obtener los horarios" }))
          throw new Error(error)
        }
        const data: { slots: string[] } = await response.json()
        if (!cancelado) {
          setHorariosDisponibles(data.slots)
          setHora('none')
        }
      } catch (error) {
        console.error("Error al obtener horarios disponibles:", error)
        if (!cancelado) {
          setHorariosDisponibles([])
          setHora('none')
        }
      } finally {
        if (!cancelado) {
          setCargandoHorarios(false)
        }
      }
    }

    cargarHorarios()

    return () => {
      cancelado = true
    }
  }, [profesionalId, fechaIso, duracion])

  useEffect(() => {
    if (busquedaPaciente.trim().length < 3) {
      setPacientesResultados([])
      return
    }

    const controller = new AbortController()

    async function buscar() {
      setCargandoPacientes(true)
      try {
        const params = new URLSearchParams({ search: busquedaPaciente.trim() })
        const response = await fetch(`/api/v1/pacientes?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        })
        if (!response.ok) {
          throw new Error("No se pudieron buscar pacientes")
        }
        const data: { pacientes: PacienteOption[] } = await response.json()
        setPacientesResultados(data.pacientes)
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Error al buscar pacientes:", error)
        }
      } finally {
        setCargandoPacientes(false)
      }
    }

    buscar()

    return () => controller.abort()
  }, [busquedaPaciente])

  const profesionalesFiltrados = useMemo(() => {
    if (!especialidad || especialidad === 'none') {
      return profesionales
    }
    return profesionales.filter((prof) => prof.especialidad === especialidad)
  }, [especialidad, profesionales])

  const pacienteLabel = pacienteSeleccionado
    ? `${pacienteSeleccionado.apellido}, ${pacienteSeleccionado.nombre} (DNI ${pacienteSeleccionado.dni})`
    : ""

  const handleRegistrar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(null)

    if (profesionalId === 'none' || hora === 'none' || !pacienteSeleccionado) {
      setSubmitError("Completa todos los campos obligatorios")
      return
    }

    setIsSubmitting(true)
    try {
      const fechaCompleta = new Date(`${fechaIso}T${hora}:00`).toISOString()

      const response = await fetch("/api/v1/turnos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pacienteId: pacienteSeleccionado.id,
          profesionalId: Number(profesionalId),
          fecha: fechaCompleta,
          durationMinutes: Number(duracion),
          motivo: motivo.trim(),
          detalle: notas.trim() || motivo.trim(),
        }),
      })

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: "No se pudo registrar el turno" }))
        throw new Error(error)
      }

      setSubmitSuccess("Turno registrado con éxito")
      onTurnoCreado?.()
    } catch (error) {
      console.error("Error al registrar turno:", error)
      setSubmitError(
        error instanceof Error ? error.message : "Error al registrar el turno. Intenta nuevamente.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCerrar = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleCerrar}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Agendar Nuevo Turno
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleRegistrar} className="space-y-6">
          {submitError ? (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}
          {submitSuccess ? (
            <Alert>
              <AlertDescription>{submitSuccess}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !fecha && "text-muted-foreground")}
                  >
                    {fecha ? format(fecha, "PPP", { locale: es }) : "Seleccionar fecha"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fecha}
                    onSelect={(date) => date && setFecha(date)}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Especialidad *</Label>
              <Select value={especialidad} onValueChange={setEspecialidad}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar especialidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>
                    Seleccionar especialidad
                  </SelectItem>
                  {especialidades.map((esp) => (
                    <SelectItem key={esp.id} value={esp.id}>
                      {esp.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Profesional *</Label>
              <Select
                value={profesionalId}
                onValueChange={setProfesionalId}
                disabled={profesionalesFiltrados.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar profesional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>
                    Seleccionar profesional
                  </SelectItem>
                  {profesionalesFiltrados.length === 0 ? (
                    <SelectItem value="sin-profesionales" disabled>
                      No hay profesionales para la especialidad
                    </SelectItem>
                  ) : (
                    profesionalesFiltrados.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duración *</Label>
              <Select value={duracion} onValueChange={setDuracion}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar duración" />
                </SelectTrigger>
                <SelectContent>
                  {DURACIONES_MINUTOS.map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                      {value} minutos
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Hora *</Label>
              <Select
                value={hora}
                onValueChange={setHora}
                disabled={cargandoHorarios || horariosDisponibles.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={cargandoHorarios ? "Buscando horarios..." : "Seleccionar hora"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>
                    Seleccionar hora
                  </SelectItem>
                  {cargandoHorarios ? (
                    <SelectItem value="loading" disabled>
                      Buscando horarios...
                    </SelectItem>
                  ) : horariosDisponibles.length === 0 ? (
                    <SelectItem value="sin-horarios" disabled>
                      No hay horarios disponibles
                    </SelectItem>
                  ) : (
                    horariosDisponibles.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Paciente *</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por nombre o DNI"
                value={busquedaPaciente}
                onChange={(event) => setBusquedaPaciente(event.target.value)}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => setBusquedaPaciente("")}
                disabled={busquedaPaciente.length === 0}
              >
                Limpiar
              </Button>
            </div>
            <div className="space-y-1">
              {cargandoPacientes ? (
                <p className="text-sm text-muted-foreground">Buscando pacientes...</p>
              ) : null}
              {pacienteSeleccionado ? (
                <p className="text-sm text-muted-foreground">Seleccionado: {pacienteLabel}</p>
              ) : null}
              {pacientesResultados.length > 0 ? (
                <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                  {pacientesResultados.map((pac) => (
                    <button
                      key={pac.id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                      onClick={() => {
                        setPacienteSeleccionado(pac)
                        setBusquedaPaciente(`${pac.apellido}, ${pac.nombre}`)
                      }}
                    >
                      {pac.apellido}, {pac.nombre} (DNI {pac.dni})
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Motivo de consulta *</Label>
            <Input value={motivo} onChange={(event) => setMotivo(event.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Notas adicionales</Label>
            <Textarea
              value={notas}
              onChange={(event) => setNotas(event.target.value)}
              placeholder="Información adicional para el profesional"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleCerrar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Agendar turno"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
