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
import { NuevaConsultaDialog } from "./nueva-consulta-dialog"
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
  presionArterial?: string
  frecuenciaCardiaca?: number
  temperatura?: number
  peso?: number
  altura?: number
  saturacionOxigeno?: number
}

interface Medicamento {
  nombre: string
  dosis: string
  frecuencia: string
  duracion: string
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
  diagnostico?: string
  tratamiento?: string
  indicaciones?: string
  observaciones?: string
  proximoControl?: string
  signosVitales?: SignosVitales
  medicamentos?: Medicamento[]
}

interface HistoriaClinicaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paciente: Paciente
  showAddConsulta?: boolean
}

export function HistoriaClinicaDialog({
  open,
  onOpenChange,
  paciente,
  showAddConsulta = false,
}: HistoriaClinicaDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(false)
  const [showNuevaConsulta, setShowNuevaConsulta] = useState(false)
  const [consultaSeleccionada, setConsultaSeleccionada] = useState<Consulta | null>(null)

  useEffect(() => {
    if (open) {
      fetchHistoriaClinica()
      if (showAddConsulta) {
        setShowNuevaConsulta(true)
      }
    }
  }, [open, showAddConsulta])

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
        motivo: h.motivo || h.anamnesis, // usar anamnesis si no hay motivo
        detalle: h.anamnesis,
        diagnostico: h.diagnostico || null,
        tratamiento: h.tratamiento || null,
        indicaciones: h.indicaciones || null,
        observaciones: h.observaciones || null,
        proximoControl: h.proximoControl || null,
        signosVitales: h.signosVitales ? {
          presionArterial: h.signosVitales.presionArterial,
          frecuenciaCardiaca: parseInt(h.signosVitales.frecuenciaCardiaca),
          temperatura: parseFloat(h.signosVitales.temperatura),
          peso: parseFloat(h.signosVitales.peso),
          altura: parseFloat(h.signosVitales.altura),
          saturacionOxigeno: parseInt(h.signosVitales.oxigenacion || '0'),
        } : undefined,
        medicamentos: h.medicamentos || [],
      }))
      
      setConsultas(historiasFormateadas)
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

  const handleNuevaConsulta = () => {
    fetchHistoriaClinica()
    setShowNuevaConsulta(false)
  }

  const puedeAgregarConsulta = user?.rol === "PROFESIONAL" || user?.rol === "GERENTE"

  // Agrupar diagnósticos únicos
  const diagnosticosUnicos = Array.from(
    new Set(consultas.filter(c => c.diagnostico).map(c => c.diagnostico))
  )

  // Medicamentos actuales (últimas consultas)
  const medicamentosActuales = consultas
    .filter(c => c.medicamentos && c.medicamentos.length > 0)
    .slice(0, 3)
    .flatMap(c => c.medicamentos || [])

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
              <div className="mb-4 flex-shrink-0 flex items-center justify-between">
                <ScrollArea className="flex-1">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="consultas" className="whitespace-nowrap">
                      Consultas ({consultas.length})
                    </TabsTrigger>
                    <TabsTrigger value="resumen" className="whitespace-nowrap">
                      Resumen Médico
                    </TabsTrigger>
                    <TabsTrigger value="medicamentos" className="whitespace-nowrap">
                      Medicamentos
                    </TabsTrigger>
                  </TabsList>
                </ScrollArea>
                {puedeAgregarConsulta && (
                  <Button onClick={() => setShowNuevaConsulta(true)} size="sm" className="ml-4">
                    <FileText className="h-4 w-4 mr-2" />
                    Nueva Consulta
                  </Button>
                )}
              </div>

              <div className="flex-1 min-h-0">
                <ScrollArea className="h-full pr-4">
                  <TabsContent value="consultas" className="space-y-6 mt-0">
                    {consultas.length === 0 ? (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground text-lg mb-4">No hay consultas registradas</p>
                          {puedeAgregarConsulta && (
                            <Button onClick={() => setShowNuevaConsulta(true)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Registrar Primera Consulta
                            </Button>
                          )}
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

                            {consulta.diagnostico && (
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Diagnóstico</h4>
                                <p className="text-sm font-medium leading-relaxed">{consulta.diagnostico}</p>
                              </div>
                            )}

                            {consulta.signosVitales && (
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-3">Signos Vitales</h4>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
                                  {consulta.signosVitales.presionArterial && (
                                    <div className="flex items-center gap-2">
                                      <Heart className="h-4 w-4 text-red-500 flex-shrink-0" />
                                      <div>
                                        <p className="text-xs text-muted-foreground">PA</p>
                                        <p className="text-sm font-semibold">
                                          {consulta.signosVitales.presionArterial}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  {consulta.signosVitales.frecuenciaCardiaca && (
                                    <div className="flex items-center gap-2">
                                      <Activity className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                      <div>
                                        <p className="text-xs text-muted-foreground">FC</p>
                                        <p className="text-sm font-semibold">
                                          {consulta.signosVitales.frecuenciaCardiaca} lpm
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  {consulta.signosVitales.temperatura && (
                                    <div className="flex items-center gap-2">
                                      <Thermometer className="h-4 w-4 text-orange-500 flex-shrink-0" />
                                      <div>
                                        <p className="text-xs text-muted-foreground">Temp</p>
                                        <p className="text-sm font-semibold">
                                          {consulta.signosVitales.temperatura}°C
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  {consulta.signosVitales.peso && (
                                    <div className="flex items-center gap-2">
                                      <Weight className="h-4 w-4 text-green-500 flex-shrink-0" />
                                      <div>
                                        <p className="text-xs text-muted-foreground">Peso</p>
                                        <p className="text-sm font-semibold">{consulta.signosVitales.peso} kg</p>
                                      </div>
                                    </div>
                                  )}
                                  {consulta.signosVitales.altura && (
                                    <div className="flex items-center gap-2">
                                      <Ruler className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                      <div>
                                        <p className="text-xs text-muted-foreground">Altura</p>
                                        <p className="text-sm font-semibold">{consulta.signosVitales.altura} cm</p>
                                      </div>
                                    </div>
                                  )}
                                  {consulta.signosVitales.saturacionOxigeno && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs text-white font-bold">O₂</span>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground">Sat O₂</p>
                                        <p className="text-sm font-semibold">
                                          {consulta.signosVitales.saturacionOxigeno}%
                                        </p>
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
                                  Medicamentos Prescriptos
                                </h4>
                                <div className="space-y-2">
                                  {consulta.medicamentos.map((med, index) => (
                                    <div key={index} className="p-2 bg-blue-50 rounded-lg">
                                      <p className="text-sm font-semibold">
                                        {med.nombre} {med.dosis}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {med.frecuencia} • {med.duracion}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {consulta.proximoControl && (
                              <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                                <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-semibold">Próximo Control</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatearFecha(consulta.proximoControl)}
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
                          <h4 className="font-semibold mb-3">Última Medicación Prescripta</h4>
                          {medicamentosActuales.length > 0 ? (
                            <ul className="text-sm space-y-2 leading-relaxed">
                              {medicamentosActuales.slice(0, 5).map((med, index) => (
                                <li key={index}>
                                  • {med.nombre} {med.dosis} - {med.frecuencia}
                                </li>
                              ))}
                            </ul>
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
                        <CardDescription>Todos los medicamentos prescriptos</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {consultas.filter(c => c.medicamentos && c.medicamentos.length > 0).length > 0 ? (
                          <div className="space-y-4">
                            {consultas
                              .filter(c => c.medicamentos && c.medicamentos.length > 0)
                              .flatMap((consulta) =>
                                (consulta.medicamentos || []).map((med, index) => (
                                  <div
                                    key={`${consulta.id}-${index}`}
                                    className="flex items-center justify-between p-4 border rounded-lg"
                                  >
                                    <div className="space-y-1">
                                      <p className="font-semibold">
                                        {med.nombre} {med.dosis}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {med.frecuencia} • {med.duracion}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Prescripto el {formatearFecha(consulta.fecha)} por Dr.{" "}
                                        {consulta.profesional.apellido}, {consulta.profesional.nombre}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              )}
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

      <NuevaConsultaDialog
        open={showNuevaConsulta}
        onOpenChange={setShowNuevaConsulta}
        paciente={paciente}
        profesionalId={user?.id || 0}
        onConsultaCreada={handleNuevaConsulta}
      />
    </>
  )
}