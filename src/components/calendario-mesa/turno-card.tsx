"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { User, Stethoscope, Clock, MoreVertical, CheckCircle, XCircle, Calendar, UserCheck, UserX } from "lucide-react"
import { cn } from "@/lib/utils"

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
  estado: "PROGRAMADO" | "EN_SALA_ESPERA" | "ASISTIO" | "NO_ASISTIO" | "CANCELADO"
  motivo: string
  duracion: number
  notas?: string
}

interface TurnoCardProps {
  turno: Turno
  onClick: () => void
  onEstadoChange: (turnoId: string, nuevoEstado: Turno["estado"]) => void
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
}

export function TurnoCard({ turno, onClick, onEstadoChange, puedeModificar = true }: TurnoCardProps) {
  const config = estadoConfig[turno.estado]
  const Icon = config.icon

  const handleEstadoClick = (e: React.MouseEvent, nuevoEstado: Turno["estado"]) => {
    e.stopPropagation()
    if (puedeModificar) {
      onEstadoChange(turno.id, nuevoEstado)
    }
  }

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all duration-200 border-2",
        config.color,
        "hover:shadow-md"
      )}
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
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                disabled={!puedeModificar}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            {puedeModificar && (
              <DropdownMenuContent align="end">
                {turno.estado !== "PROGRAMADO" && (
                  <DropdownMenuItem onClick={(e) => handleEstadoClick(e, "PROGRAMADO")}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Programado
                  </DropdownMenuItem>
                )}
                {turno.estado !== "EN_SALA_ESPERA" && (
                  <DropdownMenuItem onClick={(e) => handleEstadoClick(e, "EN_SALA_ESPERA")}>
                    <Clock className="h-4 w-4 mr-2" />
                    En Sala de Espera
                  </DropdownMenuItem>
                )}
                {turno.estado !== "ASISTIO" && (
                  <DropdownMenuItem onClick={(e) => handleEstadoClick(e, "ASISTIO")}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Asistió
                  </DropdownMenuItem>
                )}
                {turno.estado !== "NO_ASISTIO" && (
                  <DropdownMenuItem onClick={(e) => handleEstadoClick(e, "NO_ASISTIO")}>
                    <UserX className="h-4 w-4 mr-2" />
                    No Asistió
                  </DropdownMenuItem>
                )}
                {turno.estado !== "CANCELADO" && (
                  <DropdownMenuItem onClick={(e) => handleEstadoClick(e, "CANCELADO")}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelado
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </div>

        {/* Paciente */}
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">{turno.paciente.nombre}</p>
              <p className="text-xs text-muted-foreground">DNI: {turno.paciente.dni}</p>
            </div>
          </div>
        </div>

        {/* Profesional */}
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <Stethoscope className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{turno.profesional.nombre}</p>
              <p className="text-xs text-muted-foreground">{turno.profesional.especialidad}</p>
            </div>
          </div>
        </div>

        {/* Motivo */}
        <div className="pt-2 border-t border-current/10">
          <p className="text-xs text-muted-foreground line-clamp-2">{turno.motivo}</p>
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