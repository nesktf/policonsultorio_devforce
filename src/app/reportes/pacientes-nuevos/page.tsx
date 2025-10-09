"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { 
  UserPlus,
  Calendar, 
  TrendingUp, 
  TrendingDown,
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

interface MesData {
  month: number
  year: number
  label: string
  cantidad: number
}

interface ObraSocialDistribucion {
  nombre: string
  cantidad: number
}

interface ReporteData {
  fechaInicio: string
  fechaFin: string
  total: number
  meses: MesData[]
  distribucionObrasSociales: ObraSocialDistribucion[]
  promedioDiario: number
  diasAnalizados: number
  mensaje?: string
}

interface ObraSocial {
  id: number
  nombre: string
}

export default function NuevosPacientesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [reporte, setReporte] = useState<ReporteData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([])
  
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
    // Validar que las fechas estén completas antes de hacer la petición
    if (!fechaInicio || !fechaFin || fechaInicio.length !== 10 || fechaFin.length !== 10) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        fechaInicio,
        fechaFin,
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
  }, [fechaInicio, fechaFin, obraSocialId, user])

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

  const mesConMasPacientes = reporte && reporte.meses.length > 0 ? 
    reporte.meses.reduce((max, mes) => mes.cantidad > max.cantidad ? mes : max, reporte.meses[0])
    : null

  const obraSocialPrincipal = reporte && reporte.distribucionObrasSociales.length > 0
    ? reporte.distribucionObrasSociales[0]
    : null

  const COLORES_GRAFICO = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
  ]

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
                      <p className="text-xs text-muted-foreground mt-1">en el período</p>
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
                      <p className="text-sm text-muted-foreground">Mes Pico</p>
                      <p className="text-3xl font-bold text-green-600">
                        {mesConMasPacientes?.cantidad || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {mesConMasPacientes?.label || '-'}
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
            {mesConMasPacientes && mesConMasPacientes.cantidad > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <UserPlus className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">Análisis de Crecimiento</p>
                      <p className="text-sm text-blue-700">
                        <strong>{mesConMasPacientes.label}</strong> registró la mayor cantidad de pacientes nuevos con{' '}
                        <strong>{mesConMasPacientes.cantidad} registros</strong>.
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Torta - Distribución por Obra Social */}
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
                  {reporte.distribucionObrasSociales.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay datos disponibles
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <svg width="280" height="280" viewBox="0 0 280 280">
                          {(() => {
                            let currentAngle = -90
                            return reporte.distribucionObrasSociales.map((os, index) => {
                              const porcentaje = (os.cantidad / reporte.total) * 100
                              const angle = (porcentaje / 100) * 360
                              const startAngle = currentAngle
                              const endAngle = currentAngle + angle
                              currentAngle = endAngle

                              const startRad = (startAngle * Math.PI) / 180
                              const endRad = (endAngle * Math.PI) / 180
                              const x1 = 140 + 100 * Math.cos(startRad)
                              const y1 = 140 + 100 * Math.sin(startRad)
                              const x2 = 140 + 100 * Math.cos(endRad)
                              const y2 = 140 + 100 * Math.sin(endRad)
                              const largeArc = angle > 180 ? 1 : 0

                              return (
                                <path
                                  key={index}
                                  d={`M 140 140 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                  fill={COLORES_GRAFICO[index % COLORES_GRAFICO.length]}
                                  stroke="white"
                                  strokeWidth="2"
                                />
                              )
                            })
                          })()}
                          <circle cx="140" cy="140" r="60" fill="white" />
                          <text x="140" y="135" textAnchor="middle" className="text-2xl font-bold" fill="#1f2937">
                            {reporte.total}
                          </text>
                          <text x="140" y="155" textAnchor="middle" className="text-xs" fill="#6b7280">
                            pacientes
                          </text>
                        </svg>
                      </div>

                      <div className="space-y-2">
                        {reporte.distribucionObrasSociales.map((os, index) => {
                          const porcentaje = ((os.cantidad / reporte.total) * 100).toFixed(1)
                          return (
                            <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: COLORES_GRAFICO[index % COLORES_GRAFICO.length] }}
                                />
                                <span className="text-sm font-medium">{os.nombre}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{os.cantidad}</span>
                                <span className="text-xs text-muted-foreground">({porcentaje}%)</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gráfico de Barras - Distribución Mensual */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Distribución Mensual
                  </CardTitle>
                  <CardDescription>
                    Pacientes registrados por mes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reporte.total === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay datos para el período seleccionado
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reporte.meses.map((mes, index) => {
                        const porcentaje = reporte.total > 0 
                          ? ((mes.cantidad / reporte.total) * 100).toFixed(1)
                          : "0"
                        const maxCantidad = Math.max(...reporte.meses.map(m => m.cantidad))
                        const anchoBarra = maxCantidad > 0 
                          ? (mes.cantidad / maxCantidad) * 100
                          : 0

                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center gap-3">
                              <div className="w-28 text-sm font-medium truncate">{mes.label}</div>
                              <div className="flex-1 h-10 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 flex items-center justify-end pr-3 text-xs text-white font-medium transition-all"
                                  style={{ width: `${anchoBarra}%` }}
                                >
                                  {mes.cantidad > 0 && `${mes.cantidad}`}
                                </div>
                              </div>
                              <div className="w-20 text-sm text-right">
                                <span className="font-semibold">{mes.cantidad}</span>
                                <span className="text-muted-foreground text-xs ml-1">
                                  ({porcentaje}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tabla Detallada */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis Mensual Detallado</CardTitle>
                <CardDescription>Registros mensuales en el período seleccionado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-semibold">Mes</th>
                        <th className="text-right p-3 font-semibold">Cantidad</th>
                        <th className="text-right p-3 font-semibold">% del Total</th>
                        <th className="text-center p-3 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporte.meses.map((mes, index) => {
                        const porcentaje = reporte.total > 0 
                          ? ((mes.cantidad / reporte.total) * 100).toFixed(1)
                          : "0"
                        const esMejorMes = mes.cantidad === mesConMasPacientes?.cantidad && mes.cantidad > 0

                        return (
                          <tr key={index} className="border-t hover:bg-muted/50">
                            <td className="p-3 font-medium">{mes.label}</td>
                            <td className="p-3 text-right font-semibold">{mes.cantidad}</td>
                            <td className="p-3 text-right text-muted-foreground">{porcentaje}%</td>
                            <td className="p-3 text-center">
                              {esMejorMes && (
                                <Badge variant="default" className="gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  Pico
                                </Badge>
                              )}
                              {mes.cantidad === 0 && (
                                <Badge variant="secondary">Sin registros</Badge>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot className="bg-muted font-semibold">
                      <tr>
                        <td className="p-3">Total</td>
                        <td className="p-3 text-right">{reporte.total}</td>
                        <td className="p-3 text-right">100%</td>
                        <td className="p-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Análisis de Obras Sociales - Tabla */}
            <Card>
              <CardHeader>
                <CardTitle>Ranking de Obras Sociales</CardTitle>
                <CardDescription>Detalle de pacientes por cobertura médica</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-semibold">Posición</th>
                        <th className="text-left p-3 font-semibold">Obra Social</th>
                        <th className="text-right p-3 font-semibold">Pacientes</th>
                        <th className="text-right p-3 font-semibold">Porcentaje</th>
                        <th className="text-right p-3 font-semibold">Promedio/Día</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporte.distribucionObrasSociales.map((os, index) => {
                        const porcentaje = ((os.cantidad / reporte.total) * 100).toFixed(1)
                        const promedioDia = (os.cantidad / reporte.diasAnalizados).toFixed(2)
                        
                        return (
                          <tr key={index} className="border-t hover:bg-muted/50">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: COLORES_GRAFICO[index % COLORES_GRAFICO.length] }}
                                />
                                <span className="font-semibold">#{index + 1}</span>
                              </div>
                            </td>
                            <td className="p-3 font-medium">{os.nombre}</td>
                            <td className="p-3 text-right font-semibold">{os.cantidad}</td>
                            <td className="p-3 text-right">
                              <Badge variant="outline">{porcentaje}%</Badge>
                            </td>
                            <td className="p-3 text-right text-muted-foreground">{promedioDia}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  )
}