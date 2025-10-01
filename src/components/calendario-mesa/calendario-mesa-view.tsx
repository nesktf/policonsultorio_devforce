"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TurnoCard } from "@/components/calendario-mesa/turno-card"
import { TurnoDetailDialog } from "@/components/calendario-mesa/turno-detail-dialog"
import { useAuth } from "@/context/auth-context"
import { Clock } from "lucide-react"

interface Turno {
  id: string
  hora: string
  paciente: {
    nombre: string
    dni: string
    telefono: string
  }
  profesional: {
    id: string
    nombre: string
    especialidad: string
  }
  estado: "PROGRAMADO" | "EN_SALA_ESPERA" | "ASISTIO" | "NO_ASISTIO" | "CANCELADO"
  motivo: string
  duracion: number
  notas?: string
}

interface CalendarioMesaViewProps {
  selectedDate: Date
  selectedProfesional: string
  selectedEspecialidad: string
}

// Mock data actualizado con nuevos estados
const mockTurnos: Turno[] = [
  {
    id: "1",
    hora: "08:00",
    paciente: { nombre: "María González", dni: "12345678", telefono: "11-1234-5678" },
    profesional: { id: "1", nombre: "Dr. Carlos Mendez", especialidad: "cardiologia" },
    estado: "ASISTIO",
    motivo: "Control rutinario",
    duracion: 30,
  },
  {
    id: "2",
    hora: "08:00",
    paciente: { nombre: "Juan Pérez", dni: "87654321", telefono: "11-8765-4321" },
    profesional: { id: "2", nombre: "Dra. María López", especialidad: "pediatria" },
    estado: "EN_SALA_ESPERA",
    motivo: "Vacunación",
    duracion: 30,
  },
  {
    id: "3",
    hora: "08:30",
    paciente: { nombre: "Ana Martín", dni: "11223344", telefono: "11-1122-3344" },
    profesional: { id: "1", nombre: "Dr. Carlos Mendez", especialidad: "cardiologia" },
    estado: "PROGRAMADO",
    motivo: "Dolor en el pecho",
    duracion: 30,
  },
  {
    id: "4",
    hora: "09:00",
    paciente: { nombre: "Pedro Sánchez", dni: "55667788", telefono: "11-5566-7788" },
    profesional: { id: "3", nombre: "Dr. Martínez", especialidad: "traumatologia" },
    estado: "PROGRAMADO",
    motivo: "Dolor de espalda",
    duracion: 45,
  },
  {
    id: "5",
    hora: "09:00",
    paciente: { nombre: "Laura Fernández", dni: "99887766", telefono: "11-9988-7766" },
    profesional: { id: "2", nombre: "Dra. María López", especialidad: "pediatria" },
    estado: "ASISTIO",
    motivo: "Control pediátrico",
    duracion: 30,
  },
  {
    id: "6",
    hora: "09:30",
    paciente: { nombre: "Carlos Ruiz", dni: "44332211", telefono: "11-4433-2211" },
    profesional: { id: "1", nombre: "Dr. Carlos Mendez", especialidad: "cardiologia" },
    estado: "CANCELADO",
    motivo: "Electrocardiograma",
    duracion: 30,
  },
  {
    id: "7",
    hora: "10:00",
    paciente: { nombre: "Sofía Morales", dni: "33445566", telefono: "11-3344-5566" },
    profesional: { id: "4", nombre: "Dra. Rodríguez", especialidad: "dermatologia" },
    estado: "NO_ASISTIO",
    motivo: "Control de lunares",
    duracion: 30,
  },
  {
    id: "8",
    hora: "10:00",
    paciente: { nombre: "Roberto Díaz", dni: "77889900", telefono: "11-7788-9900" },
    profesional: { id: "3", nombre: "Dr. Martínez", especialidad: "traumatologia" },
    estado: "EN_SALA_ESPERA",
    motivo: "Dolor de rodilla",
    duracion: 30,
  },
]

const horarios = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
]

export function CalendarioMesaView({
  selectedDate,
  selectedProfesional,
  selectedEspecialidad,
}: CalendarioMesaViewProps) {
  const { user } = useAuth()
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null)
  const [turnos, setTurnos] = useState<Turno[]>(mockTurnos)

  // Solo mesa de entrada puede modificar estados
  const puedeModificar = user?.role === "mesa-entrada"

  const turnosFiltrados = turnos.filter((turno) => {
    if (selectedProfesional !== "todos") {
      if (turno.profesional.id !== selectedProfesional) {
        return false
      }
    }
    
    if (selectedEspecialidad !== "todas") {
      if (turno.profesional.especialidad !== selectedEspecialidad) {
        return false
      }
    }
    
    return true
  })

  const getTurnosEnHorario = (hora: string) => {
    return turnosFiltrados.filter((turno) => turno.hora === hora)
  }

  const handleEstadoChange = (turnoId: string, nuevoEstado: Turno["estado"]) => {
    setTurnos((prev) =>
      prev.map((t) =>
        t.id === turnoId
          ? { ...t, estado: nuevoEstado }
          : t
      )
    )
  }

  const getEstadisticas = () => {
    return {
      total: turnosFiltrados.length,
      programados: turnosFiltrados.filter((t) => t.estado === "PROGRAMADO").length,
      enSalaEspera: turnosFiltrados.filter((t) => t.estado === "EN_SALA_ESPERA").length,
      asistidos: turnosFiltrados.filter((t) => t.estado === "ASISTIO").length,
      noAsistidos: turnosFiltrados.filter((t) => t.estado === "NO_ASISTIO").length,
      cancelados: turnosFiltrados.filter((t) => t.estado === "CANCELADO").length,
    }
  }

  const stats = getEstadisticas()

  return (
    <div className="space-y-4">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-primary">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium">Programados</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.programados}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium">En Sala</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.enSalaEspera}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Asistidos</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.asistidos}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm font-medium">No Asistidos</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.noAsistidos}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium">Cancelados</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.cancelados}</p>
        </Card>
      </div>

      {/* Grid de Turnos */}
      <Card className="p-6">
        <div className="space-y-4">
          {horarios.map((hora) => {
            const turnosHora = getTurnosEnHorario(hora)
            const tieneDisponibilidad = turnosHora.length === 0

            return (
              <div key={hora} className="space-y-2">
                {/* Horario */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-20">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm font-medium">{hora}</span>
                  </div>
                  {turnosHora.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {turnosHora.length} {turnosHora.length === 1 ? "turno" : "turnos"}
                    </Badge>
                  )}
                </div>

                {/* Turnos en Grid */}
                {tieneDisponibilidad ? (
                  <div className="ml-24 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-sm text-muted-foreground text-center">
                      Sin turnos programados
                    </p>
                  </div>
                ) : (
                  <div className="ml-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {turnosHora.map((turno) => (
                      <TurnoCard
                        key={turno.id}
                        turno={turno}
                        onClick={() => setSelectedTurno(turno)}
                        onEstadoChange={handleEstadoChange}
                        puedeModificar={puedeModificar}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Dialog de detalles */}
      {selectedTurno && (
        <TurnoDetailDialog
          turno={selectedTurno}
          open={!!selectedTurno}
          onOpenChange={(open) => !open && setSelectedTurno(null)}
          onEstadoChange={handleEstadoChange}
          puedeModificar={puedeModificar}
        />
      )}
    </div>
  )
}