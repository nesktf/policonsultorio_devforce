"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  Stethoscope,
  FileText,
  Heart,
  Activity,
  Thermometer,
  Weight,
  Ruler,
  Plus,
  Trash2,
  Loader2,
  Pill,
} from "lucide-react"

interface Paciente {
  id: string
  nombre: string
  apellido: string
  dni: string
  fechaNacimiento?: string
}

interface NuevaConsultaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paciente: Paciente
  profesionalId: number
  onConsultaCreada: (consulta: any) => void
}

export function NuevaConsultaDialog({ 
  open, 
  onOpenChange, 
  paciente, 
  profesionalId,
  onConsultaCreada 
}: NuevaConsultaDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [prescribirMedicamentos, setPrescribirMedicamentos] = useState(false)
  const [prescribirEstudios, setPrescribirEstudios] = useState(false)

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    hora: new Date().toTimeString().slice(0, 5),
    motivo: "",
    detalle: "",
    examen_fisico: "",
    diagnostico: "",
    tratamiento: "",
    indicaciones: "",
    observaciones: "",
    proximo_control: "",
    estudios: [""],
    signos_vitales: {
      presion: "",
      frecuencia: "",
      temperatura: "",
      peso: "",
      altura: "",
      oxigenacion: "",
    },
    medicamentos: [
      {
        nombre: "",
        dosis: "",
        frecuencia: "",
        duracion: "",
      },
    ],
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSignosVitalesChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      signos_vitales: {
        ...prev.signos_vitales,
        [field]: value,
      },
    }))
  }

  const handleMedicamentoChange = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      medicamentos: prev.medicamentos.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      ),
    }))
  }

  const agregarMedicamento = () => {
    setFormData((prev) => ({
      ...prev,
      medicamentos: [
        ...prev.medicamentos,
        { nombre: "", dosis: "", frecuencia: "", duracion: "" },
      ],
    }))
  }

  const eliminarMedicamento = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medicamentos: prev.medicamentos.filter((_, i) => i !== index),
    }))
  }

  const handleEstudioChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      estudios: prev.estudios.map((estudio, i) => (i === index ? value : estudio)),
    }))
  }

  const agregarEstudio = () => {
    setFormData((prev) => ({
      ...prev,
      estudios: [...prev.estudios, ""],
    }))
  }

  const eliminarEstudio = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      estudios: prev.estudios.filter((_, i) => i !== index),
    }))
  }

  // Función para agregar unidades automáticamente
  const addUnitsToSignosVitales = (signos: any) => {
    const result = { ...signos }
    
    if (result.presion && !result.presion.includes('mmHg')) {
      result.presion = `${result.presion} mmHg`
    }
    if (result.frecuencia && !result.frecuencia.includes('lpm')) {
      result.frecuencia = `${result.frecuencia} lpm`
    }
    if (result.temperatura && !result.temperatura.includes('°C')) {
      result.temperatura = `${result.temperatura}°C`
    }
    if (result.peso && !result.peso.includes('kg')) {
      result.peso = `${result.peso} kg`
    }
    if (result.altura && !result.altura.includes('cm')) {
      result.altura = `${result.altura} cm`
    }
    if (result.oxigenacion && !result.oxigenacion.includes('%')) {
      result.oxigenacion = `${result.oxigenacion}%`
    }
    
    return result
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validaciones básicas
      if (!formData.motivo || !formData.diagnostico) {
        toast({
          title: "Error de validación",
          description: "El motivo de consulta y diagnóstico son obligatorios",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Validar medicamentos si se habilitó la prescripción
      if (prescribirMedicamentos) {
        const medicamentosCompletos = formData.medicamentos.filter(med => 
          med.nombre.trim() !== "" && 
          med.dosis.trim() !== "" && 
          med.frecuencia.trim() !== "" && 
          med.duracion.trim() !== ""
        )

        if (medicamentosCompletos.length === 0) {
          toast({
            title: "Error de validación",
            description: "Debe agregar al menos un medicamento completo o desmarcar la opción 'Prescribir medicamentos'",
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        // Verificar que no haya medicamentos incompletos
        const medicamentosIncompletos = formData.medicamentos.filter(med => 
          med.nombre.trim() !== "" && (!med.dosis.trim() || !med.frecuencia.trim() || !med.duracion.trim())
        )

        if (medicamentosIncompletos.length > 0) {
          toast({
            title: "Error de validación",
            description: "Todos los medicamentos que tengan nombre deben tener también dosis, frecuencia y duración",
            variant: "destructive",
          })
          setLoading(false)
          return
        }
      }

      const historiaData = {
        pacienteId: paciente.id,
        profesionalId: profesionalId.toString(),
        fecha: `${formData.fecha}T${formData.hora}:00`,
        motivo: formData.motivo,
        detalle: formData.detalle || "",
        examenFisico: formData.examen_fisico || null,
        signosVitales: formData.signos_vitales.presion ? (() => {
          const signosConUnidades = addUnitsToSignosVitales(formData.signos_vitales)
          return {
            presionArterial: signosConUnidades.presion,
            frecuenciaCardiaca: signosConUnidades.frecuencia,
            temperatura: signosConUnidades.temperatura,
            peso: signosConUnidades.peso,
            altura: signosConUnidades.altura,
            oxigenacion: signosConUnidades.oxigenacion,
          }
        })() : null,
        diagnostico: formData.diagnostico,
        tratamiento: formData.tratamiento || null,
        indicaciones: formData.indicaciones || null,
        observaciones: formData.observaciones || null,
        proximoControl: formData.proximo_control ? `${formData.proximo_control}T00:00:00` : null,
        medicamentos: prescribirMedicamentos ? formData.medicamentos.filter((m: any) => 
          m.nombre.trim() !== "" && 
          m.dosis.trim() !== "" && 
          m.frecuencia.trim() !== "" && 
          m.duracion.trim() !== ""
        ) : [],
        estudiosComplementarios: prescribirEstudios ? formData.estudios
          .filter((e: string) => e.trim() !== "")
          .map((e: string) => ({
            tipo: e,
            resultado: "Pendiente",
            fecha: formData.fecha
          })) : [],
      }

      const response = await fetch("/api/v2/historia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historia: historiaData })
      })

      if (!response.ok) {
        const error = await response.json()
        let errorMessage = "Error al crear consulta"
        
        // Mejorar mensajes de error específicos
        if (error.error && error.error.includes("medicamentos")) {
          if (error.error.includes("medicamentos.nombre")) {
            errorMessage = "Error en medicamentos: El nombre del medicamento es obligatorio"
          } else if (error.error.includes("medicamentos.dosis")) {
            errorMessage = "Error en medicamentos: La dosis es obligatoria"
          } else if (error.error.includes("medicamentos.frecuencia")) {
            errorMessage = "Error en medicamentos: La frecuencia es obligatoria"
          } else if (error.error.includes("medicamentos.duracion")) {
            errorMessage = "Error en medicamentos: La duración es obligatoria"
          } else {
            errorMessage = "Error en la prescripción de medicamentos. Verifique que todos los campos estén completos."
          }
        } else if (error.error && error.error.includes("estudios")) {
          errorMessage = "Error en estudios complementarios. Verifique la información."
        } else if (error.error && error.error.includes("signosVitales")) {
          errorMessage = "Error en signos vitales. Verifique que todos los campos estén completos."
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      toast({
        title: "Consulta registrada",
        description: "La consulta médica ha sido registrada exitosamente",
      })

      onConsultaCreada(historiaData)
      onOpenChange(false)

      // Reset form
      setFormData({
        fecha: new Date().toISOString().split("T")[0],
        hora: new Date().toTimeString().slice(0, 5),
        motivo: "",
        detalle: "",
        examen_fisico: "",
        diagnostico: "",
        tratamiento: "",
        indicaciones: "",
        observaciones: "",
        proximo_control: "",
        estudios: [""],
        signos_vitales: {
          presion: "",
          frecuencia: "",
          temperatura: "",
          peso: "",
          altura: "",
          oxigenacion: "",
        },
        medicamentos: [
          {
            nombre: "",
            dosis: "",
            frecuencia: "",
            duracion: "",
          },
        ],
      })
    } catch (error: any) {
      console.error("Error al crear consulta:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar la consulta",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nueva Consulta - {paciente.apellido}, {paciente.nombre}
          </DialogTitle>
          <DialogDescription>
            DNI: {paciente.dni} • Registrar nueva consulta médica
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Información de la Consulta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fecha">Fecha</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => handleInputChange("fecha", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="hora">Hora</Label>
                    <Input
                      id="hora"
                      type="time"
                      value={formData.hora}
                      onChange={(e) => handleInputChange("hora", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="motivo">Motivo de Consulta *</Label>
                  <Textarea
                    id="motivo"
                    value={formData.motivo}
                    onChange={(e) => handleInputChange("motivo", e.target.value)}
                    placeholder="Describe el motivo de la consulta..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="detalle">Detalle / Anamnesis</Label>
                  <Textarea
                    id="detalle"
                    value={formData.detalle}
                    onChange={(e) => handleInputChange("detalle", e.target.value)}
                    placeholder="Información detallada sobre la consulta..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="examen_fisico">Examen Físico</Label>
                  <Textarea
                    id="examen_fisico"
                    value={formData.examen_fisico}
                    onChange={(e) => handleInputChange("examen_fisico", e.target.value)}
                    placeholder="Hallazgos del examen físico..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Signos Vitales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Signos Vitales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="presion" className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      Presión Arterial
                    </Label>
                    <div className="relative">
                      <Input
                        id="presion"
                        value={formData.signos_vitales.presion}
                        onChange={(e) => handleSignosVitalesChange("presion", e.target.value)}
                        placeholder="120/80"
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                        mmHg
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="frecuencia" className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      Frecuencia Cardíaca
                    </Label>
                    <div className="relative">
                      <Input
                        id="frecuencia"
                        value={formData.signos_vitales.frecuencia}
                        onChange={(e) => handleSignosVitalesChange("frecuencia", e.target.value)}
                        placeholder="72"
                        className="pr-10"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                        lpm
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="temperatura" className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-orange-500" />
                      Temperatura
                    </Label>
                    <div className="relative">
                      <Input
                        id="temperatura"
                        value={formData.signos_vitales.temperatura}
                        onChange={(e) => handleSignosVitalesChange("temperatura", e.target.value)}
                        placeholder="36.5"
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                        °C
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="peso" className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-green-500" />
                      Peso
                    </Label>
                    <div className="relative">
                      <Input
                        id="peso"
                        value={formData.signos_vitales.peso}
                        onChange={(e) => handleSignosVitalesChange("peso", e.target.value)}
                        placeholder="70"
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                        kg
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="altura" className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-purple-500" />
                      Altura
                    </Label>
                    <div className="relative">
                      <Input
                        id="altura"
                        value={formData.signos_vitales.altura}
                        onChange={(e) => handleSignosVitalesChange("altura", e.target.value)}
                        placeholder="175"
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                        cm
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="oxigenacion" className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      Oxigenación
                    </Label>
                    <div className="relative">
                      <Input
                        id="oxigenacion"
                        value={formData.signos_vitales.oxigenacion}
                        onChange={(e) => handleSignosVitalesChange("oxigenacion", e.target.value)}
                        placeholder="98"
                        className="pr-6"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diagnóstico y Tratamiento */}
            <Card>
              <CardHeader>
                <CardTitle>Diagnóstico y Tratamiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="diagnostico">Diagnóstico *</Label>
                  <Textarea
                    id="diagnostico"
                    value={formData.diagnostico}
                    onChange={(e) => handleInputChange("diagnostico", e.target.value)}
                    placeholder="Diagnóstico médico..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tratamiento">Tratamiento</Label>
                  <Textarea
                    id="tratamiento"
                    value={formData.tratamiento}
                    onChange={(e) => handleInputChange("tratamiento", e.target.value)}
                    placeholder="Plan de tratamiento..."
                  />
                </div>

                <div>
                  <Label htmlFor="indicaciones">Indicaciones</Label>
                  <Textarea
                    id="indicaciones"
                    value={formData.indicaciones}
                    onChange={(e) => handleInputChange("indicaciones", e.target.value)}
                    placeholder="Indicaciones para el paciente..."
                  />
                </div>

                <div>
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange("observaciones", e.target.value)}
                    placeholder="Observaciones adicionales..."
                  />
                </div>

                <div>
                  <Label htmlFor="proximo_control">Próximo Control</Label>
                  <Input
                    id="proximo_control"
                    type="date"
                    value={formData.proximo_control}
                    onChange={(e) => handleInputChange("proximo_control", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Medicamentos */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <Checkbox
                    id="prescribir-medicamentos"
                    checked={prescribirMedicamentos}
                    onCheckedChange={(checked) => setPrescribirMedicamentos(checked as boolean)}
                  />
                  <Label htmlFor="prescribir-medicamentos" className="flex items-center gap-2 cursor-pointer">
                    <Pill className="h-4 w-4" />
                    Prescribir Medicamentos
                  </Label>
                </div>
                <CardDescription>
                  {prescribirMedicamentos 
                    ? "Agregue los medicamentos que desea prescribir al paciente" 
                    : "Marque la casilla para prescribir medicamentos"}
                </CardDescription>
              </CardHeader>
              {prescribirMedicamentos && (
                <CardContent className="space-y-4">
                {formData.medicamentos.map((medicamento, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3 bg-blue-50/30">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-blue-900 flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        Medicamento {index + 1}
                      </h4>
                      {formData.medicamentos.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarMedicamento(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <Label className="flex items-center gap-2">
                          <span>Nombre del Medicamento *</span>
                        </Label>
                        <Input
                          value={medicamento.nombre}
                          onChange={(e) => handleMedicamentoChange(index, "nombre", e.target.value)}
                          placeholder="Ej: Paracetamol, Ibuprofeno..."
                          className="font-medium"
                        />
                      </div>
                      <div>
                        <Label>Dosis *</Label>
                        <Input
                          value={medicamento.dosis}
                          onChange={(e) => handleMedicamentoChange(index, "dosis", e.target.value)}
                          placeholder="Ej: 500mg, 1 comprimido..."
                        />
                      </div>
                      <div>
                        <Label>Frecuencia *</Label>
                        <Input
                          value={medicamento.frecuencia}
                          onChange={(e) => handleMedicamentoChange(index, "frecuencia", e.target.value)}
                          placeholder="Ej: Cada 8 horas, 3 veces al día..."
                        />
                      </div>
                      <div>
                        <Label>Duración *</Label>
                        <Input
                          value={medicamento.duracion}
                          onChange={(e) => handleMedicamentoChange(index, "duracion", e.target.value)}
                          placeholder="Ej: 7 días, 2 semanas..."
                        />
                      </div>
                    </div>

                    {/* Vista previa del medicamento */}
                    {medicamento.nombre && (
                      <div className="mt-3 p-2 bg-blue-100 rounded-lg border-l-4 border-blue-500">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">{medicamento.nombre}</span>
                          {medicamento.dosis && <span className="text-blue-700"> • {medicamento.dosis}</span>}
                          {medicamento.frecuencia && <span className="text-blue-700"> • {medicamento.frecuencia}</span>}
                          {medicamento.duracion && <span className="text-blue-700"> • {medicamento.duracion}</span>}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={agregarMedicamento} 
                  className="w-full border-dashed border-2 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Otro Medicamento
                </Button>
              </CardContent>
              )}
            </Card>

            {/* Estudios */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <Checkbox
                    id="prescribir-estudios"
                    checked={prescribirEstudios}
                    onCheckedChange={(checked) => setPrescribirEstudios(checked as boolean)}
                  />
                  <Label htmlFor="prescribir-estudios" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4" />
                    Solicitar Estudios Complementarios
                  </Label>
                </div>
                <CardDescription>
                  {prescribirEstudios 
                    ? "Agregue los estudios que desea solicitar al paciente" 
                    : "Marque la casilla para solicitar estudios complementarios"}
                </CardDescription>
              </CardHeader>
              {prescribirEstudios && (
                <CardContent className="space-y-3">
                {formData.estudios.map((estudio, index) => (
                  <div key={index} className="flex gap-2 items-start p-3 bg-green-50/30 rounded-lg border border-green-200">
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-green-900">
                        Estudio {index + 1}
                      </Label>
                      <Input
                        value={estudio}
                        onChange={(e) => handleEstudioChange(index, e.target.value)}
                        placeholder="Ej: Radiografía de tórax, Análisis de sangre, Ecografía..."
                        className="mt-1"
                      />
                      {estudio.trim() && (
                        <div className="mt-2 p-2 bg-green-100 rounded-lg border-l-4 border-green-500">
                          <p className="text-sm text-green-900">
                            <span className="font-semibold">{estudio}</span>
                            <span className="text-green-700"> • Resultado: Pendiente</span>
                          </p>
                        </div>
                      )}
                    </div>
                    {formData.estudios.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarEstudio(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={agregarEstudio} 
                  className="w-full border-dashed border-2 hover:bg-green-50 hover:border-green-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Otro Estudio
                </Button>
              </CardContent>
              )}
            </Card>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Consulta"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}