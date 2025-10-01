"use client";

import { useState } from "react";
import { TurnosCalendar } from "@/components/turnos/turnos-calendar";
import { NuevoTurnoDialog } from "@/components/turnos/nuevo-turno-dialog";
import { TurnosFilters } from "@/components/turnos/turnos-filters";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { hasPermission, getAccessDeniedMessage } from "@/lib/permissions";
import { Plus, AlertCircle } from "lucide-react";

export default function TurnosPage() {
  const { user } = useAuth();
  const [showNuevoTurno, setShowNuevoTurno] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProfesional, setSelectedProfesional] =
    useState<string>("todos");
  const [selectedEspecialidad, setSelectedEspecialidad] =
    useState<string>("todas");

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

  if (user.role === "profesional") {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground text-center">
              {getAccessDeniedMessage(user.role, "turnos-todos")}
            </p>
            <p className="text-sm text-muted-foreground">
              Puedes acceder a tu agenda personal desde el menú "Mi Agenda".
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canCreateTurnos = hasPermission(user.role, "canCreateTurnos");

  return (
    <div className="p-6 space-y-6 pt-16 flex-1">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {user.role === "gerente"
              ? "Gestión de Turnos"
              : "Turnos del Policonsultorio"}
          </h1>
          <p className="text-muted-foreground">
            {user.role === "gerente"
              ? "Administra y programa citas médicas de manera eficiente"
              : "Visualiza y gestiona los turnos de todos los profesionales"}
          </p>
        </div>
        {canCreateTurnos && (
          <Button onClick={() => setShowNuevoTurno(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Turno
          </Button>
        )}
      </div>

      {/* Filters */}
      <TurnosFilters
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedProfesional={selectedProfesional}
        onProfesionalChange={setSelectedProfesional}
        selectedEspecialidad={selectedEspecialidad}
        onEspecialidadChange={setSelectedEspecialidad}
      />

      {/* Calendar */}
      <TurnosCalendar
        selectedDate={selectedDate}
        selectedProfesional={selectedProfesional}
        selectedEspecialidad={selectedEspecialidad}
        onNuevoTurno={
          canCreateTurnos ? () => setShowNuevoTurno(true) : undefined
        }
      />

      {/* Nuevo Turno Dialog */}
      {canCreateTurnos && (
        <NuevoTurnoDialog
          open={showNuevoTurno}
          onOpenChange={setShowNuevoTurno}
          defaultDate={selectedDate}
        />
      )}
    </div>
  );
}
