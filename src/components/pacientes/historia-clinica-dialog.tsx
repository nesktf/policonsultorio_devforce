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
import { Input } from "@/components/ui/input"
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
  Upload,
  Download,
  X,
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
  const [archivosAdjuntos, setArchivosAdjuntos] = useState<File[]>([])

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setArchivosAdjuntos([...archivosAdjuntos, ...Array.from(files)])
    }
  }

  const handleRemoveFile = (index: number) => {
    setArchivosAdjuntos(archivosAdjuntos.filter((_, i) => i !== index))
  }

  const puedeAgregarConsulta = user?.role === "profesional" || user?.role === "gerente"

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

          <Tabs defaultValue="consultas" className="flex-1 flex flex-col min-h-0">
            <div className="mb-4 flex-shrink-0">
              <ScrollArea className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="consultas" className="whitespace-nowrap">
                    Consultas
                  </TabsTrigger>
                  <TabsTrigger value="resumen" className="whitespace-nowrap">
                    Resumen Médico
                  </TabsTrigger>
                  <TabsTrigger value="estudios" className="whitespace-nowrap">
                    Estudios
                  </TabsTrigger>
                  <TabsTrigger value="medicamentos" className="whitespace-nowrap">
                    Medicamentos
                  </TabsTrigger>
                </TabsList>
              </ScrollArea>
            </div>

            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full pr-4">
                <TabsContent value="consultas" className="space-y-6 mt-0">
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
                        <CardHeader className="pb-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <span className="font-semibold text-base">{formatearFecha(consulta.fecha)}</span>
                                <Clock className="h-4 w-4 text-muted-foreground ml-3" />
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
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
                        <CardContent className="space-y-6">
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Motivo de Consulta</h4>
                            <p className="text-sm leading-relaxed">{consulta.motivoConsulta}</p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Diagnóstico</h4>
                            <p className="text-sm font-medium leading-relaxed">{consulta.diagnostico}</p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-3">Signos Vitales</h4>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Heart className="h-5 w-5 text-red-500 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-muted-foreground mb-0.5">Presión Arterial</p>
                                  <p className="text-sm font-semibold">{consulta.signosVitales.presionArterial} mmHg</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Activity className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-muted-foreground mb-0.5">Frecuencia Cardíaca</p>
                                  <p className="text-sm font-semibold">
                                    {consulta.signosVitales.frecuenciaCardiaca} lpm
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Thermometer className="h-5 w-5 text-orange-500 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-muted-foreground mb-0.5">Temperatura</p>
                                  <p className="text-sm font-semibold">{consulta.signosVitales.temperatura}°C</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Weight className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-muted-foreground mb-0.5">Peso</p>
                                  <p className="text-sm font-semibold">{consulta.signosVitales.peso} kg</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Ruler className="h-5 w-5 text-purple-500 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-muted-foreground mb-0.5">Altura</p>
                                  <p className="text-sm font-semibold">{consulta.signosVitales.altura} cm</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs text-white font-bold">O₂</span>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-0.5">Saturación O₂</p>
                                  <p className="text-sm font-semibold">{consulta.signosVitales.saturacionOxigeno}%</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {consulta.medicamentos.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                                <Pill className="h-4 w-4" />
                                Medicamentos Prescriptos
                              </h4>
                              <div className="space-y-3">
                                {consulta.medicamentos.map((med, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                                  >
                                    <div>
                                      <p className="text-sm font-semibold">
                                        {med.nombre} {med.dosis}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {med.frecuencia} • {med.duracion}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {consulta.proximoControl && (
                            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-semibold">Próximo Control</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
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
                        <h4 className="font-semibold mb-3">Diagnósticos Principales</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-sm py-1">
                            Hipertensión arterial esencial
                          </Badge>
                          <Badge variant="outline" className="text-sm py-1">
                            Angina de esfuerzo estable
                          </Badge>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-3">Medicación Actual</h4>
                        <ul className="text-sm space-y-2 leading-relaxed">
                          <li>• Enalapril 10mg cada 12 horas</li>
                          <li>• Atenolol 50mg una vez al día</li>
                        </ul>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-3">Alergias y Contraindicaciones</h4>
                        <p className="text-sm text-muted-foreground">No se registran alergias conocidas</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="estudios" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Estudios Complementarios</CardTitle>
                      <CardDescription>Historial de estudios realizados</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {puedeAgregarConsulta && (
                        <div className="border-2 border-dashed rounded-lg p-6 bg-muted/20">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-semibold mb-1">Adjuntar Nuevo Estudio</h4>
                              <p className="text-sm text-muted-foreground">
                                Sube archivos PDF, imágenes o documentos relacionados
                              </p>
                            </div>
                            <label htmlFor="file-upload">
                              <Button variant="outline" className="gap-2 cursor-pointer bg-transparent" asChild>
                                <span>
                                  <Upload className="h-4 w-4" />
                                  Seleccionar Archivo
                                </span>
                              </Button>
                              <Input
                                id="file-upload"
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleFileUpload}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              />
                            </label>
                          </div>

                          {archivosAdjuntos.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Archivos seleccionados:</p>
                              {archivosAdjuntos.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-background border rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    <div>
                                      <p className="text-sm font-medium">{file.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {(file.size / 1024).toFixed(2)} KB
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveFile(index)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button className="w-full mt-2">
                                <Upload className="h-4 w-4 mr-2" />
                                Subir Archivos
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      <Separator />

                      <div className="space-y-3">
                        <h4 className="font-semibold">Estudios Registrados</h4>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-semibold">Electrocardiograma</p>
                              <p className="text-sm text-muted-foreground mt-1">15/01/2024 • Dr. Mendoza</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Download className="h-4 w-4" />
                            Descargar
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-semibold">Ecocardiograma</p>
                              <p className="text-sm text-muted-foreground mt-1">15/01/2024 • Dr. Mendoza</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Download className="h-4 w-4" />
                            Descargar
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-semibold">Laboratorio Completo</p>
                              <p className="text-sm text-muted-foreground mt-1">08/01/2024 • Dra. García</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Download className="h-4 w-4" />
                            Descargar
                          </Button>
                        </div>
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
                      <div className="space-y-4">
                        {consultas.flatMap((consulta) =>
                          consulta.medicamentos.map((med, index) => (
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
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {consultaSeleccionada && (
        <Dialog open={!!consultaSeleccionada} onOpenChange={() => setConsultaSeleccionada(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Consulta Completa - {formatearFecha(consultaSeleccionada.fecha)}
              </DialogTitle>
              <DialogDescription className="text-base">
                {consultaSeleccionada.profesional.nombre} {consultaSeleccionada.profesional.apellido} •{" "}
                {consultaSeleccionada.profesional.especialidad}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 py-2">
                <div>
                  <h4 className="font-semibold mb-3 text-base">Motivo de Consulta</h4>
                  <p className="text-sm bg-muted/30 p-4 rounded-lg leading-relaxed">
                    {consultaSeleccionada.motivoConsulta}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-base">Anamnesis</h4>
                  <p className="text-sm bg-muted/30 p-4 rounded-lg leading-relaxed">{consultaSeleccionada.anamnesis}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-base">Examen Físico</h4>
                  <p className="text-sm bg-muted/30 p-4 rounded-lg leading-relaxed">
                    {consultaSeleccionada.examenFisico}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-base">Diagnóstico</h4>
                  <p className="text-sm bg-blue-50 p-4 rounded-lg font-medium leading-relaxed">
                    {consultaSeleccionada.diagnostico}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-base">Tratamiento</h4>
                  <p className="text-sm bg-muted/30 p-4 rounded-lg leading-relaxed">
                    {consultaSeleccionada.tratamiento}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-base">Indicaciones</h4>
                  <p className="text-sm bg-green-50 p-4 rounded-lg leading-relaxed">
                    {consultaSeleccionada.indicaciones}
                  </p>
                </div>

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