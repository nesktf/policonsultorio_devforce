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
import { NuevaConsultaDialog } from "./nueva-consulta-dialog"
import {
  FileText,
  Plus,
  Calendar,
  User,
  Stethoscope,
  Pill,
  AlertTriangle,
  Clock,
  Eye,
  Edit,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Ruler,
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
  presionArterial: string
  frecuenciaCardiaca: number
  temperatura: number
  peso: number
  altura: number
  saturacionOxigeno: number
}

interface Consulta {
  id: string
  fecha: string
  hora: string
  profesional: {
    nombre: string
    apellido: string
    especialidad: string
    matricula: string
  }
  motivoConsulta: string
  anamnesis: string
  examenFisico: string
  diagnostico: string
  tratamiento: string
  indicaciones: string
  observaciones: string
  proximoControl: string
  signosVitales: SignosVitales
  estudiosComplementarios: string[]
  medicamentos: {
    nombre: string
    dosis: string
    frecuencia: string
    duracion: string
  }[]
  estado: "completada" | "pendiente" | "cancelada"
}

interface HistoriaClinicaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paciente: Paciente
  showAddConsulta?: boolean // Agregando prop para mostrar automáticamente el dialog de nueva consulta
}

// Mock data para historia clínica
const mockHistoriaClinica: Consulta[] = [
  {
    id: "1",
    fecha: "2024-01-15",
    hora: "10:30",
    profesional: {
      nombre: "Dr. Carlos",
      apellido: "Mendoza",
      especialidad: "Cardiología",
      matricula: "MN 12345",
    },
    motivoConsulta: "Control rutinario y dolor en el pecho",
    anamnesis:
      "Paciente refiere dolor precordial de características opresivas, de intensidad moderada, que se presenta durante el ejercicio. Sin irradiación. Niega disnea, palpitaciones o síncope.",
    examenFisico:
      "Paciente en buen estado general, consciente, orientado. Ruidos cardíacos rítmicos, sin soplos. Pulmones ventilando bien bilateralmente. Abdomen blando, depresible, sin masas palpables.",
    diagnostico: "Angina de esfuerzo estable. Hipertensión arterial controlada.",
    tratamiento: "Continuar con medicación antihipertensiva. Iniciar betabloqueante.",
    indicaciones: "Dieta hiposódica, ejercicio moderado supervisado, control de peso. Evitar esfuerzos intensos.",
    observaciones: "Paciente colaborador, comprende las indicaciones. Familiar acompañante informado.",
    proximoControl: "2024-02-15",
    signosVitales: {
      presionArterial: "140/90",
      frecuenciaCardiaca: 78,
      temperatura: 36.5,
      peso: 75.2,
      altura: 175,
      saturacionOxigeno: 98,
    },
    estudiosComplementarios: ["ECG", "Ecocardiograma", "Ergometría"],
    medicamentos: [
      {
        nombre: "Enalapril",
        dosis: "10mg",
        frecuencia: "Cada 12 horas",
        duracion: "Continuo",
      },
      {
        nombre: "Atenolol",
        dosis: "50mg",
        frecuencia: "Una vez al día",
        duracion: "30 días",
      },
    ],
    estado: "completada",
  },
  {
    id: "2",
    fecha: "2024-01-08",
    hora: "14:15",
    profesional: {
      nombre: "Dra. Ana",
      apellido: "García",
      especialidad: "Medicina General",
      matricula: "MN 67890",
    },
    motivoConsulta: "Consulta por hipertensión arterial",
    anamnesis:
      "Paciente con antecedentes de hipertensión arterial en tratamiento. Refiere adherencia al tratamiento. Sin síntomas asociados.",
    examenFisico: "Buen estado general. TA: 135/85 mmHg. FC: 72 lpm. Peso: 74.8 kg. Sin edemas. Fondo de ojo normal.",
    diagnostico: "Hipertensión arterial esencial en tratamiento",
    tratamiento: "Continuar con Enalapril 10mg c/12hs",
    indicaciones: "Dieta hiposódica, control de peso, actividad física regular",
    observaciones: "Buen control tensional. Paciente adherente al tratamiento.",
    proximoControl: "2024-02-08",
    signosVitales: {
      presionArterial: "135/85",
      frecuenciaCardiaca: 72,
      temperatura: 36.3,
      peso: 74.8,
      altura: 175,
      saturacionOxigeno: 99,
    },
    estudiosComplementarios: ["Laboratorio completo"],
    medicamentos: [
      {
        nombre: "Enalapril",
        dosis: "10mg",
        frecuencia: "Cada 12 horas",
        duracion: "Continuo",
      },
    ],
    estado: "completada",
  },
]

export function HistoriaClinicaDialog({
  open,
  onOpenChange,
  paciente,
  showAddConsulta = false,
}: HistoriaClinicaDialogProps) {
  const { user } = useAuth()
  const [consultas, setConsultas] = useState<Consulta[]>(mockHistoriaClinica)
  const [showNuevaConsulta, setShowNuevaConsulta] = useState(false)
  const [consultaSeleccionada, setConsultaSeleccionada] = useState<Consulta | null>(null)

  useEffect(() => {
    if (open && showAddConsulta) {
      setShowNuevaConsulta(true)
    }
  }, [open, showAddConsulta])

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
    })
  }

  const handleNuevaConsulta = (nuevaConsulta: Omit<Consulta, "id">) => {
    const consultaConId = {
      ...nuevaConsulta,
      id: (consultas.length + 1).toString(),
    }
    setConsultas([consultaConId, ...consultas])
  }

  const puedeAgregarConsulta = user?.role === "profesional" || user?.role === "gerente"

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Historia Clínica - {paciente.apellido}, {paciente.nombre}
            </DialogTitle>
            <DialogDescription>
              DNI: {paciente.dni} • Edad: {calcularEdad(paciente.fechaNacimiento || "")} años • Obra Social:{" "}
              {paciente.obraSocial || "No especificada"}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="consultas" className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="consultas">Consultas</TabsTrigger>
                <TabsTrigger value="resumen">Resumen Médico</TabsTrigger>
                <TabsTrigger value="estudios">Estudios</TabsTrigger>
                <TabsTrigger value="medicamentos">Medicamentos</TabsTrigger>
              </TabsList>

              {puedeAgregarConsulta && (
                <Button onClick={() => setShowNuevaConsulta(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Consulta
                </Button>
              )}
            </div>

            <ScrollArea className="h-[60vh]">
              <TabsContent value="consultas" className="space-y-4">
                {consultas.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No hay consultas registradas</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  consultas.map((consulta) => (
                    <Card key={consulta.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{formatearFecha(consulta.fecha)}</span>
                              <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                              <span className="text-sm text-muted-foreground">{consulta.hora}</span>
                            </div>
                            <Badge
                              variant={consulta.estado === "completada" ? "secondary" : "outline"}
                              className={consulta.estado === "completada" ? "text-green-700 bg-green-100" : ""}
                            >
                              {consulta.estado === "completada" ? "Completada" : "Pendiente"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setConsultaSeleccionada(consulta)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {puedeAgregarConsulta && (
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>
                            {consulta.profesional.nombre} {consulta.profesional.apellido}
                          </span>
                          <Separator orientation="vertical" className="h-4" />
                          <Stethoscope className="h-4 w-4" />
                          <span>{consulta.profesional.especialidad}</span>
                          <Separator orientation="vertical" className="h-4" />
                          <span>{consulta.profesional.matricula}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Motivo de Consulta</h4>
                          <p className="text-sm">{consulta.motivoConsulta}</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Diagnóstico</h4>
                          <p className="text-sm font-medium">{consulta.diagnostico}</p>
                        </div>

                        {/* Signos Vitales */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">Presión Arterial</p>
                              <p className="text-sm font-medium">{consulta.signosVitales.presionArterial} mmHg</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">Frecuencia Cardíaca</p>
                              <p className="text-sm font-medium">{consulta.signosVitales.frecuenciaCardiaca} lpm</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Thermometer className="h-4 w-4 text-orange-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">Temperatura</p>
                              <p className="text-sm font-medium">{consulta.signosVitales.temperatura}°C</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Weight className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">Peso</p>
                              <p className="text-sm font-medium">{consulta.signosVitales.peso} kg</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Ruler className="h-4 w-4 text-purple-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">Altura</p>
                              <p className="text-sm font-medium">{consulta.signosVitales.altura} cm</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">O₂</span>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Saturación O₂</p>
                              <p className="text-sm font-medium">{consulta.signosVitales.saturacionOxigeno}%</p>
                            </div>
                          </div>
                        </div>

                        {consulta.medicamentos.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-1">
                              <Pill className="h-4 w-4" />
                              Medicamentos Prescriptos
                            </h4>
                            <div className="space-y-2">
                              {consulta.medicamentos.map((med, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                                  <div>
                                    <p className="text-sm font-medium">
                                      {med.nombre} {med.dosis}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {med.frecuencia} • {med.duracion}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {consulta.proximoControl && (
                          <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <div>
                              <p className="text-sm font-medium">Próximo Control</p>
                              <p className="text-xs text-muted-foreground">{formatearFecha(consulta.proximoControl)}</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="resumen" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen Médico</CardTitle>
                    <CardDescription>Información consolidada del paciente</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Diagnósticos Principales</h4>
                      <div className="space-y-1">
                        <Badge variant="outline">Hipertensión arterial esencial</Badge>
                        <Badge variant="outline">Angina de esfuerzo estable</Badge>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Medicación Actual</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Enalapril 10mg cada 12 horas</li>
                        <li>• Atenolol 50mg una vez al día</li>
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Alergias y Contraindicaciones</h4>
                      <p className="text-sm text-muted-foreground">No se registran alergias conocidas</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="estudios" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Estudios Complementarios</CardTitle>
                    <CardDescription>Historial de estudios realizados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Electrocardiograma</p>
                          <p className="text-sm text-muted-foreground">15/01/2024 • Dr. Mendoza</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Ver Resultado
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Ecocardiograma</p>
                          <p className="text-sm text-muted-foreground">15/01/2024 • Dr. Mendoza</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Ver Resultado
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Laboratorio Completo</p>
                          <p className="text-sm text-muted-foreground">08/01/2024 • Dra. García</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Ver Resultado
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medicamentos" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Historial de Medicamentos</CardTitle>
                    <CardDescription>Todos los medicamentos prescriptos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {consultas.flatMap((consulta) =>
                        consulta.medicamentos.map((med, index) => (
                          <div
                            key={`${consulta.id}-${index}`}
                            className="flex items-center justify-between p-3 border rounded"
                          >
                            <div>
                              <p className="font-medium">
                                {med.nombre} {med.dosis}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {med.frecuencia} • {med.duracion}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Prescripto el {formatearFecha(consulta.fecha)} por {consulta.profesional.nombre}{" "}
                                {consulta.profesional.apellido}
                              </p>
                            </div>
                            <Badge variant="outline">Activo</Badge>
                          </div>
                        )),
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver consulta completa */}
      {consultaSeleccionada && (
        <Dialog open={!!consultaSeleccionada} onOpenChange={() => setConsultaSeleccionada(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Consulta Completa - {formatearFecha(consultaSeleccionada.fecha)}</DialogTitle>
              <DialogDescription>
                {consultaSeleccionada.profesional.nombre} {consultaSeleccionada.profesional.apellido} •{" "}
                {consultaSeleccionada.profesional.especialidad}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[70vh]">
              <div className="space-y-6 p-1">
                <div>
                  <h4 className="font-medium mb-2">Motivo de Consulta</h4>
                  <p className="text-sm bg-muted/30 p-3 rounded">{consultaSeleccionada.motivoConsulta}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Anamnesis</h4>
                  <p className="text-sm bg-muted/30 p-3 rounded">{consultaSeleccionada.anamnesis}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Examen Físico</h4>
                  <p className="text-sm bg-muted/30 p-3 rounded">{consultaSeleccionada.examenFisico}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Diagnóstico</h4>
                  <p className="text-sm bg-blue-50 p-3 rounded font-medium">{consultaSeleccionada.diagnostico}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Tratamiento</h4>
                  <p className="text-sm bg-muted/30 p-3 rounded">{consultaSeleccionada.tratamiento}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Indicaciones</h4>
                  <p className="text-sm bg-green-50 p-3 rounded">{consultaSeleccionada.indicaciones}</p>
                </div>

                {consultaSeleccionada.observaciones && (
                  <div>
                    <h4 className="font-medium mb-2">Observaciones</h4>
                    <p className="text-sm bg-muted/30 p-3 rounded">{consultaSeleccionada.observaciones}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog para nueva consulta */}
      <NuevaConsultaDialog
        open={showNuevaConsulta}
        onOpenChange={setShowNuevaConsulta}
        paciente={paciente}
        onConsultaCreada={handleNuevaConsulta}
      />
    </>
  )
}
