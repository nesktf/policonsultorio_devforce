"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  User,
  Stethoscope, 
  Clock, 
  Calendar,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  UserX
} from "lucide-react"

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

interface TurnoDetailDialogProps {
  turno: Turno
  open: boolean
  onOpenChange: (open: boolean) => void
  onEstadoChange: (turnoId: string, nuevoEstado: Turno["estado"]) => void
  puedeModificar?: boolean
}

const estadoConfig = {
  PROGRAMADO: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Calendar,
    label: "Programado",
  },
  EN_SALA_ESPERA: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
    label: "En Sala de Espera",
  },
  ASISTIO: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    label: "Asistió",
  },
  NO_ASISTIO: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: UserX,
    label: "No Asistió",
  },
  CANCELADO: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    label: "Cancelado",
  },
}

export function TurnoDetailDialog({
  turno,
  open,
  onOpenChange,
  onEstadoChange,
  puedeModificar = true,
}: TurnoDetailDialogProps) {
  const config = estadoConfig[turno.estado]
  const Icon = config.icon

  const handleEstadoChange = (nuevoEstado: Turno["estado"]) => {
    if (puedeModificar) {
      onEstadoChange(turno.id, nuevoEstado)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span>Detalles del Turno</span>
            <Badge variant="outline" className={`gap-1 ${config.color}`}>
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {/* Información del Turno */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Fecha</span>
              </div>
              <p className="text-sm pl-5">Hoy</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Hora</span>
              </div>
              <p className="text-sm pl-5 font-mono">{turno.hora}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Duración</span>
              </div>
              <p className="text-sm pl-5">{turno.duracion} min</p>
            </div>
          </div>

          <Separator />

          {/* Información del Paciente */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-foreground">
              <User className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Paciente</h3>
            </div>
            
            <div className="pl-6 space-y-1.5">
              <div>
                <p className="text-xs text-muted-foreground">Nombre</p>
                <p className="font-medium text-sm">{turno.paciente.nombre}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">DNI</p>
                <p className="font-medium font-mono text-sm">{turno.paciente.dni}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{turno.paciente.telefono}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Información del Profesional */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-foreground">
              <Stethoscope className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Profesional</h3>
            </div>
            
            <div className="pl-6 space-y-1.5">
              <div>
                <p className="text-xs text-muted-foreground">Nombre</p>
                <p className="font-medium text-sm">{turno.profesional.nombre}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Especialidad</p>
                <p className="font-medium text-sm">{turno.profesional.especialidad}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Motivo de Consulta */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Motivo de Consulta</h3>
            </div>
            
            <div className="pl-6">
              <p className="text-sm">{turno.motivo}</p>
            </div>
          </div>

          {turno.notas && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Notas Adicionales</h3>
                <p className="text-sm text-muted-foreground">{turno.notas}</p>
              </div>
            </>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap justify-end gap-2 pt-3 border-t">
          {puedeModificar ? (
            <>
              {turno.estado !== "PROGRAMADO" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEstadoChange("PROGRAMADO")}
                  className="gap-1.5"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Programado
                </Button>
              )}
              {turno.estado !== "EN_SALA_ESPERA" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEstadoChange("EN_SALA_ESPERA")}
                  className="gap-1.5 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                >
                  <Clock className="h-3.5 w-3.5" />
                  En Sala
                </Button>
              )}
              {turno.estado !== "ASISTIO" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEstadoChange("ASISTIO")}
                  className="gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Asistió
                </Button>
              )}
              {turno.estado !== "NO_ASISTIO" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEstadoChange("NO_ASISTIO")}
                  className="gap-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  <UserX className="h-3.5 w-3.5" />
                  No Asistió
                </Button>
              )}
              {turno.estado !== "CANCELADO" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEstadoChange("CANCELADO")}
                  className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Cancelado
                </Button>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Solo el personal de mesa de entrada puede modificar el estado de los turnos
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}