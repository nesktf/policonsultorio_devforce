"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { CalendarioMesaView } from "@/components/calendario-profesional/calendario-mesa-view";
import { CalendarioOverview } from "@/components/calendario-profesional/calendario-overview";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Grid3x3, ChevronLeft, ChevronRight } from "lucide-react";

type Profesional = {
  id: number;
  nombre: string;
  apellido: string;
};

export default function CalendarioMesaPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<"day" | "overview">("day");
  const [profesional, setProfesional] = useState<Profesional | null>(null);
  const [profesionalError, setProfesionalError] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  // Solución para hidratación: solo renderizar fecha después de montar
  useEffect(() => {
    setMounted(true);
  }, []);

  // Obtener el profesional desde el userId del localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const user = JSON.parse(storedUser);
    const userId = user?.id;

    if (userId) {
      fetch(`/api/v1/profesionales/me?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.nombre && data?.apellido && data?.id) {
            setProfesional({
              id: data.id,
              nombre: data.nombre,
              apellido: data.apellido,
            });
          } else {
            setProfesionalError("Profesional no encontrado");
          }
        })
        .catch((err) => {
          console.error("Error cargando profesional:", err);
          setProfesionalError("Error al cargar profesional");
        });
    }
  }, []);

  const formatDate = (date: Date) => {
    if (!mounted) return ""; // Evita error de hidratación
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
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Mi agenda -{" "}
              {profesional
                ? `${profesional.nombre} ${profesional.apellido}`
                : profesionalError || "Cargando..."}
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
                    {mounted ? formatDate(selectedDate) : "Cargando..."}
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
          profesional ? (
            <CalendarioMesaView
              selectedDate={selectedDate}
              profesionalId={profesional.id}
            />
          ) : (
            <p>Cargando profesional...</p>
          )
        ) : profesional ? (
          <CalendarioOverview
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onViewDay={() => setView("day")}
            profesionalId={profesional.id}
          />
        ) : (
          <p>Cargando profesional...</p>
        )}
      </div>
    </MainLayout>
  );
}