"use client";

import { MouseEvent } from "react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Stethoscope,
  Clock,
  MoreVertical,
  CheckCircle,
  XCircle,
  Calendar,
  UserX,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CancelacionOrigen = "PACIENTE" | "PROFESIONAL";

interface Turno {
  id: string;
  hora: string;
  paciente: {
    nombre: string;
    dni: string;
    telefono: string;
  };
  profesional: {
    nombre: string;
    especialidad: string;
  };
  estado:
    | "PROGRAMADO"
    | "EN_SALA_ESPERA"
    | "ASISTIO"
    | "NO_ASISTIO"
    | "CANCELADO";
  motivo: string;
  duracion: number;
  notas?: string;
}

interface EstadoChangeOptions {
  solicitadoPor?: CancelacionOrigen;
}

interface TurnoCardProps {
  turno: Turno;
  onClick: () => void;
  onEstadoChange: (
    turnoId: string,
    nuevoEstado: Turno["estado"],
    opciones?: EstadoChangeOptions
  ) => void;
  puedeModificar?: boolean;
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
    label: "En Sala",
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
};

export function TurnoCard({
  turno,
  onClick,
  onEstadoChange,
  puedeModificar = true,
}: TurnoCardProps) {
  const config = estadoConfig[turno.estado];
  const Icon = config.icon;

  const handleEstadoClick = (
    event: MouseEvent,
    nuevoEstado: Turno["estado"]
  ) => {
    event.stopPropagation();
    if (puedeModificar) {
      onEstadoChange(turno.id, nuevoEstado);
    }
  };

  return (
    <Card
      className={cn(
        "h-full w-full p-2.5 flex flex-col cursor-pointer transition-all duration-200 border-2 overflow-hidden",
        config.color,
        "hover:shadow-md hover:border-primary/20"
      )}
      onClick={onClick}
    >
      {/* Header */}
      {turno.duracion >= 30 && (
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge
            variant="outline"
            className={cn("gap-1 text-xs", config.badge)}
          >
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
                  <DropdownMenuItem
                    onClick={(e) => handleEstadoClick(e, "PROGRAMADO")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Programado
                  </DropdownMenuItem>
                )}
                {turno.estado !== "EN_SALA_ESPERA" && (
                  <DropdownMenuItem
                    onClick={(e) => handleEstadoClick(e, "EN_SALA_ESPERA")}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    En Sala de Espera
                  </DropdownMenuItem>
                )}
                {turno.estado !== "ASISTIO" && (
                  <DropdownMenuItem
                    onClick={(e) => handleEstadoClick(e, "ASISTIO")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Asistió
                  </DropdownMenuItem>
                )}
                {turno.estado !== "NO_ASISTIO" && (
                  <DropdownMenuItem
                    onClick={(e) => handleEstadoClick(e, "NO_ASISTIO")}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    No Asistió
                  </DropdownMenuItem>
                )}
                {turno.estado !== "CANCELADO" && (
                  <DropdownMenuItem
                    onClick={(e) => handleEstadoClick(e, "CANCELADO")}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelado
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="flex-grow min-h-0 space-y-2 flex flex-col justify-center">
        {/* Paciente (solo si hay espacio)*/}
        {turno.duracion >= 30 && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate leading-tight">
                {turno.paciente.nombre}
              </p>
              {turno.duracion >= 30 && (
                <p className="text-xs text-muted-foreground">
                  DNI: {turno.paciente.dni}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Profesional (siempre) */}
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="min-w-0 flex-1 gap-2">
            <p className="text-sm font-medium truncate leading-tight">
              {turno.profesional.nombre}
            </p>
            {turno.duracion >= 15 && (
              <p className="text-xs text-muted-foreground">
                {turno.profesional.especialidad}
              </p>
            )}
          </div>
        </div>

        {/* motivo (solo si hay espacio) */}
        {turno.duracion >= 45 && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate leading-tight">
                Motivo
              </p>
              <p className="text-xs text-muted-foreground">{turno.motivo}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-2 border-t border-current/10 flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span className="font-medium">
          {turno.hora} ({turno.duracion} min)
        </span>
      </div>
    </Card>
  );
}
