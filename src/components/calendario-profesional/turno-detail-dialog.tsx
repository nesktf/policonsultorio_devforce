"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Stethoscope, Clock, Phone, FileText } from "lucide-react";

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

interface TurnoDetailDialogProps {
  turno: Turno;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const estadoLabels = {
  PROGRAMADO: { label: "Programado", color: "bg-blue-100 text-blue-800" },
  EN_SALA_ESPERA: {
    label: "En Sala de Espera",
    color: "bg-yellow-100 text-yellow-800",
  },
  ASISTIO: { label: "Asistió", color: "bg-green-100 text-green-800" },
  NO_ASISTIO: { label: "No Asistió", color: "bg-orange-100 text-orange-800" },
  CANCELADO: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

export function TurnoDetailDialog({
  turno,
  open,
  onOpenChange,
}: TurnoDetailDialogProps) {
  const estado = estadoLabels[turno.estado];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle del Turno</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Estado */}
          <div className="flex items-center gap-2">
            <Badge className={estado.color}>{estado.label}</Badge>
            <span className="text-sm text-muted-foreground">
              Hora: {turno.hora}
            </span>
          </div>

          <Separator />

          {/* Paciente */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <p className="font-semibold">{turno.paciente.nombre}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              DNI: {turno.paciente.dni}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              {turno.paciente.telefono}
            </div>
          </div>

          <Separator />

          {/* Profesional */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium">{turno.profesional.nombre}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {turno.profesional.especialidad}
            </p>
          </div>

          <Separator />

          {/* Motivo y notas */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium">Motivo</p>
            </div>
            <p className="text-sm">{turno.motivo}</p>

            {turno.notas && (
              <p className="text-xs text-muted-foreground">
                Notas: {turno.notas}
              </p>
            )}
          </div>

          {/* Duración */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Duración: {turno.duracion} min
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}