"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TurnoCard } from "@/components/calendario-profesional/turno-card";
import { TurnoDetailDialog } from "@/components/calendario-profesional/turno-detail-dialog";
import { useAuth } from "@/context/auth-context";
import { Clock } from "lucide-react";

// Interface de turno
interface Turno {
  id: string;
  hora: string; // formato HH:mm
  paciente: {
    nombre: string;
    dni: string;
    telefono: string;
  };
  profesional: {
    id: string;
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
  duracion: number; // en minutos
  notas?: string;
}

// Mock de turnos de un solo profesional
const mockTurnos: Turno[] = [
  {
    id: "1",
    hora: "2025-10-01T08:00:00",
    paciente: {
      nombre: "María González",
      dni: "12345678",
      telefono: "11-1234-5678",
    },
    profesional: {
      id: "1",
      nombre: "Dr. Carlos Mendez",
      especialidad: "Clínica Médica",
    },
    estado: "ASISTIO",
    motivo: "Control rutinario",
    duracion: 30,
  },
  {
    id: "2",
    hora: "2025-10-01T08:30:00",
    paciente: {
      nombre: "Juan Pérez",
      dni: "87654321",
      telefono: "11-8765-4321",
    },
    profesional: {
      id: "1",
      nombre: "Dr. Carlos Mendez",
      especialidad: "Clínica Médica",
    },
    estado: "EN_SALA_ESPERA",
    motivo: "Vacunación",
    duracion: 30,
  },
  {
    id: "3",
    hora: "2025-10-01T09:00:00",
    paciente: {
      nombre: "Ana Martín",
      dni: "11223344",
      telefono: "11-1122-3344",
    },
    profesional: {
      id: "1",
      nombre: "Dr. Carlos Mendez",
      especialidad: "Clínica Médica",
    },
    estado: "PROGRAMADO",
    motivo: "Dolor en el pecho",
    duracion: 30,
  },
];

// Horarios posibles
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
];

// Helper para comparar fechas sin hora
function esMismaFecha(fecha1: Date, fecha2: Date) {
  return (
    fecha1.getFullYear() === fecha2.getFullYear() &&
    fecha1.getMonth() === fecha2.getMonth() &&
    fecha1.getDate() === fecha2.getDate()
  );
}

interface CalendarioMesaViewProps {
  selectedDate: Date;
}

export function CalendarioMesaView({ selectedDate }: CalendarioMesaViewProps) {
  const { user } = useAuth();
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);
  const [turnos] = useState<Turno[]>(mockTurnos);

  // Solo mesa de entrada puede modificar estados
  const puedeModificar = user?.role === "mesa-entrada";

  // Filtramos solo turnos del día seleccionado
  const turnosFiltrados = turnos.filter((t) =>
    esMismaFecha(new Date(t.hora), selectedDate)
  );

  const getTurnosEnHorario = (hora: string) => {
    return turnosFiltrados.filter(
      (t) =>
        new Date(t.hora).getHours() === Number(hora.split(":")[0]) &&
        new Date(t.hora).getMinutes() === Number(hora.split(":")[1])
    );
  };

  return (
    <div className="space-y-4">
      {/* Grid de turnos */}
      <Card className="p-6">
        <div className="space-y-4">
          {horarios.map((hora) => {
            const turnosHora = getTurnosEnHorario(hora);
            const tieneDisponibilidad = turnosHora.length === 0;

            return (
              <div key={hora} className="space-y-2">
                {/* Horario */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-20">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm font-medium">
                      {hora}
                    </span>
                  </div>
                  {turnosHora.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {turnosHora.length}{" "}
                      {turnosHora.length === 1 ? "turno" : "turnos"}
                    </Badge>
                  )}
                </div>

                {/* Turnos */}
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
                        puedeModificar={false}
                        onEstadoChange={() => {}}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Dialog de detalles */}
      {selectedTurno && (
        <TurnoDetailDialog
          turno={selectedTurno}
          open={!!selectedTurno}
          onOpenChange={(open) => !open && setSelectedTurno(null)}
        />
      )}
    </div>
  );
}
