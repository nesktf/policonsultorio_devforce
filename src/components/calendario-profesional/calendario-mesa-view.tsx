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
  "08:15",
  "08:30",
  "08:45",
  "09:00",
  "09:15",
  "09:30",
  "09:45",
  "10:00",
  "10:15",
  "10:30",
  "10:45",
  "11:00",
  "11:15",
  "11:30",
  "11:45",
  "12:00",
  "12:15",
  "12:30",
  "12:45",
  "13:00",
  "13:15",
  "13:30",
  "13:45",
  "14:00",
  "14:15",
  "14:30",
  "14:45",
  "15:00",
  "15:15",
  "15:30",
  "15:45",
  "16:00",
  "16:15",
  "16:30",
  "16:45",
  "17:00",
  "17:15",
  "17:30",
  "17:45",
  "18:00",
  "18:15",
  "18:30",
  "18:45",
  "19:00",
  "19:15",
  "19:30",
  "19:45",
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

function mapTurnosPorHorario(turnos: Turno[]) {
  const horariosMap = new Map<string, Turno | null>();

  turnos.forEach((turno) => {
    const [horaIni, minIni] = turno.hora.split(":").map(Number);
    const inicio = horaIni * 60 + minIni;
    const fin = inicio + turno.duracion;

    for (let m = inicio; m < fin; m += 15) {
      const h = Math.floor(m / 60)
        .toString()
        .padStart(2, "0");
      const min = (m % 60).toString().padStart(2, "0");
      const horaStr = `${h}:${min}`;

      if (m === inicio) {
        // Solo en el inicio asignamos el turno
        horariosMap.set(horaStr, turno);
      } else {
        // Franjas intermedias ocupadas, sin mostrar turno
        horariosMap.set(horaStr, null);
      }
    }
  });

  return horariosMap;
}

function getHorasOcupadas(turno: Turno) {
  const [horaIni, minIni] = turno.hora.split(":").map(Number);
  const inicio = horaIni * 60 + minIni; // minutos desde 00:00
  const fin = inicio + turno.duracion; // minutos de fin

  const ocupadas: string[] = [];

  for (let m = inicio; m < fin; m += 15) {
    // cada franja de 15 min
    const h = Math.floor(m / 60)
      .toString()
      .padStart(2, "0");
    const min = (m % 60).toString().padStart(2, "0");
    ocupadas.push(`${h}:${min}`);
  }

  return ocupadas;
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
    return turnosFiltrados.filter((t) => getHorasOcupadas(t).includes(hora));
  };

  if (loading) return <p>Cargando turnos...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  const horariosMap = mapTurnosPorHorario(turnosFiltrados);

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          {horarios.map((hora) => {
            const turno = horariosMap.get(hora); // Obtenemos el turno que inicia en esta franja
            const tieneDisponibilidad = !turno && !horariosMap.has(hora); // Si no hay turno ni franja ocupada

            // Si la franja está ocupada pero no es inicio, no mostramos nada
            if (horariosMap.has(hora) && turno === null) return null;

            return (
              <div key={hora} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-20">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm font-medium">
                      {hora}
                    </span>
                  </div>
                  {turno && (
                    <Badge variant="outline" className="text-xs">
                      1 turno
                    </Badge>
                  )}
                </div>

                {tieneDisponibilidad ? (
                  <div className="ml-24 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-sm text-muted-foreground text-center">
                      Sin turnos programados
                    </p>
                  </div>
                ) : turno ? (
                  <div className="ml-24">
                    <TurnoCard
                      turno={turno}
                      onClick={() => setSelectedTurno(turno)}
                      puedeModificar={puedeModificar}
                      onEstadoChange={handleEstadoChange}
                    />
                  </div>
                ) : null}
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
