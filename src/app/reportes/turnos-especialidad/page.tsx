"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  Activity,
  AlertCircle,
  ArrowLeft,
  Download,
  RefreshCw,
  Stethoscope,
  CheckCircle,
  XCircle,
  Clock,
  UserX
} from "lucide-react"
import Link from "next/link"

interface EspecialidadData {
  especialidad: string
  total: number
  programados: number
  enSalaEspera: number
  asistidos: number
  noAsistidos: number
  cancelados: number
}

interface ReporteData {
  rango: {
    from: string
    to: string
  }
  totalEspecialidades: number
  totalTurnos: number
  resultados: EspecialidadData[]
}

export default function ReporteTurnosPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [reporte, setReporte] = useState<ReporteData | null>(null)
  const [rangoSeleccionado, setRangoSeleccionado] = useState<string>("ultimos-30-dias")
  const [error, setError] = useState<string | null>(null)

  const obtenerRangoFechas = (rango: string) => {
    const hoy = new Date()
    let from: Date
    let to: Date

    if (rango.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = rango.split('-').map(Number)
      from = new Date(year, month - 1, 1)
      to = new Date(year, month, 0)
    } else {
      switch (rango) {
        case "ultimos-30-dias":
          to = new Date(hoy)
          from = new Date(hoy)
          from.setDate(hoy.getDate() - 30)
          break
        case "anio-actual":
          from = new Date(hoy.getFullYear(), 0, 1)
          to = new Date(hoy.getFullYear(), 11, 31)
          break
        default:
          to = new Date(hoy)
          from = new Date(hoy)
          from.setDate(hoy.getDate() - 30)
      }
    }

    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    }
  }

  const generarOpcionesMeses = () => {
    const meses = []
    const hoy = new Date()
    const nombresMeses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    for (let i = 11; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
      const year = fecha.getFullYear()
      const month = fecha.getMonth()
      const valor = `${year}-${String(month + 1).padStart(2, '0')}`
      const label = `${nombresMeses[month]} ${year}`
      meses.push({ valor, label })
    }

    return meses
  }

  const opcionesMeses = generarOpcionesMeses()

  const cargarReporte = async () => {
    setLoading(true)
    setError(null)

    try {
      const { from, to } = obtenerRangoFechas(rangoSeleccionado)
      
      const response = await fetch(`/api/v1/reportes/turnos-especialidad?from=${from}&to=${to}`)
      
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
      cargarReporte()
    }
  }, [rangoSeleccionado, user])

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

  const calcularPorcentaje = (valor: number, total: number) => {
    if (total === 0) return "0.0"
    return ((valor / total) * 100).toFixed(1)
  }

  const especialidadConMasTurnos = reporte && reporte.resultados.length > 0 ? 
    reporte.resultados.reduce((max, esp) => esp.total > max.total ? esp : max, reporte.resultados[0])
    : null

  const totales = reporte ? {
    programados: reporte.resultados.reduce((sum, esp) => sum + esp.programados, 0),
    enSalaEspera: reporte.resultados.reduce((sum, esp) => sum + esp.enSalaEspera, 0),
    asistidos: reporte.resultados.reduce((sum, esp) => sum + esp.asistidos, 0),
    noAsistidos: reporte.resultados.reduce((sum, esp) => sum + esp.noAsistidos, 0),
    cancelados: reporte.resultados.reduce((sum, esp) => sum + esp.cancelados, 0),
  } : null

  const tasaAsistencia = totales && reporte ? 
    calcularPorcentaje(totales.asistidos, reporte.totalTurnos) : "0"

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
            <h1 className="text-3xl font-bold text-foreground">Reporte de Turnos por Especialidad</h1>
            <p className="text-muted-foreground">Análisis estadístico de turnos médicos</p>
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
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Período de Análisis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select value={rangoSeleccionado} onValueChange={setRangoSeleccionado}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Seleccionar mes" />
                </SelectTrigger>
                <SelectContent>
                  {opcionesMeses.map((mes) => (
                    <SelectItem key={mes.valor} value={mes.valor}>
                      {mes.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="anio-actual">Año Completo {new Date().getFullYear()}</SelectItem>
                </SelectContent>
              </Select>
              {reporte && (
                <div className="text-sm text-muted-foreground">
                  Desde {new Date(reporte.rango.from).toLocaleDateString('es-AR')} hasta{' '}
                  {new Date(reporte.rango.to).toLocaleDateString('es-AR')}
                </div>
              )}
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
        {reporte && !loading && totales && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Turnos</p>
                      <p className="text-3xl font-bold text-primary">{reporte.totalTurnos}</p>
                    </div>
                    <Activity className="h-8 w-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Programados</p>
                      <p className="text-3xl font-bold text-blue-600">{totales.programados}</p>
                      <p className="text-xs text-muted-foreground">{calcularPorcentaje(totales.programados, reporte.totalTurnos)}%</p>
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
                      <p className="text-3xl font-bold text-yellow-600">{totales.enSalaEspera}</p>
                      <p className="text-xs text-muted-foreground">{calcularPorcentaje(totales.enSalaEspera, reporte.totalTurnos)}%</p>
                    </div>
                    <Stethoscope className="h-8 w-8 text-yellow-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Asistidos</p>
                      <p className="text-3xl font-bold text-green-600">{totales.asistidos}</p>
                      <p className="text-xs text-muted-foreground">{tasaAsistencia}%</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">No Asistidos</p>
                      <p className="text-3xl font-bold text-orange-600">{totales.noAsistidos}</p>
                      <p className="text-xs text-muted-foreground">{calcularPorcentaje(totales.noAsistidos, reporte.totalTurnos)}%</p>
                    </div>
                    <UserX className="h-8 w-8 text-orange-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Cancelados</p>
                      <p className="text-3xl font-bold text-red-600">{totales.cancelados}</p>
                      <p className="text-xs text-muted-foreground">{calcularPorcentaje(totales.cancelados, reporte.totalTurnos)}%</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights */}
            {especialidadConMasTurnos && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">Especialidad más demandada</p>
                      <p className="text-sm text-blue-700">
                        <strong>{especialidadConMasTurnos.especialidad}</strong> lidera con{' '}
                        <strong>{especialidadConMasTurnos.total} turnos</strong> (
                        {calcularPorcentaje(especialidadConMasTurnos.total, reporte.totalTurnos)}% del total)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabla de Especialidades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Desglose por Especialidad
                </CardTitle>
                <CardDescription>
                  Comparativa detallada de turnos por especialidad médica
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reporte.resultados.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay datos para el período seleccionado
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reporte.resultados
                      .sort((a, b) => b.total - a.total)
                      .map((esp, index) => {
                        const porcentajeTotal = calcularPorcentaje(esp.total, reporte.totalTurnos)

                        return (
                          <div key={index} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-bold text-primary">#{index + 1}</span>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">{esp.especialidad}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {porcentajeTotal}% del total de turnos
                                  </p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-lg px-4 py-1">
                                {esp.total} turnos
                              </Badge>
                            </div>

                            {/* Barra de progreso con colores más suaves */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden flex">
                                  {esp.programados > 0 && (
                                    <div 
                                      className="bg-blue-300 flex items-center justify-center text-xs text-blue-800 font-medium"
                                      style={{ width: `${calcularPorcentaje(esp.programados, esp.total)}%` }}
                                    />
                                  )}
                                  {esp.enSalaEspera > 0 && (
                                    <div 
                                      className="bg-yellow-200 flex items-center justify-center text-xs text-amber-800 font-medium"
                                      style={{ width: `${calcularPorcentaje(esp.enSalaEspera, esp.total)}%` }}
                                    />
                                  )}
                                  {esp.asistidos > 0 && (
                                    <div 
                                      className="bg-green-300 flex items-center justify-center text-xs text-emerald-800 font-medium"
                                      style={{ width: `${calcularPorcentaje(esp.asistidos, esp.total)}%` }}
                                    />
                                  )}
                                  {esp.noAsistidos > 0 && (
                                    <div 
                                      className="bg-orange-300 flex items-center justify-center text-xs text-orange-800 font-medium"
                                      style={{ width: `${calcularPorcentaje(esp.noAsistidos, esp.total)}%` }}
                                    />
                                  )}
                                  {esp.cancelados > 0 && (
                                    <div 
                                      className="bg-red-300 flex items-center justify-center text-xs text-rose-800 font-medium"
                                      style={{ width: `${calcularPorcentaje(esp.cancelados, esp.total)}%` }}
                                    />
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-blue-300 rounded-full" />
                                  <span className="text-muted-foreground">Programados:</span>
                                  <span className="font-semibold">{esp.programados}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-yellow-200 rounded-full" />
                                  <span className="text-muted-foreground">En Sala:</span>
                                  <span className="font-semibold">{esp.enSalaEspera}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-green-300 rounded-full" />
                                  <span className="text-muted-foreground">Asistidos:</span>
                                  <span className="font-semibold">{esp.asistidos}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-orange-300 rounded-full" />
                                  <span className="text-muted-foreground">No Asistidos:</span>
                                  <span className="font-semibold">{esp.noAsistidos}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-red-300 rounded-full" />
                                  <span className="text-muted-foreground">Cancelados:</span>
                                  <span className="font-semibold">{esp.cancelados}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comparativa Visual */}
            {reporte.resultados.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Turnos</CardTitle>
                  <CardDescription>Proporción de turnos por especialidad</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {reporte.resultados
                      .sort((a, b) => b.total - a.total)
                      .map((esp, index) => {
                        const porcentaje = calcularPorcentaje(esp.total, reporte.totalTurnos)
                        return (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-32 text-sm font-medium truncate">{esp.especialidad}</div>
                            <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-400 flex items-center justify-end pr-2 text-xs text-white font-medium transition-all"
                                style={{ width: `${porcentaje}%` }}
                              >
                                {parseFloat(porcentaje) > 5 && `${porcentaje}%`}
                              </div>
                            </div>
                            <div className="w-16 text-sm text-right font-semibold">{esp.total}</div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}