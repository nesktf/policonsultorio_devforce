"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { CalendarioMesaView } from "@/components/calendario-mesa/calendario-mesa-view"
import { CalendarioOverview } from "@/components/calendario-mesa/calendario-overview"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { Calendar, Grid3x3, ChevronLeft, ChevronRight, Filter, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

const profesionales = [
  { id: "todos", nombre: "Todos los profesionales" },
  { id: "1", nombre: "Dr. Carlos Mendez" },
  { id: "2", nombre: "Dra. María López" },
  { id: "3", nombre: "Dr. Martínez" },
  { id: "4", nombre: "Dra. Rodríguez" },
]

const especialidades = [
  { id: "todas", nombre: "Todas las especialidades" },
  { id: "cardiologia", nombre: "Cardiología" },
  { id: "pediatria", nombre: "Pediatría" },
  { id: "traumatologia", nombre: "Traumatología" },
  { id: "dermatologia", nombre: "Dermatología" },
]


export default function CalendarioMesaPage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedProfesional, setSelectedProfesional] = useState<string>("todos")
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string>("todas")
  const [view, setView] = useState<"day" | "overview">("day")

  // Control de permisos
  if (!user) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Debes iniciar sesión para acceder a esta sección.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  // Solo mesa de entrada y gerente pueden acceder al calendario
  if (user.role === "profesional") {
    return (
      <MainLayout>
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-32 space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No tienes permisos para acceder al calendario de turnos.</p>
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver al Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calendario de Turnos</h1>
            <p className="text-muted-foreground">
              Gestión de turnos
              {user.role === "gerente" && (
                <span className="text-xs ml-2 text-yellow-600">(Solo visualización)</span>
              )}
            </p>
          </div>
          
          <Tabs value={view} onValueChange={(v) => setView(v as "day" | "overview")}>
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
                <Button variant="outline" size="sm" onClick={() => changeDate(-1)}>
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

            {/* Filters */}
            <div className="flex items-center gap-2 flex-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedProfesional} onValueChange={setSelectedProfesional}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Seleccionar profesional" />
                </SelectTrigger>
                <SelectContent>
                  {profesionales.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedEspecialidad} onValueChange={setSelectedEspecialidad}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Seleccionar especialidad" />
                </SelectTrigger>
                <SelectContent>
                  {especialidades.map((esp) => (
                    <SelectItem key={esp.id} value={esp.id}>
                      {esp.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Content */}
        {view === "day" ? (
          <CalendarioMesaView
            selectedDate={selectedDate}
            selectedProfesional={selectedProfesional}
            selectedEspecialidad={selectedEspecialidad}
          />
        ) : (
          <CalendarioOverview
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onViewDay={() => setView("day")}
          />
        )}
      </div>
    </MainLayout>
  )
}