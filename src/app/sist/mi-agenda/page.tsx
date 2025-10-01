"use client";

import { useState, useEffect } from "react";
import { TurnosCalendar } from "@/components/turnos/turnos-calendar";
import { NuevoTurnoDialog } from "@/components/turnos/nuevo-turno-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { hasPermission, getAccessDeniedMessage } from "@/lib/permissions";
import { Plus, Calendar, Clock, Users, AlertCircle } from "lucide-react";

interface User {
  nombre: string;
  apellido: string;
  rol: "MESA_ENTRADA" | "PROFESIONAL" | "GERENTE";
}

export default function MiAgendaPage() {
  const [user, setUser] = useState<User | null>(null);
  const [showNuevoTurno, setShowNuevoTurno] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error al parsear el usuario:", err);
      }
    }
  }, []);

  if (!user) return null; // Esperamos a que user exista

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">
              Debes iniciar sesión para acceder a esta sección.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedProfesional = user.nombre; // Usar ID en lugar de nombre
  const selectedEspecialidad = user.rol?.toLowerCase() || "todas";

  return (
    <div className="p-6 space-y-6 pt-16">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mi Agenda</h1>
          <p className="text-muted-foreground">
            Gestiona tus citas médicas - {user.rol || "Profesional"}
          </p>
        </div>
        <Button onClick={() => setShowNuevoTurno(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Turno
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hoy</p>
              <p className="text-2xl font-bold text-foreground">
                {new Date().toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Próximo Turno
              </p>
              <p className="text-lg font-bold text-foreground">08:30</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Especialidad
              </p>
              <p className="text-lg font-bold text-foreground">
                {user.rol || "N/A"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Turnos Hoy
              </p>
              <p className="text-2xl font-bold text-foreground">6</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Date Filter - Solo fecha, sin filtros de profesional */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Fecha:</span>
          </div>
          <input
            type="date"
            value={selectedDate.toISOString().split("T")[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-3 py-2 border border-border rounded-md text-sm"
          />
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">
              Mostrando turnos de: <strong>{user.nombre}</strong>
            </span>
          </div>
        </div>
      </Card>

      {/* Calendar - Filtrado automáticamente para el profesional actual */}
      <TurnosCalendar
        selectedDate={selectedDate}
        selectedProfesional={selectedProfesional}
        selectedEspecialidad={selectedEspecialidad}
        onNuevoTurno={() => setShowNuevoTurno(true)}
      />

      {/* Nuevo Turno Dialog - Solo si tiene permisos */}
      <NuevoTurnoDialog
        open={showNuevoTurno}
        onOpenChange={setShowNuevoTurno}
        defaultDate={selectedDate}
        defaultProfesional={user.nombre}
      />
    </div>
  );
}
