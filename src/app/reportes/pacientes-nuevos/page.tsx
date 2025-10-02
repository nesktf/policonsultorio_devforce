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
  Activity,
  AlertCircle,
  ArrowLeft,
  Download,
  RefreshCw,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react"
import Link from "next/link"

interface MesData {
  month: number
  label: string
  cantidad: number
}

interface ReporteData {
  year: number
  total: number
  meses: MesData[]
  mensaje?: string
}

export default function NuevosPacientesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [reporte, setReporte] = useState<ReporteData | null>(null)
  const [reporteAnterior, setReporteAnterior] = useState<ReporteData | null>(null)
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [error, setError] = useState<string | null>(null)

  // Generar años disponibles (últimos 3 años)
  const generarYears = () => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 3 }, (_, i) => currentYear - i)
  }

  const years = generarYears()

  const cargarReporte = async () => {
    setLoading(true)
    setError(null)

    try {
      // Cargar año seleccionado
      const response = await fetch(`/api/v1/reportes/pacientes-nuevos?year=${year}`)
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${errorText}`)
      }
      const data = await response.json()
      setReporte(data)

      // Cargar año anterior para comparación
      const responseAnterior = await fetch(`/api/v1/reportes/pacientes-nuevos?year=${year - 1}`)
      if (responseAnterior.ok) {
        const dataAnterior = await responseAnterior.json()
        setReporteAnterior(dataAnterior)
      } else {
        setReporteAnterior(null)
      }
    } catch (err: any) {
      const errorMsg = err.message || 'No se pudo cargar el reporte. Intenta nuevamente.'
      setError(errorMsg)
      console.error('Error completo:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && (user.role === "gerente")) {
      cargarReporte()
    }
  }, [year, user])

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

  if (user.role !== "gerente") {
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

  const promedioPorMes = reporte ? (reporte.total / 12).toFixed(1) : "0"

  // Calcular crecimiento año a año (año actual vs año anterior)
  const calcularCrecimientoAnual = () => {
    if (!reporte || !reporteAnterior) return null
    
    const totalActual = reporte.total
    const totalAnterior = reporteAnterior.total
    
    if (totalAnterior === 0) return null
    
    const crecimiento = ((totalActual - totalAnterior) / totalAnterior) * 100
    return {
      porcentaje: crecimiento,
      absoluto: totalActual - totalAnterior
    }
  }

  const crecimientoAnual = calcularCrecimientoAnual()

  // Calcular crecimiento mes a mes
  const calcularCrecimientoMensual = (mesActual: MesData, index: number) => {
    if (index === 0) return null // No hay mes anterior para el primer mes
    
    const mesAnterior = reporte!.meses[index - 1]
    
    if (mesAnterior.cantidad === 0) {
      if (mesActual.cantidad === 0) return { porcentaje: 0, absoluto: 0 }
      return null // No se puede calcular porcentaje desde 0
    }
    
    const crecimiento = ((mesActual.cantidad - mesAnterior.cantidad) / mesAnterior.cantidad) * 100
    return {
      porcentaje: crecimiento,
      absoluto: mesActual.cantidad - mesAnterior.cantidad
    }
  }

  const renderCrecimientoIcon = (valor: number) => {
    if (valor > 0) return <ArrowUpRight className="h-4 w-4" />
    if (valor < 0) return <ArrowDownRight className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getCrecimientoColor = (valor: number) => {
    if (valor > 0) return "text-green-600"
    if (valor < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getCrecimientoColorBg = (valor: number) => {
    if (valor > 0) return "bg-green-50 border-green-200"
    if (valor < 0) return "bg-red-50 border-red-200"
    return "bg-gray-50 border-gray-200"
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
            <p className="text-muted-foreground">Análisis de crecimiento de pacientes registrados</p>
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
              Filtros de Análisis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Año:</label>
                <Select value={year.toString()} onValueChange={(v) => setYear(Number(v))}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
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
                      <p className="text-xs text-muted-foreground mt-1">en {year}</p>
                    </div>
                    <Users className="h-8 w-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Promedio/Mes</p>
                      <p className="text-3xl font-bold text-blue-600">{promedioPorMes}</p>
                      <p className="text-xs text-muted-foreground mt-1">pacientes</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600 opacity-20" />
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
                      <p className="text-sm text-muted-foreground">vs {year - 1}</p>
                      {crecimientoAnual ? (
                        <>
                          <p className={`text-3xl font-bold ${getCrecimientoColor(crecimientoAnual.porcentaje)}`}>
                            {crecimientoAnual.porcentaje > 0 ? '+' : ''}{crecimientoAnual.porcentaje.toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {crecimientoAnual.absoluto > 0 ? '+' : ''}{crecimientoAnual.absoluto} pacientes
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-3xl font-bold text-gray-600">N/A</p>
                          <p className="text-xs text-muted-foreground mt-1">Sin datos previos</p>
                        </>
                      )}
                    </div>
                    {crecimientoAnual && crecimientoAnual.porcentaje >= 0 ? (
                      <TrendingUp className="h-8 w-8 text-green-600 opacity-20" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-600 opacity-20" />
                    )}
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
                        <strong>{mesConMasPacientes.label}</strong> fue el mes con más registros:{' '}
                        <strong>{mesConMasPacientes.cantidad} pacientes nuevos</strong>
                        {crecimientoAnual && (
                          <>
                            {'. '}
                            Comparado con {year - 1}, el crecimiento es de{' '}
                            <strong>{crecimientoAnual.porcentaje.toFixed(1)}%</strong>
                            {' '}({crecimientoAnual.absoluto > 0 ? '+' : ''}{crecimientoAnual.absoluto} pacientes)
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabla Detallada con Comparativa Mes a Mes */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis Mensual Detallado</CardTitle>
                <CardDescription>Registros y variación mes a mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-semibold">Mes</th>
                        <th className="text-right p-3 font-semibold">Cantidad</th>
                        <th className="text-right p-3 font-semibold">% del Total</th>
                        <th className="text-right p-3 font-semibold">Variación</th>
                        <th className="text-center p-3 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporte.meses.map((mes, index) => {
                        const porcentaje = reporte.total > 0 
                          ? ((mes.cantidad / reporte.total) * 100).toFixed(1)
                          : "0"
                        const esMejorMes = mes.cantidad === mesConMasPacientes?.cantidad && mes.cantidad > 0
                        const crecimientoMes = calcularCrecimientoMensual(mes, index)

                        return (
                          <tr key={index} className="border-t hover:bg-muted/50">
                            <td className="p-3 font-medium">{mes.label}</td>
                            <td className="p-3 text-right font-semibold">{mes.cantidad}</td>
                            <td className="p-3 text-right text-muted-foreground">{porcentaje}%</td>
                            <td className="p-3 text-right">
                              {crecimientoMes && crecimientoMes.porcentaje !== null ? (
                                <div className={`inline-flex items-center gap-1 ${getCrecimientoColor(crecimientoMes.porcentaje)}`}>
                                  {renderCrecimientoIcon(crecimientoMes.porcentaje)}
                                  <span className="font-medium">
                                    {crecimientoMes.porcentaje > 0 ? '+' : ''}{crecimientoMes.porcentaje.toFixed(1)}%
                                  </span>
                                  <span className="text-xs">
                                    ({crecimientoMes.absoluto > 0 ? '+' : ''}{crecimientoMes.absoluto})
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </td>
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
                        <td className="p-3">Total {year}</td>
                        <td className="p-3 text-right">{reporte.total}</td>
                        <td className="p-3 text-right">100%</td>
                        <td className="p-3 text-right">
                          {reporteAnterior && (
                            <span className={getCrecimientoColor(reporte.total - reporteAnterior.total)}>
                              vs {year - 1}: {reporte.total - reporteAnterior.total > 0 ? '+' : ''}{reporte.total - reporteAnterior.total}
                            </span>
                          )}
                        </td>
                        <td className="p-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Barras */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Distribución Mensual
                </CardTitle>
                <CardDescription>
                  Pacientes registrados por mes en {year}
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
                      const crecimientoMes = calcularCrecimientoMensual(mes, index)

                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center gap-3">
                            <div className="w-24 text-sm font-medium truncate">{mes.label}</div>
                            <div className="flex-1 h-10 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-400 flex items-center justify-end pr-3 text-xs text-white font-medium transition-all"
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
                          {crecimientoMes && crecimientoMes.porcentaje !== null && crecimientoMes.porcentaje !== 0 && (
                            <div className="ml-24 pl-3">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getCrecimientoColorBg(crecimientoMes.porcentaje)}`}
                              >
                                {renderCrecimientoIcon(crecimientoMes.porcentaje)}
                                {crecimientoMes.porcentaje > 0 ? '+' : ''}{crecimientoMes.porcentaje.toFixed(1)}% vs mes anterior
                              </Badge>
                            </div>
                          )}
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