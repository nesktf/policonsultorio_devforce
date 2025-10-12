"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TurnosCalendarProps {
  selectedDate: Date;
  turnos: ApiTurno[];
  loading: boolean;
  error: string | null;
}

interface ApiTurno {
  id: number;
  fecha: string;
  duracion: number;
  estado: string;
  paciente: {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    telefono: string;
  };
  profesional: {
    id: number;
    nombre: string;
    apellido: string;
    especialidad: string;
  };
}

const estadoConfig: Record<string, { label: string; color: string }> = {
  PROGRAMADO: { label: "Programado", color: "bg-blue-100 text-blue-800" },
  EN_SALA_ESPERA: {
    label: "En sala de espera",
    color: "bg-cyan-100 text-cyan-800",
  },
  ASISTIO: { label: "Asistió", color: "bg-green-100 text-green-800" },
  NO_ASISTIO: { label: "No asistió", color: "bg-orange-100 text-orange-800" },
  CANCELADO: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

const fallbackEstado = {
  label: "Programado",
  color: "bg-blue-100 text-blue-800",
};

// 🕓 Nueva función que no aplica el desfase horario del navegador
function formatHour(dateIso: string) {
  const date = new Date(dateIso);

  // Extraemos hora y minuto directamente en UTC
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function TurnosCalendar({
  selectedDate,
  turnos,
  loading,
  error,
}: TurnosCalendarProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          Turnos del{" "}
          {selectedDate.toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando turnos...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : turnos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay turnos asignados para esta fecha.
          </p>
        ) : (
          <div className="space-y-3">
            {turnos.map((turno) => {
              const estado = estadoConfig[turno.estado] ?? fallbackEstado;
              const profesionalNombre = `${turno.profesional.apellido}, ${turno.profesional.nombre}`;
              const pacienteNombre = `${turno.paciente.apellido}, ${turno.paciente.nombre}`;

              return (
                <div
                  key={turno.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold text-primary">
                      {formatHour(turno.fecha)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {pacienteNombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        DNI {turno.paciente.dni}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center gap-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground">
                        {profesionalNombre}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {turno.profesional.especialidad}
                      </p>
                    </div>
                    <Badge className={cn("w-fit", estado.color)}>
                      {estado.label}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      Duración: {turno.duracion} minutos
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
