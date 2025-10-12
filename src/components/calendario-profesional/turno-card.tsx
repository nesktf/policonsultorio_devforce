"use client"

import { MouseEvent } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Calendar, CheckCircle, Clock, MoreVertical, Stethoscope, User, UserX, XCircle } from "lucide-react"

type CancelacionOrigen = "PACIENTE" | "PROFESIONAL"

interface Turno {
  id: string
  hora: string
  paciente: {
    nombre: string
    apellido: string
    dni: string
    telefono: string
  }
  profesional: {
    nombre: string
    apellido: string
    especialidad: string
  }
  estado: "PROGRAMADO" | "EN_SALA_ESPERA" | "ASISTIO" | "NO_ASISTIO" | "CANCELADO"
  motivo: string
  duracion: number
  notas?: string
}

interface EstadoChangeOptions {
  solicitadoPor?: CancelacionOrigen
}

interface TurnoCardProps {
  turno: Turno
  onClick: () => void
  onEstadoChange: (turnoId: string, nuevoEstado: Turno["estado"], opciones?: EstadoChangeOptions) => void
  puedeModificar?: boolean
}

const estadoConfig = {
  PROGRAMADO: {
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Calendar,
    label: "Programado",
  },
  EN_SALA_ESPERA: {
    color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
    badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
    label: "En Sala de Espera",
  },
  ASISTIO: {
    color: "bg-green-50 border-green-200 hover:bg-green-100",
    badge: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    label: "Asistió",
  },
  NO_ASISTIO: {
    color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    badge: "bg-orange-100 text-orange-800 border-orange-200",
    icon: UserX,
    label: "No Asistió",
  },
  CANCELADO: {
    color: "bg-red-50 border-red-200 hover:bg-red-100",
    badge: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    label: "Cancelado",
  },
} as const

export function TurnoCard({ turno, onClick, onEstadoChange, puedeModificar = true }: TurnoCardProps) {
  const config = estadoConfig[turno.estado]
  const Icon = config.icon

  const handleEstadoClick = (event: MouseEvent, nuevoEstado: Turno["estado"]) => {
    event.stopPropagation()
    if (puedeModificar) {
      onEstadoChange(turno.id, nuevoEstado)
    }
  }

  return (
    <Card
      className={cn("p-4 cursor-pointer transition-all duration-200 border-2", config.color, "hover:shadow-md")}
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header con estado y acciones */}
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className={cn("gap-1", config.badge)}>
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" disabled={!puedeModificar}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            {puedeModificar ? (
              <DropdownMenuContent align="end">
                {turno.estado !== "PROGRAMADO" ? (
                  <DropdownMenuItem onClick={(event) => handleEstadoClick(event, "PROGRAMADO")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Programado
                  </DropdownMenuItem>
                ) : null}
                {turno.estado !== "EN_SALA_ESPERA" ? (
                  <DropdownMenuItem onClick={(event) => handleEstadoClick(event, "EN_SALA_ESPERA")}>
                    <Clock className="mr-2 h-4 w-4" />
                    En Sala de Espera
                  </DropdownMenuItem>
                ) : null}
                {turno.estado !== "ASISTIO" ? (
                  <DropdownMenuItem onClick={(event) => handleEstadoClick(event, "ASISTIO")}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Asistió
                  </DropdownMenuItem>
                ) : null}
                {turno.estado !== "NO_ASISTIO" ? (
                  <DropdownMenuItem onClick={(event) => handleEstadoClick(event, "NO_ASISTIO")}>
                    <UserX className="mr-2 h-4 w-4" />
                    No Asistió
                  </DropdownMenuItem>
                ) : null}
                {turno.estado !== "CANCELADO" ? (
                  <DropdownMenuItem onClick={(event) => handleEstadoClick(event, "CANCELADO")}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelado
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            ) : null}
          </DropdownMenu>
        </div>

        {/* Paciente */}
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {turno.paciente.apellido}, {turno.paciente.nombre}
              </p>
              <p className="text-xs text-muted-foreground">DNI: {turno.paciente.dni}</p>
            </div>
          </div>
        </div>

        {/* Profesional */}
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {turno.profesional.apellido}, {turno.profesional.nombre}
              </p>
              <p className="text-xs text-muted-foreground">{turno.profesional.especialidad}</p>
            </div>
          </div>
        </div>

        {/* Motivo */}
        <div className="border-t border-current/10 pt-2">
          <p className="line-clamp-2 text-xs text-muted-foreground">{turno.motivo}</p>
        </div>

        {/* Duración */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{turno.duracion} min</span>
        </div>
      </div>
    </Card>
  )
}
