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
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  XCircle,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Download,
  Filter,
  Loader2
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

interface ProfesionalStats {
  id: number
  nombre: string
  apellido: string
  especialidad: string
  asistidos: number
  cancelados: number
  ausentes: number
  total: number
  porcentajeAsistencia: number
  porcentajeCancelacion: number
}

interface Profesional {
  id: number
  nombre: string
  apellido: string
  especialidad: string
}

export default function TurnosProfesionalPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [profesionales, setProfesionales] = useState<Profesional[]>([])
  const [statsData, setStatsData] = useState<ProfesionalStats[]>([])
  const [filteredData, setFilteredData] = useState<ProfesionalStats[]>([])
  
  // Filtros
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState<string>("todos")

  // Control de permisos
  if (!user || user.rol !== "GERENTE") {
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
    cargarProfesionales()
    // Establecer fechas por defecto (último mes)
    const hoy = new Date()
    const hace30Dias = new Date(hoy.getTime() - (30 * 24 * 60 * 60 * 1000))
    
    setFechaInicio(hace30Dias.toISOString().split('T')[0])
    setFechaFin(hoy.toISOString().split('T')[0])
  }, [])

  // Cargar datos cuando cambien los filtros
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      cargarDatosReporte()
    }
  }, [fechaInicio, fechaFin, profesionalSeleccionado])

  const cargarProfesionales = async () => {
    try {
      const response = await fetch('/api/v1/profesionales')
      if (response.ok) {
        const data = await response.json()
        setProfesionales(data.profesionales || [])
      }
    } catch (error) {
      console.error('Error al cargar profesionales:', error)
    }
  }

  const cargarDatosReporte = async () => {
    if (!fechaInicio || !fechaFin) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        fechaInicio,
        fechaFin,
        ...(profesionalSeleccionado !== "todos" && { profesionalId: profesionalSeleccionado })
      })

      const response = await fetch(`/api/v1/reportes/turnos-profesional?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setStatsData(data.stats || [])
        setFilteredData(data.stats || [])
      } else {
        throw new Error('Error al cargar datos del reporte')
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del reporte",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Datos para el gráfico
  const chartData = filteredData.map(stat => ({
    nombre: `${stat.nombre} ${stat.apellido}`,
    especialidad: stat.especialidad,
    Asistidos: stat.asistidos,
    Cancelados: stat.cancelados,
    Ausentes: stat.ausentes
  }))

  // Métricas generales
  const totalTurnos = filteredData.reduce((sum, stat) => sum + stat.total, 0)
  const totalAsistidos = filteredData.reduce((sum, stat) => sum + stat.asistidos, 0)
  const totalCancelados = filteredData.reduce((sum, stat) => sum + stat.cancelados, 0)
  const totalAusentes = filteredData.reduce((sum, stat) => sum + stat.ausentes, 0)
  const promedioAsistencia = filteredData.length > 0 
    ? filteredData.reduce((sum, stat) => sum + stat.porcentajeAsistencia, 0) / filteredData.length
    : 0

  const exportarDatos = () => {
    // Implementar exportación CSV
    const csv = [
      ['Profesional', 'Especialidad', 'Asistidos', 'Cancelados', 'Ausentes', 'Total', '% Asistencia'].join(','),
      ...filteredData.map(stat => [
        `${stat.nombre} ${stat.apellido}`,
        stat.especialidad,
        stat.asistidos,
        stat.cancelados,
        stat.ausentes,
        stat.total,
        `${stat.porcentajeAsistencia.toFixed(1)}%`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', `reporte-profesionales-${fechaInicio}-${fechaFin}.csv`)
    a.click()
  }

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
            <h1 className="text-3xl font-bold text-foreground">Desempeño por Profesional</h1>
            <p className="text-muted-foreground">
              Análisis de turnos atendidos, cancelaciones y ausencias por profesional médico
            </p>
          </div>
          <Button onClick={exportarDatos} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
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
                <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha Fin</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profesional">Profesional</Label>
                <Select value={profesionalSeleccionado} onValueChange={setProfesionalSeleccionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar profesional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los profesionales</SelectItem>
                    {profesionales.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id.toString()}>
                        {prof.nombre} {prof.apellido} - {prof.especialidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
            {/* Métricas Generales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Turnos</p>
                      <p className="text-3xl font-bold text-primary">{totalTurnos}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Asistidos</p>
                      <p className="text-3xl font-bold text-green-600">{totalAsistidos}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Cancelados</p>
                      <p className="text-3xl font-bold text-orange-600">{totalCancelados}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-orange-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">% Asistencia Promedio</p>
                      <p className="text-3xl font-bold text-blue-600">{promedioAsistencia.toFixed(1)}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Barras */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Distribución de Turnos por Profesional
                </CardTitle>
                <CardDescription>
                  Comparativa de turnos asistidos, cancelados y ausentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="nombre" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [value, name]}
                        labelFormatter={(label) => `Profesional: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="Asistidos" fill="#10b981" name="Asistidos" />
                      <Bar dataKey="Cancelados" fill="#f59e0b" name="Cancelados" />
                      <Bar dataKey="Ausentes" fill="#ef4444" name="Ausentes" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Tabla de Indicadores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Indicadores de Productividad
                </CardTitle>
                <CardDescription>
                  Detalle de desempeño por cada profesional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold">Profesional</th>
                        <th className="text-left p-4 font-semibold">Especialidad</th>
                        <th className="text-center p-4 font-semibold">Asistidos</th>
                        <th className="text-center p-4 font-semibold">Cancelados</th>
                        <th className="text-center p-4 font-semibold">Ausentes</th>
                        <th className="text-center p-4 font-semibold">Total</th>
                        <th className="text-center p-4 font-semibold">% Asistencia</th>
                        <th className="text-center p-4 font-semibold">% Cancelación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((stat) => (
                        <tr key={stat.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{stat.nombre} {stat.apellido}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">{stat.especialidad}</Badge>
                          </td>
                          <td className="text-center p-4">
                            <span className="text-green-600 font-semibold">{stat.asistidos}</span>
                          </td>
                          <td className="text-center p-4">
                            <span className="text-orange-600 font-semibold">{stat.cancelados}</span>
                          </td>
                          <td className="text-center p-4">
                            <span className="text-red-600 font-semibold">{stat.ausentes}</span>
                          </td>
                          <td className="text-center p-4">
                            <span className="font-semibold">{stat.total}</span>
                          </td>
                          <td className="text-center p-4">
                            <Badge 
                              variant={stat.porcentajeAsistencia >= 85 ? "default" : 
                                     stat.porcentajeAsistencia >= 70 ? "secondary" : "destructive"}
                            >
                              {stat.porcentajeAsistencia.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="text-center p-4">
                            <Badge 
                              variant={stat.porcentajeCancelacion <= 10 ? "default" : 
                                     stat.porcentajeCancelacion <= 20 ? "secondary" : "destructive"}
                            >
                              {stat.porcentajeCancelacion.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredData.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No hay datos para el período seleccionado</p>
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