"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
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
} from "lucide-react";

interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento?: string;
}

interface NuevaConsultaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paciente: Paciente;
  profesionalId: number;
  onConsultaCreada: (consulta: any) => void;
}

export function NuevaConsultaDialog({
  open,
  onOpenChange,
  paciente,
  profesionalId,
  onConsultaCreada,
}: NuevaConsultaDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    hora: new Date().toTimeString().slice(0, 5),
    motivoConsulta: "",
    anamnesis: "",
    examenFisico: "",
    diagnostico: "",
    tratamiento: "",
    indicaciones: "",
    observaciones: "",
    proximoControl: "",
    estudiosComplementarios: [""],
    signosVitales: {
      presionArterial: "",
      frecuenciaCardiaca: "",
      temperatura: "",
      peso: "",
      altura: "",
      saturacionOxigeno: "",
    },
    medicamentos: [
      {
        nombre: "",
        dosis: "",
        frecuencia: "",
        duracion: "",
      },
    ],
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSignosVitalesChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      signosVitales: {
        ...prev.signosVitales,
        [field]: value,
      },
    }));
  };

  const handleMedicamentoChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      medicamentos: prev.medicamentos.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      ),
    }));
  };

  const agregarMedicamento = () => {
    setFormData((prev) => ({
      ...prev,
      medicamentos: [
        ...prev.medicamentos,
        { nombre: "", dosis: "", frecuencia: "", duracion: "" },
      ],
    }));
  };

  const eliminarMedicamento = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medicamentos: prev.medicamentos.filter((_, i) => i !== index),
    }));
  };

  const handleEstudioChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      estudiosComplementarios: prev.estudiosComplementarios.map((estudio, i) =>
        i === index ? value : estudio
      ),
    }));
  };

  const agregarEstudio = () => {
    setFormData((prev) => ({
      ...prev,
      estudiosComplementarios: [...prev.estudiosComplementarios, ""],
    }));
  };

  const eliminarEstudio = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      estudiosComplementarios: prev.estudiosComplementarios.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validaciones básicas
      if (!formData.motivoConsulta || !formData.diagnostico) {
        toast({
          title: "Error de validación",
          description: "El motivo de consulta y diagnóstico son obligatorios",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const historiaData = {
        pacienteId: paciente.id,
        profesionalId: profesionalId.toString(),
        fecha: `${formData.fecha}T${formData.hora}:00`,
        motivo: formData.motivoConsulta,
        detalle: formData.anamnesis || "",
        examenFisico: formData.examenFisico || null,
        signosVitales: formData.signosVitales.presionArterial
          ? {
              presionArterial: formData.signosVitales.presionArterial,
              frecuenciaCardiaca: formData.signosVitales.frecuenciaCardiaca,
              temperatura: formData.signosVitales.temperatura,
              peso: formData.signosVitales.peso,
              altura: formData.signosVitales.altura,
              oxigenacion: formData.signosVitales.saturacionOxigeno,
            }
          : null,
        diagnostico: formData.diagnostico,
        tratamiento: formData.tratamiento || null,
        indicaciones: formData.indicaciones || null,
        observaciones: formData.observaciones || null,
        proximoControl: formData.proximoControl
          ? `${formData.proximoControl}T00:00:00`
          : null,
        medicamentos: formData.medicamentos.filter(
          (m) => m.nombre.trim() !== ""
        ),
        estudiosComplementarios: formData.estudiosComplementarios
          .filter((e) => e.trim() !== "")
          .map((e) => ({
            tipo: e,
            resultado: "Pendiente",
            fecha: formData.fecha,
          })),
      };

      const response = await fetch("/api/v2/historia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historia: historiaData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear consulta");
      }

      const result = await response.json();

      toast({
        title: "Consulta registrada",
        description: "La consulta médica ha sido registrada exitosamente",
      });

      onConsultaCreada(historiaData);
      onOpenChange(false);

      // Reset form
      setFormData({
        fecha: new Date().toISOString().split("T")[0],
        hora: new Date().toTimeString().slice(0, 5),
        motivoConsulta: "",
        anamnesis: "",
        examenFisico: "",
        diagnostico: "",
        tratamiento: "",
        indicaciones: "",
        observaciones: "",
        proximoControl: "",
        estudiosComplementarios: [""],
        signosVitales: {
          presionArterial: "",
          frecuenciaCardiaca: "",
          temperatura: "",
          peso: "",
          altura: "",
          saturacionOxigeno: "",
        },
        medicamentos: [
          {
            nombre: "",
            dosis: "",
            frecuencia: "",
            duracion: "",
          },
        ],
      });
    } catch (error: any) {
      console.error("Error creando consulta:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          "No se pudo registrar la consulta. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nueva Consulta Médica
          </DialogTitle>
          <DialogDescription>
            Paciente: {paciente.apellido}, {paciente.nombre} • DNI:{" "}
            {paciente.dni}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 overflow-y-auto max-h-[70vh] px-1"
        >
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
                  onChange={(e) =>
                    handleInputChange("motivoConsulta", e.target.value)
                  }
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
                  <Label
                    htmlFor="presionArterial"
                    className="flex items-center gap-1"
                  >
                    <Heart className="h-4 w-4 text-red-500" />
                    Presión Arterial
                  </Label>
                  <Input
                    id="presionArterial"
                    value={formData.signosVitales.presionArterial}
                    onChange={(e) =>
                      handleSignosVitalesChange(
                        "presionArterial",
                        e.target.value
                      )
                    }
                    placeholder="120/80"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="frecuenciaCardiaca"
                    className="flex items-center gap-1"
                  >
                    <Activity className="h-4 w-4 text-blue-500" />
                    FC (lpm)
                  </Label>
                  <Input
                    id="frecuenciaCardiaca"
                    type="number"
                    value={formData.signosVitales.frecuenciaCardiaca}
                    onChange={(e) =>
                      handleSignosVitalesChange(
                        "frecuenciaCardiaca",
                        e.target.value
                      )
                    }
                    placeholder="72"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="temperatura"
                    className="flex items-center gap-1"
                  >
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    Temperatura (°C)
                  </Label>
                  <Input
                    id="temperatura"
                    type="number"
                    step="0.1"
                    value={formData.signosVitales.temperatura}
                    onChange={(e) =>
                      handleSignosVitalesChange("temperatura", e.target.value)
                    }
                    placeholder="36.5"
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
                    onChange={(e) =>
                      handleSignosVitalesChange("peso", e.target.value)
                    }
                    placeholder="70.5"
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
                    onChange={(e) =>
                      handleSignosVitalesChange("altura", e.target.value)
                    }
                    placeholder="175"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="saturacionOxigeno"
                    className="flex items-center gap-1"
                  >
                    <div className="w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">O₂</span>
                    </div>
                    Saturación O₂ (%)
                  </Label>
                  <Input
                    id="saturacionOxigeno"
                    type="number"
                    value={formData.signosVitales.saturacionOxigeno}
                    onChange={(e) =>
                      handleSignosVitalesChange(
                        "saturacionOxigeno",
                        e.target.value
                      )
                    }
                    placeholder="98"
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
                <Label htmlFor="anamnesis">Anamnesis</Label>
                <Textarea
                  id="anamnesis"
                  value={formData.anamnesis}
                  onChange={(e) =>
                    handleInputChange("anamnesis", e.target.value)
                  }
                  placeholder="Historia clínica actual, antecedentes relevantes..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="examenFisico">Examen Físico</Label>
                <Textarea
                  id="examenFisico"
                  value={formData.examenFisico}
                  onChange={(e) =>
                    handleInputChange("examenFisico", e.target.value)
                  }
                  placeholder="Hallazgos del examen físico..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="diagnostico">Diagnóstico *</Label>
                <Textarea
                  id="diagnostico"
                  value={formData.diagnostico}
                  onChange={(e) =>
                    handleInputChange("diagnostico", e.target.value)
                  }
                  placeholder="Diagnóstico principal y secundarios..."
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Tratamiento */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Plan de Tratamiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tratamiento">Tratamiento</Label>
                <Textarea
                  id="tratamiento"
                  value={formData.tratamiento}
                  onChange={(e) =>
                    handleInputChange("tratamiento", e.target.value)
                  }
                  placeholder="Plan terapéutico..."
                />
              </div>
              <div>
                <Label htmlFor="indicaciones">Indicaciones</Label>
                <Textarea
                  id="indicaciones"
                  value={formData.indicaciones}
                  onChange={(e) =>
                    handleInputChange("indicaciones", e.target.value)
                  }
                  placeholder="Indicaciones para el paciente..."
                />
              </div>
              <div>
                <Label htmlFor="proximoControl">Próximo Control</Label>
                <Input
                  id="proximoControl"
                  type="date"
                  value={formData.proximoControl}
                  onChange={(e) =>
                    handleInputChange("proximoControl", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Medicamentos */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Medicamentos</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={agregarMedicamento}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.medicamentos.map((medicamento, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-2 p-3 border rounded"
                >
                  <Input
                    placeholder="Medicamento"
                    value={medicamento.nombre}
                    onChange={(e) =>
                      handleMedicamentoChange(index, "nombre", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Dosis"
                    value={medicamento.dosis}
                    onChange={(e) =>
                      handleMedicamentoChange(index, "dosis", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Frecuencia"
                    value={medicamento.frecuencia}
                    onChange={(e) =>
                      handleMedicamentoChange(
                        index,
                        "frecuencia",
                        e.target.value
                      )
                    }
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Duración"
                      value={medicamento.duracion}
                      onChange={(e) =>
                        handleMedicamentoChange(
                          index,
                          "duracion",
                          e.target.value
                        )
                      }
                    />
                    {formData.medicamentos.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarMedicamento(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Estudios Complementarios */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Estudios Complementarios
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={agregarEstudio}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {formData.estudiosComplementarios.map((estudio, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Nombre del estudio"
                    value={estudio}
                    onChange={(e) => handleEstudioChange(index, e.target.value)}
                  />
                  {formData.estudiosComplementarios.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarEstudio(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
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
                onChange={(e) =>
                  handleInputChange("observaciones", e.target.value)
                }
                placeholder="Observaciones adicionales..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
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
      </DialogContent>
    </Dialog>
  );
}
