"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarioOverviewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onViewDay: () => void;
  profesionalId: number;
}

interface Turno {
  id: string;
  fecha: string; // ISO
  estado:
    | "PROGRAMADO"
    | "EN_SALA_ESPERA"
    | "ASISTIO"
    | "NO_ASISTIO"
    | "CANCELADO";
}

type ResumenDia = {
  total: number;
  programados: number;
  enSalaEspera: number;
  asistidos: number;
  noAsistidos: number;
  cancelados: number;
};

export function CalendarioOverview({
  selectedDate,
  onDateSelect,
  onViewDay,
  profesionalId,
}: CalendarioOverviewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [turnosPorDia, setTurnosPorDia] = useState<Record<string, ResumenDia>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para agrupar estados por día (clave: yyyy-mm-dd)
  const agruparEstados = (turnos: Turno[]): Record<string, ResumenDia> => {
    const resumen: Record<string, ResumenDia> = {};

    for (const t of turnos) {
      const fecha = new Date(t.fecha);
      const dateKey = fecha.toISOString().split("T")[0]; // yyyy-mm-dd

      if (!resumen[dateKey]) {
        resumen[dateKey] = {
          total: 0,
          programados: 0,
          enSalaEspera: 0,
          asistidos: 0,
          noAsistidos: 0,
          cancelados: 0,
        };
      }

      resumen[dateKey].total += 1;

      switch (t.estado) {
        case "PROGRAMADO":
          resumen[dateKey].programados += 1;
          break;
        case "EN_SALA_ESPERA":
          resumen[dateKey].enSalaEspera += 1;
          break;
        case "ASISTIO":
          resumen[dateKey].asistidos += 1;
          break;
        case "NO_ASISTIO":
          resumen[dateKey].noAsistidos += 1;
          break;
        case "CANCELADO":
          resumen[dateKey].cancelados += 1;
          break;
      }
    }

    return resumen;
  };

  // Fetch de turnos del mes
  useEffect(() => {
    if (!profesionalId) return;

    async function fetchTurnos() {
      setLoading(true);
      setError(null);

      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth(); // 0-indexed

        const from = new Date(Date.UTC(year, month, 1));
        const to = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));

        const fromStr = from.toISOString();
        const toStr = to.toISOString();

        const res = await fetch(
          `/api/v1/turnos?profesionalId=${profesionalId}&from=${fromStr}&to=${toStr}`
        );

        if (!res.ok) throw new Error("Error al cargar turnos");

        const data = await res.json();
        const resumen = agruparEstados(data.turnos || []);
        setTurnosPorDia(resumen);
      } catch (err: any) {
        setError(err.message || "Error desconocido");
        setTurnosPorDia({});
      } finally {
        setLoading(false);
      }
    }

    fetchTurnos();
  }, [currentMonth, profesionalId]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = domingo

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } =
    getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1));
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(year, month, day);
    onDateSelect(newDate);
    onViewDay();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const getTurnosDelDia = (day: number): ResumenDia | null => {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return turnosPorDia[dateKey] || null;
  };

  const monthName = currentMonth.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  const days: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold capitalize">{monthName}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((dia) => (
          <div
            key={dia}
            className="text-center text-sm font-medium text-muted-foreground p-2"
          >
            {dia}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (day === null)
            return <div key={`empty-${index}`} className="aspect-square" />;

          const resumen = getTurnosDelDia(day);
          const today = isToday(day);

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`
                aspect-square p-2 rounded-lg border-2 transition-all hover:shadow-md
                ${
                  today
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }
                ${resumen ? "bg-blue-50" : "bg-background"}
              `}
            >
              <div className="flex flex-col items-center justify-center h-full space-y-1">
                <span
                  className={`text-sm font-medium ${
                    today ? "text-primary font-bold" : ""
                  }`}
                >
                  {day}
                </span>

                {resumen && (
                  <div className="space-y-0.5 w-full">
                    <Badge
                      variant="outline"
                      className="text-xs px-1 py-0 w-full justify-center bg-primary/10"
                    >
                      {resumen.total} turnos
                    </Badge>

                    <div className="flex gap-0.5 justify-center">
                      {resumen.programados > 0 && (
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-blue-500"
                          title={`${resumen.programados} programados`}
                        />
                      )}
                      {resumen.enSalaEspera > 0 && (
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-yellow-500"
                          title={`${resumen.enSalaEspera} en sala`}
                        />
                      )}
                      {resumen.asistidos > 0 && (
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-green-500"
                          title={`${resumen.asistidos} asistidos`}
                        />
                      )}
                      {resumen.noAsistidos > 0 && (
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-orange-500"
                          title={`${resumen.noAsistidos} no asistidos`}
                        />
                      )}
                      {resumen.cancelados > 0 && (
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-red-500"
                          title={`${resumen.cancelados} cancelados`}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Programados</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>En Sala de Espera</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Asistidos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>No Asistidos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Cancelados</span>
          </div>
        </div>
      </div>

      {loading && (
        <p className="mt-4 text-sm text-muted-foreground">Cargando turnos...</p>
      )}
      {error && <p className="mt-4 text-sm text-red-500">Error: {error}</p>}
    </Card>
  );
}