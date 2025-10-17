"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  FileText,
  Calendar,
  User,
  Stethoscope,
  Pill,
  AlertTriangle,
  Clock,
  Eye,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  Loader2,
} from "lucide-react"

interface Paciente {
  id: string
  nombre: string
  apellido: string
  dni: string
  fechaNacimiento?: string
  telefono: string
  email?: string
  obraSocial?: string
  numeroAfiliado?: string
}

interface SignosVitales {
  presion?: string
  frecuencia?: string
  temperatura?: string
  peso?: string
  altura?: string
  oxigenacion?: string
}

interface Medicamento {
  nombre: string
  dosis: string
  frecuencia: string
  duracion: string
}

interface Estudio {
  tipo: string
  resultado: string
  fecha: string
}

interface Consulta {
  id: number
  fecha: string
  profesional: {
    id: number
    nombre: string
    apellido: string
    especialidad: string
  }
  motivo: string
  detalle: string
  examen_fisico?: string
  signos_vitales?: SignosVitales
  diagnostico: string
  tratamiento?: string
  medicamentos?: Medicamento[]
  estudios?: Estudio[]
  indicaciones?: string
  observaciones?: string
  proximo_control?: string
}

interface HistoriaClinicaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paciente: Paciente
}

export function HistoriaClinicaDialog({
  open,
  onOpenChange,
  paciente,
}: HistoriaClinicaDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(false)
  const [consultaSeleccionada, setConsultaSeleccionada] = useState<Consulta | null>(null)

  useEffect(() => {
    if (open) {
      fetchHistoriaClinica()
    }
  }, [open])

  const fetchHistoriaClinica = async () => {
    setLoading(true)
    try {
      // Tu API espera id_paciente, no pacienteId
      const response = await fetch(`/api/v2/historia?id_paciente=${paciente.id}`)
      if (!response.ok) {
        throw new Error("Error al cargar historia clínica")
      }
      const data = await response.json()
      
      // Mapear la respuesta de tu API a la estructura del componente
      const historiasFormateadas = (data.historias || []).map((h: any) => ({
        id: parseInt(h.id),
        fecha: h.fecha,
        profesional: {
          id: parseInt(h.profesionalId),
          nombre: h.profesional.split(' ')[0], // Extraer nombre del string "Nombre Apellido"
          apellido: h.profesional.split(' ').slice(1).join(' '), // Resto es apellido
          especialidad: h.especialidad,
        },
        motivo: h.motivo || "Consulta médica",
        detalle: h.anamnesis || "",
        examen_fisico: h.examenFisico || null,
        signos_vitales: h.signosVitales ? {
          presion: h.signosVitales.presionArterial,
          frecuencia: h.signosVitales.frecuenciaCardiaca,
          temperatura: h.signosVitales.temperatura,
          peso: h.signosVitales.peso,
          altura: h.signosVitales.altura,
          oxigenacion: h.signosVitales.oxigenacion,
        } : null,
        diagnostico: h.diagnostico || "",
        tratamiento: h.tratamiento || null,
        // Asegurar que medicamentos sea un array válido y bien estructurado
        medicamentos: Array.isArray(h.medicamentos) ? h.medicamentos.filter((med: any) => 
          med && typeof med === 'object' && med.nombre
        ).map((med: any) => ({
          nombre: med.nombre || "",
          dosis: med.dosis || "",
          frecuencia: med.frecuencia || "",
          duracion: med.duracion || ""
        })) : [],
        estudios: h.estudiosComplementarios ? h.estudiosComplementarios.filter((e: any) => 
          e && (typeof e === 'string' || (typeof e === 'object' && (e.tipo || e.nombre)))
        ).map((e: any) => ({
          tipo: e.tipo || e.nombre || e,
          resultado: e.resultado || "Pendiente",
          fecha: e.fecha || h.fecha
        })) : [],
        indicaciones: h.indicaciones || null,
        observaciones: h.observaciones || null,
        proximo_control: h.proximoControl || null,
      }))
      
      // Ordenar las consultas de más recientes a más viejas
      const consultasOrdenadas = historiasFormateadas.sort((a: any, b: any) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      )
      
      setConsultas(consultasOrdenadas)
    } catch (error) {
      console.error("Error cargando historia clínica:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la historia clínica",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calcularEdad = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return "N/A"
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }

    return edad
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/Argentina/Buenos_Aires",
    })
  }

  
  const formatearFechaHora = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Argentina/Buenos_Aires",
      hour12: false,
    })
  }

  const formatearHora = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Argentina/Buenos_Aires",
      hour12: false,
    })
  }

  // Agrupar diagnósticos únicos
  const diagnosticosUnicos = Array.from(
    new Set(consultas.filter(c => c.diagnostico).map(c => c.diagnostico))
  )

  // Medicamentos actuales (últimas consultas)
  const medicamentosActuales = consultas
    .filter(c => c.medicamentos && c.medicamentos.length > 0)
    .slice(0, 3)
    .flatMap(c => c.medicamentos || [])
    .slice(0, 10) // Limitar a 10 medicamentos más recientes

  // Medicamentos únicos para evitar duplicados
  const medicamentosUnicos = medicamentosActuales.reduce((acc: any[], med) => {
    const existe = acc.find(m => m.nombre.toLowerCase() === med.nombre.toLowerCase())
    if (!existe) {
      acc.push(med)
    }
    return acc
  }, [])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[90vw] h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-6 w-6" />
              Historia Clínica - {paciente.apellido}, {paciente.nombre}
            </DialogTitle>
            <DialogDescription className="text-base">
              DNI: {paciente.dni} • Edad: {calcularEdad(paciente.fechaNacimiento || "")} años • Obra Social:{" "}
              {paciente.obraSocial || "No especificada"}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="consultas" className="flex-1 flex flex-col min-h-0">
              <div className="mb-4 flex-shrink-0">
                <ScrollArea className="flex-1">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="consultas" className="whitespace-nowrap">
                      Consultas ({consultas.length})
                    </TabsTrigger>
                    <TabsTrigger value="resumen" className="whitespace-nowrap">
                      Resumen Médico
                    </TabsTrigger>
                    <TabsTrigger value="medicamentos" className="whitespace-nowrap">
                      Medicamentos ({consultas.reduce((total, c) => total + (c.medicamentos?.length || 0), 0)})
                    </TabsTrigger>
                    <TabsTrigger value="estudios" className="whitespace-nowrap">
                      Estudios ({consultas.reduce((total, c) => total + (c.estudios?.length || 0), 0)})
                    </TabsTrigger>
                  </TabsList>
                </ScrollArea>
              </div>

              <div className="flex-1 min-h-0">
                <ScrollArea className="h-full pr-4">
                  <TabsContent value="consultas" className="space-y-6 mt-0">
                    {consultas.length === 0 ? (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground text-lg mb-4">No hay consultas registradas</p>
                        </CardContent>
                      </Card>
                    ) : (
                      consultas.map((consulta) => (
                        <Card key={consulta.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-5 w-5 text-blue-600" />
                                  <span className="font-semibold text-base">
                                    {formatearFecha(consulta.fecha)}
                                  </span>
                                  <Clock className="h-4 w-4 text-muted-foreground ml-3" />
                                  <span className="text-sm text-muted-foreground">
                                    {formatearHora(consulta.fecha)}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setConsultaSeleccionada(consulta)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>
                                Dr. {consulta.profesional.apellido}, {consulta.profesional.nombre}
                              </span>
                              <Separator orientation="vertical" className="h-4" />
                              <Stethoscope className="h-4 w-4" />
                              <span>{consulta.profesional.especialidad}</span>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                                Motivo de Consulta
                              </h4>
                              <p className="text-sm leading-relaxed">{consulta.motivo}</p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Detalle</h4>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{consulta.detalle}</p>
                            </div>

                            {consulta.examen_fisico && (
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Examen Físico</h4>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{consulta.examen_fisico}</p>
                              </div>
                            )}

                            {consulta.diagnostico && (
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Diagnóstico</h4>
                                <p className="text-sm font-medium leading-relaxed">{consulta.diagnostico}</p>
                              </div>
                            )}

                            {consulta.signos_vitales && (
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-3">Signos Vitales</h4>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
                                  {consulta.signos_vitales.presion && (
                                    <div className="flex items-center gap-2">
                                      <Heart className="h-4 w-4 text-red-500 flex-shrink-0" />
                                      <div>
                                        <p className="text-xs text-muted-foreground">PA</p>
                                        <p className="text-sm font-semibold">
                                          {consulta.signos_vitales.presion}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  {consulta.signos_vitales.frecuencia && (
                                    <div className="flex items-center gap-2">
                                      <Activity className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                      <div>
                                        <p className="text-xs text-muted-foreground">FC</p>
                                        <p className="text-sm font-semibold">
                                          {consulta.signos_vitales.frecuencia}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  {consulta.signos_vitales.temperatura && (
                                    <div className="flex items-center gap-2">
                                      <Thermometer className="h-4 w-4 text-orange-500 flex-shrink-0" />
                                      <div>
                                        <p className="text-xs text-muted-foreground">Temp</p>
                                        <p className="text-sm font-semibold">
                                          {consulta.signos_vitales.temperatura}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  {consulta.signos_vitales.peso && (
                                    <div className="flex items-center gap-2">
                                      <Weight className="h-4 w-4 text-green-500 flex-shrink-0" />
                                      <div>
                                        <p className="text-xs text-muted-foreground">Peso</p>
                                        <p className="text-sm font-semibold">{consulta.signos_vitales.peso}</p>
                                      </div>
                                    </div>
                                  )}
                                  {consulta.signos_vitales.altura && (
                                    <div className="flex items-center gap-2">
                                      <Ruler className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                      <div>
                                        <p className="text-xs text-muted-foreground">Altura</p>
                                        <p className="text-sm font-semibold">{consulta.signos_vitales.altura}</p>
                                      </div>
                                    </div>
                                  )}

                                  {consulta.signos_vitales.oxigenacion && (
                                    <div className="flex items-center gap-2">
                                      <Activity className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                      <div>
                                        <p className="text-xs text-muted-foreground">Oxigenación</p>
                                        <p className="text-sm font-semibold">{consulta.signos_vitales.oxigenacion}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {consulta.medicamentos && consulta.medicamentos.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                  <Pill className="h-4 w-4" />
                                  Medicamentos Prescriptos ({consulta.medicamentos.length})
                                </h4>
                                <div className="space-y-2">
                                  {consulta.medicamentos.map((med, index) => (
                                    <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <p className="text-sm font-semibold text-blue-900">
                                            {med.nombre}
                                          </p>
                                          <div className="mt-1 space-y-1">
                                            <div className="flex items-center gap-4 text-xs text-blue-700">
                                              <span className="flex items-center gap-1">
                                                <span className="font-medium">Dosis:</span> {med.dosis}
                                              </span>
                                              <span className="flex items-center gap-1">
                                                <span className="font-medium">Frecuencia:</span> {med.frecuencia}
                                              </span>
                                            </div>
                                            <div className="text-xs text-blue-600">
                                              <span className="font-medium">Duración:</span> {med.duracion}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded">
                                          #{index + 1}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {consulta.tratamiento && (
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Tratamiento</h4>
                                <p className="text-sm leading-relaxed">{consulta.tratamiento}</p>
                              </div>
                            )}

                            {consulta.indicaciones && (
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Indicaciones</h4>
                                <p className="text-sm leading-relaxed">{consulta.indicaciones}</p>
                              </div>
                            )}

                            {consulta.estudios && consulta.estudios.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  Estudios Complementarios ({consulta.estudios.length})
                                </h4>
                                <div className="space-y-2">
                                  {consulta.estudios.map((estudio, index) => (
                                    <div key={index} className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <p className="text-sm font-semibold text-green-900">
                                            {estudio.tipo}
                                          </p>
                                          <div className="mt-1 space-y-1">
                                            <div className="text-xs text-green-700">
                                              <span className="font-medium">Resultado:</span> {estudio.resultado}
                                            </div>
                                            <div className="text-xs text-green-600">
                                              <span className="font-medium">Fecha:</span> {formatearFecha(estudio.fecha)}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-xs text-green-500 bg-green-100 px-2 py-1 rounded">
                                          #{index + 1}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {consulta.observaciones && (
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Observaciones</h4>
                                <p className="text-sm leading-relaxed">{consulta.observaciones}</p>
                              </div>
                            )}

                            {consulta.proximo_control && (
                              <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                                <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-semibold">Próximo Control</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatearFecha(consulta.proximo_control)}
                                  </p>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="resumen" className="space-y-4 mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Resumen Médico</CardTitle>
                        <CardDescription>Información consolidada del paciente</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h4 className="font-semibold mb-3">Diagnósticos Registrados</h4>
                          {diagnosticosUnicos.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {diagnosticosUnicos.map((diagnostico, index) => (
                                <Badge key={index} variant="outline" className="text-sm py-1">
                                  {diagnostico}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No hay diagnósticos registrados</p>
                          )}
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-3">Medicación Actual</h4>
                          {medicamentosUnicos.length > 0 ? (
                            <div className="space-y-2">
                              {medicamentosUnicos.slice(0, 5).map((med, index) => (
                                <div key={index} className="p-2 bg-blue-50 rounded-lg border-l-2 border-blue-400">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm text-blue-900">{med.nombre}</span>
                                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                      {med.dosis}
                                    </span>
                                  </div>
                                  <div className="text-xs text-blue-700 mt-1">
                                    {med.frecuencia} • {med.duracion}
                                  </div>
                                </div>
                              ))}
                              {medicamentosUnicos.length > 5 && (
                                <p className="text-xs text-muted-foreground text-center py-2">
                                  +{medicamentosUnicos.length - 5} medicamentos más en las consultas
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No hay medicación registrada</p>
                          )}
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-3">Total de Consultas</h4>
                          <p className="text-2xl font-bold text-primary">{consultas.length}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="medicamentos" className="space-y-4 mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Historial de Medicamentos</CardTitle>
                        <CardDescription>Todos los medicamentos prescriptos por consulta</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {consultas.filter(c => c.medicamentos && c.medicamentos.length > 0).length > 0 ? (
                          <div className="space-y-6">
                            {consultas
                              .filter(c => c.medicamentos && c.medicamentos.length > 0)
                              .map((consulta) => (
                                <div key={consulta.id} className="border rounded-lg p-4 bg-gray-50">
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <h4 className="font-semibold text-sm">
                                        {formatearFecha(consulta.fecha)}
                                      </h4>
                                      <p className="text-xs text-muted-foreground">
                                        Dr. {consulta.profesional.apellido}, {consulta.profesional.nombre} • {consulta.profesional.especialidad}
                                      </p>
                                    </div>
                                    <Badge variant="secondary">
                                      {consulta.medicamentos?.length || 0} medicamentos
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid gap-3">
                                    {(consulta.medicamentos || []).map((med, medIndex) => (
                                      <div
                                        key={`${consulta.id}-${medIndex}`}
                                        className="bg-white p-3 rounded-lg border border-blue-200"
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <h5 className="font-semibold text-blue-900">
                                              {med.nombre}
                                            </h5>
                                            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-600">Dosis:</span>
                                                <span className="text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs">
                                                  {med.dosis}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-600">Frecuencia:</span>
                                                <span className="text-green-700 bg-green-50 px-2 py-1 rounded text-xs">
                                                  {med.frecuencia}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-600">Duración:</span>
                                                <span className="text-orange-700 bg-orange-50 px-2 py-1 rounded text-xs">
                                                  {med.duracion}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-3">
                                            #{medIndex + 1}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No hay medicamentos registrados</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="estudios" className="space-y-4 mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Historial de Estudios Complementarios</CardTitle>
                        <CardDescription>Todos los estudios solicitados por consulta</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {consultas.filter(c => c.estudios && c.estudios.length > 0).length > 0 ? (
                          <div className="space-y-6">
                            {consultas
                              .filter(c => c.estudios && c.estudios.length > 0)
                              .map((consulta) => (
                                <div key={consulta.id} className="border rounded-lg p-4 bg-gray-50">
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <h4 className="font-semibold text-sm">
                                        {formatearFecha(consulta.fecha)}
                                      </h4>
                                      <p className="text-xs text-muted-foreground">
                                        Dr. {consulta.profesional.apellido}, {consulta.profesional.nombre} • {consulta.profesional.especialidad}
                                      </p>
                                    </div>
                                    <Badge variant="secondary">
                                      {consulta.estudios?.length || 0} estudios
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid gap-3">
                                    {(consulta.estudios || []).map((estudio, estIndex) => (
                                      <div
                                        key={`${consulta.id}-${estIndex}`}
                                        className="bg-white p-3 rounded-lg border border-green-200"
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <h5 className="font-semibold text-green-900">
                                              {estudio.tipo}
                                            </h5>
                                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-600">Resultado:</span>
                                                <span className="text-green-700 bg-green-50 px-2 py-1 rounded text-xs">
                                                  {estudio.resultado}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-600">Fecha:</span>
                                                <span className="text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs">
                                                  {formatearFecha(estudio.fecha)}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-3">
                                            #{estIndex + 1}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No hay estudios registrados</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </ScrollArea>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {consultaSeleccionada && (
        <Dialog open={!!consultaSeleccionada} onOpenChange={() => setConsultaSeleccionada(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Consulta Completa - {formatearFecha(consultaSeleccionada.fecha)}
              </DialogTitle>
              <DialogDescription className="text-base">
                Dr. {consultaSeleccionada.profesional.apellido}, {consultaSeleccionada.profesional.nombre} •{" "}
                {consultaSeleccionada.profesional.especialidad}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 py-2">
                <div>
                  <h4 className="font-semibold mb-3 text-base">Motivo de Consulta</h4>
                  <p className="text-sm bg-muted/30 p-4 rounded-lg leading-relaxed">
                    {consultaSeleccionada.motivo}
                  </p>
                </div>

                {consultaSeleccionada.detalle && (
                  <div>
                    <h4 className="font-semibold mb-3 text-base">Detalle</h4>
                    <p className="text-sm bg-muted/30 p-4 rounded-lg leading-relaxed whitespace-pre-wrap">
                      {consultaSeleccionada.detalle}
                    </p>
                  </div>
                )}

                {consultaSeleccionada.examen_fisico && (
                  <div>
                    <h4 className="font-semibold mb-3 text-base">Examen Físico</h4>
                    <p className="text-sm bg-muted/30 p-4 rounded-lg leading-relaxed whitespace-pre-wrap">
                      {consultaSeleccionada.examen_fisico}
                    </p>
                  </div>
                )}

                {consultaSeleccionada.diagnostico && (
                  <div>
                    <h4 className="font-semibold mb-3 text-base">Diagnóstico</h4>
                    <p className="text-sm bg-blue-50 p-4 rounded-lg font-medium leading-relaxed">
                      {consultaSeleccionada.diagnostico}
                    </p>
                  </div>
                )}

                {consultaSeleccionada.tratamiento && (
                  <div>
                    <h4 className="font-semibold mb-3 text-base">Tratamiento</h4>
                    <p className="text-sm bg-muted/30 p-4 rounded-lg leading-relaxed">
                      {consultaSeleccionada.tratamiento}
                    </p>
                  </div>
                )}

                {consultaSeleccionada.indicaciones && (
                  <div>
                    <h4 className="font-semibold mb-3 text-base">Indicaciones</h4>
                    <p className="text-sm bg-green-50 p-4 rounded-lg leading-relaxed">
                      {consultaSeleccionada.indicaciones}
                    </p>
                  </div>
                )}

                {consultaSeleccionada.observaciones && (
                  <div>
                    <h4 className="font-semibold mb-3 text-base">Observaciones</h4>
                    <p className="text-sm bg-muted/30 p-4 rounded-lg leading-relaxed">
                      {consultaSeleccionada.observaciones}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}