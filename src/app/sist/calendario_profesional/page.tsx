"use client";

import { useState } from "react";
import { CalendarioMesaView } from "@/components/calendario-profesional/calendario-mesa-view";
import { CalendarioOverview } from "@/components/calendario-profesional/calendario-overview";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import {
  Calendar,
  Grid3x3,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const profesionales = [
  { id: "todos", nombre: "Todos los profesionales" },
  { id: "1", nombre: "Dr. Carlos Mendez" },
  { id: "2", nombre: "Dra. María López" },
  { id: "3", nombre: "Dr. Martínez" },
  { id: "4", nombre: "Dra. Rodríguez" },
];

const especialidades = [
  { id: "todas", nombre: "Todas las especialidades" },
  { id: "cardiologia", nombre: "Cardiología" },
  { id: "pediatria", nombre: "Pediatría" },
  { id: "traumatologia", nombre: "Traumatología" },
  { id: "dermatologia", nombre: "Dermatología" },
];

export default function CalendarioMesaPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<"day" | "overview">("day");

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="p-6 space-y-6 pt-16 flex-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Mi agenda - Nombre del profesional
          </h1>
          <p className="text-muted-foreground">
            <span className="text-xs ml-2 text-yellow-600">
              (Solo visualización)
            </span>
          </p>
        </div>

        <Tabs
          value={view}
          onValueChange={(v) => setView(v as "day" | "overview")}
        >
          <TabsList>
            <TabsTrigger value="day" className="gap-2">
              <Grid3x3 className="h-4 w-4" />
              Vista Diaria
            </TabsTrigger>
            <TabsTrigger value="overview" className="gap-2">
              <Calendar className="h-4 w-4" />
              Vista General
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeDate(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[280px]">
                <p className="text-sm font-medium text-foreground capitalize text-center">
                  {formatDate(selectedDate)}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => changeDate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={goToToday}>
              Hoy
            </Button>
          </div>
        </div>
      </Card>

      {/* Content */}
      {view === "day" ? (
        <CalendarioMesaView selectedDate={selectedDate} />
      ) : (
        <CalendarioOverview
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onViewDay={() => setView("day")}
        />
      )}
    </div>
  );
}
