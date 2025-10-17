"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserCheck,
  BarChart3,
  Download,
  Filter,
  Loader2,
  CalendarDays,
  Users
} from "lucide-react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

interface TurnoProgramado {
  id: number
  fecha: string
  hora: string
  paciente: {
    nombre: string
    apellido: string
    dni: string
    telefono: string
  }
  profesional: {
    nombre: string
    apellido: string
    especialidad: string
  }
  estado: string
  duracionMinutos: number
}

interface EspecialidadStats {
  especialidad: string
  cantidad: number
  color: string
}

export default function AgendaDiariaPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [turnos, setTurnos] = useState<TurnoProgramado[]>([])
  const [especialidadStats, setEspecialidadStats] = useState<EspecialidadStats[]>([])
  
  // Filtros
  const [fechaSeleccionada, setFechaSeleccionada] = useState("")
  const [especialidadFiltro, setEspecialidadFiltro] = useState<string>("todas")
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos")

  // Control de permisos - Permitir MESA_ENTRADA y GERENTE
  if (!user || (user.rol !== "MESA_ENTRADA" && user.rol !== "GERENTE")) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-32 space-y-4">
              <AlertTriangle className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No tienes permisos para acceder a este reporte.</p>
              <Link href="/reportes">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver a Reportes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  // Cargar datos iniciales
  useEffect(() => {
    // Establecer fecha de hoy por defecto
    const hoy = new Date()
    setFechaSeleccionada(hoy.toISOString().split('T')[0])
  }, [])

  // Cargar datos cuando cambien los filtros
  useEffect(() => {
    if (fechaSeleccionada) {
      cargarAgendaDiaria()
    }
  }, [fechaSeleccionada, especialidadFiltro, estadoFiltro])

  const cargarAgendaDiaria = async () => {
    if (!fechaSeleccionada) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        fecha: fechaSeleccionada,
        ...(especialidadFiltro !== "todas" && { especialidad: especialidadFiltro }),
        ...(estadoFiltro !== "todos" && { estado: estadoFiltro })
      })

      const response = await fetch(`/api/v1/reportes/agenda-diaria?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setTurnos(data.turnos || [])
        setEspecialidadStats(data.especialidadStats || [])
      } else {
        throw new Error('Error al cargar agenda diaria')
      }
    } catch (error) {
      console.error('Error al cargar agenda:', error)
      toast({
        title: "Error",
        description: "No se pudo cargar la agenda diaria",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'PROGRAMADO':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Programado</Badge>
      case 'EN_SALA_ESPERA':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">En Sala</Badge>
      case 'ASISTIO':
        return <Badge variant="default" className="bg-green-100 text-green-800">Asistió</Badge>
      case 'NO_ASISTIO':
        return <Badge variant="destructive">No Asistió</Badge>
      case 'CANCELADO':
        return <Badge variant="secondary">Cancelado</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const formatearHora = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    })
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const exportarAgenda = () => {
    const csv = [
      ['Hora', 'Paciente', 'DNI', 'Teléfono', 'Profesional', 'Especialidad', 'Estado'].join(','),
      ...turnos.map(turno => [
        formatearHora(turno.fecha),
        `${turno.paciente.apellido}, ${turno.paciente.nombre}`,
        turno.paciente.dni,
        turno.paciente.telefono,
        `${turno.profesional.apellido}, ${turno.profesional.nombre}`,
        turno.profesional.especialidad,
        turno.estado
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', `agenda-${fechaSeleccionada}.csv`)
    a.click()
  }

  // Especialidades únicas para el filtro
  const especialidadesUnicas = Array.from(
    new Set(turnos.map(t => t.profesional.especialidad))
  ).sort()

  // Datos para el gráfico
  const chartData = especialidadStats.map(stat => ({
    especialidad: stat.especialidad,
    cantidad: stat.cantidad
  }))

  // Métricas del día
  const totalTurnos = turnos.length
  const turnosCompletados = turnos.filter(t => t.estado === 'ASISTIO').length
  const turnosEnEspera = turnos.filter(t => t.estado === 'EN_SALA_ESPERA').length
  const turnosProgramados = turnos.filter(t => t.estado === 'PROGRAMADO').length

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/reportes" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a Reportes
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Agenda Diaria</h1>
            <p className="text-muted-foreground">
              Organización de turnos programados para coordinación de mesa de entrada
            </p>
          </div>
          <Button onClick={exportarAgenda} variant="outline" className="gap-2" disabled={turnos.length === 0}>
            <Download className="h-4 w-4" />
            Exportar Agenda
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={fechaSeleccionada}
                  onChange={(e) => setFechaSeleccionada(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="especialidad">Especialidad</Label>
                <Select value={especialidadFiltro} onValueChange={setEspecialidadFiltro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las especialidades</SelectItem>
                    {especialidadesUnicas.map((esp) => (
                      <SelectItem key={esp} value={esp}>
                        {esp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="PROGRAMADO">Programado</SelectItem>
                    <SelectItem value="EN_SALA_ESPERA">En Sala de Espera</SelectItem>
                    <SelectItem value="ASISTIO">Asistió</SelectItem>
                    <SelectItem value="NO_ASISTIO">No Asistió</SelectItem>
                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {fechaSeleccionada && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  Agenda para: <span className="font-medium">{formatearFecha(fechaSeleccionada)}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Métricas del Día */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Turnos</p>
                      <p className="text-3xl font-bold text-primary">{totalTurnos}</p>
                    </div>
                    <CalendarDays className="h-8 w-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Programados</p>
                      <p className="text-3xl font-bold text-blue-600">{turnosProgramados}</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">En Sala</p>
                      <p className="text-3xl font-bold text-yellow-600">{turnosEnEspera}</p>
                    </div>
                    <Users className="h-8 w-8 text-yellow-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completados</p>
                      <p className="text-3xl font-bold text-green-600">{turnosCompletados}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico por Especialidad */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Turnos por Especialidad
                  </CardTitle>
                  <CardDescription>
                    Distribución de turnos del día seleccionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="especialidad" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [value, "Turnos"]}
                          labelFormatter={(label) => `Especialidad: ${label}`}
                        />
                        <Bar dataKey="cantidad" fill="#3b82f6" name="Turnos" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabla de Turnos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Agenda Detallada
                </CardTitle>
                <CardDescription>
                  Listado completo de turnos para el día seleccionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold">Hora</th>
                        <th className="text-left p-4 font-semibold">Paciente</th>
                        <th className="text-left p-4 font-semibold">DNI</th>
                        <th className="text-left p-4 font-semibold">Teléfono</th>
                        <th className="text-left p-4 font-semibold">Profesional</th>
                        <th className="text-left p-4 font-semibold">Especialidad</th>
                        <th className="text-center p-4 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {turnos
                        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                        .map((turno) => (
                        <tr key={turno.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">{formatearHora(turno.fecha)}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {turno.paciente.apellido}, {turno.paciente.nombre}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-muted-foreground">{turno.paciente.dni}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-muted-foreground">{turno.paciente.telefono}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {turno.profesional.apellido}, {turno.profesional.nombre}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Stethoscope className="h-3 w-3" />
                              {turno.profesional.especialidad}
                            </Badge>
                          </td>
                          <td className="text-center p-4">
                            {getEstadoBadge(turno.estado)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {turnos.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No hay turnos programados para esta fecha</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Selecciona otra fecha o verifica los filtros aplicados
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  )
}