"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Stethoscope,
  Clock,
  Calendar,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  UserX,
} from "lucide-react";

interface Turno {
  id: string;
  fecha?: string;
  hora: string;
  paciente: {
    id: number; // <-- agregar id

    nombre: string;
    apellido?: string;
    dni?: string;
    telefono?: string;
  };
  profesional?: {
    nombre?: string;
    apellido?: string;
    especialidad?: string;
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

interface TurnoDetailDialogProps {
  turno: Turno;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEstadoChange?: (turnoId: string, nuevoEstado: Turno["estado"]) => void;
  onNuevaConsulta?: (paciente: Turno["paciente"]) => void; // <-- TIPO AQUÍ
  puedeModificar?: boolean;
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
};

export function TurnoDetailDialog({
  turno,
  open,
  onOpenChange,
  onEstadoChange,
  onNuevaConsulta, // <-- agregar aquí
}: //puedeModificar = false,
TurnoDetailDialogProps) {
  const config = estadoConfig[turno.estado];
  const Icon = config.icon;

  const cambiarEstado = (nuevoEstado: Turno["estado"]) => {
    //if (!puedeModificar) return;
    if (onEstadoChange) {
      onEstadoChange(turno.id, nuevoEstado);
    }
    // cerramos el diálogo igual que la versión de mesa
    onOpenChange(false);
  };

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
          {/* Información básica */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Fecha</span>
              </div>
              <p className="text-sm pl-5">
                {turno.fecha
                  ? new Date(turno.fecha).toLocaleDateString()
                  : "Hoy"}
              </p>
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

          {/* Paciente */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-foreground">
              <User className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Paciente</h3>
            </div>

            <div className="pl-6 space-y-1.5">
              <div>
                <p className="text-xs text-muted-foreground">Nombre</p>
                <p className="font-medium text-sm">
                  {turno.paciente?.apellido
                    ? `${turno.paciente.apellido}, ${turno.paciente.nombre}`
                    : turno.paciente?.nombre}
                </p>
              </div>
              {turno.paciente?.dni && (
                <div>
                  <p className="text-xs text-muted-foreground">DNI</p>
                  <p className="font-medium font-mono text-sm">
                    {turno.paciente.dni}
                  </p>
                </div>
              )}
              {turno.paciente?.telefono && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">
                      {turno.paciente.telefono}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Profesional */}
          {turno.profesional && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Profesional</h3>
                </div>

                <div className="pl-6 space-y-1.5">
                  <div>
                    <p className="text-xs text-muted-foreground">Nombre</p>
                    <p className="font-medium text-sm">
                      {turno.profesional.apellido
                        ? `${turno.profesional.apellido}, ${turno.profesional.nombre}`
                        : turno.profesional.nombre}
                    </p>
                  </div>
                  {turno.profesional.especialidad && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Especialidad
                      </p>
                      <p className="font-medium text-sm">
                        {turno.profesional.especialidad}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Motivo y notas */}
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
        <div className="flex justify-end gap-2 pt-3 border-t">
          {turno.estado !== "ASISTIO" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onEstadoChange) {
                  onEstadoChange(turno.id, "ASISTIO");
                }
                onOpenChange(false); // cerrar diálogo
                if (onNuevaConsulta) {
                  onNuevaConsulta(turno.paciente); // abrimos formulario de nueva consulta
                }
              }}
              className="gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Asistió
            </Button>
          )}
          {/* 🆕 Botón Cancelar */}
          {turno.estado !== "CANCELADO" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onEstadoChange) {
                  onEstadoChange(turno.id, "CANCELADO");
                }
                onOpenChange(false); // cerrar diálogo
              }}
              className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancelar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
