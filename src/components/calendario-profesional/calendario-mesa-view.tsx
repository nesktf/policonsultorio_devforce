"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TurnoCard } from "@/components/calendario-profesional/turno-card";
import { TurnoDetailDialog } from "@/components/calendario-profesional/turno-detail-dialog";
import { useAuth } from "@/context/auth-context";
import { Clock } from "lucide-react";
import { NuevaConsultaDialog } from "@/components/pacientes/nueva-consulta-dialog";

export interface Turno {
  id: string;
  fecha: string; // ISO
  hora: string; // obligatorio
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
  estado:
    | "PROGRAMADO"
    | "EN_SALA_ESPERA"
    | "ASISTIO"
    | "NO_ASISTIO"
    | "CANCELADO";
  motivo: string;
  duracion: number; // minutos
  notas?: string;
}

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

function esMismaFecha(fecha1: Date, fecha2: Date) {
  return (
    fecha1.getFullYear() === fecha2.getFullYear() &&
    fecha1.getMonth() === fecha2.getMonth() &&
    fecha1.getDate() === fecha2.getDate()
  );
}

interface CalendarioMesaViewProps {
  selectedDate: Date;
  profesionalId: number;
}

export function CalendarioMesaView({
  selectedDate,
  profesionalId,
}: CalendarioMesaViewProps) {
  const { user } = useAuth();
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openNuevaConsulta, setOpenNuevaConsulta] = useState(false);
  const [pacienteParaConsulta, setPacienteParaConsulta] = useState<{
    id: number;
    nombre: string;
    apellido?: string;
    dni?: string;
    telefono?: string;
  } | null>(null);

  const puedeModificar = user?.rol === "MESA_ENTRADA";

  const from = new Date(selectedDate);
  from.setHours(0, 0, 0, 0);
  const to = new Date(selectedDate);
  to.setHours(23, 59, 59, 999);

  useEffect(() => {
    if (!profesionalId) return;

    async function fetchTurnos() {
      setLoading(true);
      setError(null);
      try {
        const fromStr = from.toISOString();
        const toStr = to.toISOString();

        const res = await fetch(
          `/api/v1/turnos?profesionalId=${profesionalId}&from=${fromStr}&to=${toStr}`
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Error al cargar turnos");
        }

        const data = await res.json();

        const turnosConHora = (data.turnos || []).map((turno: Turno) => {
          // Extraer hora directamente de la fecha ISO sin conversión de timezone
          // porque la fecha ya viene en el formato correcto desde el servidor
          const fechaISO = new Date(turno.fecha);
          const hora = fechaISO.getUTCHours().toString().padStart(2, "0");
          const minutos = fechaISO.getUTCMinutes().toString().padStart(2, "0");
          const horaFormateada = `${hora}:${minutos}`;

          return {
            ...turno,
            hora: horaFormateada,
            motivo: turno.motivo || "",
          };
        });

        setTurnos(turnosConHora);
      } catch (err: any) {
        setError(err.message || "Error desconocido");
        setTurnos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTurnos();
  }, [profesionalId, selectedDate]);

  // NUEVO: cambiar estado (optimista + rollback)
  const handleEstadoChange = async (
    turnoId: string,
    nuevoEstado: Turno["estado"]
  ) => {
    const turnoAnterior = turnos.find((t) => t.id === turnoId);
    // optimista
    setTurnos((prev) =>
      prev.map((t) => (t.id === turnoId ? { ...t, estado: nuevoEstado } : t))
    );

    try {
      const response = await fetch(`/api/v1/turnos/${turnoId}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el estado del turno");
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      // rollback
      if (turnoAnterior) {
        setTurnos((prev) =>
          prev.map((t) => (t.id === turnoId ? turnoAnterior : t))
        );
      }
    }
  };

  const turnosFiltrados = turnos.filter((t) =>
    esMismaFecha(new Date(t.fecha), selectedDate)
  );

  const getTurnosEnHorario = (hora: string) => {
    return turnosFiltrados.filter((t) => t.hora === hora);
  };

  if (loading) return <p>Cargando turnos...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          {horarios.map((hora) => {
            const turnosHora = getTurnosEnHorario(hora);
            const tieneDisponibilidad = turnosHora.length === 0;

            return (
              <div key={hora} className="space-y-2">
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
                        puedeModificar={puedeModificar}
                        onEstadoChange={handleEstadoChange} // <-- PASAMOS la función
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {selectedTurno && (
        <TurnoDetailDialog
          turno={selectedTurno}
          open={!!selectedTurno}
          onOpenChange={(open) => !open && setSelectedTurno(null)}
          onEstadoChange={handleEstadoChange} // <-- PASAMOS la función
          puedeModificar={puedeModificar}
          onNuevaConsulta={(paciente) => {
            setPacienteParaConsulta(paciente);
            setOpenNuevaConsulta(true);
          }}
        />
      )}
      {pacienteParaConsulta && (
        <NuevaConsultaDialog
          paciente={{
            ...pacienteParaConsulta,
            id: pacienteParaConsulta.id.toString(), // <-- aquí
            apellido: pacienteParaConsulta.apellido || "",
            dni: pacienteParaConsulta.dni || "",
          }}
          open={openNuevaConsulta}
          onOpenChange={setOpenNuevaConsulta}
          profesionalId={profesionalId} // si quieres pasar el id del profesional
          onConsultaCreada={() => {}}
        />
      )}
    </div>
  );
}
