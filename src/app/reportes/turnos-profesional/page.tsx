"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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
  const [usarFechasPersonalizadas, setUsarFechasPersonalizadas] = useState(false)
  const [rangoSeleccionado, setRangoSeleccionado] = useState("ultimos-30-dias")

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

  // Cargar datos iniciales
  useEffect(() => {
    cargarProfesionales()
    // Establecer fechas por defecto (mismo período que turnos-especialidad)
    // Desde 15/9/2025 hasta 16/10/2025
    setFechaInicio('2025-09-15')
    setFechaFin('2025-10-16')
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
    const doc = new jsPDF()
    
    // Configuración de colores
    const primaryColor: [number, number, number] = [37, 99, 235] // azul
    const successColor: [number, number, number] = [34, 197, 94] // verde
    const warningColor: [number, number, number] = [249, 115, 22] // naranja
    const dangerColor: [number, number, number] = [239, 68, 68] // rojo
    const secondaryColor: [number, number, number] = [107, 114, 128] // gris
    
    // Header principal
    doc.setFontSize(18)
    doc.setTextColor(...primaryColor)
    doc.text('Reporte de Desempeño por Profesional', 20, 25)
    
    doc.setFontSize(10)
    doc.setTextColor(...secondaryColor)
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 20, 35)
    
    // Sección de filtros aplicados
    let yPosition = 50
    doc.setFontSize(12)
    doc.setTextColor(...primaryColor)
    doc.text('Filtros Aplicados:', 20, yPosition)
    
    yPosition += 10
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    
    // Mostrar filtros de fecha
    doc.text(`• Período: ${fechaInicio} al ${fechaFin}`, 25, yPosition)
    yPosition += 6
    
    // Mostrar filtro de profesional si está activo
    if (profesionalSeleccionado && profesionalSeleccionado !== 'todos') {
      const profesionalNombre = profesionales.find(p => p.id.toString() === profesionalSeleccionado)
      if (profesionalNombre) {
        doc.text(`• Profesional: ${profesionalNombre.nombre} ${profesionalNombre.apellido}`, 25, yPosition)
        yPosition += 6
      }
    } else {
      doc.text(`• Profesional: Todos los profesionales`, 25, yPosition)
      yPosition += 6
    }
    
    doc.text(`• Total de registros: ${filteredData.length}`, 25, yPosition)
    yPosition += 15
    
    // Leyenda de colores
    doc.setFontSize(12)
    doc.setTextColor(...primaryColor)
    doc.text('Leyenda de Performance:', 20, yPosition)
    yPosition += 10
    
    doc.setFontSize(9)
    // Verde - Excelente
    doc.setFillColor(...successColor)
    doc.rect(25, yPosition - 3, 4, 4, 'F')
    doc.setTextColor(0, 0, 0)
    doc.text('Excelente (≥ 90% asistencia)', 32, yPosition)
    yPosition += 8
    
    // Naranja - Bueno
    doc.setFillColor(...warningColor)
    doc.rect(25, yPosition - 3, 4, 4, 'F')
    doc.text('Bueno (70-89% asistencia)', 32, yPosition)
    yPosition += 8
    
    // Rojo - Necesita mejora
    doc.setFillColor(...dangerColor)
    doc.rect(25, yPosition - 3, 4, 4, 'F')
    doc.text('Necesita mejora (< 70% asistencia)', 32, yPosition)
    yPosition += 15
    
    // Tabla de datos
    const tableData = filteredData.map(stat => [
      `${stat.nombre} ${stat.apellido}`,
      stat.especialidad,
      stat.asistidos.toString(),
      stat.cancelados.toString(),
      stat.ausentes.toString(),
      stat.total.toString(),
      `${stat.porcentajeAsistencia.toFixed(1)}%`
    ])
    
    // Configurar la tabla
    autoTable(doc, {
      startY: yPosition,
      head: [['Profesional', 'Especialidad', 'Asistidos', 'Cancelados', 'Ausentes', 'Total', '% Asistencia']],
      body: tableData,
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 35 }, // Profesional
        1: { cellWidth: 30 }, // Especialidad
        2: { cellWidth: 20, halign: 'center' }, // Asistidos
        3: { cellWidth: 20, halign: 'center' }, // Cancelados
        4: { cellWidth: 20, halign: 'center' }, // Ausentes
        5: { cellWidth: 20, halign: 'center' }, // Total
        6: { cellWidth: 25, halign: 'center' } // % Asistencia
      },
      didParseCell: function(data) {
        // Colorear la celda de porcentaje según el valor
        if (data.column.index === 6 && data.section === 'body') {
          const rowIndex = data.row.index
          const porcentajeStr = tableData[rowIndex][6] as string
          const porcentaje = parseFloat(porcentajeStr.replace('%', ''))
          
          if (porcentaje >= 90) {
            data.cell.styles.fillColor = [220, 252, 231] // verde claro
            data.cell.styles.textColor = [22, 101, 52] // verde oscuro
          } else if (porcentaje >= 70) {
            data.cell.styles.fillColor = [255, 237, 213] // naranja claro
            data.cell.styles.textColor = [154, 52, 18] // naranja oscuro
          } else {
            data.cell.styles.fillColor = [254, 226, 226] // rojo claro
            data.cell.styles.textColor = [153, 27, 27] // rojo oscuro
          }
        }
      },
      margin: { top: 20, left: 20, right: 20 }
    })
    
    // Footer
    const pageHeight = doc.internal.pageSize.height
    doc.setFontSize(8)
    doc.setTextColor(...secondaryColor)
    doc.text('Sistema de Gestión Médica - Reporte Profesional', 20, pageHeight - 15)
    doc.text(`Página 1 de 1 | ${new Date().toLocaleDateString('es-AR')}`, 20, pageHeight - 10)
    
    // Guardar el archivo
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-')
    const fileName = `reporte-profesionales-${fechaInicio}-${fechaFin}_${timestamp}.pdf`
    doc.save(fileName)
    
    toast({
      title: "Exportación exitosa",
      description: "El reporte PDF se ha generado con filtros y colores",
    })
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
            Exportar PDF
          </Button>
        </div>

        {/* Período de Análisis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Período de Análisis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Checkbox para activar fechas personalizadas */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fechas-personalizadas"
                checked={usarFechasPersonalizadas}
                onCheckedChange={(checked) => setUsarFechasPersonalizadas(checked as boolean)}
              />
              <Label htmlFor="fechas-personalizadas" className="text-sm font-medium cursor-pointer">
                Usar fechas personalizadas
              </Label>
            </div>

            {usarFechasPersonalizadas ? (
              /* Filtros de fechas personalizadas */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            ) : (
              /* Filtros de rangos predefinidos */
              <div className="flex items-center gap-4">
                <Select value={rangoSeleccionado} onValueChange={setRangoSeleccionado}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Seleccionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ultimos-30-dias">Últimos 30 días</SelectItem>
                    {opcionesMeses.map((mes) => (
                      <SelectItem key={mes.valor} value={mes.valor}>
                        {mes.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="anio-actual">Año Completo {new Date().getFullYear()}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Información del período analizado */}
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              <strong>Período analizado:</strong> Desde {new Date(fechaInicio).toLocaleDateString('es-AR')} hasta{' '}
              {new Date(fechaFin).toLocaleDateString('es-AR')}
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