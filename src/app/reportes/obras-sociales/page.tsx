"use client"

import {
  AlertCircle,
  ArrowLeft,
  Award,
  Activity,
  Briefcase,
  Calendar,
  Download,
  Loader2,
  PieChart as PieChartIcon,
  RefreshCw,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { exportarReporteObraSocial } from "@/utils/pdfExport"
import { useAuth } from "@/context/auth-context"

interface ObraSocial {
  id: number
  nombre: string
  estado: string
}

interface Metricas {
  totalPacientes: number
  pacientesActivos: number
  totalProfesionales: number
  totalTurnos: number
}

interface TurnosPorEstado {
  PROGRAMADO: number
  EN_SALA_ESPERA: number
  ASISTIO: number
  NO_ASISTIO: number
  CANCELADO: number
}

interface Profesional {
  id: number
  nombre: string
  especialidad: string
  turnosAtendidos: number
}

interface DistribucionEspecialidad {
  especialidad: string
  cantidad: number
}

interface ReporteData {
  obraSocial: ObraSocial
  metricas: Metricas
  turnosPorEstado: TurnosPorEstado
  profesionales: Profesional[]
  distribucionEspecialidades: DistribucionEspecialidad[]
}

const COLORES_ESPECIALIDADES = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
]

export default function ReporteObraSocialPage() {
  const { user } = useAuth()
  const canAccessReport = user?.rol === "GERENTE"

  const handleExport = async () => {
  if (reporte) {
    await exportarReporteObraSocial(reporte)
    }
  }

  const [loading, setLoading] = useState(false)
  const [reporte, setReporte] = useState<ReporteData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([])
  const [obraSocialId, setObraSocialId] = useState<string>("")

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }),
    []
  )

  const cargarObrasSociales = useCallback(async () => {
    if (!canAccessReport) return

    try {
      const response = await fetch('/api/v1/obra_social?state_id=1', {
        cache: 'no-store',
      })
      if (!response.ok) {
        throw new Error('No se pudieron cargar las obras sociales.')
      }
      const data = await response.json()
      setObrasSociales(data.obras_sociales || [])
    } catch (err) {
      console.error('Error cargando obras sociales:', err)
      setObrasSociales([])
    }
  }, [canAccessReport])

  const cargarReporte = useCallback(async () => {
    if (!obraSocialId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/v1/reportes/obra-social?obraSocialId=${obraSocialId}`,
        { cache: 'no-store' }
      )

      const payload = await response.json().catch(() => null)

      if (!response.ok || !payload) {
        throw new Error(
          payload?.error ?? 'No se pudo obtener el reporte.'
        )
      }

      setReporte(payload as ReporteData)
    } catch (err) {
      console.error('Error completo:', err)
      setReporte(null)
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.')
    } finally {
      setLoading(false)
    }
  }, [obraSocialId])

  useEffect(() => {
    if (!canAccessReport) return
    cargarObrasSociales()
  }, [cargarObrasSociales, canAccessReport])

  useEffect(() => {
    if (!canAccessReport || !obraSocialId) return
    cargarReporte()
  }, [cargarReporte, canAccessReport, obraSocialId])

  const profesionalMasActivo = useMemo(
    () => reporte?.profesionales?.[0] ?? null,
    [reporte?.profesionales]
  )

  const turnosData = useMemo(() => {
    if (!reporte) return []

    return [
      { name: 'Asistió', value: reporte.turnosPorEstado.ASISTIO, color: '#10b981' },
      { name: 'Programados', value: reporte.turnosPorEstado.PROGRAMADO, color: '#3b82f6' },
      { name: 'No Asistió', value: reporte.turnosPorEstado.NO_ASISTIO, color: '#ef4444' },
      { name: 'Cancelados', value: reporte.turnosPorEstado.CANCELADO, color: '#6b7280' },
      { name: 'En Sala', value: reporte.turnosPorEstado.EN_SALA_ESPERA, color: '#f59e0b' },
    ]
      .filter(item => item.value > 0)
      .map(item => ({
        ...item,
        porcentaje: reporte.metricas.totalTurnos > 0
          ? (item.value / reporte.metricas.totalTurnos) * 100
          : 0
      }))
  }, [reporte])

  const especialidadesData = useMemo(() => {
    if (!reporte) return []

    return reporte.distribucionEspecialidades
      .filter(esp => esp.cantidad > 0)
      .map((esp, index) => ({
        name: esp.especialidad,
        value: esp.cantidad,
        color: COLORES_ESPECIALIDADES[index % COLORES_ESPECIALIDADES.length],
        porcentaje: reporte.metricas.totalProfesionales > 0
          ? (esp.cantidad / reporte.metricas.totalProfesionales) * 100
          : 0
      }))
  }, [reporte])

  if (!user) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card>
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Debes iniciar sesión para acceder a esta sección.
            </div>
          </Card>
        </div>
      </MainLayout>
    )
  }

  if (!canAccessReport) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card>
            <div className="flex h-32 flex-col items-center justify-center space-y-4 text-muted-foreground">
              <AlertCircle className="h-12 w-12" />
              <p>No tienes permisos para acceder a los reportes.</p>
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver al Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link
                href="/reportes"
                className="mb-2 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Reportes
              </Link>
              <h1 className="text-3xl font-bold text-foreground">Reporte de Obra Social</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Análisis detallado de pacientes, profesionales y atenciones por cobertura médica
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={cargarReporte}
                disabled={loading || !obraSocialId}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Button 
                variant="outline" 
                className="gap-2" 
                onClick={handleExport} // <-- Se aÃ±ade el onClick
                disabled={!reporte}
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Selector de Obra Social */}
          <Card className="p-4">
            <div className="mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              <h3 className="font-semibold">Seleccionar Opción de Cobertura</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select value={obraSocialId} onValueChange={setObraSocialId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una opción..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sin-obra-social">
                      Sin Obra Social (Particulares)
                    </SelectItem>
                    {obrasSociales.map((os) => (
                      <SelectItem key={os.id} value={os.id.toString()}>
                        {os.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Error */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/10">
              <div className="flex items-center gap-3 p-4 text-sm text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </Card>
          )}

          {/* Loading */}
          {loading && (
            <Card>
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Cargando reporte...
              </div>
            </Card>
          )}

          {/* Mensaje cuando no hay selecciÃ³n */}
          {!obraSocialId && !loading && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <Briefcase className="h-12 w-12 text-blue-600 mx-auto mb-3 opacity-50" />
                <p className="text-blue-900 font-medium">Selecciona una obra social para ver el reporte</p>
                <p className="text-sm text-blue-700 mt-1">
                  Elige una obra social del selector arriba para visualizar métricas y análisis detallados
                </p>
              </CardContent>
            </Card>
          )}

          {/* Contenido del Reporte */}
          {reporte && !loading && (
            <>
              {/* MÃ©tricas principales */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pacientes</p>
                      <p className="mt-2 text-4xl font-bold text-primary">
                        {numberFormatter.format(reporte.metricas.totalPacientes)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">total registrados</p>
                    </div>
                    <Users className="h-8 w-8 text-primary/20" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Activos</p>
                      <p className="mt-2 text-4xl font-bold text-green-600">
                        {numberFormatter.format(reporte.metricas.pacientesActivos)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Último mes</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-600/20" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Profesionales</p>
                      <p className="mt-2 text-4xl font-bold text-blue-600">
                        {numberFormatter.format(reporte.metricas.totalProfesionales)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">disponibles</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-blue-600/20" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Turnos</p>
                      <p className="mt-2 text-4xl font-bold text-purple-600">
                        {numberFormatter.format(reporte.metricas.totalTurnos)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">históricos</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600/20" />
                  </div>
                </Card>
              </div>

              {/* Profesional destacado */}
              {profesionalMasActivo && (
                <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-start gap-3 p-4">
                    <Award className="mt-0.5 h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-900">Profesional Destacado</p>
                      <p className="mt-1 text-sm text-blue-700">
                        <strong>{profesionalMasActivo.nombre}</strong> ({profesionalMasActivo.especialidad}) ha atendido{' '}
                        <strong>{numberFormatter.format(profesionalMasActivo.turnosAtendidos)} turnos</strong>,
                        liderando en atenciones para esta cobertura.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                {/* DistribuciÃ³n de Turnos con GrÃ¡fico de Torta */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Distribución de Turnos
                    </CardTitle>
                    <CardDescription>Turnos por estado</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reporte.metricas.totalTurnos === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        No hay turnos registrados
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* GrÃ¡fico de Torta */}
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie
                              data={turnosData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={90}
                              dataKey="value"
                              label={({ name, value }) =>
                                `${name}: ${numberFormatter.format(value)}`
                              }
                            >
                              {turnosData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number, name: string) => [
                                numberFormatter.format(value),
                                name,
                              ]}
                            />
                          </PieChart>
                        </ResponsiveContainer>

                        {/* Detalle en tarjetas */}
                        <div className="grid gap-2">
                          {turnosData.map((item) => (
                            <div key={item.name} className="rounded border bg-card p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  <span className="text-sm font-medium">{item.name}</span>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold">
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

                {/* DistribuciÃ³n por Especialidad con GrÃ¡fico de Torta */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Profesionales por Especialidad
                    </CardTitle>
                    <CardDescription>Distribución del equipo médico</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reporte.distribucionEspecialidades.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        No hay profesionales registrados
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* GrÃ¡fico de Torta */}
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie
                              data={especialidadesData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={90}
                              dataKey="value"
                              label={({ name, value }) =>
                                `${name}: ${value}`
                              }
                            >
                              {especialidadesData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number, name: string) => [
                                `${value} profesionales`,
                                name,
                              ]}
                            />
                          </PieChart>
                        </ResponsiveContainer>

                        {/* Detalle en barras */}
                        <div className="space-y-3">
                          {reporte.distribucionEspecialidades.map((item, index) => {
                            const porcentaje = reporte.metricas.totalProfesionales > 0
                              ? ((item.cantidad / reporte.metricas.totalProfesionales) * 100).toFixed(1)
                              : "0"
                            const anchoBarra = reporte.metricas.totalProfesionales > 0
                              ? (item.cantidad / reporte.metricas.totalProfesionales) * 100
                              : 0
                            
                            return (
                              <div key={index} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium">{item.especialidad}</span>
                                  <span className="text-muted-foreground">
                                    {item.cantidad} prof. ({porcentaje}%)
                                  </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                  <div 
                                    className="h-full transition-all"
                                    style={{ 
                                      width: `${anchoBarra}%`,
                                      backgroundColor: COLORES_ESPECIALIDADES[index % COLORES_ESPECIALIDADES.length]
                                    }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Ranking de Profesionales */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Ranking de Profesionales
                  </CardTitle>
                  <CardDescription>
                    Profesionales ordenados por turnos atendidos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reporte.profesionales.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No hay profesionales con atenciones para esta cobertura.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b text-left text-sm text-muted-foreground">
                            <th className="p-3 font-semibold">Posición</th>
                            <th className="p-3 font-semibold">Profesional</th>
                            <th className="p-3 font-semibold">Especialidad</th>
                            <th className="p-3 text-right font-semibold">Turnos Atendidos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reporte.profesionales.map((prof, index) => (
                            <tr key={prof.id} className="border-b hover:bg-muted/40">
                              <td className="p-3">
                                <span className="font-semibold">#{index + 1}</span>
                              </td>
                              <td className="p-3 font-medium">{prof.nombre}</td>
                              <td className="p-3">
                                <span className="rounded-md border px-2 py-1 text-xs">
                                  {prof.especialidad}
                                </span>
                              </td>
                              <td className="p-3 text-right font-semibold">
                                {numberFormatter.format(prof.turnosAtendidos)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  )
}