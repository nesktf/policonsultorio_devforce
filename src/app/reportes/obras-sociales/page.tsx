"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { 
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  ArrowLeft,
  Download,
  RefreshCw,
  Briefcase,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  PieChart,
  Award
} from "lucide-react"
import Link from "next/link"

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
  tasaAsistencia: number
}

interface TurnosPorEstado {
  PROGRAMADO: number
  EN_SALA_ESPERA: number
  ASISTIO: number
  NO_ASISTIO: number
  CANCELADO: number
}

interface EvolucionMensual {
  mes: string
  cantidad: number
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
  evolucionMensual: EvolucionMensual[]
  profesionales: Profesional[]
  distribucionEspecialidades: DistribucionEspecialidad[]
}

export default function ReporteObraSocialPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [reporte, setReporte] = useState<ReporteData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([])
  const [obraSocialId, setObraSocialId] = useState<string>("")

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
    if (!obraSocialId) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v1/reportes/obra-social?obraSocialId=${obraSocialId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar el reporte')
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
    if (user && user.rol === "GERENTE" && obraSocialId) {
      cargarReporte()
    }
  }, [obraSocialId, user])

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

  const profesionalMasActivo = reporte && reporte.profesionales.length > 0
    ? reporte.profesionales[0]
    : null
    
  const COLORES_ESPECIALIDADES = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
  ]

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
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
            <h1 className="text-3xl font-bold text-foreground">Reporte de Obra Social</h1>
            <p className="text-muted-foreground">Análisis detallado de pacientes, profesionales y atenciones</p>
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
            <Button variant="outline" className="gap-2" disabled={!reporte}>
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Selector de Obra Social */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Seleccionar Opción de Cobertura
            </CardTitle>
          </CardHeader>
          <CardContent>
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

        {/* Mensaje cuando no hay selección */}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pacientes</p>
                      <p className="text-3xl font-bold text-primary">{reporte.metricas.totalPacientes}</p>
                      <p className="text-xs text-muted-foreground mt-1">total registrados</p>
                    </div>
                    <Users className="h-8 w-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Activos</p>
                      <p className="text-3xl font-bold text-green-600">{reporte.metricas.pacientesActivos}</p>
                      <p className="text-xs text-muted-foreground mt-1">último mes</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Profesionales</p>
                      <p className="text-3xl font-bold text-blue-600">{reporte.metricas.totalProfesionales}</p>
                      <p className="text-xs text-muted-foreground mt-1">disponibles</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-blue-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Turnos</p>
                      <p className="text-3xl font-bold text-purple-600">{reporte.metricas.totalTurnos}</p>
                      <p className="text-xs text-muted-foreground mt-1">históricos</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>              
            </div>

            {profesionalMasActivo && (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">Profesional Destacado</p>
                      <p className="text-sm text-blue-700">
                        <strong>{profesionalMasActivo.nombre}</strong> ({profesionalMasActivo.especialidad}) ha atendido{' '}
                        <strong>{profesionalMasActivo.turnosAtendidos} turnos</strong>,
                        liderando en atenciones para esta cobertura.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribución de Turnos por Estado */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Distribución de Turnos
                  </CardTitle>
                  <CardDescription>
                    Turnos por estado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: 'Asistió', value: reporte.turnosPorEstado.ASISTIO, color: '#10b981', icon: CheckCircle },
                      { label: 'Programados', value: reporte.turnosPorEstado.PROGRAMADO, color: '#3b82f6', icon: Clock },
                      { label: 'No Asistió', value: reporte.turnosPorEstado.NO_ASISTIO, color: '#ef4444', icon: XCircle },
                      { label: 'Cancelados', value: reporte.turnosPorEstado.CANCELADO, color: '#6b7280', icon: XCircle },
                      { label: 'En Sala', value: reporte.turnosPorEstado.EN_SALA_ESPERA, color: '#f59e0b', icon: Clock },
                    ].map((item, index) => {
                      const Icon = item.icon
                      const porcentaje = reporte.metricas.totalTurnos > 0
                        ? ((item.value / reporte.metricas.totalTurnos) * 100).toFixed(1)
                        : "0"
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <Icon className="h-4 w-4" style={{ color: item.color }} />
                            <span className="text-sm font-medium">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold">{item.value}</span>
                            <Badge variant="outline" className="text-xs">{porcentaje}%</Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Distribución por Especialidad */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Profesionales por Especialidad
                  </CardTitle>
                  <CardDescription>
                    Distribución del equipo médico
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reporte.distribucionEspecialidades.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay profesionales registrados
                    </div>
                  ) : (
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
                              <span className="text-muted-foreground">{item.cantidad} prof.</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Ranking de Profesionales - MODIFICADO: Se quita la columna "Destacado" */}
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
                   <div className="text-center py-8 text-muted-foreground">
                    No hay profesionales con atenciones para esta cobertura.
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 font-semibold">Posición</th>
                          <th className="text-left p-3 font-semibold">Profesional</th>
                          <th className="text-left p-3 font-semibold">Especialidad</th>
                          <th className="text-right p-3 font-semibold">Turnos Atendidos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reporte.profesionales.map((prof, index) => (
                            <tr key={prof.id} className="border-t hover:bg-muted/50">
                              <td className="p-3">
                                <span className="font-semibold">#{index + 1}</span>
                              </td>
                              <td className="p-3 font-medium">{prof.nombre}</td>
                              <td className="p-3">
                                <Badge variant="outline">{prof.especialidad}</Badge>
                              </td>
                              <td className="p-3 text-right font-semibold">{prof.turnosAtendidos}</td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Métricas Adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Pacientes Activos</span>
                    </div>
                    <p className="text-2xl font-bold">{reporte.metricas.pacientesActivos}</p>
                    <p className="text-xs text-muted-foreground">
                      {reporte.metricas.totalPacientes > 0 
                        ? `${((reporte.metricas.pacientesActivos / reporte.metricas.totalPacientes) * 100).toFixed(1)}% del total`
                        : 'No hay pacientes registrados'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-sm">Promedio Turnos/Prof.</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {reporte.metricas.totalProfesionales > 0
                        ? (reporte.metricas.totalTurnos / reporte.metricas.totalProfesionales).toFixed(1)
                        : '0'
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Turnos por profesional
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">Especialidades</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {reporte.distribucionEspecialidades.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Áreas médicas disponibles
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Información de la Obra Social */}
            <Card>
              <CardHeader>
                <CardTitle>Información de la Obra Social</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre</p>
                      <p className="text-lg font-semibold">{reporte.obraSocial.nombre}</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-muted-foreground opacity-30" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm text-muted-foreground">Estado</p>
                      <Badge 
                        variant={reporte.obraSocial.estado === 'ACTIVA' ? 'default' : 'secondary'}
                        className="mt-1"
                      >
                        {reporte.obraSocial.estado}
                      </Badge>
                    </div>
                    <Activity className="h-8 w-8 text-muted-foreground opacity-30" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  )
}