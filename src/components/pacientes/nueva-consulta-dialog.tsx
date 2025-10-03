"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Stethoscope, FileText, Heart, Activity, Thermometer, Weight, Ruler } from "lucide-react"

interface Paciente {
  id: string
  nombre: string
  apellido: string
  dni: string
}

interface NuevaConsultaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paciente: Paciente
  profesionalId: number,
  onConsultaCreada: (consulta: any) => void
}

export function NuevaConsultaDialog({ open, onOpenChange, paciente, profesionalId, onConsultaCreada }: NuevaConsultaDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    hora: new Date().toTimeString().slice(0, 5),
    motivoConsulta: "",
    historiaEnfermedadActual: "",
    examenFisico: "",
    diagnostico: "",
    indicaciones: "",
    observaciones: "",
    proximoControl: "",
    signosVitales: {
      presionArterial: "",
      frecuenciaCardiaca: "",
      temperatura: "",
      peso: "",
      altura: "",
      saturacionOxigeno: "",
    },
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
      signosVitales: {
        ...prev.signosVitales,
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validaciones básicas
      if (!formData.motivoConsulta || !formData.diagnostico) {
        toast({
          title: "Error de validación",
          description: "El motivo de consulta y diagnóstico son obligatorios",
          variant: "destructive",
        })
        return
      }

      // const nuevaConsulta = {
      //   ...formData,
      //   profesional: {
      //     nombre: user?.name || "Dr. Usuario",
      //     apellido: "Profesional",
      //     especialidad: user?.role === "profesional" ? "Medicina General" : "Especialista",
      //     matricula: "MN 00000",
      //   },
      //   signosVitales: {
      //     presionArterial: formData.signosVitales.presionArterial,
      //     frecuenciaCardiaca: Number.parseInt(formData.signosVitales.frecuenciaCardiaca) || 0,
      //     temperatura: Number.parseFloat(formData.signosVitales.temperatura) || 0,
      //     peso: Number.parseFloat(formData.signosVitales.peso) || 0,
      //     altura: Number.parseInt(formData.signosVitales.altura) || 0,
      //     saturacionOxigeno: Number.parseInt(formData.signosVitales.saturacionOxigeno) || 0,
      //   },
      //   estado: "completada" as const,
      // }
      const nuevaConsulta = {
        pacienteId: paciente.id,
        profesionalId,
        fecha: new Date(formData.fecha.toString()),
        motivo: formData.motivoConsulta,
        detalle: formData.historiaEnfermedadActual.length > 0 ?
          formData.historiaEnfermedadActual : undefined,
        examenFisico: formData.examenFisico.length > 0 ?
          formData.examenFisico : undefined,
        signosVitales: {
          presionArterial: formData.signosVitales.presionArterial.length > 0 ?
            formData.signosVitales.presionArterial : undefined,
          frecuenciaCardiaca: formData.signosVitales.frecuenciaCardiaca.length > 0 ? 
            formData.signosVitales.frecuenciaCardiaca : undefined,
          temperatura: formData.signosVitales.temperatura.length > 0 ? 
            formData.signosVitales.temperatura : undefined,
          peso: formData.signosVitales.peso.length > 0 ?
            formData.signosVitales.peso : undefined,
          altura: formData.signosVitales.altura.length > 0 ?
            formData.signosVitales.altura : undefined,
          oxigenacion: formData.signosVitales.saturacionOxigeno.length > 0 ?
            formData.signosVitales.saturacionOxigeno : undefined,
        },
        diagnostico: formData.diagnostico,
        indicaciones: formData.indicaciones.length > 0 ?
          formData.indicaciones : undefined,
        proximoControl: formData.proximoControl.length > 0 ?
          new Date(formData.proximoControl).toString() : undefined,
        observaciones: formData.observaciones.length > 0 ?
          formData.observaciones : undefined,
      }

      console.log(nuevaConsulta);
      const ret = await fetch('api/v2/historia', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({historia: nuevaConsulta})
      })
      .then(async (body) => await body.json());
      if (ret.error) {
        console.log(ret.error);
        return;
      }

      onConsultaCreada(nuevaConsulta)
      onOpenChange(false)

      toast({
        title: "Consulta registrada",
        description: "La consulta médica ha sido registrada exitosamente",
      })

      // Reset form
      setFormData({
        fecha: new Date().toISOString().split("T")[0],
        hora: new Date().toTimeString().slice(0, 5),
        motivoConsulta: "",
        historiaEnfermedadActual: "",
        examenFisico: "",
        diagnostico: "",
        indicaciones: "",
        observaciones: "",
        proximoControl: "",
        signosVitales: {
          presionArterial: "",
          frecuenciaCardiaca: "",
          temperatura: "",
          peso: "",
          altura: "",
          saturacionOxigeno: "",
        },
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar la consulta. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nueva Consulta Médica
          </DialogTitle>
          <DialogDescription>
            Paciente: {paciente.apellido}, {paciente.nombre} • DNI: {paciente.dni}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto max-h-[70vh] px-1">
          {/* Información básica */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información de la Consulta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fecha">Fecha *</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => handleInputChange("fecha", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hora">Hora *</Label>
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
                <Label htmlFor="motivoConsulta">Motivo de Consulta *</Label>
                <Textarea
                  id="motivoConsulta"
                  value={formData.motivoConsulta}
                  onChange={(e) => handleInputChange("motivoConsulta", e.target.value)}
                  placeholder="Describa el motivo principal de la consulta..."
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Signos Vitales */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Signos Vitales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="presionArterial" className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    Presión Arterial
                  </Label>
                  <Input
                    id="presionArterial"
                    value={formData.signosVitales.presionArterial}
                    onChange={(e) => handleSignosVitalesChange("presionArterial", e.target.value)}
                    placeholder="120/80"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="frecuenciaCardiaca" className="flex items-center gap-1">
                    <Activity className="h-4 w-4 text-blue-500" />
                    FC (lpm)
                  </Label>
                  <Input
                    id="frecuenciaCardiaca"
                    type="number"
                    value={formData.signosVitales.frecuenciaCardiaca}
                    onChange={(e) => handleSignosVitalesChange("frecuenciaCardiaca", e.target.value)}
                    placeholder="72"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="temperatura" className="flex items-center gap-1">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    Temperatura (°C)
                  </Label>
                  <Input
                    id="temperatura"
                    type="number"
                    step="0.1"
                    value={formData.signosVitales.temperatura}
                    onChange={(e) => handleSignosVitalesChange("temperatura", e.target.value)}
                    placeholder="36.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="peso" className="flex items-center gap-1">
                    <Weight className="h-4 w-4 text-green-500" />
                    Peso (kg)
                  </Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.1"
                    value={formData.signosVitales.peso}
                    onChange={(e) => handleSignosVitalesChange("peso", e.target.value)}
                    placeholder="70.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="altura" className="flex items-center gap-1">
                    <Ruler className="h-4 w-4 text-purple-500" />
                    Altura (cm)
                  </Label>
                  <Input
                    id="altura"
                    type="number"
                    value={formData.signosVitales.altura}
                    onChange={(e) => handleSignosVitalesChange("altura", e.target.value)}
                    placeholder="175"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="saturacionOxigeno" className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">O₂</span>
                    </div>
                    Saturación O₂ (%)
                  </Label>
                  <Input
                    id="saturacionOxigeno"
                    type="number"
                    value={formData.signosVitales.saturacionOxigeno}
                    onChange={(e) => handleSignosVitalesChange("saturacionOxigeno", e.target.value)}
                    placeholder="98"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evaluación Médica */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Evaluación Médica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="historiaEnfermedadActual">Historia de la enfermedad actual</Label>
                <Textarea
                  id="historiaEnfermedadActual"
                  value={formData.historiaEnfermedadActual}
                  onChange={(e) => handleInputChange("historiaEnfermedadActual", e.target.value)}
                  placeholder="Historia clínica actual, evolución de los síntomas..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="examenFisico">Examen Físico</Label>
                <Textarea
                  id="examenFisico"
                  value={formData.examenFisico}
                  onChange={(e) => handleInputChange("examenFisico", e.target.value)}
                  placeholder="Hallazgos del examen físico..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="diagnostico">Diagnóstico *</Label>
                <Textarea
                  id="diagnostico"
                  value={formData.diagnostico}
                  onChange={(e) => handleInputChange("diagnostico", e.target.value)}
                  placeholder="Diagnóstico principal y secundarios..."
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Indicaciones y Seguimiento */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Indicaciones y Seguimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Label htmlFor="proximoControl">Próximo Control</Label>
                <Input
                  id="proximoControl"
                  type="date"
                  value={formData.proximoControl}
                  onChange={(e) => handleInputChange("proximoControl", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Observaciones */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => handleInputChange("observaciones", e.target.value)}
                placeholder="Observaciones adicionales..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Consulta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
