"use client";

import type React from "react";

<<<<<<< HEAD
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
=======
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
>>>>>>> master
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
<<<<<<< HEAD
  Pill,
} from "lucide-react"
=======
} from "lucide-react";
>>>>>>> master

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
<<<<<<< HEAD
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [prescribirMedicamentos, setPrescribirMedicamentos] = useState(false)
  const [prescribirEstudios, setPrescribirEstudios] = useState(false)
=======
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
>>>>>>> master

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
      signos_vitales: {
        ...prev.signos_vitales,
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
<<<<<<< HEAD
    }))
  }
=======
    }));
  };
>>>>>>> master

  const agregarMedicamento = () => {
    setFormData((prev) => ({
      ...prev,
      medicamentos: [
        ...prev.medicamentos,
        { nombre: "", dosis: "", frecuencia: "", duracion: "" },
      ],
<<<<<<< HEAD
    }))
  }
=======
    }));
  };
>>>>>>> master

  const eliminarMedicamento = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medicamentos: prev.medicamentos.filter((_, i) => i !== index),
    }));
  };

  const handleEstudioChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
<<<<<<< HEAD
      estudios: prev.estudios.map((estudio, i) => (i === index ? value : estudio)),
    }))
  }
=======
      estudiosComplementarios: prev.estudiosComplementarios.map((estudio, i) =>
        i === index ? value : estudio
      ),
    }));
  };
>>>>>>> master

  const agregarEstudio = () => {
    setFormData((prev) => ({
      ...prev,
<<<<<<< HEAD
      estudios: [...prev.estudios, ""],
    }))
  }
=======
      estudiosComplementarios: [...prev.estudiosComplementarios, ""],
    }));
  };
>>>>>>> master

  const eliminarEstudio = (index: number) => {
    setFormData((prev) => ({
      ...prev,
<<<<<<< HEAD
      estudios: prev.estudios.filter((_, i) => i !== index),
    }))
  }
=======
      estudiosComplementarios: prev.estudiosComplementarios.filter(
        (_, i) => i !== index
      ),
    }));
  };
>>>>>>> master

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
    e.preventDefault();
    setLoading(true);

    try {
      // Validaciones básicas
      if (!formData.motivo || !formData.diagnostico) {
        toast({
          title: "Error de validación",
          description: "El motivo de consulta y diagnóstico son obligatorios",
          variant: "destructive",
        });
        setLoading(false);
        return;
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
<<<<<<< HEAD
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
=======
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
>>>>>>> master
        diagnostico: formData.diagnostico,
        tratamiento: formData.tratamiento || null,
        indicaciones: formData.indicaciones || null,
        observaciones: formData.observaciones || null,
<<<<<<< HEAD
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
=======
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
>>>>>>> master

      const response = await fetch("/api/v2/historia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historia: historiaData }),
      });

      if (!response.ok) {
<<<<<<< HEAD
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
=======
        const error = await response.json();
        throw new Error(error.error || "Error al crear consulta");
      }

      const result = await response.json();

>>>>>>> master
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
      });
    } catch (error: any) {
<<<<<<< HEAD
      console.error("Error al crear consulta:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar la consulta",
=======
      console.error("Error creando consulta:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          "No se pudo registrar la consulta. Intente nuevamente.",
>>>>>>> master
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nueva Consulta - {paciente.apellido}, {paciente.nombre}
          </DialogTitle>
          <DialogDescription>
<<<<<<< HEAD
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
=======
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
>>>>>>> master
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
<<<<<<< HEAD
                        onClick={() => eliminarEstudio(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-6"
=======
                        onClick={() => eliminarMedicamento(index)}
>>>>>>> master
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

<<<<<<< HEAD
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
=======
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
>>>>>>> master
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
  );
}
