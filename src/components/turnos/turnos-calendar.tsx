"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { useNotifications } from "@/context/notifications-context" // Agregando hook de notificaciones
import { HistoriaClinicaDialog } from "@/components/pacientes/historia-clinica-dialog"
import {
  Clock,
  User,
  Stethoscope,
  Plus,
  CheckCircle,
  XCircle,
  FileText,
  UserX,
  Users,
  Activity,
  Calendar,
  History,
  Check,
} from "lucide-react"

interface HistorialEstado {
  estado: Turno["estado"]
  timestamp: string
  usuario: string
  rol: string
}

interface Turno {
  id: string
  hora: string
  paciente: {
    nombre: string
    dni: string
    telefono: string
  }
  profesional: {
    nombre: string
    especialidad: string
  }
  estado:
    | "programado"
    | "confirmado"
    | "en-sala-espera"
    | "en-consulta"
    | "completado"
    | "no-asistio"
    | "cancelado"
    | "reprogramado"
  motivo: string
  duracion: number
  notas?: string
  historial: HistorialEstado[]
}

interface TurnosCalendarProps {
  selectedDate: Date
  selectedProfesional: string
  selectedEspecialidad: string
  onNuevoTurno: () => void
}

const mockTurnos: Turno[] = [
  {
    id: "1",
    hora: "08:00",
    paciente: { nombre: "María González", dni: "12345678", telefono: "11-1234-5678" },
    profesional: { nombre: "Dr. Carlos Mendez", especialidad: "Cardiología" },
    estado: "programado",
    motivo: "Control rutinario",
    duracion: 30,
    historial: [
      {
        estado: "programado",
        timestamp: "2024-01-15T07:30:00Z",
        usuario: "Ana García",
        rol: "mesa-entrada",
      },
    ],
  },
  {
    id: "2",
    hora: "08:30",
    paciente: { nombre: "Juan Pérez", dni: "87654321", telefono: "11-8765-4321" },
    profesional: { nombre: "Dr. Carlos Mendez", especialidad: "Cardiología" },
    estado: "confirmado",
    motivo: "Consulta por dolor en el pecho",
    duracion: 30,
    historial: [
      {
        estado: "programado",
        timestamp: "2024-01-15T07:00:00Z",
        usuario: "Ana García",
        rol: "mesa-entrada",
      },
      {
        estado: "confirmado",
        timestamp: "2024-01-15T07:45:00Z",
        usuario: "Ana García",
        rol: "mesa-entrada",
      },
    ],
  },
  {
    id: "3",
    hora: "09:00",
    paciente: { nombre: "Ana Martín", dni: "11223344", telefono: "11-1122-3344" },
    profesional: { nombre: "Dra. María López", especialidad: "Pediatría" },
    estado: "en-sala-espera",
    motivo: "Control pediátrico",
    duracion: 45,
    historial: [
      {
        estado: "programado",
        timestamp: "2024-01-15T06:30:00Z",
        usuario: "Ana García",
        rol: "mesa-entrada",
      },
      {
        estado: "confirmado",
        timestamp: "2024-01-15T08:00:00Z",
        usuario: "Ana García",
        rol: "mesa-entrada",
      },
      {
        estado: "en-sala-espera",
        timestamp: "2024-01-15T08:55:00Z",
        usuario: "Ana García",
        rol: "mesa-entrada",
      },
    ],
  },
  {
    id: "4",
    hora: "09:30",
    paciente: { nombre: "Pedro Sánchez", dni: "55667788", telefono: "11-5566-7788" },
    profesional: { nombre: "Dr. Carlos Mendez", especialidad: "Cardiología" },
    estado: "en-consulta",
    motivo: "Dolor de espalda",
    duracion: 30,
    historial: [
      {
        estado: "programado",
        timestamp: "2024-01-15T09:00:00Z",
        usuario: "Ana García",
        rol: "mesa-entrada",
      },
      {
        estado: "confirmado",
        timestamp: "2024-01-15T09:15:00Z",
        usuario: "Ana García",
        rol: "mesa-entrada",
      },
      {
        estado: "en-sala-espera",
        timestamp: "2024-01-15T09:45:00Z",
        usuario: "Ana García",
        rol: "mesa-entrada",
      },
      {
        estado: "en-consulta",
        timestamp: "2024-01-15T10:00:00Z",
        usuario: "Dr. Carlos Mendez",
        rol: "profesional",
      },
    ],
  },
  {
    id: "5",
    hora: "10:00",
    paciente: { nombre: "Laura Fernández", dni: "99887766", telefono: "11-9988-7766" },
    profesional: { nombre: "Dra. María López", especialidad: "Pediatría" },
    estado: "completado",
    motivo: "Vacunación",
    duracion: 30,
    historial: [
      {
        estado: "programado",
        timestamp: "2024-01-15T09:30:00Z",
        usuario: "Ana García",
        rol: "mesa-entrada",
      },
      {
        estado: "confirmado",
        timestamp: "2024-01-15T09:45:00Z",
        usuario: "Ana García",
        rol: "mesa-entrada",
      },
      {
        estado: "en-sala-espera",
        timestamp: "2024-01-15T10:15:00Z",
        usuario: "Ana García",
        rol: "mesa-entrada",
      },
      {
        estado: "en-consulta",
        timestamp: "2024-01-15T10:30:00Z",
        usuario: "Dra. María López",
        rol: "profesional",
      },
      {
        estado: "completado",
        timestamp: "2024-01-15T11:00:00Z",
        usuario: "Dra. María López",
        rol: "profesional",
      },
    ],
  },
  {
    id: "6",
    hora: "10:30",
    paciente: { nombre: "Carlos Ruiz", dni: "44332211", telefono: "11-4433-2211" },
    profesional: { nombre: "Dr. Carlos Mendez", especialidad: "Cardiología" },
    estado: "no-asistio",
    motivo: "Dolor de rodilla",
    duracion: 30,
    historial: [
      {
        estado: "programado",
        timestamp: "2024-01-15T10:00:00Z",
        usuario: "Ana García",
        rol: "mesa-entrada",
      },
      {
        estado: "confirmado",
        timestamp: "2024-01-15T10:15:00Z",
        usuario: "Ana García",
        rol: "mesa-entrada",
      },
      {
        estado: "no-asistio",
        timestamp: "2024-01-15T11:00:00Z",
        usuario: "Dr. Carlos Mendez",
        rol: "profesional",
      },
    ],
  },
  {
    id: "7",
    hora: "11:00",
    paciente: { nombre: "Sofia Morales", dni: "33445566", telefono: "11-3344-5566" },
    profesional: { nombre: "Dra. María López", especialidad: "Pediatría" },
    estado: "cancelado",
    motivo: "Control de crecimiento",
    duracion: 30,
    historial: [
      {
        estado: "programado",
        timestamp: "2024-01-15T10:30:00Z",
        usuario: "Ana García",
        rol: "mesa-entrada",
      },
      {
        estado: "confirmado",
        timestamp: "2024-01-15T10:45:00Z",
        usuario: "Ana García",
        rol: "mesa-entrada",
      },
      {
        estado: "cancelado",
        timestamp: "2024-01-15T11:30:00Z",
        usuario: "Dr. Carlos Mendez",
        rol: "profesional",
      },
    ],
  },
  {
    id: "8",
    hora: "11:30",
    paciente: { nombre: "Roberto Díaz", dni: "77889900", telefono: "11-7788-9900" },
    profesional: { nombre: "Dr. Carlos Mendez", especialidad: "Cardiología" },
    estado: "reprogramado",
    motivo: "Electrocardiograma",
    duracion: 45,
    historial: [
      {
        estado: "programado",
        timestamp: "2024-01-15T11:00:00Z",
        usuario: "Ana García",
        rol: "mesa-entrada",
      },
      {
        estado: "confirmado",
        timestamp: "2024-01-15T11:15:00Z",
        usuario: "Ana García",
        rol: "mesa-entrada",
      },
      {
        estado: "reprogramado",
        timestamp: "2024-01-15T12:00:00Z",
        usuario: "Dr. Carlos Mendez",
        rol: "profesional",
      },
    ],
  },
]

const horarios = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
]

const estadoConfig = {
  programado: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock,
    label: "Programado",
  },
  confirmado: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    label: "Confirmado",
  },
  "en-sala-espera": {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Users,
    label: "En Sala de Espera",
  },
  "en-consulta": {
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: Activity,
    label: "En Consulta",
  },
  completado: {
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: FileText,
    label: "Completado",
  },
  "no-asistio": {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: UserX,
    label: "No Asistió",
  },
  cancelado: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    label: "Cancelado",
  },
  reprogramado: {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Calendar,
    label: "Reprogramado",
  },
}

export function TurnosCalendar({
  selectedDate,
  selectedProfesional,
  selectedEspecialidad,
  onNuevoTurno,
}: TurnosCalendarProps) {
  const { user } = useAuth()
  const { notifyPatientInWaitingRoom } = useNotifications() // Agregando hook de notificaciones
  const [showHistoriaClinica, setShowHistoriaClinica] = useState(false)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null)
  const [turnos, setTurnos] = useState<Turno[]>(mockTurnos)

  const handleCambiarEstado = (turnoId: string, nuevoEstado: Turno["estado"]) => {
    const turno = turnos.find((t) => t.id === turnoId)
    if (!turno) return

    const flujoObligatorio = {
      // 1. Programado - puede ir a cualquier estado
      programado: ["confirmado", "no-asistio", "cancelado", "reprogramado"],

      // 2.1.1 Confirmado - solo puede ir al siguiente paso del flujo normal o estados finales
      confirmado: ["en-sala-espera", "no-asistio", "cancelado", "reprogramado"],

      // 2.1.2 En Sala de Espera - solo puede ir al siguiente paso del flujo normal o estados finales
      "en-sala-espera": ["en-consulta", "no-asistio", "cancelado", "reprogramado"],

      // 2.1.3 En Consulta - solo puede completarse o ir a estados finales
      "en-consulta": ["completado", "no-asistio", "cancelado", "reprogramado"],

      // 2.1.4 Completado - estado final, no puede cambiar
      completado: [],

      // 2.2.x Estados finales - no pueden cambiar
      "no-asistio": [],
      cancelado: [],
      reprogramado: [],
    }

    // Validar que la transición esté permitida en el flujo obligatorio
    const transicionesPermitidas = flujoObligatorio[turno.estado]
    if (!transicionesPermitidas.includes(nuevoEstado)) {
      console.log(`[v0] Transición no permitida: ${turno.estado} → ${nuevoEstado}`)
      return
    }

    // Validaciones por rol
    if (user?.role === "mesa-entrada") {
      const estadosPermitidosMesa = [
        "confirmado",
        "en-sala-espera",
        "en-consulta",
        "no-asistio",
        "cancelado",
        "reprogramado",
      ]
      if (!estadosPermitidosMesa.includes(nuevoEstado)) {
        console.log("[v0] Mesa de entrada no puede cambiar a este estado")
        return
      }
    } else if (user?.role === "profesional") {
      // Solo el profesional asignado al turno puede cambiar su estado
      if (turno.profesional.nombre !== user.name) {
        console.log("[v0] Profesional no autorizado para este turno")
        return
      }

      // Profesionales solo pueden manejar estados de consulta
      const estadosPermitidosProfesional = ["en-consulta", "completado"]
      if (!estadosPermitidosProfesional.includes(nuevoEstado)) {
        console.log("[v0] Profesional solo puede manejar consulta y completado")
        return
      }

      // Validación adicional: solo puede completar si está en consulta
      if (nuevoEstado === "completado" && turno.estado !== "en-consulta") {
        console.log("[v0] Solo se puede completar desde en-consulta")
        return
      }
    } else {
      console.log("[v0] Rol no autorizado para cambiar estados")
      return
    }

    // Crear entrada de historial
    const nuevaEntradaHistorial: HistorialEstado = {
      estado: nuevoEstado,
      timestamp: new Date().toISOString(),
      usuario: user?.name || "Usuario",
      rol: user?.role || "unknown",
    }

    setTurnos((prev) =>
      prev.map((t) =>
        t.id === turnoId
          ? {
              ...t,
              estado: nuevoEstado,
              historial: [...t.historial, nuevaEntradaHistorial],
            }
          : t,
      ),
    )

    if (nuevoEstado === "en-sala-espera") {
      notifyPatientInWaitingRoom(turno.paciente.nombre, turno.profesional.nombre, turno.hora)
    }

    if (nuevoEstado === "completado") {
      if (user?.role !== "profesional" || turno.profesional.nombre !== user.name) {
        console.log("[v0] Solo el profesional asignado puede completar el turno")
        return
      }

      // Abrir automáticamente el diálogo de historia clínica
      setPacienteSeleccionado({
        id: turno.paciente.dni,
        nombre: turno.paciente.nombre.split(" ")[0],
        apellido: turno.paciente.nombre.split(" ").slice(1).join(" "),
        dni: turno.paciente.dni,
        telefono: turno.paciente.telefono,
      })
      setShowHistoriaClinica(true)
    }
  }

  const handleMarcarEstado = (turnoId: string, nuevoEstado: Turno["estado"]) => {
    handleCambiarEstado(turnoId, nuevoEstado)
  }

  const handleDesmarcarEstado = (turnoId: string) => {
    const turno = turnos.find((t) => t.id === turnoId)
    if (!turno) return

    const historialSinUltimo = turno.historial.slice(0, -1)
    const estadoAnterior = historialSinUltimo[historialSinUltimo.length - 1]?.estado || "programado"

    setTurnos((prev) =>
      prev.map((t) =>
        t.id === turnoId
          ? {
              ...t,
              estado: estadoAnterior,
              historial: historialSinUltimo,
            }
          : t,
      ),
    )
  }

  const turnosFiltrados = turnos.filter((turno) => {
    if (user?.role === "profesional" && turno.profesional.nombre !== user.name) {
      return false
    }

    if (selectedProfesional !== "todos" && !turno.profesional.nombre.includes(selectedProfesional)) {
      return false
    }
    if (selectedEspecialidad !== "todas" && turno.profesional.especialidad.toLowerCase() !== selectedEspecialidad) {
      return false
    }
    return true
  })

  const getTurnoEnHorario = (hora: string) => {
    return turnosFiltrados.find((turno) => turno.hora === hora)
  }

  const isHorarioDisponible = (hora: string) => {
    return !getTurnoEnHorario(hora)
  }

  const getAccionesDisponibles = (turno: Turno) => {
    const acciones = []

    const flujoObligatorio = {
      programado: ["confirmado", "no-asistio", "cancelado", "reprogramado"],
      confirmado: ["en-sala-espera", "no-asistio", "cancelado", "reprogramado"],
      "en-sala-espera": ["en-consulta", "no-asistio", "cancelado", "reprogramado"],
      "en-consulta": ["completado", "no-asistio", "cancelado", "reprogramado"],
      completado: [], // Estado final
      "no-asistio": [], // Estado final
      cancelado: [], // Estado final
      reprogramado: [], // Estado final
    }

    const estadosPermitidos = flujoObligatorio[turno.estado] || []

    if (user?.role === "mesa-entrada") {
      // Mesa de entrada maneja el flujo inicial y puede marcar estados finales
      const accionesMesa = [
        { estado: "confirmado", label: "Confirmar", icon: CheckCircle, color: "text-green-600" },
        { estado: "en-sala-espera", label: "Paciente en Sala", icon: Users, color: "text-yellow-600" },
        { estado: "en-consulta", label: "Iniciar Consulta", icon: Activity, color: "text-indigo-600" },
        { estado: "no-asistio", label: "No Asistió", icon: UserX, color: "text-orange-600" },
        { estado: "cancelado", label: "Cancelar", icon: XCircle, color: "text-red-600" },
        { estado: "reprogramado", label: "Reprogramar", icon: Calendar, color: "text-purple-600" },
      ]

      accionesMesa.forEach((accion) => {
        if (estadosPermitidos.includes(accion.estado)) {
          acciones.push(accion)
        }
      })
    }

    if (user?.role === "profesional" && turno.profesional.nombre === user.name) {
      // Solo el profesional asignado puede manejar la consulta
      const accionesProfesional = [
        { estado: "en-consulta", label: "Iniciar Consulta", icon: Activity, color: "text-indigo-600" },
        { estado: "completado", label: "Completar Consulta", icon: FileText, color: "text-emerald-600" },
      ]

      accionesProfesional.forEach((accion) => {
        if (estadosPermitidos.includes(accion.estado)) {
          acciones.push(accion)
        }
      })
    }

    return acciones
  }

  const getAccionPrincipal = (turno: Turno) => {
    const acciones = getAccionesDisponibles(turno)
    if (acciones.length === 0) return null

    if (user?.role === "mesa-entrada") {
      if (turno.estado === "programado") return acciones.find((a) => a.estado === "confirmado")
      if (turno.estado === "confirmado") return acciones.find((a) => a.estado === "en-sala-espera")
      if (turno.estado === "en-sala-espera") return acciones.find((a) => a.estado === "en-consulta")
    }

    if (user?.role === "profesional") {
      if (turno.estado === "en-sala-espera") return acciones.find((a) => a.estado === "en-consulta")
      if (turno.estado === "en-consulta") return acciones.find((a) => a.estado === "completado")
    }

    return acciones[0]
  }

  const HistorialTurno = ({ turno }: { turno: Turno }) => {
    const todosLosEstados = ["programado", "confirmado", "en-sala-espera", "en-consulta", "completado"] as const
    const estadosFinales = ["no-asistio", "cancelado", "reprogramado"] as const

    const flujoObligatorio = {
      programado: ["confirmado", "no-asistio", "cancelado", "reprogramado"],
      confirmado: ["en-sala-espera", "no-asistio", "cancelado", "reprogramado"],
      "en-sala-espera": ["en-consulta", "no-asistio", "cancelado", "reprogramado"],
      "en-consulta": ["completado", "no-asistio", "cancelado", "reprogramado"],
      completado: [],
      "no-asistio": [],
      cancelado: [],
      reprogramado: [],
    }

    const puedeModificarEstado = (estado: Turno["estado"]) => {
      // Solo mesa de entrada puede modificar estados desde el historial
      if (user?.role !== "mesa-entrada") return false

      if (estado === "completado") {
        return user?.role === "profesional" && turno.profesional.nombre === user.name
      }

      // No se pueden modificar estados finales
      if (["completado", "no-asistio", "cancelado", "reprogramado"].includes(turno.estado)) return false

      // Verificar si el estado está permitido según el flujo
      const estadosPermitidos = flujoObligatorio[turno.estado] || []
      return estadosPermitidos.includes(estado)
    }

    const puedeDesmarcarEstado = (estado: Turno["estado"]) => {
      // Solo mesa de entrada puede desmarcar estados
      if (user?.role !== "mesa-entrada") return false

      // No se puede desmarcar el estado "programado" (siempre debe existir)
      if (estado === "programado") return false

      // No se pueden desmarcar estados finales una vez marcados
      if (["completado", "no-asistio", "cancelado", "reprogramado"].includes(turno.estado)) return false

      // Solo se puede desmarcar si es el último estado en el historial
      const ultimoEstado = turno.historial[turno.historial.length - 1]?.estado
      return ultimoEstado === estado
    }

    const mostrarEstadosFinales = !["completado", "no-asistio", "cancelado", "reprogramado"].includes(turno.estado)
    const estadosFinalesDisponibles = estadosFinales.filter((estado) =>
      flujoObligatorio[turno.estado]?.includes(estado),
    )

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
            <History className="h-3 w-3" />
            Detalle
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle del Turno</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Paciente:</strong> {turno.paciente.nombre}
              </p>
              <p>
                <strong>Hora:</strong> {turno.hora}
              </p>
              <p>
                <strong>Profesional:</strong> {turno.profesional.nombre}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Progreso del Turno</h4>

              {/* Estados normales del flujo */}
              {todosLosEstados.map((estado) => {
                const config = estadoConfig[estado]
                const Icon = config.icon
                const historialItem = turno.historial.find((h) => h.estado === estado)
                const isCompleted = !!historialItem
                const isCurrent = turno.estado === estado && isCompleted
                const puedeMarcar = puedeModificarEstado(estado)
                const puedeDesmarcar = puedeDesmarcarEstado(estado)

                return (
                  <div
                    key={estado}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg transition-all",
                      isCompleted ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200",
                      isCurrent && "ring-2 ring-primary ring-offset-1",
                      (puedeMarcar || puedeDesmarcar) && "hover:shadow-sm cursor-pointer",
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all",
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-white border-gray-300 text-gray-400",
                        (puedeMarcar || puedeDesmarcar) && "hover:scale-110",
                      )}
                    >
                      {isCompleted ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={cn("text-sm font-medium", isCompleted ? "text-green-800" : "text-gray-500")}>
                          {config.label}
                        </p>

                        <div className="flex items-center gap-1">
                          {/* Mesa de entrada puede marcar todos excepto completado */}
                          {user?.role === "mesa-entrada" && estado !== "completado" && puedeMarcar && !isCompleted && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarcarEstado(turno.id, estado)}
                              className="h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              Marcar
                            </Button>
                          )}

                          {/* Solo el profesional puede marcar completado */}
                          {user?.role === "profesional" &&
                            estado === "completado" &&
                            turno.profesional.nombre === user.name &&
                            puedeMarcar &&
                            !isCompleted && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarcarEstado(turno.id, estado)}
                                className="h-6 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              >
                                Completar
                              </Button>
                            )}

                          {puedeDesmarcar && isCompleted && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDesmarcarEstado(turno.id)}
                              className="h-6 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            >
                              Desmarcar
                            </Button>
                          )}
                        </div>
                      </div>

                      {historialItem && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(historialItem.timestamp).toLocaleString()} - {historialItem.usuario}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}

              {mostrarEstadosFinales && estadosFinalesDisponibles.length > 0 && (
                <>
                  <div className="border-t pt-3 mt-4">
                    <h5 className="font-medium text-xs text-muted-foreground mb-2">Estados Finales Alternativos</h5>
                    <div className="space-y-2">
                      {estadosFinalesDisponibles.map((estado) => {
                        const config = estadoConfig[estado]
                        const Icon = config.icon
                        const historialItem = turno.historial.find((h) => h.estado === estado)
                        const isCompleted = !!historialItem
                        const isCurrent = turno.estado === estado && isCompleted
                        const puedeMarcar = puedeModificarEstado(estado)

                        return (
                          <div
                            key={estado}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-lg transition-all",
                              isCompleted ? "bg-red-50 border border-red-200" : "bg-gray-50 border border-gray-200",
                              isCurrent && "ring-2 ring-red-500 ring-offset-1",
                              puedeMarcar && "hover:shadow-sm cursor-pointer",
                            )}
                          >
                            <div
                              className={cn(
                                "flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all",
                                isCompleted
                                  ? "bg-red-500 border-red-500 text-white"
                                  : "bg-white border-gray-300 text-gray-400",
                                puedeMarcar && "hover:scale-110",
                              )}
                            >
                              {isCompleted ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p
                                  className={cn("text-sm font-medium", isCompleted ? "text-red-800" : "text-gray-500")}
                                >
                                  {config.label}
                                </p>

                                <div className="flex items-center gap-1">
                                  {user?.role === "mesa-entrada" && puedeMarcar && !isCompleted && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMarcarEstado(turno.id, estado)}
                                      className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      Marcar
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {historialItem && (
                                <p className="text-xs text-muted-foreground">
                                  {new Date(historialItem.timestamp).toLocaleString()} - {historialItem.usuario}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium">Programados</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {turnosFiltrados.filter((t) => t.estado === "programado").length}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Confirmados</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {turnosFiltrados.filter((t) => t.estado === "confirmado").length}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium">En Espera</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {turnosFiltrados.filter((t) => t.estado === "en-sala-espera").length}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            <span className="text-sm font-medium">En Consulta</span>
          </div>
          <p className="text-2xl font-bold text-indigo-600">
            {turnosFiltrados.filter((t) => t.estado === "en-consulta").length}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-sm font-medium">Completados</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {turnosFiltrados.filter((t) => t.estado === "completado").length}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm font-medium">No Asistieron</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {turnosFiltrados.filter((t) => t.estado === "no-asistio").length}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium">Cancelados</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {turnosFiltrados.filter((t) => t.estado === "cancelado").length}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-sm font-medium">Disponibles</span>
          </div>
          <p className="text-2xl font-bold text-gray-600">{horarios.filter((h) => isHorarioDisponible(h)).length}</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-2">
          {horarios.map((hora) => {
            const turno = getTurnoEnHorario(hora)
            const disponible = isHorarioDisponible(hora)

            return (
              <div
                key={hora}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg border transition-colors",
                  disponible
                    ? "border-dashed border-gray-300 hover:border-primary hover:bg-primary/5"
                    : "border-solid bg-card",
                )}
              >
                <div className="flex items-center gap-2 w-20">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-sm font-medium">{hora}</span>
                </div>

                {disponible ? (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Horario disponible</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onNuevoTurno}
                      className="gap-2 text-primary hover:text-primary"
                    >
                      <Plus className="h-4 w-4" />
                      Agendar turno
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{turno!.paciente.nombre}</p>
                          <p className="text-xs text-muted-foreground">DNI: {turno!.paciente.dni}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{turno!.profesional.nombre}</p>
                          <p className="text-xs text-muted-foreground">{turno!.profesional.especialidad}</p>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground truncate">{turno!.motivo}</p>
                        <p className="text-xs text-muted-foreground">{turno!.duracion} min</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <HistorialTurno turno={turno!} />

                      {(() => {
                        const config = estadoConfig[turno!.estado]
                        const Icon = config.icon
                        return (
                          <Badge variant="outline" className={cn("gap-1", config.color)}>
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {pacienteSeleccionado && (
        <HistoriaClinicaDialog
          open={showHistoriaClinica}
          onOpenChange={setShowHistoriaClinica}
          paciente={pacienteSeleccionado}
          showAddConsulta={true}
        />
      )}
    </div>
  )
}
