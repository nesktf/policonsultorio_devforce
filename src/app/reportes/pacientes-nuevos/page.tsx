"use client"

import { useState, useEffect, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { exportarReportePacientesNuevos } from "@/utils/pdfExport"
import { useAuth } from "@/context/auth-context"

import { 
  UserPlus,
  Calendar, 
  TrendingUp,
  AlertCircle,
  ArrowLeft,
  Download,
  RefreshCw,
  Users,
  BarChart3,
  PieChart,
  Activity,
  Filter
} from "lucide-react"
import Link from "next/link"
import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

interface PeriodoData {
  id: string
  label: string
  cantidad: number
  fechaInicio: string
  fechaFin: string
}

interface ObraSocialDistribucion {
  nombre: string
  cantidad: number
}

interface ReporteData {
  fechaInicio: string
  fechaFin: string
  total: number
  periodos: PeriodoData[]
  distribucionObrasSociales: ObraSocialDistribucion[]
  promedioDiario: number
  diasAnalizados: number
  mensaje?: string
}

type GroupByOption = "day" | "week" | "month"

interface ObraSocial {
  id: number
  nombre: string
}

const COLORES_GRAFICO = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
]

export default function NuevosPacientesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [reporte, setReporte] = useState<ReporteData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([])
  
  const handleExport = async () => {
  if (reporte) {
    // Obtener el nombre de la obra social si hay filtro
    let obraSocialNombre: string | undefined = undefined
    
    if (obraSocialId !== "todos") {
      if (obraSocialId === "sin-obra-social") {
        obraSocialNombre = "Sin obra social"
      } else {
        const obraSocial = obrasSociales.find(os => os.id.toString() === obraSocialId)
        obraSocialNombre = obraSocial?.nombre
      }
    }
    
    // Crear el objeto con el filtro
    const reporteConFiltro = {
      ...reporte,
      obraSocialFiltro: obraSocialNombre
    }
    
    await exportarReportePacientesNuevos(reporteConFiltro, groupBy)
  }
}

  // Filtros
  const [fechaInicio, setFechaInicio] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 3)
    return date.toISOString().split('T')[0]
  })
  const [fechaFin, setFechaFin] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [obraSocialId, setObraSocialId] = useState<string>("todos")
  const [groupBy, setGroupBy] = useState<GroupByOption>("month")

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }),
    []
  )

  const cargarObrasSociales = async () => {
    try {
      const response = await fetch('/api/v1/obra_social?state_id=1')
      if (response.ok) {
        const data = await response.json()
        setObrasSociales(data.obras_sociales || [])
      }
    } catch (err) {
      console.error('Error cargando obras sociales:', err)
    }
  }

  const cargarReporte = async () => {
    if (!fechaInicio || !fechaFin || fechaInicio.length !== 10 || fechaFin.length !== 10) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        fechaInicio,
        fechaFin,
        groupBy,
      })
      
      if (obraSocialId !== "todos") {
        params.append('obraSocialId', obraSocialId)
      }

      const response = await fetch(`/api/v1/reportes/pacientes-nuevos?${params}`)
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${errorText}`)
      }
      const data = await response.json()
      setReporte(data)
    } catch (err: any) {
      const errorMsg = err.message || 'No se pudo cargar el reporte. Intenta nuevamente.'
      setError(errorMsg)
      console.error('Error completo:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.rol === "GERENTE") {
      cargarObrasSociales()
    }
  }, [user])

  useEffect(() => {
    if (user && user.rol === "GERENTE") {
      cargarReporte()
    }
  }, [fechaInicio, fechaFin, obraSocialId, groupBy, user])

  const periodoConMasPacientes = reporte && reporte.periodos && reporte.periodos.length > 0 ? 
    reporte.periodos.reduce((max, periodo) => periodo.cantidad > max.cantidad ? periodo : max, reporte.periodos[0])
    : null

  const obraSocialPrincipal = reporte && reporte.distribucionObrasSociales && reporte.distribucionObrasSociales.length > 0
    ? reporte.distribucionObrasSociales[0]
    : null

  const obrasSocialesData = useMemo(() => {
    if (!reporte) return []

    return reporte.distribucionObrasSociales
      .filter(os => os.cantidad > 0)
      .map((os, index) => ({
        name: os.nombre,
        value: os.cantidad,
        color: COLORES_GRAFICO[index % COLORES_GRAFICO.length],
        porcentaje: reporte.total > 0 ? (os.cantidad / reporte.total) * 100 : 0
      }))
  }, [reporte])

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

  if (user.rol !== "GERENTE") {
    return (
      <MainLayout>
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-32 space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No tienes permisos para acceder a los reportes.</p>
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

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/reportes">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Reportes
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Reporte de Nuevos Pacientes</h1>
            <p className="text-muted-foreground">Análisis de crecimiento y distribución por obra social</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={cargarReporte}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={handleExport} 
              disabled={!reporte || loading}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Análisis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Fecha Inicio:</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  onKeyDown={(e) => e.preventDefault()}
                  max={fechaFin}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Fecha Fin:</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  onKeyDown={(e) => e.preventDefault()}
                  min={fechaInicio}
                  max={new Date().toISOString().split('T')[0]}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Obra Social:</label>
                <Select value={obraSocialId} onValueChange={setObraSocialId}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas las obras sociales</SelectItem>
                    <SelectItem value="sin-obra-social">Sin obra social</SelectItem>
                    {obrasSociales.map((os) => (
                      <SelectItem key={os.id} value={os.id.toString()}>
                        {os.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="flex items-center gap-2 p-4 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <p className="text-muted-foreground">Cargando reporte...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumen General */}
        {reporte && !loading && (
          <>
            {reporte.mensaje && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-800">{reporte.mensaje}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Pacientes</p>
                      <p className="text-3xl font-bold text-primary">{reporte.total}</p>
                      <p className="text-xs text-muted-foreground mt-1">en el perí­odo</p>
                    </div>
                    <Users className="h-8 w-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Promedio Diario</p>
                      <p className="text-3xl font-bold text-blue-600">{reporte.promedioDiario}</p>
                      <p className="text-xs text-muted-foreground mt-1">pacientes/día</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Perí­odo Pico</p>
                      <p className="text-3xl font-bold text-green-600">
                        {periodoConMasPacientes?.cantidad || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-[120px]">
                        {periodoConMasPacientes?.label || '-'}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">OS Principal</p>
                      <p className="text-lg font-bold text-purple-600 truncate max-w-[120px]">
                        {obraSocialPrincipal?.nombre || 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {obraSocialPrincipal?.cantidad || 0} pacientes
                      </p>
                    </div>
                    <PieChart className="h-8 w-8 text-purple-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights */}
            {periodoConMasPacientes && periodoConMasPacientes.cantidad > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <UserPlus className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">Análisis de Crecimiento</p>
                      <p className="text-sm text-blue-700">
                        <strong>{periodoConMasPacientes.label}</strong> registró la mayor cantidad de pacientes nuevos con{' '}
                        <strong>{periodoConMasPacientes.cantidad} registros</strong>.
                        {obraSocialPrincipal && (
                          <> La obra social con mayor demanda es <strong>{obraSocialPrincipal.nombre}</strong> con{' '}
                          <strong>{obraSocialPrincipal.cantidad} pacientes</strong> ({((obraSocialPrincipal.cantidad / reporte.total) * 100).toFixed(1)}% del total).</>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* GrÃ¡fico de Torta - DistribuciÃ³n por Obra Social */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribución por Obra Social
                </CardTitle>
                <CardDescription>
                  Proporción de pacientes por cobertura
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reporte.distribucionObrasSociales.length === 0 || reporte.total === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay datos disponibles
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-8 lg:flex-row">
                    <div className="w-full lg:w-1/2">
                      <ResponsiveContainer width="100%" height={320}>
                        <RechartsPieChart>
                          <Pie
                            data={obrasSocialesData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={110}
                            dataKey="value"
                            label={({ name, value }) =>
                              `${name}: ${numberFormatter.format(value)}`
                            }
                          >
                            {obrasSocialesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number, name: string) => [
                              numberFormatter.format(value),
                              name,
                            ]}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid w-full gap-4 lg:w-1/2">
                      {obrasSocialesData.map((item) => (
                        <div key={item.name} className="rounded border bg-card p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="h-4 w-4 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="font-semibold">{item.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-foreground">
                                {numberFormatter.format(item.value)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.porcentaje.toFixed(1)}% del total
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* GrÃ¡fico de Barras - DistribuciÃ³n por PerÃ­odo */}
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Distribución Temporal
                    </CardTitle>
                    <CardDescription>
                      Pacientes registrados por perí­odo
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="groupByPeriodo" className="text-sm text-muted-foreground">
                      Agrupación:
                    </label>
                    <select
                      id="groupByPeriodo"
                      value={groupBy}
                      onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
                      className="rounded border px-3 py-1 text-sm"
                    >
                      <option value="day">Diaria</option>
                      <option value="week">Semanal</option>
                      <option value="month">Mensual</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!reporte.periodos || reporte.total === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay datos para el perí­odo seleccionado
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reporte.periodos.map((periodo, index) => {
                      const porcentaje = reporte.total > 0 
                        ? ((periodo.cantidad / reporte.total) * 100).toFixed(1)
                        : "0"
                      const maxCantidad = Math.max(...reporte.periodos.map(p => p.cantidad))
                      const anchoBarra = maxCantidad > 0 
                        ? (periodo.cantidad / maxCantidad) * 100
                        : 0
                      const esMejorPeriodo = periodo.cantidad === periodoConMasPacientes?.cantidad && periodo.cantidad > 0

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold min-w-[200px] truncate">{periodo.label}</span>
                              {esMejorPeriodo && (
                                <Badge variant="default" className="gap-1 text-xs">
                                  <TrendingUp className="h-3 w-3" />
                                  Pico
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-foreground">
                                {numberFormatter.format(periodo.cantidad)}
                              </span>
                              <span className="text-sm text-muted-foreground w-16 text-right">
                                {porcentaje}%
                              </span>
                            </div>
                          </div>
                          <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                            <div 
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out flex items-center justify-end px-3"
                              style={{ width: `${anchoBarra}%` }}
                            >
                              {periodo.cantidad > 0 && anchoBarra > 15 && (
                                <span className="text-xs text-white font-semibold">
                                  {numberFormatter.format(periodo.cantidad)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  )
}